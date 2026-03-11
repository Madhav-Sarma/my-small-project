import type { Request, Response, NextFunction } from "express";
import { SlidingWindowRateLimiter } from "./sliding-window.js";
import type { RedisLike, RateLimitConfig, RateLimitScope } from "./types.js";

interface RequestWithContext extends Request {
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
}

interface ScopeBinding {
  scopeName: string;
  limiter: SlidingWindowRateLimiter;
  extractId: (req: RequestWithContext) => string | null;
}

/**
 * Creates an Express middleware that enforces sliding-window rate limits for
 * one or more scopes (user / workspace / organization).
 *
 * All configured scopes are checked on every request. If any scope is
 * exhausted the middleware responds 429 immediately and sets the standard
 * X-RateLimit-* headers for the failing scope.
 *
 * @example
 * app.use(
 *   createRateLimitMiddleware(redis, {
 *     user:         { windowMs: 60_000, max: 100  },
 *     workspace:    { windowMs: 60_000, max: 500  },
 *     organization: { windowMs: 60_000, max: 1000 },
 *   }),
 * );
 */
export function createRateLimitMiddleware(
  redis: RedisLike,
  scopes: RateLimitScope,
) {
  const bindings: ScopeBinding[] = [];

  if (scopes.user) {
    bindings.push(buildBinding("user", scopes.user, redis, (req) => req.userId ?? null));
  }

  if (scopes.workspace) {
    bindings.push(
      buildBinding("workspace", scopes.workspace, redis, (req) => {
        // workspaceId may live in route params, body, or on the request object itself
        const fromParams = req.params?.workspaceId;
        const paramValue = Array.isArray(fromParams) ? fromParams[0] : fromParams;
        return (
          paramValue ??
          (req.body as Record<string, string> | undefined)?.workspaceId ??
          req.workspaceId ??
          null
        );
      }),
    );
  }

  if (scopes.organization) {
    bindings.push(
      buildBinding("organization", scopes.organization, redis, (req) => req.organizationId ?? null),
    );
  }

  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const typedReq = req as RequestWithContext;

    for (const { scopeName, limiter, extractId } of bindings) {
      const id = extractId(typedReq);
      if (!id) continue; // Skip scopes we can't identify

      let result;
      try {
        result = await limiter.check(id);
      } catch {
        // Redis unavailable — fail open to avoid blocking legitimate traffic
        continue;
      }

      // Always set informational headers for this scope
      res.setHeader(`X-RateLimit-${scopeName}-Limit`, result.total);
      res.setHeader(`X-RateLimit-${scopeName}-Remaining`, result.remaining);
      res.setHeader(`X-RateLimit-${scopeName}-Reset`, Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        const retryAfterSecs = Math.ceil((result.resetAt - Date.now()) / 1000);
        res.setHeader("Retry-After", retryAfterSecs);
        res.status(429).json({
          error: "Too Many Requests",
          message: `Rate limit exceeded for scope: ${scopeName}`,
          scope: scopeName,
          retryAfter: retryAfterSecs,
        });
        return;
      }
    }

    next();
  };
}

function buildBinding(
  scopeName: string,
  config: RateLimitConfig,
  redis: RedisLike,
  extractId: (req: RequestWithContext) => string | null,
): ScopeBinding {
  return {
    scopeName,
    limiter: new SlidingWindowRateLimiter(redis, {
      ...config,
      keyPrefix: config.keyPrefix ?? `rl:${scopeName}`,
    }),
    extractId,
  };
}
