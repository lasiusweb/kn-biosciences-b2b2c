import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface APIMetrics {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  userAgent: string;
  ip: string;
  userId?: string;
  timestamp: number;
  responseTime: number;
  error?: string;
}

// In-memory storage for rate limiting and metrics
// In production, this should be replaced with Redis or similar
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const metricsStore: APIMetrics[] = [];
const MAX_METRICS = 10000; // Keep last 10k metrics

export class EnterpriseAPIGateway {
  private static instance: EnterpriseAPIGateway;
  private metricsCallbacks: Array<(metrics: APIMetrics) => void> = [];

  private constructor() {}

  static getInstance(): EnterpriseAPIGateway {
    if (!EnterpriseAPIGateway.instance) {
      EnterpriseAPIGateway.instance = new EnterpriseAPIGateway();
    }
    return EnterpriseAPIGateway.instance;
  }

  // Rate limiting middleware
  async rateLimit(config: RateLimitConfig): Promise<(req: NextRequest) => Promise<RateLimitResult | NextResponse>> {
    return async (req: NextRequest): Promise<RateLimitResult | NextResponse> => {
      const key = config.keyGenerator 
        ? config.keyGenerator(req)
        : this.generateKey(req);
      
      const now = Date.now();
      const windowMs = config.windowMs;
      const maxRequests = config.maxRequests;

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      if (!entry || now > entry.resetTime) {
        entry = { count: 0, resetTime: now + windowMs };
        rateLimitStore.set(key, entry);
      }

      // Clean old entries periodically
      if (Math.random() < 0.001) { // 0.1% chance
        this.cleanExpiredEntries();
      }

      // Check if request should be counted
      const shouldCount = await this.shouldCountRequest(req, config);
      
      if (shouldCount) {
        entry.count++;
      }

      const resetTime = entry.resetTime;
      const remaining = Math.max(0, maxRequests - entry.count);
      const success = entry.count <= maxRequests;

      if (!success) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: `Too many requests. Try again in ${retryAfter} seconds.`,
            retryAfter,
            limit: maxRequests,
            remaining: 0,
            resetTime
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetTime.toString(),
              'Retry-After': retryAfter.toString()
            }
          }
        );
      }

      // Store rate limit info for the request
      (req as any).rateLimit = {
        limit: maxRequests,
        remaining,
        resetTime
      };

      return {
        success,
        limit: maxRequests,
        remaining,
        resetTime
      };
    };
  }

  // API metrics middleware
  async withMetrics(handler: (req: NextRequest) => Promise<NextResponse>): Promise<(req: NextRequest) => Promise<NextResponse>> {
    return async (req: NextRequest): Promise<NextResponse> => {
      const requestId = this.generateRequestId();
      const startTime = Date.now();
      const ip = this.getClientIP(req);
      
      try {
        // Execute the original handler
        const response = await handler(req);
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        
        // Extract user ID if available
        const userId = await this.extractUserId(req);
        
        // Create metrics entry
        const metrics: APIMetrics = {
          requestId,
          method: req.method,
          path: new URL(req.url).pathname,
          statusCode: response.status,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          ip,
          userId,
          timestamp: startTime,
          responseTime,
        };

        // Store metrics
        this.storeMetrics(metrics);
        
        // Add metrics headers to response
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-Response-Time', `${responseTime}ms`);
        
        // Notify callbacks
        this.notifyMetricsCallbacks(metrics);
        
        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        const metrics: APIMetrics = {
          requestId,
          method: req.method,
          path: new URL(req.url).pathname,
          statusCode: 500,
          userAgent: req.headers.get('user-agent') || 'Unknown',
          ip,
          timestamp: startTime,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        };

        this.storeMetrics(metrics);
        this.notifyMetricsCallbacks(metrics);

        return NextResponse.json(
          {
            error: "Internal server error",
            requestId,
            timestamp: new Date().toISOString()
          },
          { 
            status: 500,
            headers: {
              'X-Request-ID': requestId,
              'X-Response-Time': `${responseTime}ms`
            }
          }
        );
      }
    };
  }

  // Security headers middleware
  withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest): Promise<NextResponse> => {
      const response = await handler(req);
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      return response;
    };
  }

  // CORS middleware
  withCORS(handler: (req: NextRequest) => Promise<NextResponse>, options: {
    origins?: string[];
    methods?: string[];
    credentials?: boolean;
  } = {}): (req: NextRequest) => Promise<NextResponse> {
    return async (req: NextRequest): Promise<NextResponse> => {
      const response = await handler(req);
      
      const origin = req.headers.get('origin');
      const allowedOrigins = options.origins || ['http://localhost:3000'];
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', 
        options.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set('Access-Control-Allow-Headers', 
        'Content-Type, Authorization, X-Requested-With'
      );
      
      if (options.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    };
  }

  // Request validation middleware
  withValidation<T = any>(
    schema: {
      body?: (data: any) => T | Promise<T>;
      query?: (data: any) => T | Promise<T>;
    }
  ) {
    return async (req: NextRequest) => {
      try {
        // Parse and validate request
        const contentType = req.headers.get('content-type');
        let body: any = null;
        let query: any = null;

        // Parse body if present
        if (contentType?.includes('application/json') && req.method !== 'GET') {
          body = await req.json();
        }

        // Parse query parameters
        const url = new URL(req.url);
        query = Object.fromEntries(url.searchParams);

        // Validate body
        if (schema.body && body !== null) {
          body = await schema.body(body);
        }

        // Validate query
        if (schema.query) {
          query = await schema.query(query);
        }

        // Attach parsed data to request
        (req as any).parsedBody = body;
        (req as any).parsedQuery = query;

        return NextResponse.next();
      } catch (error) {
        return NextResponse.json(
          {
            error: "Validation failed",
            message: error instanceof Error ? error.message : "Invalid request data",
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
    };
  }

  // Health check endpoint
  healthCheck() {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      gateway: {
        activeConnections: rateLimitStore.size,
        totalMetrics: metricsStore.length,
        memoryUsage: process.memoryUsage(),
      }
    });
  }

  // Metrics endpoint
  getMetrics(options: {
    limit?: number;
    startTime?: number;
    endTime?: number;
    statusCodes?: number[];
    paths?: string[];
  } = {}) {
    let filteredMetrics = [...metricsStore];

    // Apply filters
    if (options.startTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= options.startTime!);
    }
    if (options.endTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= options.endTime!);
    }
    if (options.statusCodes) {
      filteredMetrics = filteredMetrics.filter(m => options.statusCodes!.includes(m.statusCode));
    }
    if (options.paths) {
      filteredMetrics = filteredMetrics.filter(m => options.paths!.includes(m.path));
    }

    // Apply limit
    const limit = options.limit || 1000;
    const paginatedMetrics = filteredMetrics.slice(-limit);

    // Calculate aggregates
    const totalRequests = filteredMetrics.length;
    const successfulRequests = filteredMetrics.filter(m => m.statusCode < 400).length;
    const errorRequests = filteredMetrics.filter(m => m.statusCode >= 400).length;
    const avgResponseTime = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0) / filteredMetrics.length;
    
    // Group by status codes
    const statusDistribution: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      const status = m.statusCode.toString();
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Group by paths
    const pathDistribution: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      pathDistribution[m.path] = (pathDistribution[m.path] || 0) + 1;
    });

    return NextResponse.json({
      summary: {
        totalRequests,
        successfulRequests,
        errorRequests,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        timeRange: {
          start: filteredMetrics[0]?.timestamp,
          end: filteredMetrics[filteredMetrics.length - 1]?.timestamp
        }
      },
      statusDistribution,
      pathDistribution,
      metrics: paginatedMetrics
    });
  }

  // Register metrics callback
  onMetrics(callback: (metrics: APIMetrics) => void): void {
    this.metricsCallbacks.push(callback);
  }

  // Private helper methods
  private generateKey(req: NextRequest): string {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const key = `${ip}:${createHash('md5').update(userAgent).digest('hex')}`;
    return key;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  private getClientIP(req: NextRequest): string {
    // Check various headers for IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const clientIP = req.headers.get('x-client-ip');
    
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (clientIP) {
      return clientIP;
    }
    
    // Fallback to request IP (may not work in all deployments)
    return req.ip || '127.0.0.1';
  }

  private async shouldCountRequest(req: NextRequest, config: RateLimitConfig): Promise<boolean> {
    // This is a simplified implementation
    // In production, you might want to check:
    // - Response status from previous request
    // - Authentication status
    // - Request method
    // - Specific endpoints to exclude
    
    // For now, count all requests
    return true;
  }

  private async extractUserId(req: NextRequest): Promise<string | undefined> {
    // Extract user ID from Authorization header or session
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        // This would verify JWT and extract user ID
        // For now, return undefined
        return undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private storeMetrics(metrics: APIMetrics): void {
    metricsStore.push(metrics);
    
    // Keep only the most recent metrics
    if (metricsStore.length > MAX_METRICS) {
      metricsStore.splice(0, metricsStore.length - MAX_METRICS);
    }
  }

  private notifyMetricsCallbacks(metrics: APIMetrics): void {
    this.metricsCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Metrics callback error:', error);
      }
    });
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Export singleton instance
export const apiGateway = EnterpriseAPIGateway.getInstance();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API limits
  API: { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 1000 requests per 15 minutes
  
  // Auth endpoints (more restrictive)
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 20 }, // 20 requests per 15 minutes
  
  // Search endpoints
  SEARCH: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  
  // Cart operations
  CART: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  
  // Order operations
  ORDERS: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
} as const;