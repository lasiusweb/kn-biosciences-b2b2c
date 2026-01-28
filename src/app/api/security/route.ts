// Security API Routes
import { NextRequest, NextResponse } from "next/server";
import { securityManager } from "@/lib/security/security-manager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ip, severity, message, metadata } = body;

    switch (action) {
      case "block-ip":
        if (!ip) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.addBlockedIP(ip);
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been blocked`,
        });

      case "unblock-ip":
        if (!ip) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.removeBlockedIP(ip);
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been unblocked`,
        });

      case "get-blocked-ips":
        return NextResponse.json({
          success: true,
          data: {
            blockedIPs: securityManager.getBlockedIPs(),
            totalRequests: securityManager.getMetrics().totalRequests,
            blockedRequests: securityManager.getMetrics().blockedRequests,
            securityViolations: securityManager.getMetrics().securityViolations,
          },
        });

      case "add-ip-whitelist":
        const { ip, description } = body;
        if (!ip) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.addIPToWhitelist(ip, description);
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been added to whitelist`,
        });

      case "remove-ip-whitelist":
        const { ip } = body;
        if (!ip) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.removeIPFromWhitelist(ip);
        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been removed from whitelist`,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Security POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "metrics":
        const metrics = securityManager.getMetrics();
        const blockedIPs = securityManager.getBlockedIPs();

        return NextResponse.json({
          success: true,
          data: {
            ...metrics,
            blockedIPs,
            recentlyBlocked: blockedIPs.slice(-10),
          },
        });

      case "security-config":
        return NextResponse.json({
          success: true,
          data: {
            config: {
              rateLimitWindow: securityManager.config.rateLimitWindow,
              rateLimitMax: securityManager.config.rateLimitMax,
              enableCORS: securityManager.config.enableCORS,
              enableSecurityHeaders:
                securityManager.config.enableSecurityHeaders,
              enableIPWhitelist: securityManager.config.enableIPWhitelist,
              ipWhitelist: securityManager.config.ipWhitelist,
              blockedIPs: securityManager.config.blockedIPs,
              enableRequestLogging: securityManager.config.enableRequestLogging,
              enableRateLimiting: securityManager.config.enableRateLimiting,
              enableIPBlocking: securityManager.config.enableIPBlocking,
            },
          },
        });

      case "alerts":
        const limit = parseInt(searchParams.get("limit") || "50");
        const severity =
          (searchParams.get("severity") as
            | "low"
            | "medium"
            | "high"
            | "critical") || "medium";

        const alerts = securityManager
          .getAlerts()
          .filter((alert) => !severity || alert.severity === severity)
          .slice(-limit);

        return NextResponse.json({
          success: true,
          data: alerts,
        });

      case "logs":
        const limit = parseInt(searchParams.get("limit") || "100");
        const level =
          (searchParams.get("level") as
            | "info"
            | "warning"
            | "error"
            | "critical") || "info";

        const logs = securityManager.getSecurityLogs(limit, level);

        return NextResponse.json({
          success: true,
          data: logs,
        });

      case "ip-info":
        const ip = searchParams.get("ip");
        if (!ip) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        const isBlocked = securityManager.isIPBlocked(ip);
        const isWhitelisted = securityManager.isIPWhitelisted(ip);
        const requests = securityManager.getRequestsByIP(ip);
        const suspiciousActivity =
          securityManager.getSuspiciousActivityForIP(ip);

        return NextResponse.json({
          success: true,
          data: {
            ip,
            isBlocked,
            isWhitelisted,
            requests,
            suspiciousActivity,
          },
        });

      default:
        return NextResponse.json(
          { error: "Invalid endpoint" },
          { status: 404 },
        );
    }
  } catch (error) {
    console.error("Security GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Middleware for applying security measures
export function securityMiddleware() {
  return (req: NextRequest, res: NextResponse, next: NextFunction) => {
    // Apply security headers
    if (securityManager.config.enableSecurityHeaders) {
      const securityHeaders = securityManager.createSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    // Apply rate limiting
    if (securityManager.config.enableRateLimiting) {
      const rateLimiter = securityManager.getRateLimiter();
      if (rateLimiter) {
        await rateLimiter(req, res, next);
        return;
      }
    }

    // Apply IP blocking
    if (securityManager.config.enableIPBlocking) {
      if (
        securityManager.isIPBlocked(req.headers["x-forwarded-for"] || req.ip)
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Check for suspicious activity
      if (securityManager.detectSuspiciousActivity(req)) {
        return NextResponse.json({ error: "Request blocked" }, { status: 403 });
      }

      // Check IP whitelist
      if (
        securityManager.config.enableIPWhitelist &&
        !securityManager.isIPWhitelisted(
          req.headers["x-forwarded-for"] || req.ip,
        )
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // Log the request
      if (securityManager.config.enableRequestLogging) {
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}`,
        );
      }

      next();
    }
  };
}
