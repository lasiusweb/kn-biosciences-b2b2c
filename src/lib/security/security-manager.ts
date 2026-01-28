// Advanced Security Features and Rate Limiting
import { NextRequest, NextResponse } from "next/server";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { performanceMonitor } from "@/lib/performance/monitoring";

interface SecurityConfig {
  rateLimitWindow: number; // milliseconds
  rateLimitMax: number;
  enableCORS: boolean;
  enableSecurityHeaders: boolean;
  enableIPWhitelist: boolean;
  ipWhitelist: string[];
  blockedIPs: string[];
  enableRequestLogging: boolean;
  enableRateLimiting: boolean;
  enableIPBlocking: boolean;
}

interface SecurityMetrics {
  requestsByIP: Map<string, number>;
  suspiciousRequests: Map<string, number[]>;
  blockedRequests: number;
  rateLimitedRequests: number;
  securityViolations: Array<{
    type: string;
    ip: string;
    path: string;
    timestamp: Date;
    severity: "low" | "medium" | "high" | "critical";
  }>;
}

class SecurityManager {
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private rateLimiters: Map<string, any> = new Map();
  private securityHeaders: any;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.metrics = {
      requestsByIP: new Map(),
      suspiciousRequests: new Map(),
      blockedRequests: 0,
      rateLimitedRequests: 0,
      securityViolations: [],
    };

    this.initializeRateLimiters();
    this.initializeSecurityHeaders();
  }

  private initializeRateLimiters() {
    // Different rate limits for different endpoints
    this.rateLimiters.set(
      "api",
      rateLimit({
        windowMs: this.config.rateLimitWindow,
        max: this.config.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: "Too many requests from this IP, please try again later.",
        store: {
          incrementKey: req.headers["x-forwarded-for"] || req.ip,
          setKeyExpiry: "EXPIRE_KEYS",
          resetExpiryOnChange: true,
          skipFailedRequests: true,
          skipSuccessfulRequests: false,
          clearExpired: true,
          max: 1000, // Maximum number of keys to store
          keyGenerator: (req: any) => {
            const ip = req.headers["x-forwarded-for"] || req.ip;
            return `api:${ip}:${Date.now()}`;
          },
          keyGenerator: req.ip || "unknown",
        },
      }),
    );

    this.rateLimiters.set(
      "auth",
      rateLimit({
        windowMs: this.config.rateLimitWindow * 2, // Stricter for auth
        max: this.config.rateLimitMax / 2,
        standardHeaders: true,
        legacyHeaders: false,
        message: "Too many authentication attempts, please try again later.",
        store: {
          incrementKey: req.ip,
          setKeyExpiry: "EXPIRE_KEYS",
          resetExpiryOnChange: true,
          clearExpired: this.config.rateLimitWindow,
        },
      }),
    );

    this.rateLimiters.set(
      "admin",
      rateLimit({
        windowMs: this.config.rateLimitWindow / 2, // More restrictive for admin
        max: this.config.rateLimitMax / 4,
        standardHeaders: true,
        legacyHeaders: false,
        message: "Admin access rate limit exceeded.",
        store: {
          incrementKey: req.ip,
          setKeyExpiry: "EXPIRE_KEYS",
          resetExpiryOnChange: true,
          clearExpired: this.config.rateLimitWindow / 2,
        },
      }),
    );
  }

  private initializeSecurityHeaders() {
    this.securityHeaders = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'unsafe-inline'", "'unsafe-eval'"],
          scriptSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          imgSrc: ["'data:', 'https:'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      dnsPrefetchControl: false,
      frameguard: true,
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: [],
      referrerPolicy: "strict-origin-when-cross-origin",
      xContentTypeOptions: {
        nosniff: true,
      },
      xDnsPrefetchControl: "off",
    });
  }

  private isIPWhitelisted(ip: string): boolean {
    return (
      this.config.ipWhitelist.includes(ip) ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.") ||
      ip.startsWith("127.")
    );
  }

  private isIPBlocked(ip: string): boolean {
    return this.config.blockedIPs.includes(ip);
  }

  private detectSuspiciousActivity(req: NextRequest): boolean {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    const userAgent = req.headers["user-agent"] || "";
    const suspiciousPatterns = [
      /bot/i,
      /scanner/i,
      /crawler/i,
      /sqlmap/i,
      /xss/i,
      /script/i,
      /eval/i,
      /alert/i,
      /evil/i,
    ];

    return (
      suspiciousPatterns.some((pattern) => pattern.test(userAgent)) ||
      req.url.includes("..") ||
      req.url.includes("%2e") ||
      req.url.includes("<script>")
    );
  }

  private updateMetrics(
    req: NextRequest,
    action: "request" | "blocked" | "rate_limited" | "suspicious",
  ): void {
    const ip = req.headers["x-forwarded-for"] || req.ip;

    this.metrics.requestsByIP.set(
      ip,
      (this.metrics.requestsByIP.get(ip) || 0) + 1,
    );

    if (action === "suspicious") {
      const suspicious = this.metrics.suspiciousRequests.get(ip) || [];
      suspicious.push(new Date());

      if (suspicious.length >= 5) {
        this.metrics.securityViolations.push({
          type: "suspicious_activity",
          ip,
          path: req.url,
          timestamp: new Date(),
          severity: "medium",
        });
      }
    } else if (action === "blocked") {
      this.metrics.blockedRequests++;
      this.metrics.securityViolations.push({
        type: "ip_blocked",
        ip,
        path: req.url,
        timestamp: new Date(),
        severity: "high",
      });
    } else if (action === "rate_limited") {
      this.metrics.rateLimitedRequests++;
      this.metrics.securityViolations.push({
        type: "rate_limit_exceeded",
        ip,
        path: req.url,
        timestamp: new Date(),
        severity: "low",
      });
    }

    // Log security events
    performanceMonitor.addAlert(
      action === "blocked" ? "error" : "warning",
      `Security: ${action} - IP: ${ip}, Path: ${req.url}`,
      "security",
    );
  }

  private getRateLimiter(endpoint: string): any {
    if (endpoint.startsWith("/api/auth")) {
      return this.rateLimiters.get("auth");
    } else if (endpoint.startsWith("/api/admin")) {
      return this.rateLimiters.get("admin");
    } else {
      return this.rateLimiters.get("api");
    }
  }

  createRateLimitMiddleware(endpoint?: string) {
    const rateLimiter = this.getRateLimiter(endpoint || "api");

    return async (req: NextRequest, res: NextResponse, next: () => void) => {
      const ip = req.headers["x-forwarded-for"] || req.ip;

      // Check IP blocking first
      if (this.config.enableIPBlocking && this.isIPBlocked(ip)) {
        this.updateMetrics(req, "blocked");
        return NextResponse.json(
          { error: "Access denied: IP address is blocked" },
          { status: 403 },
        );
      }

      // Check IP whitelist
      if (this.config.enableIPWhitelist && !this.isIPWhitelisted(ip)) {
        this.updateMetrics(req, "blocked");
        return NextResponse.json(
          { error: "Access denied: IP not whitelisted" },
          { status: 403 },
        );
      }

      // Check for suspicious activity
      if (this.detectSuspiciousActivity(req)) {
        this.updateMetrics(req, "suspicious");
        return NextResponse.json(
          { error: "Request blocked: Suspicious activity detected" },
          { status: 403 },
        );
      }

      // Apply rate limiting
      if (this.config.enableRateLimiting) {
        await rateLimiter(req, res, () => {
          if (!req.headers["x-forwarded-for"]) {
            req.headers["x-forwarded-for"] = ip;
          }
          this.updateMetrics(req, "request");
          return next();
        });

        // Rate limited
        this.updateMetrics(req, "rate_limited");
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 },
        );
      }

      // Normal processing
      this.updateMetrics(req, "request");
      return next();
    };
  }

  createSecurityHeaders(): any {
    return this.securityHeaders;
  }

  async logSecurityEvent(
    type: string,
    details: Record<string, any>,
    severity: "low" | "medium" | "high" | "critical" = "medium",
  ): Promise<void> {
    this.metrics.securityViolations.push({
      type,
      ip: details.ip || "unknown",
      path: details.path || "/",
      timestamp: new Date(),
      severity,
      ...details,
    });

    // Store in database or external system
    console.log(`SECURITY [${severity.toUpperCase()}]: ${type}`, details);

    // Send alert for high/critical events
    if (severity === "high" || severity === "critical") {
      // Here you could send to Slack, email, SMS, etc.
      performanceMonitor.addAlert("critical", `Security ${type}`, "security");
    }
  }

  getMetrics(): SecurityMetrics {
    const totalRequests = Array.from(this.metrics.requestsByIP.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const uniqueIPs = this.metrics.requestsByIP.size;
    const suspiciousIPs = this.metrics.suspiciousRequests.size;

    return {
      ...this.metrics,
      totalRequests,
      uniqueIPs,
      suspiciousIPs,
      averageRequestsPerIP: uniqueIPs > 0 ? totalRequests / uniqueIPs : 0,
    };
  }

  clearMetrics(): void {
    this.metrics = {
      requestsByIP: new Map(),
      suspiciousRequests: new Map(),
      blockedRequests: 0,
      rateLimitedRequests: 0,
      securityViolations: [],
    };
  }

  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  addBlockedIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip);
      console.log(`IP ${ip} added to block list`);
    }
  }

  removeBlockedIP(ip: string): void {
    const index = this.config.blockedIPs.indexOf(ip);
    if (index > -1) {
      this.config.blockedIPs.splice(index, 1);
      console.log(`IP ${ip} removed from block list`);
    }
  }

  getBlockedIPs(): string[] {
    return [...this.config.blockedIPS];
  }

  static createDefaultConfig(): SecurityConfig {
    return {
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"),
      enableCORS: process.env.ENABLE_CORS !== "false",
      enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS !== "false",
      enableIPWhitelist: process.env.ENABLE_IP_WHITELIST === "true",
      ipWhitelist: (process.env.IP_WHITELIST || "")
        .split(",")
        .map((ip) => ip.trim()),
      blockedIPs: (process.env.BLOCKED_IPS || "")
        .split(",")
        .map((ip) => ip.trim()),
      enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === "true",
      enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== "false",
      enableIPBlocking: process.env.ENABLE_IP_BLOCKING !== "false",
    };
  }
}

export const securityManager = new SecurityManager(
  SecurityManager.createDefaultConfig(),
);

export default SecurityManager;
