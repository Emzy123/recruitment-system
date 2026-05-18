import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured, otherwise fallback to a mock/in-memory limiter
const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// We define our redis instance
const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : ({
      sadd: async () => {},
      zadd: async () => {},
      zremrangebyscore: async () => {},
      zcard: async () => 0,
      expire: async () => {},
      pexpire: async () => {},
      del: async () => {},
      get: async () => null,
      set: async () => "OK",
      eval: async () => [0, 0, 0, 0], // Mock successful rate limit eval
      evalsha: async () => [0, 0, 0, 0],
    } as unknown as Redis); // Mock redis for local dev if keys are missing

// Standard rate limiter: 10 requests per 10 seconds per IP
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Strict rate limiter for auth routes: 5 requests per 1 minute
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});
