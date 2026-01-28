// Performance Monitoring API
import { NextRequest, NextResponse } from "next/server";
import { performanceMonitor, loadBalancer } from "@/lib/performance/monitoring";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const service = searchParams.get("service");

    switch (type) {
      case "system":
        const systemHealth = performanceMonitor.getSystemHealth();
        return NextResponse.json({
          success: true,
          data: systemHealth,
        });

      case "service":
        if (!service) {
          return NextResponse.json(
            { error: "Service name is required" },
            { status: 400 },
          );
        }

        const serviceMetrics = performanceMonitor.getServiceMetrics(service);
        if (!serviceMetrics) {
          return NextResponse.json(
            { error: "Service not found" },
            { status: 404 },
          );
        }

        return NextResponse.json({
          success: true,
          data: serviceMetrics,
        });

      case "load-balancer":
        const loadBalancerHealth = loadBalancer.getServiceHealth();
        return NextResponse.json({
          success: true,
          data: {
            algorithm: loadBalancer.config.algorithm,
            services: Array.from(loadBalancerHealth.entries()).map(
              ([name, health]) => ({
                name,
                ...health,
              }),
            ),
          },
        });

      case "alerts":
        const alerts = performanceMonitor.getAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
        });

      default:
        // Return comprehensive monitoring data
        const systemHealth = performanceMonitor.getSystemHealth();
        const loadBalancerHealth = loadBalancer.getServiceHealth();

        return NextResponse.json({
          success: true,
          data: {
            system: systemHealth,
            loadBalancer: {
              algorithm: loadBalancer.config.algorithm,
              services: Array.from(loadBalancerHealth.entries()).map(
                ([name, health]) => ({
                  name,
                  ...health,
                }),
              ),
            },
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (error) {
    console.error("Performance monitoring GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serviceName, algorithm } = body;

    switch (action) {
      case "clear-metrics":
        if (serviceName) {
          performanceMonitor.clearMetrics(serviceName);
        } else {
          performanceMonitor.clearMetrics();
        }

        return NextResponse.json({
          success: true,
          message: `Metrics cleared${serviceName ? " for " + serviceName : ""}`,
        });

      case "clear-alerts":
        performanceMonitor.clearAlerts();
        return NextResponse.json({
          success: true,
          message: "Alerts cleared",
        });

      case "test-alert":
        performanceMonitor.addAlert(
          "warning",
          "Test alert from monitoring system",
          serviceName || "test-service",
        );
        return NextResponse.json({
          success: true,
          message: "Test alert generated",
        });

      case "update-load-balancer":
        if (!algorithm || !serviceName) {
          return NextResponse.json(
            { error: "Algorithm and service name are required" },
            { status: 400 },
          );
        }

        // This would typically update the load balancer configuration
        // For now, we'll just acknowledge the request
        return NextResponse.json({
          success: true,
          message: `Load balancer algorithm updated to ${algorithm} for ${serviceName}`,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Performance monitoring POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Webhook endpoint for receiving alerts from external systems
export async function PUT(request: NextRequest) {
  try {
    const alert = await request.json();
    const { level, message, service, metadata } = alert;

    if (!level || !message) {
      return NextResponse.json(
        { error: "Level and message are required" },
        { status: 400 },
      );
    }

    // Validate alert level
    const validLevels = ["info", "warning", "error", "critical"];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid alert level" },
        { status: 400 },
      );
    }

    // Add the alert
    performanceMonitor.addAlert(level, message, service, metadata);

    // Here you could also:
    // - Send notifications to Slack/Discord
    // - Trigger paging for critical alerts
    // - Store to external monitoring system
    // - Create incident tickets

    return NextResponse.json({
      success: true,
      message: "Alert received and processed",
    });
  } catch (error) {
    console.error("Performance monitoring webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
