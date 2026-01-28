// Service Registry for Microservices Architecture
export interface ServiceConfig {
  name: string;
  version: string;
  baseUrl: string;
  healthEndpoint: string;
  timeout: number;
  retries: number;
  circuitBreakerThreshold: number;
}

export interface ServiceHealth {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  lastCheck: Date;
  uptime: number;
  errorCount: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();
  private healthChecks: Map<string, ServiceHealth> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeServices();
    this.startHealthChecks();
  }

  private initializeServices() {
    // Core Services
    this.registerService({
      name: "user-service",
      version: "1.0.0",
      baseUrl: process.env.USER_SERVICE_URL || "http://localhost:3001",
      healthEndpoint: "/health",
      timeout: 5000,
      retries: 3,
      circuitBreakerThreshold: 5,
    });

    this.registerService({
      name: "product-service",
      version: "1.0.0",
      baseUrl: process.env.PRODUCT_SERVICE_URL || "http://localhost:3002",
      healthEndpoint: "/health",
      timeout: 5000,
      retries: 3,
      circuitBreakerThreshold: 5,
    });

    this.registerService({
      name: "order-service",
      version: "1.0.0",
      baseUrl: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
      healthEndpoint: "/health",
      timeout: 5000,
      retries: 3,
      circuitBreakerThreshold: 5,
    });

    this.registerService({
      name: "payment-service",
      version: "1.0.0",
      baseUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:3004",
      healthEndpoint: "/health",
      timeout: 10000,
      retries: 3,
      circuitBreakerThreshold: 3,
    });

    this.registerService({
      name: "analytics-service",
      version: "1.0.0",
      baseUrl: process.env.ANALYTICS_SERVICE_URL || "http://localhost:3005",
      healthEndpoint: "/health",
      timeout: 10000,
      retries: 2,
      circuitBreakerThreshold: 3,
    });

    this.registerService({
      name: "notification-service",
      version: "1.0.0",
      baseUrl: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006",
      healthEndpoint: "/health",
      timeout: 5000,
      retries: 3,
      circuitBreakerThreshold: 5,
    });

    this.registerService({
      name: "inventory-service",
      version: "1.0.0",
      baseUrl: process.env.INVENTORY_SERVICE_URL || "http://localhost:3007",
      healthEndpoint: "/health",
      timeout: 5000,
      retries: 3,
      circuitBreakerThreshold: 5,
    });
  }

  registerService(config: ServiceConfig) {
    this.services.set(config.name, config);
    this.healthChecks.set(config.name, {
      service: config.name,
      status: "unhealthy",
      responseTime: 0,
      lastCheck: new Date(),
      uptime: 0,
      errorCount: 0,
    });
  }

  getService(serviceName: string): ServiceConfig | undefined {
    return this.services.get(serviceName);
  }

  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthChecks.get(serviceName);
  }

  getAllServices(): Array<{ config: ServiceConfig; health: ServiceHealth }> {
    const result: Array<{ config: ServiceConfig; health: ServiceHealth }> = [];

    this.services.forEach((config, name) => {
      const health = this.healthChecks.get(name);
      if (health) {
        result.push({ config, health });
      }
    });

    return result;
  }

  async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const config = this.services.get(serviceName);
    const currentHealth = this.healthChecks.get(serviceName);

    if (!config || !currentHealth) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const startTime = Date.now();

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(
          () => reject(new Error("Health check timeout")),
          config.timeout,
        );
      });

      const response = await Promise.race([
        fetch(`${config.baseUrl}${config.healthEndpoint}`, {
          method: "GET",
        }),
        timeoutPromise,
      ]);

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      const updatedHealth: ServiceHealth = {
        service: serviceName,
        status: isHealthy ? "healthy" : "unhealthy",
        responseTime,
        lastCheck: new Date(),
        uptime: isHealthy ? currentHealth.uptime + 1 : 0,
        errorCount: isHealthy ? 0 : currentHealth.errorCount + 1,
      };

      this.healthChecks.set(serviceName, updatedHealth);
      return updatedHealth;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const updatedHealth: ServiceHealth = {
        service: serviceName,
        status: "unhealthy",
        responseTime,
        lastCheck: new Date(),
        uptime: 0,
        errorCount: currentHealth.errorCount + 1,
      };

      this.healthChecks.set(serviceName, updatedHealth);
      return updatedHealth;
    }
  }

  private async startHealthChecks() {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      const promises = Array.from(this.services.keys()).map((serviceName) =>
        this.checkServiceHealth(serviceName).catch((error) => {
          console.error(`Health check failed for ${serviceName}:`, error);
          return null;
        }),
      );

      await Promise.allSettled(promises);
    }, 30000);

    // Initial health check
    setTimeout(() => {
      Array.from(this.services.keys()).forEach((serviceName) => {
        this.checkServiceHealth(serviceName).catch((error) => {
          console.error(
            `Initial health check failed for ${serviceName}:`,
            error,
          );
        });
      });
    }, 1000);
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async callService<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const config = this.services.get(serviceName);
    const health = this.healthChecks.get(serviceName);

    if (!config) {
      throw new Error(`Service ${serviceName} not found`);
    }

    if (
      health?.status === "unhealthy" &&
      health.errorCount >= config.circuitBreakerThreshold
    ) {
      throw new Error(`Service ${serviceName} circuit breaker is open`);
    }

    const url = `${config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Service-Version": config.version,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Service ${serviceName} returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Update health status on error
      if (health) {
        health.errorCount += 1;
        health.status = "degraded";
      }

      throw error;
    }
  }
}

export const serviceRegistry = new ServiceRegistry();
