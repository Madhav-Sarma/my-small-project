import type { Redis } from "ioredis";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./middleware.js";

export interface RateLimitWindow {
  /** Time window in milliseconds. */
  windowMs: number;
  /** Maximum requests allowed within the window. */
  maxRequests: number;
}

export interface RateLimiterOptions {
  /** Per-user sliding window limit. User ID from req.userId. */
  perUser?: RateLimitWindow;
  /**
   * Per-workspace sliding window limit.
   * Workspace ID is resolved from req.params.workspaceId → req.body.workspaceId → req.query.workspaceId.
   */
  perWorkspace?: RateLimitWindow;
  /** Per-organization sliding window limit. Organization ID from req.organizationId. */
  perOrganization?: RateLimitWindow;
  /** Redis key namespace. Defaults to "ratelimit". */
  keyPrefix?: string;
}

interface SlidingWindowResult {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: number;
}

/**
 * Lua script for an atomic sliding-window check.
 *
 * Returns a two-element array [newCount, allowed] where allowed is 1 (ok) or 0 (rejected).
 * Using Lua ensures the read-modify-write is atomic on the Redis server, eliminating TOCTOU races.
 */
const SLIDING_WINDOW_LUA = `
local key          = KEYS[1]
local now          = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local expires_s    = tonumber(ARGV[4])

redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
local count = tonumber(redis.call('ZCARD', key))

if count < max_requests then
  redis.call('ZADD', key, now, now .. '-' .. math.random())
  redis.call('EXPIRE', key, expires_s)
  return {count + 1, 1}
end
return {count, 0}
`;

async function checkSlidingWindow(
  redis: Redis,
  key: string,
  windowMs: number,
  maxRequests: number,
): Promise<SlidingWindowResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const expiresSeconds = Math.ceil(windowMs / 1000) + 1;

  const result = (await redis.eval(
    SLIDING_WINDOW_LUA,
    1,
    key,
    String(now),
    String(windowStart),
    String(maxRequests),
    String(expiresSeconds),
  )) as [number, number];

  const [count, allowedFlag] = result;
  return {
    allowed: allowedFlag === 1,
    count,
    remaining: Math.max(0, maxRequests - count),
    resetAt: now + windowMs,
  };
}

/**
 * Creates an Express middleware that enforces rate limits using a Redis sliding-window algorithm.
 *
 * Independent limit tiers (user / workspace / organization) are checked in order.
 * The first violated tier short-circuits with HTTP 429 and sets:
 *   - `Retry-After` header
 *   - `X-RateLimit-Limit-{tier}`, `X-RateLimit-Remaining-{tier}`, `X-RateLimit-Reset-{tier}` headers
 *
 * On Redis failure the middleware fails open (lets the request through) to prevent outages.
 *
 * @example
 * const redis = new Redis(process.env.REDIS_URL);
 * const limiter = createRateLimiter(redis, {
 *   perUser:         { windowMs: 60_000, maxRequests: 60  },
 *   perOrganization: { windowMs: 60_000, maxRequests: 300 },
 * });
 * app.use("/api/v1", authMiddleware, limiter);
 */
export function createRateLimiter(redis: Redis, options: RateLimiterOptions) {
  const prefix = options.keyPrefix ?? "ratelimit";

  return async function rateLimiterMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = req.userId;
    const organizationId = req.organizationId;
    const workspaceId =
      (req.params as Record<string, string>).workspaceId ??
      (req.body as Record<string, unknown> | undefined)?.workspaceId as string | undefined ??
      req.query.workspaceId as string | undefined;

    type CheckEntry = { key: string; window: RateLimitWindow; tier: string };
    const checks: CheckEntry[] = [];

    if (options.perUser && userId) {
      checks.push({ key: `${prefix}:user:${userId}`, window: options.perUser, tier: "user" });
    }
    if (options.perWorkspace && workspaceId) {
      checks.push({ key: `${prefix}:workspace:${workspaceId}`, window: options.perWorkspace, tier: "workspace" });
    }
    if (options.perOrganization && organizationId) {
      checks.push({ key: `${prefix}:org:${organizationId}`, window: options.perOrganization, tier: "organization" });
    }

    for (const check of checks) {
      let result: SlidingWindowResult;
      try {
        result = await checkSlidingWindow(redis, check.key, check.window.windowMs, check.window.maxRequests);
      } catch {
        // Fail open on Redis errors to prevent cascading outages.
        continue;
      }

      const tierHeader = check.tier.charAt(0).toUpperCase() + check.tier.slice(1);
      res.setHeader(`X-RateLimit-Limit-${tierHeader}`, check.window.maxRequests);
      res.setHeader(`X-RateLimit-Remaining-${tierHeader}`, result.remaining);
      res.setHeader(`X-RateLimit-Reset-${tierHeader}`, Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        const retryAfter = Math.ceil(check.window.windowMs / 1000);
        res.setHeader("Retry-After", retryAfter);
        res.status(429).json({
          error: "Too many requests",
          tier: check.tier,
          retryAfterSeconds: retryAfter,
          resetAt: new Date(result.resetAt).toISOString(),
        });
        return;
      }
    }

    next();
  };
}
