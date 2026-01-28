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
import { Progress } from "@/components/ui/progress";
import {
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
} from "lucide-react";

interface Service {
  name: string;
  status: "healthy" | "warning" | "error" | "unknown";
  responseTime: number;
  uptime: number;
  cpu: number;
  memory: number;
  lastCheck: string;
  endpoints: Array<{
    path: string;
    status: "healthy" | "error";
    responseTime: number;
  }>;
}

interface ServiceHealthGridProps {
  services?: Service[];
  detailed?: boolean;
}

export function ServiceHealthGrid({
  services,
  detailed = false,
}: ServiceHealthGridProps) {
  const mockServices: Service[] = [
    {
      name: "User Service",
      status: "healthy",
      responseTime: 120,
      uptime: 99.9,
      cpu: 45,
      memory: 60,
      lastCheck: "2 seconds ago",
      endpoints: [
        { path: "/api/users", status: "healthy", responseTime: 120 },
        { path: "/api/auth", status: "healthy", responseTime: 95 },
      ],
    },
    {
      name: "Product Service",
      status: "healthy",
      responseTime: 85,
      uptime: 99.8,
      cpu: 30,
      memory: 45,
      lastCheck: "3 seconds ago",
      endpoints: [
        { path: "/api/products", status: "healthy", responseTime: 85 },
        { path: "/api/inventory", status: "warning", responseTime: 320 },
      ],
    },
    {
      name: "Order Service",
      status: "warning",
      responseTime: 450,
      uptime: 98.5,
      cpu: 75,
      memory: 80,
      lastCheck: "5 seconds ago",
      endpoints: [
        { path: "/api/orders", status: "healthy", responseTime: 280 },
        { path: "/api/payments", status: "warning", responseTime: 620 },
      ],
    },
    {
      name: "Payment Service",
      status: "healthy",
      responseTime: 200,
      uptime: 99.7,
      cpu: 55,
      memory: 50,
      lastCheck: "1 second ago",
      endpoints: [
        { path: "/api/payments", status: "healthy", responseTime: 200 },
        { path: "/api/refunds", status: "healthy", responseTime: 150 },
      ],
    },
    {
      name: "Analytics Service",
      status: "error",
      responseTime: 2000,
      uptime: 95.2,
      cpu: 90,
      memory: 95,
      lastCheck: "10 seconds ago",
      endpoints: [
        { path: "/api/analytics", status: "error", responseTime: 2000 },
        { path: "/api/reports", status: "error", responseTime: 5000 },
      ],
    },
    {
      name: "Cache Service",
      status: "healthy",
      responseTime: 15,
      uptime: 99.9,
      cpu: 20,
      memory: 35,
      lastCheck: "1 second ago",
      endpoints: [{ path: "/api/cache", status: "healthy", responseTime: 15 }],
    },
  ];

  const displayServices = services || mockServices;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default";
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return "text-green-600";
    if (time < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const getResourceColor = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Service Health
        </CardTitle>
        <CardDescription>Real-time status of all microservices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayServices.map((service, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 space-y-3 ${
                service.status === "error"
                  ? "border-red-200 bg-red-50/50"
                  : service.status === "warning"
                    ? "border-yellow-200 bg-yellow-50/50"
                    : "border-green-200 bg-green-50/50"
              }`}
            >
              {/* Service Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className="font-medium">{service.name}</span>
                </div>
                <Badge variant={getStatusVariant(service.status)}>
                  {service.status.toUpperCase()}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Response</span>
                  </div>
                  <div
                    className={`font-medium ${getResponseTimeColor(service.responseTime)}`}
                  >
                    {service.responseTime}ms
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Uptime</span>
                  </div>
                  <div className="font-medium">{service.uptime}%</div>
                </div>
              </div>

              {/* Resource Usage */}
              {detailed && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" />
                        <span>CPU</span>
                      </div>
                      <span>{service.cpu}%</span>
                    </div>
                    <Progress value={service.cpu} className="h-1" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        <span>Memory</span>
                      </div>
                      <span>{service.memory}%</span>
                    </div>
                    <Progress value={service.memory} className="h-1" />
                  </div>
                </div>
              )}

              {/* Endpoints */}
              {detailed && service.endpoints && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Endpoints
                  </div>
                  <div className="space-y-1">
                    {service.endpoints.map((endpoint, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-mono">{endpoint.path}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(endpoint.status)}
                          <span
                            className={getResponseTimeColor(
                              endpoint.responseTime,
                            )}
                          >
                            {endpoint.responseTime}ms
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Check */}
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Last check: {service.lastCheck}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {displayServices.filter((s) => s.status === "healthy").length}
              </div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {displayServices.filter((s) => s.status === "warning").length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {displayServices.filter((s) => s.status === "error").length}
              </div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{displayServices.length}</div>
              <div className="text-sm text-muted-foreground">
                Total Services
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
