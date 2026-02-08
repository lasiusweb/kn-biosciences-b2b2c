// Monitoring and Alerting System for KN Biosciences
import { performanceMonitor } from './performance-monitoring';
import { logger } from './logger';
import { supabase } from './supabase';
import nodemailer from 'nodemailer';

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Alert types
export enum AlertType {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  INFRASTRUCTURE = 'infrastructure',
  BUSINESS = 'business'
}

// Alert interface
export interface Alert {
  id?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  service?: string;
  endpoint?: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

// Metric thresholds
export interface Thresholds {
  responseTime: {
    warning: number; // in ms
    critical: number; // in ms
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  throughput: {
    warning: number; // requests per minute
    critical: number; // requests per minute
  };
  memoryUsage: {
    warning: number; // percentage
    critical: number; // percentage
  };
  cpuUsage: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

// Default thresholds
const DEFAULT_THRESHOLDS: Thresholds = {
  responseTime: {
    warning: 1000, // 1 second
    critical: 3000 // 3 seconds
  },
  errorRate: {
    warning: 1, // 1%
    critical: 5 // 5%
  },
  throughput: {
    warning: 10, // 10 RPM
    critical: 2 // 2 RPM
  },
  memoryUsage: {
    warning: 75, // 75%
    critical: 90 // 90%
  },
  cpuUsage: {
    warning: 75, // 75%
    critical: 90 // 90%
  }
};

// Alerting system class
export class AlertingSystem {
  private static instance: AlertingSystem;
  private alerts: Alert[] = [];
  private thresholds: Thresholds;
  private emailTransporter: any;
  private webhookUrls: string[];
  private alertCooldowns: Map<string, number> = new Map(); // To prevent spam
  private readonly cooldownPeriod = 300000; // 5 minutes in ms

  private constructor(thresholds: Thresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
    this.setupEmailTransporter();
    this.webhookUrls = [
      process.env.ALERT_WEBHOOK_URL || '',
      process.env.SECURITY_ALERT_WEBHOOK_URL || ''
    ].filter(url => url !== '');
  }

  public static getInstance(): AlertingSystem {
    if (!AlertingSystem.instance) {
      const thresholds = this.loadThresholdsFromEnv();
      AlertingSystem.instance = new AlertingSystem(thresholds);
    }
    return AlertingSystem.instance;
  }

  private static loadThresholdsFromEnv(): Thresholds {
    return {
      responseTime: {
        warning: parseInt(process.env.RESPONSE_TIME_WARNING_THRESHOLD || '1000'),
        critical: parseInt(process.env.RESPONSE_TIME_CRITICAL_THRESHOLD || '3000')
      },
      errorRate: {
        warning: parseFloat(process.env.ERROR_RATE_WARNING_THRESHOLD || '1'),
        critical: parseFloat(process.env.ERROR_RATE_CRITICAL_THRESHOLD || '5')
      },
      throughput: {
        warning: parseInt(process.env.THROUGHPUT_WARNING_THRESHOLD || '10'),
        critical: parseInt(process.env.THROUGHPUT_CRITICAL_THRESHOLD || '2')
      },
      memoryUsage: {
        warning: parseInt(process.env.MEMORY_USAGE_WARNING_THRESHOLD || '75'),
        critical: parseInt(process.env.MEMORY_USAGE_CRITICAL_THRESHOLD || '90')
      },
      cpuUsage: {
        warning: parseInt(process.env.CPU_USAGE_WARNING_THRESHOLD || '75'),
        critical: parseInt(process.env.CPU_USAGE_CRITICAL_THRESHOLD || '90')
      }
    };
  }

  private setupEmailTransporter(): void {
    if (!process.env.SMTP_HOST) {
      console.warn('SMTP configuration not found. Email alerts will be disabled.');
      return;
    }

    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Checks if an alert should be triggered based on response time
   */
  async checkResponseTime(service: string, endpoint: string, responseTime: number): Promise<void> {
    let severity: AlertSeverity | null = null;
    let title = '';
    let description = '';

    if (responseTime >= this.thresholds.responseTime.critical) {
      severity = AlertSeverity.CRITICAL;
      title = `Critical Response Time on ${service}`;
      description = `${endpoint} took ${responseTime}ms to respond, exceeding critical threshold of ${this.thresholds.responseTime.critical}ms`;
    } else if (responseTime >= this.thresholds.responseTime.warning) {
      severity = AlertSeverity.MEDIUM;
      title = `High Response Time on ${service}`;
      description = `${endpoint} took ${responseTime}ms to respond, exceeding warning threshold of ${this.thresholds.responseTime.warning}ms`;
    }

    if (severity) {
      const alertId = `${service}:${endpoint}:response_time`;
      await this.triggerAlert({
        type: AlertType.PERFORMANCE,
        severity,
        title,
        description,
        service,
        endpoint,
        metadata: {
          responseTime,
          threshold: severity === AlertSeverity.CRITICAL 
            ? this.thresholds.responseTime.critical 
            : this.thresholds.responseTime.warning
        }
      }, alertId);
    }
  }

  /**
   * Checks if an alert should be triggered based on error rate
   */
  async checkErrorRate(service: string, errorRate: number): Promise<void> {
    let severity: AlertSeverity | null = null;
    let title = '';
    let description = '';

    if (errorRate >= this.thresholds.errorRate.critical) {
      severity = AlertSeverity.CRITICAL;
      title = `Critical Error Rate on ${service}`;
      description = `${service} is experiencing ${errorRate}% error rate, exceeding critical threshold of ${this.thresholds.errorRate.critical}%`;
    } else if (errorRate >= this.thresholds.errorRate.warning) {
      severity = AlertSeverity.HIGH;
      title = `High Error Rate on ${service}`;
      description = `${service} is experiencing ${errorRate}% error rate, exceeding warning threshold of ${this.thresholds.errorRate.warning}%`;
    }

    if (severity) {
      const alertId = `${service}:error_rate`;
      await this.triggerAlert({
        type: AlertType.PERFORMANCE,
        severity,
        title,
        description,
        service,
        metadata: {
          errorRate,
          threshold: severity === AlertSeverity.CRITICAL 
            ? this.thresholds.errorRate.critical 
            : this.thresholds.errorRate.warning
        }
      }, alertId);
    }
  }

  /**
   * Checks if an alert should be triggered based on throughput
   */
  async checkThroughput(service: string, throughput: number): Promise<void> {
    let severity: AlertSeverity | null = null;
    let title = '';
    let description = '';

    // Low throughput alerts
    if (throughput <= this.thresholds.throughput.critical) {
      severity = AlertSeverity.CRITICAL;
      title = `Critical Low Throughput on ${service}`;
      description = `${service} is processing only ${throughput} requests/min, below critical threshold of ${this.thresholds.throughput.critical} requests/min`;
    } else if (throughput <= this.thresholds.throughput.warning) {
      severity = AlertSeverity.MEDIUM;
      title = `Low Throughput on ${service}`;
      description = `${service} is processing ${throughput} requests/min, below warning threshold of ${this.thresholds.throughput.warning} requests/min`;
    }

    if (severity) {
      const alertId = `${service}:throughput`;
      await this.triggerAlert({
        type: AlertType.PERFORMANCE,
        severity,
        title,
        description,
        service,
        metadata: {
          throughput,
          threshold: severity === AlertSeverity.CRITICAL 
            ? this.thresholds.throughput.critical 
            : this.thresholds.throughput.warning
        }
      }, alertId);
    }
  }

  /**
   * Checks if an alert should be triggered based on resource usage
   */
  async checkResourceUsage(cpuUsage: number, memoryUsage: number): Promise<void> {
    // Check CPU usage
    if (cpuUsage >= this.thresholds.cpuUsage.critical) {
      const alertId = `system:cpu_usage`;
      await this.triggerAlert({
        type: AlertType.INFRASTRUCTURE,
        severity: AlertSeverity.CRITICAL,
        title: 'Critical CPU Usage',
        description: `Server CPU usage is at ${cpuUsage}%, exceeding critical threshold of ${this.thresholds.cpuUsage.critical}%`,
        metadata: {
          cpuUsage,
          threshold: this.thresholds.cpuUsage.critical
        }
      }, alertId);
    } else if (cpuUsage >= this.thresholds.cpuUsage.warning) {
      const alertId = `system:cpu_usage_warning`;
      await this.triggerAlert({
        type: AlertType.INFRASTRUCTURE,
        severity: AlertSeverity.MEDIUM,
        title: 'High CPU Usage',
        description: `Server CPU usage is at ${cpuUsage}%, exceeding warning threshold of ${this.thresholds.cpuUsage.warning}%`,
        metadata: {
          cpuUsage,
          threshold: this.thresholds.cpuUsage.warning
        }
      }, alertId);
    }

    // Check memory usage
    if (memoryUsage >= this.thresholds.memoryUsage.critical) {
      const alertId = `system:memory_usage`;
      await this.triggerAlert({
        type: AlertType.INFRASTRUCTURE,
        severity: AlertSeverity.CRITICAL,
        title: 'Critical Memory Usage',
        description: `Server memory usage is at ${memoryUsage}%, exceeding critical threshold of ${this.thresholds.memoryUsage.critical}%`,
        metadata: {
          memoryUsage,
          threshold: this.thresholds.memoryUsage.critical
        }
      }, alertId);
    } else if (memoryUsage >= this.thresholds.memoryUsage.warning) {
      const alertId = `system:memory_usage_warning`;
      await this.triggerAlert({
        type: AlertType.INFRASTRUCTURE,
        severity: AlertSeverity.MEDIUM,
        title: 'High Memory Usage',
        description: `Server memory usage is at ${memoryUsage}%, exceeding warning threshold of ${this.thresholds.memoryUsage.warning}%`,
        metadata: {
          memoryUsage,
          threshold: this.thresholds.memoryUsage.warning
        }
      }, alertId);
    }
  }

  /**
   * Checks for security-related alerts
   */
  async checkSecurityEvents(eventType: string, details: any): Promise<void> {
    let severity: AlertSeverity = AlertSeverity.LOW;
    let title = '';
    let description = '';

    switch (eventType) {
      case 'failed_login':
        severity = AlertSeverity.MEDIUM;
        title = 'Multiple Failed Login Attempts';
        description = `Detected multiple failed login attempts from IP: ${details.ip}`;
        break;
      case 'brute_force':
        severity = AlertSeverity.HIGH;
        title = 'Potential Brute Force Attack';
        description = `System is detecting signs of a brute force attack from IP: ${details.ip}`;
        break;
      case 'unusual_activity':
        severity = AlertSeverity.MEDIUM;
        title = 'Unusual User Activity';
        description = `Detected unusual activity for user: ${details.userId}`;
        break;
      case 'data_exfiltration':
        severity = AlertSeverity.CRITICAL;
        title = 'Potential Data Exfiltration';
        description = `Detected unusual data access patterns that may indicate data exfiltration`;
        break;
      case 'privilege_escalation':
        severity = AlertSeverity.CRITICAL;
        title = 'Privilege Escalation Attempt';
        description = `Detected potential privilege escalation attempt by user: ${details.userId}`;
        break;
      default:
        severity = AlertSeverity.LOW;
        title = 'Security Event Detected';
        description = `Security event "${eventType}" detected with details: ${JSON.stringify(details)}`;
    }

    const alertId = `security:${eventType}:${details.userId || details.ip || 'unknown'}`;
    await this.triggerAlert({
      type: AlertType.SECURITY,
      severity,
      title,
      description,
      metadata: details
    }, alertId);
  }

  /**
   * Triggers an alert if not in cooldown period
   */
  private async triggerAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>, alertId: string): Promise<void> {
    const now = Date.now();
    const lastTriggered = this.alertCooldowns.get(alertId);

    // Check if alert is in cooldown period
    if (lastTriggered && (now - lastTriggered) < this.cooldownPeriod) {
      // Still in cooldown, don't trigger again
      return;
    }

    // Update cooldown timer
    this.alertCooldowns.set(alertId, now);

    const fullAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };

    this.alerts.push(fullAlert);

    // Log the alert
    await logger.warn(`Alert triggered: ${fullAlert.title}`, {
      service: 'alerting-system',
      operation: 'trigger-alert',
      metadata: fullAlert
    });

    // Send notifications
    await this.sendAlertNotifications(fullAlert);
  }

  /**
   * Sends alert notifications via various channels
   */
  private async sendAlertNotifications(alert: Alert): Promise<void> {
    const promises: Promise<any>[] = [];

    // Send email if transporter is configured
    if (this.emailTransporter) {
      promises.push(this.sendEmailNotification(alert));
    }

    // Send webhook notifications
    for (const webhookUrl of this.webhookUrls) {
      if (webhookUrl) {
        promises.push(this.sendWebhookNotification(alert, webhookUrl));
      }
    }

    // Log to database
    promises.push(this.logAlertToDatabase(alert));

    try {
      await Promise.all(promises);
    } catch (error) {
      await logger.error('Error sending alert notifications', {
        service: 'alerting-system',
        operation: 'send-notifications',
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id
      });
    }
  }

  /**
   * Sends an email notification
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    const recipients = process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || ['admin@knbiosciences.com'];
    
    const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
    const html = `
      <h2>${alert.title}</h2>
      <p><strong>Type:</strong> ${alert.type}</p>
      <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
      <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
      ${alert.service ? `<p><strong>Service:</strong> ${alert.service}</p>` : ''}
      ${alert.endpoint ? `<p><strong>Endpoint:</strong> ${alert.endpoint}</p>` : ''}
      <p><strong>Description:</strong> ${alert.description}</p>
      ${alert.metadata ? `<p><strong>Details:</strong> <pre>${JSON.stringify(alert.metadata, null, 2)}</pre></p>` : ''}
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'alerts@knbiosciences.com',
      to: recipients.join(', '),
      subject,
      html
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
      await logger.info(`Alert email sent successfully`, {
        service: 'alerting-system',
        operation: 'send-email',
        alertId: alert.id
      });
    } catch (error) {
      await logger.error('Failed to send alert email', {
        service: 'alerting-system',
        operation: 'send-email',
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id
      });
    }
  }

  /**
   * Sends a webhook notification
   */
  private async sendWebhookNotification(alert: Alert, webhookUrl: string): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.title}`,
          attachments: [
            {
              color: this.getAlertColor(alert.severity),
              fields: [
                { title: 'Type', value: alert.type, short: true },
                { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true },
                { title: 'Service', value: alert.service || 'N/A', short: true },
                { title: 'Endpoint', value: alert.endpoint || 'N/A', short: true },
                { title: 'Description', value: alert.description, short: false },
                ...(alert.metadata ? [
                  { title: 'Details', value: `\`\`\`${JSON.stringify(alert.metadata, null, 2)}\`\`\``, short: false }
                ] : [])
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await logger.info(`Alert webhook sent successfully`, {
        service: 'alerting-system',
        operation: 'send-webhook',
        alertId: alert.id,
        webhookUrl: this.maskUrl(webhookUrl)
      });
    } catch (error) {
      await logger.error('Failed to send alert webhook', {
        service: 'alerting-system',
        operation: 'send-webhook',
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id,
        webhookUrl: this.maskUrl(webhookUrl)
      });
    }
  }

  /**
   * Logs alert to database
   */
  private async logAlertToDatabase(alert: Alert): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert([{
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          service: alert.service,
          endpoint: alert.endpoint,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          resolved: alert.resolved,
          metadata: alert.metadata
        }]);

      if (error) {
        throw error;
      }

      await logger.info(`Alert logged to database`, {
        service: 'alerting-system',
        operation: 'log-to-db',
        alertId: alert.id
      });
    } catch (error) {
      await logger.error('Failed to log alert to database', {
        service: 'alerting-system',
        operation: 'log-to-db',
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id
      });
    }
  }

  /**
   * Gets color code for alert severity
   */
  private getAlertColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger';
      case AlertSeverity.HIGH: return 'warning';
      case AlertSeverity.MEDIUM: return 'good';
      case AlertSeverity.LOW: return '#cccccc';
      default: return '#cccccc';
    }
  }

  /**
   * Masks sensitive parts of a URL
   */
  private maskUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '***';
      }
      return parsed.toString();
    } catch {
      return url; // Return original if parsing fails
    }
  }

  /**
   * Acknowledges an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;

    // Update in database
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ acknowledged: true, acknowledged_by: acknowledgedBy })
        .eq('id', alertId);

      if (error) {
        throw error;
      }
    } catch (error) {
      await logger.error('Failed to acknowledge alert in database', {
        service: 'alerting-system',
        operation: 'acknowledge-alert',
        error: error instanceof Error ? error.message : String(error),
        alertId
      });
      return false;
    }

    return true;
  }

  /**
   * Resolves an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date().toISOString();

    // Update in database
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ 
          resolved: true, 
          resolved_by: resolvedBy,
          resolved_at: alert.resolvedAt
        })
        .eq('id', alertId);

      if (error) {
        throw error;
      }
    } catch (error) {
      await logger.error('Failed to resolve alert in database', {
        service: 'alerting-system',
        operation: 'resolve-alert',
        error: error instanceof Error ? error.message : String(error),
        alertId
      });
      return false;
    }

    return true;
  }

  /**
   * Gets active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Gets alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Gets alerts by type
   */
  getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * Gets alert statistics
   */
  getAlertStatistics(): {
    total: number;
    active: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
  } {
    const stats = {
      total: this.alerts.length,
      active: 0,
      bySeverity: {
        [AlertSeverity.LOW]: 0,
        [AlertSeverity.MEDIUM]: 0,
        [AlertSeverity.HIGH]: 0,
        [AlertSeverity.CRITICAL]: 0
      },
      byType: {
        [AlertType.PERFORMANCE]: 0,
        [AlertType.SECURITY]: 0,
        [AlertType.INFRASTRUCTURE]: 0,
        [AlertType.BUSINESS]: 0
      }
    };

    for (const alert of this.alerts) {
      if (!alert.resolved) {
        stats.active++;
      }
      
      stats.bySeverity[alert.severity]++;
      stats.byType[alert.type]++;
    }

    return stats;
  }

  /**
   * Updates thresholds dynamically
   */
  updateThresholds(newThresholds: Partial<Thresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds
    };
  }

  /**
   * Gets current thresholds
   */
  getThresholds(): Thresholds {
    return { ...this.thresholds };
  }
}

// Create a singleton instance
export const alertingSystem = AlertingSystem.getInstance();

// Monitoring utilities
export class MonitoringUtils {
  /**
   * Monitors API endpoint performance
   */
  static async monitorEndpoint(
    service: string,
    endpoint: string,
    fn: () => Promise<any>
  ): Promise<any> {
    const startTime = performance.now();
    let errorOccurred = false;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      errorOccurred = true;
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Record performance metric
      await performanceMonitor.recordMetric({
        service_name: service,
        endpoint,
        response_time: responseTime,
        error: errorOccurred,
        status_code: errorOccurred ? 500 : 200
      });

      // Check if alert should be triggered
      await alertingSystem.checkResponseTime(service, endpoint, responseTime);
    }
  }

  /**
   * Monitors system resources
   */
  static async monitorSystemResources(): Promise<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  }> {
    // In a real implementation, this would use system monitoring libraries
    // For now, we'll simulate the values
    const cpuUsage = Math.random() * 100; // Random value for simulation
    const memoryUsage = Math.random() * 100; // Random value for simulation
    const diskUsage = Math.random() * 100; // Random value for simulation

    // Check if alerts should be triggered
    await alertingSystem.checkResourceUsage(cpuUsage, memoryUsage);

    return {
      cpuUsage: parseFloat(cpuUsage.toFixed(2)),
      memoryUsage: parseFloat(memoryUsage.toFixed(2)),
      diskUsage: parseFloat(diskUsage.toFixed(2))
    };
  }

  /**
   * Monitors error rates for a service
   */
  static async monitorErrorRate(service: string, totalRequests: number, errorCount: number): Promise<void> {
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    // Record in performance monitor
    await performanceMonitor.recordMetric({
      service_name: service,
      endpoint: 'error_rate',
      response_time: 0, // Not applicable for error rate
      error: false, // This is the error rate metric itself
      status_code: 200,
      metadata: { errorRate, totalRequests, errorCount }
    });

    // Check if alert should be triggered
    await alertingSystem.checkErrorRate(service, errorRate);
  }

  /**
   * Monitors throughput for a service
   */
  static async monitorThroughput(service: string, requestsPerMinute: number): Promise<void> {
    // Record in performance monitor
    await performanceMonitor.recordMetric({
      service_name: service,
      endpoint: 'throughput',
      response_time: 0, // Not applicable for throughput
      error: false,
      status_code: 200,
      metadata: { requestsPerMinute }
    });

    // Check if alert should be triggered
    await alertingSystem.checkThroughput(service, requestsPerMinute);
  }
}

// Health check endpoint
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    cache: boolean;
    externalServices: boolean;
    diskSpace: boolean;
  };
  timestamp: string;
}> {
  const checks = {
    database: false,
    cache: false,
    externalServices: true, // Assume true unless proven otherwise
    diskSpace: true // Assume true unless proven otherwise
  };

  // Check database connectivity
  try {
    const { error } = await supabase.from('health_check').select('id').limit(1);
    checks.database = !error;
  } catch (error) {
    checks.database = false;
  }

  // Check cache connectivity (if using Redis)
  try {
    // In a real implementation, check Redis connection
    // const pingResult = await redis.ping();
    // checks.cache = pingResult === 'PONG';
    checks.cache = true; // For now, assume it's working
  } catch (error) {
    checks.cache = false;
  }

  // Determine overall status
  const healthyChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const healthyRatio = healthyChecks / totalChecks;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (healthyRatio < 0.5) {
    status = 'unhealthy';
  } else if (healthyRatio < 1) {
    status = 'degraded';
  }

  return {
    status,
    checks,
    timestamp: new Date().toISOString()
  };
}

// Export all monitoring utilities
export const MonitoringSystem = {
  alertingSystem,
  MonitoringUtils,
  healthCheck
};

export default MonitoringSystem;