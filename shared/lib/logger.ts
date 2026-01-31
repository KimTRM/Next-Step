/**
 * Logging System for NextStep Platform
 */

import { NextStepError, AppError, ErrorContext } from './errors';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error | NextStepError;
  context?: ErrorContext;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private sessionId: string;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error | NextStepError,
    context?: ErrorContext
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      data,
      error,
      context,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from Clerk or other auth system
    if (typeof window !== 'undefined') {
      // This would be populated by your auth context
      return (window as any).__CLERK_USER_ID__;
    }
    return undefined;
  }

  private log(entry: LogEntry): void {
    const logMessage = `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    switch (entry.level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logMessage, entry.data, entry.error);
        }
        break;
      case 'info':
        console.info(logMessage, entry.data);
        break;
      case 'warn':
        console.warn(logMessage, entry.data, entry.error);
        break;
      case 'error':
        console.error(logMessage, entry.data, entry.error);
        break;
    }

    // In production, you might want to send errors to a service like Sentry
    if (entry.level === 'error' && !this.isDevelopment) {
      this.sendToErrorReporting(entry);
    }
  }

  private async sendToErrorReporting(entry: LogEntry): Promise<void> {
    // Integration with error reporting services like Sentry, LogRocket, etc.
    try {
      // Example: Send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
      
      // For now, just store in localStorage for debugging
      if (typeof window !== 'undefined') {
        const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
        errors.push(entry);
        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.splice(0, errors.length - 50);
        }
        localStorage.setItem('app_errors', JSON.stringify(errors));
      }
    } catch (err) {
      console.warn('Failed to send error to reporting service:', err);
    }
  }

  // Public logging methods
  debug(message: string, data?: any): void {
    const entry = this.createLogEntry('debug', message, data);
    this.log(entry);
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry('info', message, data);
    this.log(entry);
  }

  warn(message: string, data?: any, error?: Error): void {
    const entry = this.createLogEntry('warn', message, data, error);
    this.log(entry);
  }

  error(message: string, error?: Error | NextStepError, context?: ErrorContext, data?: any): void {
    const entry = this.createLogEntry('error', message, data, error, context);
    this.log(entry);
  }

  // Specialized logging methods
  logError(error: Error | NextStepError, context?: ErrorContext): void {
    const message = error instanceof NextStepError ? error.message : 'Unexpected error occurred';
    this.error(message, error, context);
  }

  logUserAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data);
  }

  logApiCall(endpoint: string, method: string, status: number, duration?: number): void {
    this.debug(`API Call: ${method} ${endpoint}`, {
      status,
      duration,
      timestamp: new Date().toISOString(),
    });
  }

  logPerformance(metric: string, value: number, unit?: string): void {
    this.debug(`Performance: ${metric}`, {
      value,
      unit: unit || 'ms',
      timestamp: new Date().toISOString(),
    });
  }

  // Error analytics
  getErrorSummary(): LogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      return errors;
    } catch {
      return [];
    }
  }

  clearErrorLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_errors');
    }
  }

  // Session management
  getSessionId(): string {
    return this.sessionId;
  }

  regenerateSessionId(): void {
    this.sessionId = this.generateSessionId();
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const logError = (error: Error | NextStepError, context?: ErrorContext) => 
  logger.logError(error, context);

export const logUserAction = (action: string, data?: any) => 
  logger.logUserAction(action, data);

export const logApiCall = (endpoint: string, method: string, status: number, duration?: number) => 
  logger.logApiCall(endpoint, method, status, duration);

export const logPerformance = (metric: string, value: number, unit?: string) => 
  logger.logPerformance(metric, value, unit);

// Development helper to expose logger in console
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).appLogger = logger;
  (window as any).appLogs = {
    getErrors: () => logger.getErrorSummary(),
    clearLogs: () => logger.clearErrorLogs(),
  };
}
