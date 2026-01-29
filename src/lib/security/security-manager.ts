// Advanced Security Features and Rate Limiting
import { NextRequest, NextResponse } from "next/server";
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

interface SecurityViolation {
  type: string;
  ip: string;
  path: string;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
  [key: string]: any;
}

interface SecurityMetrics {
  requestsByIP: Map<string, number>;
  suspiciousRequests: Map<string, Date[]>;
  blockedRequests: number;
  rateLimitedRequests: number;
  securityViolations: SecurityViolation[];
  totalRequests?: number;
  uniqueIPs?: number;
  suspiciousIPs?: number;
  averageRequestsPerIP?: number;
}

class SecurityManager {
  private config: SecurityConfig;
  private metrics: SecurityMetrics;
  private securityHeaders: Record<string, string>;

  constructor(config: SecurityConfig) {
    this.config = config;
    this.metrics = {
      requestsByIP: new Map(),
      suspiciousRequests: new Map(),
      blockedRequests: 0,
      rateLimitedRequests: 0,
      securityViolations: [],
    };

    this.securityHeaders = this.initializeSecurityHeaders();
  }

  private initializeSecurityHeaders() {
    return {
      "Content-Security-Policy": "default-src 'self'; script-src 'none'; object-src 'none';",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    };
  }

  public isIPWhitelisted(ip: string): boolean {
    return (
      this.config.ipWhitelist.includes(ip) ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.") ||
      ip.startsWith("127.")
    );
  }

  public isIPBlocked(ip: string): boolean {
    return this.config.blockedIPs.includes(ip);
  }

  public detectSuspiciousActivity(req: NextRequest): boolean {
    const userAgent = req.headers.get("user-agent") || "";
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

  public recordViolation(violation: Omit<SecurityViolation, "timestamp">) {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: new Date(),
    };
    this.metrics.securityViolations.push(fullViolation);
    
    if (violation.severity === 'high' || violation.severity === 'critical') {
      console.error(`[SECURITY ${violation.severity.toUpperCase()}] ${violation.type} from ${violation.ip}`);
    }
  }

  public getConfig(): SecurityConfig {
    return this.config;
  }

  public getAlerts(): SecurityViolation[] {
    return this.metrics.securityViolations;
  }

  public getSecurityLogs(limit: number = 100, level?: string): SecurityViolation[] {
    let logs = this.metrics.securityViolations;
    if (level) {
      logs = logs.filter(l => l.severity === level);
    }
    return logs.slice(-limit);
  }

  public getRequestsByIP(ip: string): number {
    return this.metrics.requestsByIP.get(ip) || 0;
  }

  public getSuspiciousActivityForIP(ip: string): Date[] {
    return this.metrics.suspiciousRequests.get(ip) || [];
  }

  public addIPToWhitelist(ip: string, description?: string) {
    if (!this.config.ipWhitelist.includes(ip)) {
      this.config.ipWhitelist.push(ip);
    }
  }

  public removeIPFromWhitelist(ip: string) {
    this.config.ipWhitelist = this.config.ipWhitelist.filter(item => item !== ip);
  }

  public createSecurityHeaders(): Record<string, string> {
    return this.securityHeaders;
  }

  public getMetrics() {
    const totalRequests = Array.from(this.metrics.requestsByIP.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    const uniqueIPs = this.metrics.requestsByIP.size;
    
    return {
      ...this.metrics,
      totalRequests,
      uniqueIPs,
      suspiciousIPs: this.metrics.suspiciousRequests.size,
      averageRequestsPerIP: uniqueIPs > 0 ? totalRequests / uniqueIPs : 0,
    };
  }

  public addBlockedIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip);
    }
  }

  public removeBlockedIP(ip: string): void {
    this.config.blockedIPs = this.config.blockedIPs.filter(i => i !== ip);
  }

  public getBlockedIPs(): string[] {
    return [...this.config.blockedIPs];
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
        .filter(Boolean)
        .map((ip) => ip.trim()),
      blockedIPs: (process.env.BLOCKED_IPS || "")
        .split(",")
        .filter(Boolean)
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