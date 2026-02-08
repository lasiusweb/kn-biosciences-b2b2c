import { supabase } from './supabase';

export interface PerformanceMetric {
  id?: string;
  service_name: string;
  endpoint: string;
  response_time: number; // in milliseconds
  timestamp: string;
  user_id?: string;
  session_id?: string;
  error?: boolean;
  error_message?: string;
  status_code?: number;
  cache_hit?: boolean;
  db_queries?: number;
  db_time?: number;
  memory_usage?: number;
  cpu_usage?: number;
}

export interface AnalyticsEvent {
  id?: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  properties: Record<string, any>;
  page?: string;
  url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetric[] = [];
  private eventsBuffer: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.startFlushInterval();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Records a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metricsBuffer.push(fullMetric);

    // Flush if buffer is full
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushMetrics();
    }
  }

  /**
   * Records an analytics event
   */
  async recordEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.eventsBuffer.push(fullEvent);

    // Flush if buffer is full
    if (this.eventsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushEvents();
    }
  }

  /**
   * Measures execution time of a function
   */
  async measureExecution<T>(
    serviceName: string,
    endpoint: string,
    fn: () => Promise<T>,
    options: {
      user_id?: string;
      session_id?: string;
      cache_hit?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    let error = false;
    let error_message: string | undefined;
    let status_code: number | undefined;

    try {
      const result = await fn();
      return result;
    } catch (err) {
      error = true;
      error_message = err instanceof Error ? err.message : String(err);
      status_code = 500;
      throw err;
    } finally {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      await this.recordMetric({
        service_name: serviceName,
        endpoint,
        response_time: responseTime,
        user_id: options.user_id,
        session_id: options.session_id,
        error,
        error_message,
        status_code,
        cache_hit: options.cache_hit
      });
    }
  }

  /**
   * Measures database query performance
   */
  async measureDbQuery<T>(
    queryFn: () => Promise<T>,
    serviceName: string = 'database'
  ): Promise<{ result: T; queryTime: number }> {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const queryTime = Math.round(endTime - startTime);

      await this.recordMetric({
        service_name: serviceName,
        endpoint: 'database_query',
        response_time: queryTime,
        db_queries: 1,
        db_time: queryTime
      });

      return { result, queryTime };
    } catch (error) {
      const endTime = performance.now();
      const queryTime = Math.round(endTime - startTime);

      await this.recordMetric({
        service_name: serviceName,
        endpoint: 'database_query',
        response_time: queryTime,
        error: true,
        error_message: error instanceof Error ? error.message : String(error),
        status_code: 500
      });

      throw error;
    }
  }

  /**
   * Flushes metrics to the database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const { error } = await supabase
        .from('performance_metrics') // Assuming this table exists
        .insert(metricsToFlush);

      if (error) {
        console.error('Error flushing performance metrics:', error);
        // Put metrics back in buffer if flush failed
        this.metricsBuffer.unshift(...metricsToFlush);
      }
    } catch (err) {
      console.error('Error flushing performance metrics:', err);
      // Put metrics back in buffer if flush failed
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Flushes events to the database
   */
  private async flushEvents(): Promise<void> {
    if (this.eventsBuffer.length === 0) return;

    const eventsToFlush = [...this.eventsBuffer];
    this.eventsBuffer = [];

    try {
      const { error } = await supabase
        .from('analytics_events') // Assuming this table exists
        .insert(eventsToFlush);

      if (error) {
        console.error('Error flushing analytics events:', error);
        // Put events back in buffer if flush failed
        this.eventsBuffer.unshift(...eventsToFlush);
      }
    } catch (err) {
      console.error('Error flushing analytics events:', err);
      // Put events back in buffer if flush failed
      this.eventsBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Starts the periodic flush interval
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(async () => {
      await this.flushMetrics();
      await this.flushEvents();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Stops the flush interval (call when shutting down)
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Gets performance statistics
   */
  async getPerformanceStats(
    serviceName: string,
    hours: number = 24
  ): Promise<{
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    totalRequests: number;
    errorRate: number;
    throughput: number; // requests per minute
  }> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('service_name', serviceName)
      .gte('timestamp', startTime.toISOString());

    if (error) {
      throw new Error(`Error fetching performance stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        throughput: 0
      };
    }

    const responses = data.map(m => m.response_time);
    const errors = data.filter(m => m.error).length;
    const durationInMinutes = hours;
    const totalRequests = data.length;

    // Calculate average response time
    const avgResponseTime = responses.reduce((sum, val) => sum + val, 0) / responses.length;

    // Calculate percentiles (simple approximation)
    responses.sort((a, b) => a - b);
    const p95Index = Math.floor(responses.length * 0.95);
    const p99Index = Math.floor(responses.length * 0.99);
    const p95ResponseTime = responses[p95Index] || 0;
    const p99ResponseTime = responses[p99Index] || 0;

    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;
    const throughput = durationInMinutes > 0 ? totalRequests / durationInMinutes : 0;

    return {
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      totalRequests,
      errorRate,
      throughput
    };
  }
}

// Create a singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance decorator for class methods
export function MeasurePerformance(serviceName: string, endpoint?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const methodEndpoint = endpoint || `${target.constructor.name}.${propertyKey}`;
      return await performanceMonitor.measureExecution(
        serviceName,
        methodEndpoint,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}