/**
 * Error logging and reporting system
 */

import type { AppError, ErrorLogEntry, ErrorReportingService } from './types';
import { extractErrorInfo, generateErrorId, isCriticalError, debounceErrorReporting } from './utils';

/**
 * Console-based error logger for development
 */
class ConsoleErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 1000;

  log(error: AppError, context?: Record<string, any>): void {
    const logEntry: ErrorLogEntry = {
      id: generateErrorId(),
      error,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      timestamp: Date.now(),
      resolved: false,
      ...context,
    };

    this.logs.unshift(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${logEntry.id}]`);
      console.error('Error Details:', extractErrorInfo(error));
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
      console.log('Context:', context);
      console.groupEnd();
    }

    // Log critical errors immediately
    if (isCriticalError(error)) {
      console.error('🔥 CRITICAL ERROR:', extractErrorInfo(error));
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getErrorById(id: string): ErrorLogEntry | undefined {
    return this.logs.find(log => log.id === id);
  }

  markAsResolved(id: string): void {
    const log = this.getErrorById(id);
    if (log) {
      log.resolved = true;
    }
  }
}

/**
 * Production error reporter (can be extended with Sentry, etc.)
 */
class ProductionErrorReporter implements ErrorReportingService {
  private user: { id: string; email?: string; name?: string } | null = null;
  private breadcrumbs: Array<{ message: string; timestamp: number; category?: string }> = [];

  setUser(user: { id: string; email?: string; name?: string }): void {
    this.user = user;
  }

  clearUser(): void {
    this.user = null;
  }

  addBreadcrumb(message: string, category?: string, level?: string): void {
    this.breadcrumbs.push({
      message,
      timestamp: Date.now(),
      category,
    });

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }

  async report(error: AppError, context?: Record<string, any>): Promise<void> {
    // In production, this would send to an error reporting service
    // For now, we'll just log to console with structured format
    const reportData = {
      errorId: generateErrorId(),
      timestamp: Date.now(),
      error: extractErrorInfo(error),
      user: this.user,
      breadcrumbs: this.breadcrumbs,
      context,
      severity: error.severity || 'medium',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    };

    // Log in a structured format for production monitoring
    console.error('ERROR_REPORT:', JSON.stringify(reportData));

    // Here you would integrate with services like Sentry, LogRocket, etc.
    // Example:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error.originalError || error, {
    //     tags: { errorCode: error.code },
    //     extra: context,
    //   });
    // }
  }
}

/**
 * Main error logger that combines console and production reporting
 */
class ErrorLogger {
  private consoleLogger = new ConsoleErrorLogger();
  private productionReporter = new ProductionErrorReporter();
  private debouncedReport: (error: AppError) => void;

  constructor() {
    // Debounce production reporting to avoid spam
    this.debouncedReport = debounceErrorReporting(
      (error) => this.productionReporter.report(error),
      5000
    );
  }

  log(error: AppError, context?: Record<string, any>): void {
    // Always log to console
    this.consoleLogger.log(error, context);

    // Report to production service in non-development
    if (process.env.NODE_ENV === 'production') {
      this.debouncedReport(error);
    }
  }

  logUserAction(action: string, details?: Record<string, any>): void {
    this.productionReporter.addBreadcrumb(action, 'user', 'info');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📍 User Action: ${action}`, details);
    }
  }

  logNavigation(from: string, to: string): void {
    this.productionReporter.addBreadcrumb(`Navigation: ${from} → ${to}`, 'navigation', 'info');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧭 Navigation: ${from} → ${to}`);
    }
  }

  setUser(user: { id: string; email?: string; name?: string }): void {
    this.productionReporter.setUser(user);
  }

  clearUser(): void {
    this.productionReporter.clearUser();
  }

  getConsoleLogs(): ErrorLogEntry[] {
    return this.consoleLogger.getLogs();
  }

  clearConsoleLogs(): void {
    this.consoleLogger.clearLogs();
  }

  // Performance monitoring
  logPerformance(metric: string, value: number, unit?: string): void {
    this.productionReporter.addBreadcrumb(`${metric}: ${value}${unit || ''}`, 'performance', 'info');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ Performance: ${metric} = ${value}${unit || ''}`);
    }
  }

  // Feature usage tracking
  logFeatureUsage(feature: string, details?: Record<string, any>): void {
    this.productionReporter.addBreadcrumb(`Feature: ${feature}`, 'feature', 'info');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Feature Used: ${feature}`, details);
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (error: AppError, context?: Record<string, any>) => {
  errorLogger.log(error, context);
};

export const logUserAction = (action: string, details?: Record<string, any>) => {
  errorLogger.logUserAction(action, details);
};

export const logNavigation = (from: string, to: string) => {
  errorLogger.logNavigation(from, to);
};

export const logPerformance = (metric: string, value: number, unit?: string) => {
  errorLogger.logPerformance(metric, value, unit);
};

export const logFeatureUsage = (feature: string, details?: Record<string, any>) => {
  errorLogger.logFeatureUsage(feature, details);
};

export const setErrorUser = (user: { id: string; email?: string; name?: string }) => {
  errorLogger.setUser(user);
};

export const clearErrorUser = () => {
  errorLogger.clearUser();
};

// Development-only debugging tools
export const getErrorLogs = () => {
  if (process.env.NODE_ENV === 'development') {
    return errorLogger.getConsoleLogs();
  }
  return [];
};

export const clearErrorLogs = () => {
  if (process.env.NODE_ENV === 'development') {
    errorLogger.clearConsoleLogs();
  }
};
