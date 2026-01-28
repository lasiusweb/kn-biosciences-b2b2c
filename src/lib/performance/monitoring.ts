// Load Balancing and Performance Monitoring System
import { serviceRegistry } from "@/lib/microservices/service-registry";
import { cacheManager } from "@/lib/cache/advanced-cache";

interface PerformanceMetrics {
  responseTime: number;
  requestCount: number;
  errorCount: number;
  cacheHitRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  timestamp: Date;
}

interface ServiceHealth {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  uptime: number;
  errorCount: number;
  lastCheck: Date;
  version: string;
}

interface LoadBalancerConfig {
  algorithm:
    | "round-robin"
    | "least-connections"
    | "weighted-round-robin"
    | "random";
  healthCheckInterval: number;
  maxRetries: number;
  timeout: number;
  circuitBreakerThreshold: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private alerts: Array<{
    level: "info" | "warning" | "error" | "critical";
    message: string;
    service: string;
    timestamp: Date;
  }> = [];
  private thresholds = {
    responseTime: 5000, // 5 seconds
    errorRate: 0.05, // 5%
    cacheHitRate: 0.8, // 80%
    memoryUsage: 0.85, // 85%
    cpuUsage: 0.8, // 80%
  };

  recordMetric(
    serviceName: string,
    responseTime: number,
    error: boolean = false,
    cacheHit: boolean = false,
  ) {
    const timestamp = new Date();

    if (!this.metrics.has(serviceName)) {
      this.metrics.set(serviceName, []);
    }

    const serviceMetrics = this.metrics.get(serviceName)!;
    serviceMetrics.push({
      responseTime,
      requestCount: 1,
      errorCount: error ? 1 : 0,
      cacheHitRate: cacheHit ? 1 : 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp,
    });

    // Keep only last 1000 metrics per service
    if (serviceMetrics.length > 1000) {
      serviceMetrics.splice(0, serviceMetrics.length - 1000);
    }

    // Check for performance alerts
    this.checkAlerts(serviceName, responseTime, error, cacheHit);
  }

  private checkAlerts(
    serviceName: string,
    responseTime: number,
    error: boolean,
    cacheHit: boolean,
  ) {
    if (responseTime > this.thresholds.responseTime) {
      this.addAlert(
        "warning",
        `High response time: ${responseTime}ms`,
        serviceName,
      );
    }

    if (error) {
      const serviceMetrics = this.metrics.get(serviceName)!;
      const recentErrors = serviceMetrics
        .slice(-100)
        .filter((m) => m.errorCount > 0);
      const errorRate = recentErrors.length / 100;

      if (errorRate > this.thresholds.errorRate) {
        this.addAlert(
          "error",
          `High error rate: ${(errorRate * 100).toFixed(2)}%`,
          serviceName,
        );
      }
    }

    if (!cacheHit && Math.random() < 0.1) {
      // Check cache performance occasionally
      const serviceMetrics = this.metrics.get(serviceName)!;
      const recentMetrics = serviceMetrics.slice(-100);
      const cacheHitRate =
        recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) /
        recentMetrics.length;

      if (cacheHitRate < this.thresholds.cacheHitRate) {
        this.addAlert(
          "warning",
          `Low cache hit rate: ${(cacheHitRate * 100).toFixed(2)}%`,
          serviceName,
        );
      }
    }
  }

  private addAlert(
    level: "info" | "warning" | "error" | "critical",
    message: string,
    service: string,
  ) {
    this.alerts.push({
      level,
      message,
      service,
      timestamp: new Date(),
    });

    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts.splice(0, this.alerts.length - 500);
    }

    console.log(`[${level.toUpperCase()}] ${service}: ${message}`);
  }

  getServiceMetrics(serviceName: string): PerformanceMetrics | null {
    const serviceMetrics = this.metrics.get(serviceName);
    if (!serviceMetrics || serviceMetrics.length === 0) {
      return null;
    }

    const recent = serviceMetrics.slice(-100);
    const avgResponseTime =
      recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const totalRequests = recent.reduce((sum, m) => sum + m.requestCount, 0);
    const totalErrors = recent.reduce((sum, m) => sum + m.errorCount, 0);
    const avgCacheHitRate =
      recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length;
    const avgMemoryUsage = recent[recent.length - 1]?.memoryUsage;
    const avgCpuUsage = recent[recent.length - 1]?.cpuUsage;

    return {
      responseTime: avgResponseTime,
      requestCount: totalRequests,
      errorCount: totalErrors,
      cacheHitRate: avgCacheHitRate,
      memoryUsage: avgMemoryUsage || process.memoryUsage(),
      cpuUsage: avgCpuUsage || process.cpuUsage(),
      timestamp: new Date(),
    };
  }

  getSystemHealth(): {
    status: "healthy" | "degraded" | "unhealthy";
    alerts: any[];
    services: ServiceHealth[];
    system: PerformanceMetrics;
  } {
    const allServices = serviceRegistry.getAllServices();
    const serviceHealth: ServiceHealth[] = [];

    for (const { config, health } of allServices) {
      serviceHealth.push({
        service: config.name,
        status: health.status,
        responseTime: health.responseTime,
        uptime: health.uptime,
        errorCount: health.errorCount,
        lastCheck: health.lastCheck,
        version: config.version,
      });
    }

    // Determine overall system status
    const unhealthyServices = serviceHealth.filter(
      (s) => s.status === "unhealthy",
    );
    const degradedServices = serviceHealth.filter(
      (s) => s.status === "degraded",
    );

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (unhealthyServices.length > 0) {
      status = "unhealthy";
    } else if (degradedServices.length > 0) {
      status = "degraded";
    }

    return {
      status,
      alerts: this.alerts.slice(-50),
      services: serviceHealth,
      system: {
        responseTime: 0,
        requestCount: 0,
        errorCount: 0,
        cacheHitRate: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        timestamp: new Date(),
      },
    };
  }

  getAlerts(
    level?: "info" | "warning" | "error" | "critical",
    limit: number = 50,
  ) {
    let filtered = this.alerts;
    if (level) {
      filtered = this.alerts.filter((alert) => alert.level === level);
    }
    return filtered.slice(-limit);
  }

  clearMetrics(serviceName?: string) {
    if (serviceName) {
      this.metrics.delete(serviceName);
    } else {
      this.metrics.clear();
    }
  }

  clearAlerts() {
    this.alerts = [];
  }
}

class LoadBalancer {
  private config: LoadBalancerConfig;
  private serviceInstances: Map<
    string,
    Array<{
      url: string;
      weight: number;
      connections: number;
      lastUsed: number;
    }>
  > = new Map();
  private currentIndices: Map<string, number> = new Map();

  constructor(config: LoadBalancerConfig) {
    this.config = config;
  }

  registerService(
    serviceName: string,
    instances: Array<{ url: string; weight?: number }>,
  ) {
    this.serviceInstances.set(
      serviceName,
      instances.map((instance, index) => ({
        url: instance.url,
        weight: instance.weight || 1,
        connections: 0,
        lastUsed: Date.now(),
      })),
    );
    this.currentIndices.set(serviceName, 0);
  }

  private getNextInstance(serviceName: string): string | null {
    const instances = this.serviceInstances.get(serviceName);
    if (!instances || instances.length === 0) {
      return null;
    }

    switch (this.config.algorithm) {
      case "round-robin":
        return this.roundRobin(serviceName, instances);

      case "least-connections":
        return this.leastConnections(serviceName, instances);

      case "weighted-round-robin":
        return this.weightedRoundRobin(serviceName, instances);

      case "random":
        return this.randomSelection(instances);

      default:
        return instances[0].url;
    }
  }

  private roundRobin(serviceName: string, instances: any[]): string {
    const currentIndex = this.currentIndices.get(serviceName) || 0;
    const nextIndex = (currentIndex + 1) % instances.length;
    this.currentIndices.set(serviceName, nextIndex);
    return instances[nextIndex].url;
  }

  private leastConnections(serviceName: string, instances: any[]): string {
    let leastConnections = Infinity;
    let selectedInstance = instances[0];

    for (const instance of instances) {
      if (instance.connections < leastConnections) {
        leastConnections = instance.connections;
        selectedInstance = instance;
      }
    }

    selectedInstance.connections++;
    return selectedInstance.url;
  }

  private weightedRoundRobin(serviceName: string, instances: any[]): string {
    const totalWeight = instances.reduce(
      (sum, instance) => sum + instance.weight,
      0,
    );
    let random = Math.random() * totalWeight;
    let currentIndex = this.currentIndices.get(serviceName) || 0;

    for (let i = 0; i < instances.length; i++) {
      random -= instances[(currentIndex + i) % instances.length].weight;
      if (random <= 0) {
        this.currentIndices.set(
          serviceName,
          (currentIndex + i) % instances.length,
        );
        return instances[(currentIndex + i) % instances.length].url;
      }
    }

    return instances[0].url;
  }

  private randomSelection(instances: any[]): string {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex].url;
  }

  async callWithLoadBalance<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const instanceUrl = this.getNextInstance(serviceName);

    if (!instanceUrl) {
      throw new Error(
        `No healthy instances available for service: ${serviceName}`,
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${instanceUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Service ${serviceName} returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  getServiceHealth(): Map<
    string,
    {
      instances: number;
      healthyInstances: number;
      algorithm: string;
    }
  > {
    const healthMap = new Map();

    for (const [serviceName, instances] of Array.from(
      this.serviceInstances.entries(),
    )) {
      healthMap.set(serviceName, {
        instances: instances.length,
        healthyInstances: instances.filter(
          (instance: {
            url: string;
            weight: number;
            connections: number;
            lastUsed: number;
          }) => Date.now() - instance.lastUsed < 30000, // Consider healthy if used in last 30s
        ).length,
        algorithm: this.config.algorithm,
      });
    }

    return healthMap;
  }
}

// Singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const loadBalancer = new LoadBalancer({
  algorithm: "round-robin",
  healthCheckInterval: 30000,
  maxRetries: 3,
  timeout: 10000,
  circuitBreakerThreshold: 5,
});

export { PerformanceMonitor, LoadBalancer };
