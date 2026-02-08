import { kv } from '@vercel/kv'; // Using Vercel KV for distributed rate limiting

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly prefix: string;

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 100, prefix: string = 'rl:') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.prefix = prefix;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    try {
      const key = `${this.prefix}${identifier}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Use a sorted set to track requests within the time window
      const pipeline = kv.pipeline();
      
      // Clean old entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Get current count
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, { score: now, member: now.toString() });
      
      // Set expiration for the key
      pipeline.expire(key, Math.ceil(this.windowMs / 1000));
      
      const [_, currentCount] = await pipeline.exec() as [any, number];
      
      const remaining = Math.max(0, this.maxRequests - currentCount);
      const resetTime = now + this.windowMs;

      return {
        allowed: currentCount <= this.maxRequests,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - if rate limiter fails, allow request to proceed
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs,
        error: 'Rate limiter unavailable'
      };
    }
  }
}

// Specific rate limiters for different use cases
export const apiRateLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests
);

export const authRateLimiter = new RateLimiter(
  60 * 60 * 1000, // 1 hour
  5 // 5 login attempts
);

export const searchRateLimiter = new RateLimiter(
  60 * 1000, // 1 minute
  30 // 30 search requests
);