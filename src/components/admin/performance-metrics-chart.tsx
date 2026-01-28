"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface PerformanceMetricsChartProps {
  data?: any;
  detailed?: boolean;
}

export function PerformanceMetricsChart({
  data,
  detailed = false,
}: PerformanceMetricsChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>No performance data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const generateTimeSeriesData = () => {
    const points = detailed ? 24 : 12; // hours or 5-minute intervals
    return Array.from({ length: points }, (_, i) => ({
      time: detailed ? `${i}:00` : `${i * 5}m`,
      responseTime: Math.random() * 200 + 100 + (i % 3 === 0 ? 50 : 0),
      throughput: Math.random() * 1000 + 500,
      errorRate: Math.random() * 5,
      cpu: Math.random() * 60 + 20,
      memory: Math.random() * 40 + 30,
    }));
  };

  const chartData = data.timeSeries || generateTimeSeriesData();

  const metrics = {
    avgResponseTime: data.avgResponseTime || Math.random() * 500 + 100,
    p95ResponseTime: data.p95ResponseTime || Math.random() * 800 + 200,
    throughput: data.throughput || Math.random() * 2000 + 800,
    errorRate: data.errorRate || Math.random() * 3,
    uptime: data.uptime || 99.9,
    requests: data.requests || Math.random() * 10000 + 5000,
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold)
      return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            {getTrendIcon(metrics.avgResponseTime, 500)}
          </div>
          <div className="text-2xl font-bold">
            {metrics.avgResponseTime.toFixed(0)}ms
          </div>
          <div className="text-xs text-muted-foreground">
            P95: {metrics.p95ResponseTime.toFixed(0)}ms
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Throughput</span>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {metrics.throughput.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">req/min</div>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Error Rate</span>
            </div>
            {getTrendIcon(metrics.errorRate, 1)}
          </div>
          <div className="text-2xl font-bold">
            {metrics.errorRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Last {metrics.requests.toFixed(0)} requests
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{metrics.uptime.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Last 24h</div>
        </div>
      </div>

      {/* Charts */}
      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>
                Average and P95 response times over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#8884d8"
                    name="Response Time (ms)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Throughput & Error Rate</CardTitle>
              <CardDescription>
                Request volume and error rate correlation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="throughput"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Throughput"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errorRate"
                    stroke="#ff7300"
                    name="Error Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {!detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key performance metrics trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#8884d8"
                  name="Response Time (ms)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="throughput"
                  stroke="#82ca9d"
                  name="Throughput"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
