"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Cpu,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Server,
  Zap,
} from "lucide-react";
import { PerformanceMetricsChart } from "./performance-metrics-chart";
import { ServiceHealthGrid } from "./service-health-grid";
// import { SecurityAlertsList } from "./security-alerts-list";
// import { CacheAnalytics } from "./cache-analytics";
// import { CDNPerformance } from "./cdn-performance";
// import { LoadBalancerMetrics } from "./load-balancer-metrics";

const SecurityAlertsList = ({ alerts, detailed }: any) => null;
const CacheAnalytics = ({ data, detailed }: any) => null;
const CDNPerformance = ({ data }: any) => null;
const LoadBalancerMetrics = ({ data }: any) => null;

interface MonitoringDashboardProps {
  className?: string;
}

export function MonitoringDashboard({ className }: MonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/monitoring/performance");
      const data = await response.json();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSystemHealth = () => {
    if (!metrics) return { status: "unknown", score: 0 };

    const { performance, services, security, cache } = metrics;
    let healthScore = 100;
    let issues = [];

    // Check performance
    if (performance.avgResponseTime > 1000) {
      healthScore -= 20;
      issues.push("High response time");
    }

    // Check services
    const unhealthyServices =
      services?.filter((s: any) => s.status !== "healthy")?.length || 0;
    if (unhealthyServices > 0) {
      healthScore -= unhealthyServices * 15;
      issues.push(`${unhealthyServices} unhealthy services`);
    }

    // Check security
    const criticalAlerts =
      security?.alerts?.filter((a: any) => a.severity === "critical")?.length ||
      0;
    if (criticalAlerts > 0) {
      healthScore -= criticalAlerts * 10;
      issues.push(`${criticalAlerts} critical security alerts`);
    }

    // Check cache
    const cacheHitRate = cache?.hitRate || 0;
    if (cacheHitRate < 70) {
      healthScore -= 10;
      issues.push("Low cache hit rate");
    }

    const status =
      healthScore >= 90
        ? "healthy"
        : healthScore >= 70
          ? "warning"
          : "critical";

    return { status, score: Math.max(0, healthScore), issues };
  };

  const systemHealth = getSystemHealth();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? "Pause" : "Resume"} Auto-refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                <Badge
                  variant={
                    systemHealth.status === "healthy"
                      ? "default"
                      : systemHealth.status === "warning"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {systemHealth.status.toUpperCase()}
                </Badge>
              </div>
              <Progress value={systemHealth.score} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Health Score: {systemHealth.score}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Services</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics?.services?.filter((s: any) => s.status === "healthy")
                  ?.length || 0}
                /{metrics?.services?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Healthy services
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics?.performance?.avgResponseTime || 0}ms
              </div>
              <div className="text-xs text-muted-foreground">
                Average response
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cache Hit Rate</span>
              </div>
              <div className="text-2xl font-bold">
                {metrics?.cache?.hitRate || 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                Cache efficiency
              </div>
            </div>
          </div>

          {systemHealth.issues.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  Active Issues
                </span>
              </div>
              <ul className="text-sm text-destructive space-y-1">
                {systemHealth.issues.map((issue: string, index: number) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Monitoring Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceMetricsChart data={metrics?.performance} />
            <ServiceHealthGrid services={metrics?.services} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecurityAlertsList alerts={metrics?.security?.alerts} />
            <CacheAnalytics data={metrics?.cache} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsChart data={metrics?.performance} detailed />
          <LoadBalancerMetrics data={metrics?.loadBalancer} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceHealthGrid services={metrics?.services} detailed />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecurityAlertsList alerts={metrics?.security?.alerts} detailed />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheAnalytics data={metrics?.cache} detailed />
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4">
          <CDNPerformance data={metrics?.cdn} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
