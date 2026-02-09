// lib/performance/performance-baseline.ts
import { supabase } from '../supabase';
import { logger } from '../logger';

export interface PerformanceMetric {
  id: string;
  service_name: string;
  endpoint: string;
  response_time: number; // in milliseconds
  throughput: number; // requests per minute
  error_rate: number; // percentage
  timestamp: string;
  user_id?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceBaseline {
  service_name: string;
  endpoint: string;
  avg_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  avg_throughput: number;
  error_rate: number;
  calculated_at: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  baseline: PerformanceBaseline[];
  current_metrics: PerformanceMetric[];
  deviation_analysis: {
    service_name: string;
    endpoint: string;
    response_time_deviation: number;
    throughput_deviation: number;
    error_rate_deviation: number;
  }[];
  recommendations: string[];
}

export class PerformanceBaselineService {
  private static instance: PerformanceBaselineService;
  
  private constructor() {}

  public static getInstance(): PerformanceBaselineService {
    if (!PerformanceBaselineService.instance) {
      PerformanceBaselineService.instance = new PerformanceBaselineService();
    }
    return PerformanceBaselineService.instance;
  }

  /**
   * Establishes performance baselines for all services
   */
  async establishBaselines(): Promise<PerformanceBaseline[]> {
    const baselines: PerformanceBaseline[] = [];
    
    // Define critical endpoints to baseline
    const criticalEndpoints = [
      { service: 'web', endpoint: '/api/products' },
      { service: 'web', endpoint: '/api/products/[slug]' },
      { service: 'web', endpoint: '/api/cart' },
      { service: 'web', endpoint: '/api/checkout' },
      { service: 'web', endpoint: '/api/auth' },
      { service: 'web', endpoint: '/api/search' },
      { service: 'web', endpoint: '/api/orders' },
      { service: 'web', endpoint: '/api/payments' },
      { service: 'web', endpoint: '/api/shipping' },
      { service: 'web', endpoint: '/api/users' },
    ];

    for (const endpoint of criticalEndpoints) {
      const baseline = await this.calculateBaseline(endpoint.service, endpoint.endpoint);
      baselines.push(baseline);
    }

    // Store baselines in the database
    await this.storeBaselines(baselines);

    return baselines;
  }

  /**
   * Calculates baseline metrics for a specific service and endpoint
   */
  private async calculateBaseline(serviceName: string, endpoint: string): Promise<PerformanceBaseline> {
    try {
      // Get historical performance data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: metrics, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('service_name', serviceName)
        .eq('endpoint', endpoint)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000); // Limit to last 1000 records for performance

      if (error) {
        logger.error(`Error fetching metrics for ${serviceName}:${endpoint}`, error);
        // Return default baseline values if no historical data
        return {
          service_name: serviceName,
          endpoint: endpoint,
          avg_response_time: 1000, // Default 1 second
          p95_response_time: 2000, // Default 2 seconds
          p99_response_time: 5000, // Default 5 seconds
          avg_throughput: 100, // Default 100 requests/minute
          error_rate: 2, // Default 2% error rate
          calculated_at: new Date().toISOString(),
          metadata: {
            historical_data_available: false,
            default_values_applied: true
          }
        };
      }

      if (!metrics || metrics.length === 0) {
        // Return default baseline values if no historical data
        return {
          service_name: serviceName,
          endpoint: endpoint,
          avg_response_time: 1000,
          p95_response_time: 2000,
          p99_response_time: 5000,
          avg_throughput: 100,
          error_rate: 2,
          calculated_at: new Date().toISOString(),
          metadata: {
            historical_data_available: false,
            default_values_applied: true
          }
        };
      }

      // Calculate baseline metrics
      const responseTimes = metrics.map(m => m.response_time).sort((a, b) => a - b);
      const throughputs = metrics.map(m => m.throughput);
      const errorRates = metrics.map(m => m.error_rate);

      // Calculate percentiles
      const p95Index = Math.floor(0.95 * responseTimes.length);
      const p99Index = Math.floor(0.99 * responseTimes.length);

      return {
        service_name: serviceName,
        endpoint: endpoint,
        avg_response_time: this.calculateMean(responseTimes),
        p95_response_time: responseTimes[p95Index] || responseTimes[responseTimes.length - 1],
        p99_response_time: responseTimes[p99Index] || responseTimes[responseTimes.length - 1],
        avg_throughput: this.calculateMean(throughputs),
        error_rate: this.calculateMean(errorRates),
        calculated_at: new Date().toISOString(),
        metadata: {
          historical_data_points: metrics.length,
          calculation_period: '30 days',
          last_data_point: metrics[0]?.timestamp
        }
      };
    } catch (error) {
      logger.error(`Error calculating baseline for ${serviceName}:${endpoint}`, error);
      // Return default values in case of error
      return {
        service_name: serviceName,
        endpoint: endpoint,
        avg_response_time: 1000,
        p95_response_time: 2000,
        p99_response_time: 5000,
        avg_throughput: 100,
        error_rate: 2,
        calculated_at: new Date().toISOString(),
        metadata: {
          error_occurred: true,
          default_values_applied: true
        }
      };
    }
  }

  /**
   * Calculates mean of an array of numbers
   */
  private calculateMean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  }

  /**
   * Stores performance baselines in the database
   */
  private async storeBaselines(baselines: PerformanceBaseline[]): Promise<void> {
    try {
      // First, delete existing baselines to avoid duplicates
      await supabase
        .from('performance_baselines')
        .delete()
        .lt('calculated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Keep only last 24 hours

      // Insert new baselines
      const { error } = await supabase
        .from('performance_baselines')
        .insert(baselines);

      if (error) {
        logger.error('Error storing performance baselines:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Error storing performance baselines:', error);
    }
  }

  /**
   * Gets current performance metrics and compares with baselines
   */
  async generatePerformanceReport(): Promise<PerformanceReport> {
    try {
      // Get current metrics (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: currentMetrics, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (metricsError) {
        throw metricsError;
      }

      // Get baselines
      const { data: baselines, error: baselinesError } = await supabase
        .from('performance_baselines')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (baselinesError) {
        throw baselinesError;
      }

      // Calculate deviations
      const deviationAnalysis = this.calculateDeviations(
        currentMetrics || [],
        baselines || []
      );

      // Generate recommendations based on deviations
      const recommendations = this.generateRecommendations(deviationAnalysis);

      return {
        baseline: baselines || [],
        current_metrics: currentMetrics || [],
        deviation_analysis: deviationAnalysis,
        recommendations
      };
    } catch (error) {
      logger.error('Error generating performance report:', error);
      throw error;
    }
  }

  /**
   * Calculates deviations from baseline metrics
   */
  private calculateDeviations(
    currentMetrics: PerformanceMetric[],
    baselines: PerformanceBaseline[]
  ): PerformanceReport['deviation_analysis'] {
    const analysis = [];
    
    // Group current metrics by service and endpoint
    const currentByEndpoint = new Map<string, PerformanceMetric[]>();
    for (const metric of currentMetrics) {
      const key = `${metric.service_name}:${metric.endpoint}`;
      if (!currentByEndpoint.has(key)) {
        currentByEndpoint.set(key, []);
      }
      currentByEndpoint.get(key)!.push(metric);
    }

    // Compare with baselines
    for (const baseline of baselines) {
      const key = `${baseline.service_name}:${baseline.endpoint}`;
      const currentData = currentByEndpoint.get(key) || [];

      if (currentData.length > 0) {
        // Calculate current averages
        const currentResponseTimes = currentData.map(m => m.response_time);
        const currentThroughputs = currentData.map(m => m.throughput);
        const currentErrorRates = currentData.map(m => m.error_rate);

        const currentAvgResponseTime = this.calculateMean(currentResponseTimes);
        const currentAvgThroughput = this.calculateMean(currentThroughputs);
        const currentAvgErrorRate = this.calculateMean(currentErrorRates);

        analysis.push({
          service_name: baseline.service_name,
          endpoint: baseline.endpoint,
          response_time_deviation: currentAvgResponseTime - baseline.avg_response_time,
          throughput_deviation: currentAvgThroughput - baseline.avg_throughput,
          error_rate_deviation: currentAvgErrorRate - baseline.error_rate
        });
      }
    }

    return analysis;
  }

  /**
   * Generates performance recommendations based on deviations
   */
  private generateRecommendations(deviations: PerformanceReport['deviation_analysis']): string[] {
    const recommendations: string[] = [];

    for (const deviation of deviations) {
      // Response time recommendations
      if (deviation.response_time_deviation > 200) { // More than 200ms slower than baseline
        recommendations.push(
          `Response time for ${deviation.service_name}:${deviation.endpoint} is ${deviation.response_time_deviation}ms slower than baseline. Consider optimizing database queries or implementing caching.`
        );
      }

      // Throughput recommendations
      if (deviation.throughput_deviation < -20) { // More than 20 requests/minute lower than baseline
        recommendations.push(
          `Throughput for ${deviation.service_name}:${deviation.endpoint} is ${Math.abs(deviation.throughput_deviation)} requests/minute lower than baseline. Investigate potential bottlenecks.`
        );
      }

      // Error rate recommendations
      if (deviation.error_rate_deviation > 1) { // More than 1% higher error rate than baseline
        recommendations.push(
          `Error rate for ${deviation.service_name}:${deviation.endpoint} is ${deviation.error_rate_deviation}% higher than baseline. Check for recent code changes or infrastructure issues.`
        );
      }
    }

    // Add general recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance is within baseline parameters. Continue monitoring.');
    }

    recommendations.push('Consider implementing proactive performance monitoring and alerting.');
    recommendations.push('Review database query performance and implement indexing where needed.');
    recommendations.push('Optimize image loading and implement lazy loading for better performance.');

    return recommendations;
  }

  /**
   * Gets performance metrics for a specific service and endpoint
   */
  async getMetricsForEndpoint(
    serviceName: string,
    endpoint: string,
    hours: number = 24
  ): Promise<PerformanceMetric[]> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('service_name', serviceName)
        .eq('endpoint', endpoint)
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting metrics for endpoint:', error);
      return [];
    }
  }

  /**
   * Gets performance summary for dashboard
   */
  async getPerformanceSummary(hours: number = 24): Promise<{
    avg_response_time: number;
    avg_throughput: number;
    avg_error_rate: number;
    total_requests: number;
    critical_issues: number;
  }> {
    try {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      const { data, error } = await supabase
        .from('performance_metrics')
        .select(`
          response_time,
          throughput,
          error_rate
        `)
        .gte('timestamp', startTime.toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          avg_response_time: 0,
          avg_throughput: 0,
          avg_error_rate: 0,
          total_requests: 0,
          critical_issues: 0
        };
      }

      const response_times = data.map(m => m.response_time);
      const throughputs = data.map(m => m.throughput);
      const error_rates = data.map(m => m.error_rate);

      // Count critical issues (response time > 5s or error rate > 5%)
      const criticalIssues = data.filter(
        m => m.response_time > 5000 || m.error_rate > 5
      ).length;

      return {
        avg_response_time: this.calculateMean(response_times),
        avg_throughput: this.calculateMean(throughputs),
        avg_error_rate: this.calculateMean(error_rates),
        total_requests: data.length,
        critical_issues: criticalIssues
      };
    } catch (error) {
      logger.error('Error getting performance summary:', error);
      return {
        avg_response_time: 0,
        avg_throughput: 0,
        avg_error_rate: 0,
        total_requests: 0,
        critical_issues: 0
      };
    }
  }

  /**
   * Records a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const newMetric: PerformanceMetric = {
        ...metric,
        id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('performance_metrics')
        .insert([newMetric]);

      if (error) {
        logger.error('Error recording performance metric:', error);
      }
    } catch (error) {
      logger.error('Error recording performance metric:', error);
    }
  }
}

// Create and export singleton instance
export const performanceBaselineService = PerformanceBaselineService.getInstance();
export default performanceBaselineService;