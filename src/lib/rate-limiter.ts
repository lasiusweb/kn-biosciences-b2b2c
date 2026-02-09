interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}

// In-memory store for rate limiting (client-side compatible)
// Note: This is reset when the page refreshes, but works for session-based rate limiting
const rateLimitStore = new Map<string, { requests: number[] }>();

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly prefix: string;

  constructor(windowMs: number = 60 * 1000, maxRequests: number = 100, prefix: string = 'rl:') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.prefix = prefix;
  }

  check(identifier: string): RateLimitResult {
    try {
      const key = `${this.prefix}${identifier}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Get or create entry for this identifier
      let entry = rateLimitStore.get(key);
      if (!entry) {
        entry = { requests: [] };
        rateLimitStore.set(key, entry);
      }

      // Filter requests within the current window
      const recentRequests = entry.requests.filter(timestamp => timestamp > windowStart);

      if (recentRequests.length >= this.maxRequests) {
        // Rate limit exceeded
        const oldestRequest = Math.min(...recentRequests);
        const resetTime = oldestRequest + this.windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetTime
        };
      }

      // Add current request to list
      entry.requests.push(now);
      
      // Clean up old requests periodically to prevent memory leaks
      if (recentRequests.length < entry.requests.length) {
        entry.requests = recentRequests;
      }

      const remaining = Math.max(0, this.maxRequests - recentRequests.length - 1);
      const resetTime = now + this.windowMs;

      return {
        allowed: recentRequests.length < this.maxRequests,
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