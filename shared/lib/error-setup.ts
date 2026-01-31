/**
 * Error Handling Setup and Configuration
 */

import { Toaster } from './toast';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { logger } from './logger';
import { authManager } from './auth-handler';
import React from 'react';

/**
 * Initialize error handling system
 */
export function initializeErrorHandling(): void {
  // Set up global error handlers
  setupGlobalErrorHandlers();
  
  // Initialize auth manager
  initializeAuthManager();
  
  // Log system startup
  logger.info('Error handling system initialized', {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}

/**
 * Set up global error handlers for unhandled errors
 */
function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason, {
        component: 'global-error-handler',
        action: 'unhandledrejection',
      });

      // Show user-friendly error
      if (process.env.NODE_ENV === 'production') {
        import('./toast').then(({ showError }) => {
          showError('Something went wrong. Please refresh the page and try again.', event.reason);
        });
      }

      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle uncaught errors (in development)
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', event.error || new Error(event.message), {
        component: 'global-error-handler',
        action: 'uncaught-error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
  }
}

/**
 * Initialize auth manager with current auth state
 */
function initializeAuthManager(): void {
  // This would typically be called by your auth system
  // For now, we'll set up a basic check
  if (typeof window !== 'undefined') {
    // Check if user is authenticated (this would integrate with Clerk)
    const checkAuthState = () => {
      // This would integrate with your auth provider
      // For now, we'll just check for a token in localStorage
      const hasToken = !!localStorage.getItem('clerk-db-jwt');
      authManager.setAuthenticated(hasToken);
    };

    // Check auth state on load
    checkAuthState();

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'clerk-db-jwt') {
        checkAuthState();
      }
    });
  }
}

/**
 * Error handling configuration
 */
export const errorConfig = {
  // Toast settings
  toast: {
    duration: 5000,
    position: 'bottom-right' as const,
  },

  // Retry settings
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },

  // Logging settings
  logging: {
    enabled: process.env.NODE_ENV === 'development',
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  },

  // Error boundary settings
  errorBoundary: {
    showRetry: true,
    showHome: true,
    showReport: process.env.NODE_ENV === 'production',
  },
};

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: {
    title?: string;
    description?: string;
    showRetry?: boolean;
    showHome?: boolean;
  }
) {
  const WrappedComponent = (props: P) => (
    React.createElement(ErrorBoundary, {
      title: errorBoundaryProps?.title,
      description: errorBoundaryProps?.description,
      showRetry: errorBoundaryProps?.showRetry,
      showHome: errorBoundaryProps?.showHome,
      children: React.createElement(Component, props)
    })
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Error handling provider component
 */
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  // Initialize error handling on mount
  React.useEffect(() => {
    initializeErrorHandling();
  }, []);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(ErrorBoundary, { children }),
    React.createElement(Toaster)
  );
}

/**
 * Development error monitoring
 */
export function setupDevelopmentErrorMonitoring(): void {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Expose error utilities to console for debugging
    (window as any).errorUtils = {
      logger,
      authManager,
      getErrors: () => logger.getErrorSummary(),
      clearErrors: () => logger.clearErrorLogs(),
      testError: () => {
        throw new Error('Test error for debugging');
      },
    };

    // Log development mode
    logger.info('Development error monitoring enabled', {
      consoleCommands: [
        'errorUtils.logger - Access logger',
        'errorUtils.getErrors() - View recent errors',
        'errorUtils.clearErrors() - Clear error logs',
        'errorUtils.testError() - Test error handling',
      ],
    });
  }
}

/**
 * Production error reporting setup
 */
export function setupProductionErrorReporting(): void {
  if (process.env.NODE_ENV === 'production') {
    // This would integrate with services like Sentry, LogRocket, etc.
    logger.info('Production error reporting setup', {
      note: 'Configure with your error reporting service',
    });

    // Example Sentry integration (commented out):
    /*
    import * as Sentry from '@sentry/nextjs';
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    */
  }
}

/**
 * Performance monitoring setup
 */
export function setupPerformanceMonitoring(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      logger.logPerformance('page-load', loadTime, 'ms');
    });

    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      // This would integrate with web-vitals library
      logger.info('Web Vitals monitoring available');
    }
  }
}

/**
 * Complete error handling setup
 */
export function setupCompleteErrorHandling(): void {
  initializeErrorHandling();
  setupDevelopmentErrorMonitoring();
  setupProductionErrorReporting();
  setupPerformanceMonitoring();
}
