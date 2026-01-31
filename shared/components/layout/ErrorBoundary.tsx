/**
 * React Error Boundary Component
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { logError } from '../../lib/logger';
import { NextStepError } from '../../lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
  showReport?: boolean;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log the error
    logError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      additionalData: {
        errorInfo,
        retryCount: this.state.retryCount,
        props: this.props,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Create mailto link with bug report
    const subject = encodeURIComponent('Bug Report - NextStep Platform');
    const body = encodeURIComponent(JSON.stringify(bugReport, null, 2));
    window.open(`mailto:support@nextstep.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const isRetryable = this.state.retryCount < this.maxRetries;
      const isNextStepError = error instanceof NextStepError;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {this.props.title || 'Something went wrong'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {this.props.description || 
                 (isNextStepError ? error.userMessage : 'An unexpected error occurred')}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-32">
                    <div className="font-semibold mb-1">Error:</div>
                    <div className="mb-2">{error.message}</div>
                    {error.stack && (
                      <>
                        <div className="font-semibold mb-1">Stack Trace:</div>
                        <div className="whitespace-pre-wrap">{error.stack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}

              {this.state.retryCount > 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  Retry attempt {this.state.retryCount} of {this.maxRetries}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                {(this.props.showRetry !== false) && isRetryable && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}

                {(this.props.showHome !== false) && (
                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="outline"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                )}
              </div>

              {(this.props.showReport !== false) && process.env.NODE_ENV === 'production' && (
                <Button
                  onClick={this.handleReportBug}
                  className="w-full"
                  variant="ghost"
                  size="sm"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    logError(error, {
      component: 'useErrorHandler',
      action: 'manualErrorHandling',
      additionalData: errorInfo,
    });
  }, []);
};
