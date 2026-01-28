"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { performanceMonitor } from "@/lib/performance/monitoring";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Zap,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  status?: "good" | "warning" | "critical";
  icon?: React.ReactNode;
}

function MetricCard({
  title,
  value,
  unit,
  trend,
  status = "good",
  icon,
}: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
          >
            {status}
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1">
          <span className="text-2xl font-semibold">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {trend && (
          <div className="mt-2 flex items-center space-x-1">
            {getTrendIcon()}
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PerformanceDashboard() {
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const { getMetrics } = usePerformanceMonitoring({
    trackPageViews: true,
    trackUserInteractions: true,
    trackResources: true,
    sampleRate: 0.2,
  });

  useEffect(() => {
    const fetchMetrics = () => {
      const health = getMetrics?.() || performanceMonitor.getSystemHealth();
      const recentAlerts = performanceMonitor.getAlerts(undefined, 10);

      setSystemHealth(health);
      setAlerts(recentAlerts);
    };

    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, getMetrics]);

  const getAlertIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-organic-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-organic-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Performance Dashboard
          </h2>
          <Badge className={getSystemStatusColor(systemHealth.status)}>
            {systemHealth.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Response Time"
          value={systemHealth.system.responseTime || 0}
          unit="ms"
          status={systemHealth.system.responseTime > 5000 ? "critical" : "good"}
          icon={<Clock className="h-4 w-4 text-organic-600" />}
          trend="stable"
        />
        <MetricCard
          title="Memory Usage"
          value={
            Math.round(
              (systemHealth.system.memoryUsage.heapUsed / 1024 / 1024) * 100,
            ) / 100
          }
          unit="MB"
          status={
            systemHealth.system.memoryUsage.heapUsed > 500 * 1024 * 1024
              ? "warning"
              : "good"
          }
          icon={<Server className="h-4 w-4 text-organic-600" />}
          trend="up"
        />
        <MetricCard
          title="Total Requests"
          value={systemHealth.system.requestCount}
          unit="requests"
          status="good"
          icon={<Activity className="h-4 w-4 text-organic-600" />}
          trend="up"
        />
        <MetricCard
          title="Error Rate"
          value={systemHealth.system.errorCount}
          unit="errors"
          status={systemHealth.system.errorCount > 10 ? "critical" : "good"}
          icon={<XCircle className="h-4 w-4 text-organic-600" />}
          trend={systemHealth.system.errorCount > 0 ? "up" : "stable"}
        />
      </div>

      {/* Services Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-organic-600" />
              <span>Service Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.services.map((service: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        service.status === "healthy"
                          ? "bg-green-500"
                          : service.status === "degraded"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">{service.service}</p>
                      <p className="text-xs text-gray-500">
                        v{service.version}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {service.responseTime}ms
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(service.uptime / 1000 / 60)}m uptime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-organic-600" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent alerts
                </p>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-2 bg-gray-50 rounded"
                  >
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.service} •{" "}
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.level}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-organic-600" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                performanceMonitor.clearMetrics();
                performanceMonitor.clearAlerts();
                window.location.reload();
              }}
            >
              Clear Metrics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/api/health", "_blank")}
            >
              Health Check API
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const metrics = performanceMonitor.getSystemHealth();
                const blob = new Blob([JSON.stringify(metrics, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `performance-metrics-${new Date().toISOString()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
