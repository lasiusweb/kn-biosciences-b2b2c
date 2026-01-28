"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Server,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Settings,
  Zap,
  Globe,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  version: string;
  url: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  uptime: number;
  errorCount: number;
  lastCheck: Date;
  description?: string;
}

interface ServiceMetric {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  averageResponseTime: number;
  totalRequests: number;
  uptime: number;
}

export function useMicroservicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetric>({
    totalServices: 0,
    healthyServices: 0,
    degradedServices: 0,
    unhealthyServices: 0,
    averageResponseTime: 0,
    totalRequests: 0,
    uptime: 100,
  });

  // Initialize with mock services
  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: "user-service",
        name: "User Service",
        version: "1.2.0",
        url: "http://localhost:3001",
        status: "healthy",
        responseTime: 45,
        uptime: 99.8,
        errorCount: 2,
        lastCheck: new Date(),
        description: "Manages user authentication and profiles",
      },
      {
        id: "product-service",
        name: "Product Service",
        version: "1.1.0",
        url: "http://localhost:3002",
        status: "healthy",
        responseTime: 62,
        uptime: 99.5,
        errorCount: 5,
        lastCheck: new Date(),
        description: "Product catalog and inventory management",
      },
      {
        id: "order-service",
        name: "Order Service",
        version: "2.0.0",
        url: "http://localhost:3003",
        status: "degraded",
        responseTime: 145,
        uptime: 97.2,
        errorCount: 12,
        lastCheck: new Date(),
        description: "Order processing and management",
      },
      {
        id: "payment-service",
        name: "Payment Service",
        version: "1.5.2",
        url: "http://localhost:3004",
        status: "healthy",
        responseTime: 89,
        uptime: 99.9,
        errorCount: 1,
        lastCheck: new Date(),
        description: "Payment processing and transactions",
      },
      {
        id: "analytics-service",
        name: "Analytics Service",
        version: "1.0.3",
        url: "http://localhost:3005",
        status: "unhealthy",
        responseTime: 5000,
        uptime: 85.1,
        errorCount: 25,
        lastCheck: new Date(),
        description: "Data analytics and reporting",
      },
      {
        id: "notification-service",
        name: "Notification Service",
        version: "1.3.1",
        url: "http://localhost:3006",
        status: "healthy",
        responseTime: 34,
        uptime: 99.7,
        errorCount: 3,
        lastCheck: new Date(),
        description: "Email and SMS notifications",
      },
    ];

    setServices(mockServices);

    const healthy = mockServices.filter((s) => s.status === "healthy").length;
    const degraded = mockServices.filter((s) => s.status === "degraded").length;
    const unhealthy = mockServices.filter(
      (s) => s.status === "unhealthy",
    ).length;
    const avgResponseTime =
      mockServices.reduce((sum, s) => sum + s.responseTime, 0) /
      mockServices.length;

    setMetrics({
      totalServices: mockServices.length,
      healthyServices: healthy,
      degradedServices: degraded,
      unhealthyServices: unhealthy,
      averageResponseTime: avgResponseTime,
      totalRequests:
        mockServices.reduce((sum, s) => sum + s.errorCount, 0) * 100,
      uptime:
        mockServices.reduce((sum, s) => sum + s.uptime, 0) /
        mockServices.length,
    });
  }, []);

  const refreshService = async (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.id === serviceId) {
          // Simulate health check
          const newResponseTime = Math.random() * 500;
          const isHealthy = newResponseTime < 1000;
          return {
            ...service,
            responseTime: newResponseTime,
            status: isHealthy ? "healthy" : "unhealthy",
            lastCheck: new Date(),
            errorCount: isHealthy ? 0 : service.errorCount + 1,
          };
        }
        return service;
      }),
    );
  };

  const refreshAllServices = async () => {
    const promises = services.map((service) => refreshService(service.id));
    await Promise.all(promises);
  };

  const addService = (service: Omit<Service, "id" | "lastCheck">) => {
    const newService: Service = {
      ...service,
      id: service.name.toLowerCase().replace(/\s+/g, "-"),
      lastCheck: new Date(),
    };
    setServices((prev) => [...prev, newService]);
  };

  const removeService = (serviceId: string) => {
    setServices((prev) => prev.filter((service) => service.id !== serviceId));
  };

  return {
    services,
    metrics,
    refreshService,
    refreshAllServices,
    addService,
    removeService,
  };
}

function ServiceCard({
  service,
  onRefresh,
  onRemove,
}: {
  service: Service;
  onRefresh: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh(service.id);
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "unhealthy":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "degraded":
        return AlertTriangle;
      case "unhealthy":
        return XCircle;
      default:
        return Activity;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 100) return "text-green-600";
    if (responseTime < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const StatusIcon = getStatusIcon(service.status);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon
            className={`h-5 w-5 ${getStatusColor(service.status).split(" ")[0]}`}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.version}</p>
          </div>
        </div>
        <Badge className={getStatusColor(service.status)}>
          {service.status.toUpperCase()}
        </Badge>
      </div>

      {service.description && (
        <p className="text-sm text-gray-600">{service.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Response Time</p>
          <p
            className={`font-medium ${getResponseTimeColor(service.responseTime)}`}
          >
            {service.responseTime}ms
          </p>
        </div>
        <div>
          <p className="text-gray-500">Uptime</p>
          <p className="font-medium">{service.uptime}%</p>
        </div>
        <div>
          <p className="text-gray-500">Errors</p>
          <p className="font-medium">{service.errorCount}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Check</p>
          <p className="font-medium">
            {service.lastCheck.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500 font-mono">{service.url}</p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(service.id)}
          >
            <XCircle className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MicroservicesDashboard() {
  const { services, metrics, refreshAllServices, addService, removeService } =
    useMicroservicesManager();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    version: "1.0.0",
    url: "",
    description: "",
  });

  const handleAddService = () => {
    if (newService.name && newService.url) {
      addService({
        ...newService,
        status: "unhealthy",
        responseTime: 0,
        uptime: 0,
        errorCount: 0,
      });
      setNewService({ name: "", version: "1.0.0", url: "", description: "" });
      setShowAddForm(false);
    }
  };

  const getSystemHealthColor = () => {
    if (metrics.unhealthyServices === 0 && metrics.degradedServices === 0)
      return "text-green-600";
    if (metrics.unhealthyServices === 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getSystemHealthText = () => {
    if (metrics.unhealthyServices === 0 && metrics.degradedServices === 0)
      return "All Systems Operational";
    if (metrics.unhealthyServices === 0) return "Some Systems Degraded";
    return "Critical Issues Detected";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Server className="h-6 w-6 text-organic-600" />
          <h2 className="text-2xl font-bold text-gray-900">Microservices</h2>
          <Badge className={getSystemHealthColor()}>
            {getSystemHealthText()}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAllServices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-organic-600" />
              <h3 className="text-sm font-medium text-gray-600">
                Total Services
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.totalServices}
            </p>
            <p className="text-xs text-gray-500 mt-1">Registered services</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Healthy Services
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2 text-green-600">
              {metrics.healthyServices}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(
                (metrics.healthyServices / metrics.totalServices) *
                100
              ).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-600">
                Avg Response
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {Math.round(metrics.averageResponseTime)}ms
            </p>
            <p className="text-xs text-gray-500 mt-1">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">
                System Uptime
              </h3>
            </div>
            <p className="text-2xl font-semibold mt-2">
              {metrics.uptime.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Overall uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Service Name"
                value={newService.name}
                onChange={(e) =>
                  setNewService((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Version"
                value={newService.version}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    version: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Service URL"
                value={newService.url}
                onChange={(e) =>
                  setNewService((prev) => ({ ...prev, url: e.target.value }))
                }
                className="md:col-span-2"
              />
              <Input
                placeholder="Description (optional)"
                value={newService.description}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="md:col-span-2"
              />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Button onClick={handleAddService}>Add Service</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onRefresh={() => {}}
            onRemove={removeService}
          />
        ))}
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {metrics.healthyServices}
              </p>
              <p className="text-sm text-green-800">Healthy</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">
                {metrics.degradedServices}
              </p>
              <p className="text-sm text-yellow-800">Degraded</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {metrics.unhealthyServices}
              </p>
              <p className="text-sm text-red-800">Unhealthy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
