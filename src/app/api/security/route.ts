// Security API Routes
import { NextRequest, NextResponse } from "next/server";
import { securityManager } from "@/lib/security/security-manager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ip } = body;

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
        const metrics = securityManager.getMetrics();
        return NextResponse.json({
          success: true,
          data: {
            blockedIPs: securityManager.getBlockedIPs(),
            totalRequests: metrics.totalRequests,
            blockedRequests: metrics.blockedRequests,
            securityViolations: metrics.securityViolations,
          },
        });

      case "add-ip-whitelist": {
        const { ip: whitelistIp, description } = body;
        if (!whitelistIp) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.addIPToWhitelist(whitelistIp, description);
        return NextResponse.json({
          success: true,
          message: `IP ${whitelistIp} has been added to whitelist`,
        });
      }

      case "remove-ip-whitelist": {
        const { ip: removeIp } = body;
        if (!removeIp) {
          return NextResponse.json(
            { error: "IP address is required" },
            { status: 400 },
          );
        }

        securityManager.removeIPFromWhitelist(removeIp);
        return NextResponse.json({
          success: true,
          message: `IP ${removeIp} has been removed from whitelist`,
        });
      }

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
      case "metrics": {
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
      }

      case "security-config":
        const config = securityManager.getConfig();
        return NextResponse.json({
          success: true,
          data: {
            config: {
              rateLimitWindow: config.rateLimitWindow,
              rateLimitMax: config.rateLimitMax,
              enableCORS: config.enableCORS,
              enableSecurityHeaders: config.enableSecurityHeaders,
              enableIPWhitelist: config.enableIPWhitelist,
              ipWhitelist: config.ipWhitelist,
              blockedIPs: config.blockedIPs,
              enableRequestLogging: config.enableRequestLogging,
              enableRateLimiting: config.enableRateLimiting,
              enableIPBlocking: config.enableIPBlocking,
            },
          },
        });

      case "alerts": {
        const limitStr = searchParams.get("limit") || "50";
        const limit = parseInt(limitStr);
        const severity = searchParams.get("severity");

        const alerts = securityManager
          .getAlerts()
          .filter((alert) => !severity || alert.severity === severity)
          .slice(-limit);

        return NextResponse.json({
          success: true,
          data: alerts,
        });
      }

      case "logs": {
        const limitStr = searchParams.get("limit") || "100";
        const limit = parseInt(limitStr);
        const level = searchParams.get("level") || undefined;

        const logs = securityManager.getSecurityLogs(limit, level);

        return NextResponse.json({
          success: true,
          data: logs,
        });
      }

      case "ip-info": {
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
      }

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
export async function securityMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const config = securityManager.getConfig();

  // Apply security headers
  if (config.enableSecurityHeaders) {
    const securityHeaders = securityManager.createSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
  }

  // Apply IP blocking
  if (config.enableIPBlocking) {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (securityManager.isIPBlocked(clientIp)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check for suspicious activity
    if (securityManager.detectSuspiciousActivity(req)) {
      return NextResponse.json({ error: "Request blocked" }, { status: 403 });
    }

    // Check IP whitelist
    if (
      config.enableIPWhitelist &&
      !securityManager.isIPWhitelisted(clientIp)
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Log the request
    if (config.enableRequestLogging) {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${clientIp}`,
      );
    }
  }

  return res;
}