// lib/infrastructure/infrastructure-optimizer.ts
import { logger } from '../logger';

export interface InfrastructureMetrics {
  cpu_usage: number; // percentage
  memory_usage: number; // percentage
  disk_usage: number; // percentage
  network_io: number; // MB/s
  response_time: number; // ms
  throughput: number; // requests/second
  error_rate: number; // percentage
  database_connections: number;
  cache_hit_rate: number; // percentage
  uptime: number; // percentage
  timestamp: string;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'performance' | 'cost' | 'reliability' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimated_savings?: number; // in rupees per month
  implementation_steps: string[];
}

export interface ResourceUtilization {
  service: string;
  cpu_percent: number;
  memory_mb: number;
  disk_mb: number;
  network_in_mb: number;
  network_out_mb: number;
  timestamp: string;
}

export class InfrastructureOptimizer {
  private static instance: InfrastructureOptimizer;
  private readonly OPTIMIZATION_THRESHOLD = 80; // Percentage threshold for optimization recommendations
  private readonly COST_OPTIMIZATION_THRESHOLD = 70; // Lower threshold for cost optimization
  private readonly PERFORMANCE_THRESHOLD = 85; // Higher threshold for performance issues

  private constructor() {}

  public static getInstance(): InfrastructureOptimizer {
    if (!InfrastructureOptimizer.instance) {
      InfrastructureOptimizer.instance = new InfrastructureOptimizer();
    }
    return InfrastructureOptimizer.instance;
  }

  /**
   * Analyzes current infrastructure metrics and provides optimization recommendations
   */
  async analyzeInfrastructure(): Promise<{
    currentMetrics: InfrastructureMetrics;
    recommendations: OptimizationRecommendation[];
    summary: {
      performance_score: number;
      cost_efficiency_score: number;
      reliability_score: number;
      security_score: number;
      overall_score: number;
    };
  }> {
    // Get current metrics
    const currentMetrics = await this.getCurrentMetrics();
    
    // Generate recommendations based on metrics
    const recommendations = [
      ...this.generatePerformanceRecommendations(currentMetrics),
      ...this.generateCostRecommendations(currentMetrics),
      ...this.generateReliabilityRecommendations(currentMetrics),
      ...this.generateSecurityRecommendations(currentMetrics)
    ];

    // Calculate scores
    const scores = this.calculateScores(currentMetrics, recommendations);

    return {
      currentMetrics,
      recommendations,
      summary: scores
    };
  }

  /**
   * Gets current infrastructure metrics
   */
  private async getCurrentMetrics(): Promise<InfrastructureMetrics> {
    // In a real implementation, this would fetch from monitoring tools like:
    // - CloudWatch (AWS)
    // - Azure Monitor
    // - Prometheus/Grafana
    // - Custom monitoring system
    
    // For now, we'll simulate metrics
    return {
      cpu_usage: Math.random() * 100, // Random value for simulation
      memory_usage: Math.random() * 100,
      disk_usage: Math.random() * 100,
      network_io: Math.random() * 100,
      response_time: 200 + Math.random() * 800, // 200-1000ms
      throughput: 50 + Math.random() * 150, // 50-200 req/sec
      error_rate: Math.random() * 5, // 0-5%
      database_connections: 20 + Math.random() * 30, // 20-50 connections
      cache_hit_rate: 60 + Math.random() * 30, // 60-90%
      uptime: 99.5 + Math.random() * 0.4, // 99.5-99.9%
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generates performance optimization recommendations
   */
  private generatePerformanceRecommendations(metrics: InfrastructureMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // CPU usage recommendations
    if (metrics.cpu_usage > this.PERFORMANCE_THRESHOLD) {
      recommendations.push({
        id: `perf_cpu_${Date.now()}`,
        category: 'performance',
        priority: 'high',
        title: 'High CPU Usage',
        description: `Current CPU usage is ${metrics.cpu_usage.toFixed(1)}% which exceeds the recommended threshold of ${this.PERFORMANCE_THRESHOLD}%`,
        impact: 'high',
        effort: 'medium',
        implementation_steps: [
          'Implement caching for frequently accessed data',
          'Optimize database queries',
          'Review and optimize code for performance',
          'Consider scaling up compute resources'
        ]
      });
    }

    // Memory usage recommendations
    if (metrics.memory_usage > this.PERFORMANCE_THRESHOLD) {
      recommendations.push({
        id: `perf_mem_${Date.now()}`,
        category: 'performance',
        priority: 'high',
        title: 'High Memory Usage',
        description: `Current memory usage is ${metrics.memory_usage.toFixed(1)}% which exceeds the recommended threshold of ${this.PERFORMANCE_THRESHOLD}%`,
        impact: 'high',
        effort: 'medium',
        implementation_steps: [
          'Identify memory leaks in application code',
          'Optimize data structures and algorithms',
          'Implement proper garbage collection',
          'Scale up memory resources if needed'
        ]
      });
    }

    // Response time recommendations
    if (metrics.response_time > 500) { // More than 500ms
      recommendations.push({
        id: `perf_resp_${Date.now()}`,
        category: 'performance',
        priority: 'high',
        title: 'Slow Response Times',
        description: `Current average response time is ${metrics.response_time.toFixed(0)}ms which is higher than optimal`,
        impact: 'high',
        effort: 'high',
        implementation_steps: [
          'Implement CDN for static assets',
          'Optimize database queries and add indexes',
          'Implement caching strategies',
          'Optimize image loading and compression'
        ]
      });
    }

    // Cache hit rate recommendations
    if (metrics.cache_hit_rate < 80) { // Below 80% threshold
      recommendations.push({
        id: `perf_cache_${Date.now()}`,
        category: 'performance',
        priority: 'medium',
        title: 'Low Cache Hit Rate',
        description: `Current cache hit rate is ${metrics.cache_hit_rate.toFixed(1)}% which is below the optimal 80%`,
        impact: 'medium',
        effort: 'medium',
        implementation_steps: [
          'Review cache invalidation strategies',
          'Optimize cache keys and TTL values',
          'Implement cache warming strategies',
          'Consider implementing Redis for better caching'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generates cost optimization recommendations
   */
  private generateCostRecommendations(metrics: InfrastructureMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Low resource utilization recommendations
    if (metrics.cpu_usage < this.COST_OPTIMIZATION_THRESHOLD && 
        metrics.memory_usage < this.COST_OPTIMIZATION_THRESHOLD) {
      recommendations.push({
        id: `cost_util_${Date.now()}`,
        category: 'cost',
        priority: 'medium',
        title: 'Resource Underutilization',
        description: `Current resources are underutilized (CPU: ${metrics.cpu_usage.toFixed(1)}%, Memory: ${metrics.memory_usage.toFixed(1)}%)`,
        impact: 'medium',
        effort: 'low',
        estimated_savings: 15000, // Estimated monthly savings in rupees
        implementation_steps: [
          'Consider downsizing compute resources',
          'Implement auto-scaling based on demand',
          'Review reserved instance options',
          'Optimize resource allocation'
        ]
      });
    }

    // Database connection recommendations
    if (metrics.database_connections < 10) { // Very low connection usage
      recommendations.push({
        id: `cost_db_${Date.now()}`,
        category: 'cost',
        priority: 'low',
        title: 'Database Connection Optimization',
        description: `Database connections are underutilized (${metrics.database_connections} connections)`,
        impact: 'low',
        effort: 'low',
        estimated_savings: 8000,
        implementation_steps: [
          'Optimize connection pooling',
          'Review database instance size',
          'Implement connection reuse strategies'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generates reliability recommendations
   */
  private generateReliabilityRecommendations(metrics: InfrastructureMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Error rate recommendations
    if (metrics.error_rate > 1) { // More than 1% error rate
      recommendations.push({
        id: `reliability_error_${Date.now()}`,
        category: 'reliability',
        priority: 'high',
        title: 'High Error Rate',
        description: `Current error rate is ${metrics.error_rate.toFixed(2)}% which is higher than acceptable`,
        impact: 'high',
        effort: 'high',
        implementation_steps: [
          'Implement comprehensive error handling',
          'Add circuit breaker patterns',
          'Improve logging and monitoring',
          'Set up automated alerting for errors'
        ]
      });
    }

    // Uptime recommendations
    if (metrics.uptime < 99.8) { // Below 99.8% uptime
      recommendations.push({
        id: `reliability_uptime_${Date.now()}`,
        category: 'reliability',
        priority: 'high',
        title: 'Uptime Optimization',
        description: `Current uptime is ${metrics.ptime.toFixed(3)}% which is below the target of 99.8%`,
        impact: 'high',
        effort: 'high',
        implementation_steps: [
          'Implement redundant systems',
          'Set up health checks and auto-healing',
          'Create disaster recovery procedures',
          'Implement proper backup strategies'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generates security recommendations
   */
  private generateSecurityRecommendations(metrics: InfrastructureMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Add security-related recommendations
    recommendations.push({
      id: `security_monitor_${Date.now()}`,
      category: 'security',
      priority: 'high',
      title: 'Security Monitoring Enhancement',
      description: 'Implement comprehensive security monitoring for infrastructure',
      impact: 'high',
      effort: 'medium',
      implementation_steps: [
        'Set up intrusion detection systems',
        'Implement security log monitoring',
        'Configure security alerts',
        'Regular security audits and penetration testing'
      ]
    });

    recommendations.push({
      id: `security_patch_${Date.now()}`,
      category: 'security',
      priority: 'medium',
      title: 'Patch Management',
      description: 'Establish regular patch management for infrastructure components',
      impact: 'medium',
      effort: 'low',
      implementation_steps: [
        'Schedule regular patch updates',
        'Implement automated patching where possible',
        'Test patches in staging before production',
        'Maintain patch compliance records'
      ]
    });

    return recommendations;
  }

  /**
   * Calculates infrastructure health scores
   */
  private calculateScores(
    metrics: InfrastructureMetrics,
    recommendations: OptimizationRecommendation[]
  ): {
    performance_score: number;
    cost_efficiency_score: number;
    reliability_score: number;
    security_score: number;
    overall_score: number;
  } {
    // Performance score (higher is better when usage is lower, but response time is worse when higher)
    let performanceScore = 100;
    if (metrics.cpu_usage > 80) performanceScore -= 20;
    if (metrics.memory_usage > 80) performanceScore -= 20;
    if (metrics.response_time > 800) performanceScore -= 20;
    if (metrics.cache_hit_rate < 70) performanceScore -= 15;
    performanceScore = Math.max(0, performanceScore);

    // Cost efficiency score (higher when resources are appropriately utilized)
    let costEfficiencyScore = 100;
    if (metrics.cpu_usage < 30 && metrics.memory_usage < 30) costEfficiencyScore -= 30;
    if (metrics.disk_usage > 90) costEfficiencyScore -= 20;
    costEfficiencyScore = Math.max(0, costEfficiencyScore);

    // Reliability score (higher when error rate is low and uptime is high)
    let reliabilityScore = 100;
    if (metrics.error_rate > 2) reliabilityScore -= 30;
    if (metrics.error_rate > 5) reliabilityScore -= 30;
    if (metrics.uptime < 99.5) reliabilityScore -= 20;
    if (metrics.uptime < 99.0) reliabilityScore -= 30;
    reliabilityScore = Math.max(0, reliabilityScore);

    // Security score (based on number of security recommendations)
    const securityRecommendations = recommendations.filter(r => r.category === 'security');
    let securityScore = 100 - (securityRecommendations.length * 10);
    securityScore = Math.max(0, securityScore);

    const overallScore = (performanceScore + costEfficiencyScore + reliabilityScore + securityScore) / 4;

    return {
      performance_score: Math.round(performanceScore),
      cost_efficiency_score: Math.round(costEfficiencyScore),
      reliability_score: Math.round(reliabilityScore),
      security_score: Math.round(securityScore),
      overall_score: Math.round(overallScore)
    };
  }

  /**
   * Gets resource utilization by service
   */
  async getResourceUtilizationByService(): Promise<ResourceUtilization[]> {
    // In a real implementation, this would fetch from monitoring tools
    // For now, we'll simulate data
    return [
      {
        service: 'web-app',
        cpu_percent: 45,
        memory_mb: 1200,
        disk_mb: 500,
        network_in_mb: 10,
        network_out_mb: 15,
        timestamp: new Date().toISOString()
      },
      {
        service: 'database',
        cpu_percent: 65,
        memory_mb: 2048,
        disk_mb: 2000,
        network_in_mb: 5,
        network_out_mb: 5,
        timestamp: new Date().toISOString()
      },
      {
        service: 'cache',
        cpu_percent: 25,
        memory_mb: 512,
        disk_mb: 10,
        network_in_mb: 2,
        network_out_mb: 8,
        timestamp: new Date().toISOString()
      },
      {
        service: 'search',
        cpu_percent: 35,
        memory_mb: 768,
        disk_mb: 100,
        network_in_mb: 1,
        network_out_mb: 1,
        timestamp: new Date().toISOString()
      }
    ];
  }

  /**
   * Generates a capacity planning report
   */
  async generateCapacityPlan(
    forecastPeriod: '7d' | '30d' | '90d' = '30d'
  ): Promise<{
    current_capacity: ResourceUtilization[];
    projected_usage: ResourceUtilization[];
    scaling_recommendations: {
      service: string;
      current_resources: { cpu: number; memory: number; disk: number };
      recommended_resources: { cpu: number; memory: number; disk: number };
      timeline: string;
    }[];
    cost_implications: {
      current_monthly_cost: number;
      projected_monthly_cost: number;
      difference: number;
    };
  }> {
    const currentCapacity = await this.getResourceUtilizationByService();
    
    // Project usage based on growth trends
    const projectedUsage = currentCapacity.map(service => ({
      ...service,
      cpu_percent: service.cpu_percent * 1.2, // 20% growth projection
      memory_mb: service.memory_mb * 1.25, // 25% growth projection
      disk_mb: service.disk_mb * 1.15, // 15% growth projection
      timestamp: new Date(Date.now() + (forecastPeriod === '7d' ? 7 : forecastPeriod === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Generate scaling recommendations
    const scalingRecommendations = currentCapacity
      .filter(service => 
        service.cpu_percent > 75 || 
        service.memory_mb > 0.8 * 2048 || // Assuming 2GB max for example
        service.disk_mb > 0.8 * 3000 // Assuming 3GB max for example
      )
      .map(service => ({
        service: service.service,
        current_resources: {
          cpu: service.cpu_percent,
          memory: service.memory_mb,
          disk: service.disk_mb
        },
        recommended_resources: {
          cpu: Math.min(100, service.cpu_percent * 1.5), // Scale up by 50% if needed
          memory: Math.min(4096, service.memory_mb * 1.5), // Scale up memory
          disk: Math.min(6000, service.disk_mb * 1.3) // Scale up disk
        },
        timeline: forecastPeriod
      }));

    // Calculate cost implications (simulated)
    const currentMonthlyCost = currentCapacity.reduce((sum, service) => sum + this.estimateServiceCost(service), 0);
    const projectedMonthlyCost = projectedUsage.reduce((sum, service) => sum + this.estimateServiceCost(service), 0);

    return {
      current_capacity: currentCapacity,
      projected_usage: projectedUsage,
      scaling_recommendations,
      cost_implications: {
        current_monthly_cost: currentMonthlyCost,
        projected_monthly_cost: projectedMonthlyCost,
        difference: projectedMonthlyCost - currentMonthlyCost
      }
    };
  }

  /**
   * Estimates monthly cost for a service based on resource usage
   */
  private estimateServiceCost(service: ResourceUtilization): number {
    // Simplified cost estimation
    let cost = 0;
    
    // CPU cost (assuming $0.05 per % per month)
    cost += service.cpu_percent * 0.05;
    
    // Memory cost (assuming $0.01 per MB per month)
    cost += service.memory_mb * 0.01;
    
    // Disk cost (assuming $0.001 per MB per month)
    cost += service.disk_mb * 0.001;
    
    // Network cost (assuming $0.05 per GB per month)
    const totalNetwork = (service.network_in_mb + service.network_out_mb) / 1024; // Convert to GB
    cost += totalNetwork * 0.05;
    
    return cost * 100; // Convert to rupees (approximate)
  }

  /**
   * Implements auto-scaling based on metrics
   */
  async implementAutoScaling(metrics: InfrastructureMetrics): Promise<void> {
    try {
      // Determine scaling needs based on current metrics
      const scalingNeeds = this.analyzeScalingNeeds(metrics);
      
      if (scalingNeeds.requiresScaling) {
        logger.info('Auto-scaling triggered', {
          service: 'infrastructure-optimizer',
          operation: 'auto-scaling',
          scalingNeeds
        });
        
        // In a real implementation, this would call cloud provider APIs
        // to scale resources up or down
        console.log(`Scaling resources: ${scalingNeeds.direction} by ${scalingNeeds.amount}%`);
      }
    } catch (error) {
      logger.error('Error implementing auto-scaling:', error);
    }
  }

  /**
   * Analyzes if scaling is needed based on metrics
   */
  private analyzeScalingNeeds(metrics: InfrastructureMetrics): {
    requiresScaling: boolean;
    direction: 'up' | 'down' | 'none';
    amount: number; // percentage
  } {
    let requiresScaling = false;
    let direction: 'up' | 'down' | 'none' = 'none';
    let amount = 0;

    // Scale up if CPU or memory is high
    if (metrics.cpu_usage > 85 || metrics.memory_usage > 85) {
      requiresScaling = true;
      direction = 'up';
      amount = 25; // Scale up by 25%
    } 
    // Scale down if resources are consistently underutilized
    else if (metrics.cpu_usage < 30 && metrics.memory_usage < 30) {
      requiresScaling = true;
      direction = 'down';
      amount = 20; // Scale down by 20%
    }

    return { requiresScaling, direction, amount };
  }

  /**
   * Gets infrastructure health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: {
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      details: string;
    }[];
    overall_score: number;
  }> {
    const metrics = await this.getCurrentMetrics();
    
    // Determine overall status based on metrics
    let criticalIssues = 0;
    let warningIssues = 0;
    
    if (metrics.cpu_usage > 90) criticalIssues++;
    if (metrics.memory_usage > 90) criticalIssues++;
    if (metrics.error_rate > 5) criticalIssues++;
    if (metrics.uptime < 99.0) criticalIssues++;
    
    if (metrics.cpu_usage > 75) warningIssues++;
    if (metrics.memory_usage > 75) warningIssues++;
    if (metrics.response_time > 1000) warningIssues++;
    if (metrics.error_rate > 2) warningIssues++;
    if (metrics.uptime < 99.5) warningIssues++;
    
    let status: 'healthy' | 'warning' | 'critical';
    if (criticalIssues > 0) {
      status = 'critical';
    } else if (warningIssues > 0) {
      status = 'warning';
    } else {
      status = 'healthy';
    }
    
    const overallScore = this.calculateOverallHealthScore(metrics);
    
    return {
      status,
      overall_score: overallScore,
      services: [
        { name: 'Web Application', status: this.getServiceStatus(metrics.response_time, 500, 800), details: `Response time: ${metrics.response_time.toFixed(0)}ms` },
        { name: 'Database', status: this.getServiceStatus(metrics.database_connections, 30, 50), details: `Connections: ${metrics.database_connections}` },
        { name: 'Cache', status: this.getServiceStatus(metrics.cache_hit_rate, 85, 75, true), details: `Hit rate: ${metrics.cache_hit_rate.toFixed(1)}%` },
        { name: 'Infrastructure', status: this.getServiceStatus(metrics.cpu_usage, 75, 85), details: `CPU: ${metrics.cpu_usage.toFixed(1)}%` }
      ]
    };
  }

  /**
   * Determines service status based on threshold values
   */
  private getServiceStatus(
    currentValue: number, 
    warningThreshold: number, 
    criticalThreshold: number,
    inverseLogic: boolean = false // For metrics where higher is better (like cache hit rate)
  ): 'healthy' | 'warning' | 'critical' {
    if (inverseLogic) {
      if (currentValue >= warningThreshold) return 'healthy';
      if (currentValue >= criticalThreshold) return 'warning';
      return 'critical';
    } else {
      if (currentValue <= warningThreshold) return 'healthy';
      if (currentValue <= criticalThreshold) return 'warning';
      return 'critical';
    }
  }

  /**
   * Calculates overall health score from 0-100
   */
  private calculateOverallHealthScore(metrics: InfrastructureMetrics): number {
    let score = 100;
    
    // Deduct points for issues
    if (metrics.cpu_usage > 80) score -= (metrics.cpu_usage - 80) * 2;
    if (metrics.memory_usage > 80) score -= (metrics.memory_usage - 80) * 2;
    if (metrics.response_time > 500) score -= Math.min(30, (metrics.response_time - 500) / 10);
    if (metrics.error_rate > 1) score -= metrics.error_rate * 10;
    if (metrics.uptime < 99.8) score -= (99.8 - metrics.uptime) * 50;
    if (metrics.cache_hit_rate < 80) score -= (80 - metrics.cache_hit_rate);
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// Create and export singleton instance
export const infrastructureOptimizer = InfrastructureOptimizer.getInstance();
export default infrastructureOptimizer;