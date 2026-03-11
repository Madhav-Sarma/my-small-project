import type { RedisLike, RateLimitConfig, RateLimitResult } from "./types.js";

/**
 * Sliding-window rate limiter backed by Redis sorted sets.
 *
 * Algorithm (atomic Lua script):
 *   1. Remove entries older than (now - windowMs) via ZREMRANGEBYSCORE
 *   2. Count remaining entries (ZCARD)
 *   3. If count < max → add current entry (ZADD) and reset TTL → allowed
 *   4. Otherwise → reject
 *
 * The Lua script runs atomically, so there are no race conditions between
 * the count check and the entry insertion.
 */

const SLIDING_WINDOW_LUA = `
local key      = KEYS[1]
local seq_key  = KEYS[2]
local now      = tonumber(ARGV[1])
local win_start = tonumber(ARGV[2])
local max      = tonumber(ARGV[3])
local ttl_ms   = tonumber(ARGV[4])

redis.call('ZREMRANGEBYSCORE', key, '-inf', win_start)
local count = redis.call('ZCARD', key)

if count < max then
  local seq = redis.call('INCR', seq_key)
  redis.call('ZADD', key, now, tostring(now) .. ':' .. tostring(seq))
  redis.call('PEXPIRE', key, ttl_ms)
  redis.call('PEXPIRE', seq_key, ttl_ms)
  return {count + 1, 1}
else
  return {count, 0}
end
`;

export class SlidingWindowRateLimiter {
  private readonly prefix: string;

  constructor(
    private readonly redis: RedisLike,
    private readonly config: RateLimitConfig,
  ) {
    this.prefix = config.keyPrefix ?? "rl";
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const key = `${this.prefix}:${identifier}`;
    const seqKey = `${key}:seq`;

    const result = (await this.redis.eval(
      SLIDING_WINDOW_LUA,
      2,         // numkeys
      key,
      seqKey,
      String(now),
      String(windowStart),
      String(this.config.max),
      String(this.config.windowMs),
    )) as [number, number];

    const [requestCount, allowedFlag] = result;

    return {
      allowed: allowedFlag === 1,
      remaining: Math.max(0, this.config.max - requestCount),
      resetAt: now + this.config.windowMs,
      total: this.config.max,
    };
  }
}
