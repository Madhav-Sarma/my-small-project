export interface RateLimitConfig {
  /** Rolling time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed within the window */
  max: number;
  /** Redis key prefix (default: "rl") */
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Unix timestamp (ms) at which the window fully resets */
  resetAt: number;
  total: number;
}

export interface RateLimitScope {
  /** Per-user rate limit config */
  user?: RateLimitConfig;
  /** Per-workspace rate limit config */
  workspace?: RateLimitConfig;
  /** Per-organization rate limit config */
  organization?: RateLimitConfig;
}

/** Minimal Redis interface required by the rate limiter */
export interface RedisLike {
  eval(script: string, numkeys: number, ...args: string[]): Promise<unknown>;
}
