import { supabase } from './supabase';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  id?: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  error?: any;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id?: string;
  timestamp: string;
  errorName: string;
  errorMessage: string;
  stackTrace: string;
  service: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private errorBuffer: ErrorReport[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushInterval: NodeJS.Timeout | null = null;
  private correlationId: string | null = null;

  private constructor() {
    this.startFlushInterval();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sets a correlation ID for the current request context
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Gets the current correlation ID
   */
  getCorrelationId(): string | null {
    return this.correlationId;
  }

  /**
   * Creates a new correlation ID
   */
  generateCorrelationId(): string {
    return 'correlation_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Logs a message
   */
  async log(level: LogLevel, message: string, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    error?: any;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      sessionId: context.sessionId,
      correlationId: this.correlationId || this.generateCorrelationId(),
      error: context.error,
      metadata: context.metadata || {}
    };

    // Add to buffer
    this.logBuffer.push(logEntry);

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      this.consoleLog(logEntry);
    }

    // Flush if buffer is full
    if (this.logBuffer.length >= this.BUFFER_SIZE) {
      await this.flushLogs();
    }
  }

  /**
   * Logs a debug message
   */
  async debug(message: string, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Logs an info message
   */
  async info(message: string, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  /**
   * Logs a warning message
   */
  async warn(message: string, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  /**
   * Logs an error message
   */
  async error(message: string, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    error?: any;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Reports an error to the error tracking system
   */
  async reportError(error: Error, context: {
    service: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    const errorReport: ErrorReport = {
      timestamp: new Date().toISOString(),
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack || 'No stack trace available',
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      sessionId: context.sessionId,
      userAgent: context.userAgent,
      url: context.url,
      severity: context.severity || this.assessSeverity(error),
      resolved: false
    };

    // Add to error buffer
    this.errorBuffer.push(errorReport);

    // Log the error as well
    await this.error(error.message, {
      service: context.service,
      operation: context.operation,
      userId: context.userId,
      sessionId: context.sessionId,
      error,
      metadata: {
        stack: error.stack,
        severity: errorReport.severity
      }
    });

    // Flush if buffer is full
    if (this.errorBuffer.length >= this.BUFFER_SIZE) {
      await this.flushErrors();
    }
  }

  /**
   * Assess the severity of an error
   */
  private assessSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    if (message.includes('database') || message.includes('connection') || message.includes('timeout')) {
      return 'high';
    }
    
    if (message.includes('payment') || message.includes('transaction') || message.includes('order')) {
      return 'critical';
    }
    
    if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Console log for development
   */
  private consoleLog(entry: LogEntry): void {
    const colorMap: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m'  // Red
    };

    const resetColor = '\x1b[0m';
    const color = colorMap[entry.level];

    console.log(
      `${color}[${entry.timestamp}] ${entry.level.toUpperCase()} - ${entry.service}${entry.operation ? `:${entry.operation}` : ''} - ${entry.message}${resetColor}`
    );

    if (entry.error) {
      console.error(entry.error);
    }
  }

  /**
   * Flushes logs to the database
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const { error } = await supabase
        .from('logs') // Assuming this table exists
        .insert(logsToFlush);

      if (error) {
        console.error('Error flushing logs:', error);
        // Put logs back in buffer if flush failed
        this.logBuffer.unshift(...logsToFlush);
      }
    } catch (err) {
      console.error('Error flushing logs:', err);
      // Put logs back in buffer if flush failed
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * Flushes errors to the database
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      const { error } = await supabase
        .from('error_reports') // Assuming this table exists
        .insert(errorsToFlush);

      if (error) {
        console.error('Error flushing error reports:', error);
        // Put errors back in buffer if flush failed
        this.errorBuffer.unshift(...errorsToFlush);
      }
    } catch (err) {
      console.error('Error flushing error reports:', err);
      // Put errors back in buffer if flush failed
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  /**
   * Starts the periodic flush interval
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(async () => {
      await this.flushLogs();
      await this.flushErrors();
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
   * Gets logs for a specific service
   */
  async getServiceLogs(
    service: string,
    hours: number = 24,
    level?: LogLevel
  ): Promise<LogEntry[]> {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    let query = supabase
      .from('logs')
      .select('*')
      .eq('service', service)
      .gte('timestamp', startTime.toISOString());

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Gets error reports
   */
  async getErrorReports(
    service?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    resolved: boolean = false
  ): Promise<ErrorReport[]> {
    let query = supabase
      .from('error_reports')
      .select('*')
      .eq('resolved', resolved);

    if (service) {
      query = query.eq('service', service);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching error reports: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Resolves an error report
   */
  async resolveError(errorId: string, resolvedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('error_reports')
      .update({ 
        resolved: true, 
        resolvedAt: new Date().toISOString(),
        resolvedBy 
      })
      .eq('id', errorId);

    if (error) {
      console.error('Error resolving error report:', error);
      return false;
    }

    return true;
  }
}

// Create a singleton instance
export const logger = Logger.getInstance();

// Error boundary component for React
export class LoggingErrorBoundary {
  constructor(private serviceName: string) {}

  async logError(error: Error, operation?: string): Promise<void> {
    await logger.reportError(error, {
      service: this.serviceName,
      operation,
      severity: 'high'
    });
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo): Promise<void> {
    await this.logError(error, 'componentDidCatch');
    
    // Log the error info as well
    await logger.error('React Error Boundary caught an error', {
      service: this.serviceName,
      operation: 'componentDidCatch',
      metadata: {
        errorInfo
      }
    });
  }
}

// Higher-order function to wrap async functions with error logging
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  serviceName: string,
  operation: string
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args);
    } catch (error) {
      await logger.reportError(error as Error, {
        service: serviceName,
        operation,
        severity: 'high'
      });
      throw error;
    }
  };
}

// Decorator for logging method calls
export function LogMethod(serviceName: string, operation?: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const op = operation || `${target.constructor.name}.${propertyKey}`;
      
      try {
        // Log method entry
        await logger.debug(`Entering method: ${op}`, {
          service: serviceName,
          operation: op,
          metadata: {
            args: args.length > 0 ? args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg) : undefined
          }
        });

        const result = await originalMethod.apply(this, args);

        // Log method exit
        await logger.debug(`Exiting method: ${op}`, {
          service: serviceName,
          operation: op,
          metadata: {
            result: typeof result === 'object' ? JSON.stringify(result) : result
          }
        });

        return result;
      } catch (error) {
        await logger.reportError(error as Error, {
          service: serviceName,
          operation: op,
          severity: 'high'
        });
        
        throw error;
      }
    };

    return descriptor;
  };
}