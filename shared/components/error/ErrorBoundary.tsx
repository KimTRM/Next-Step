/**
 * React Error Boundary Component
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { logError } from '@/shared/lib/errors/logger';
import { normalizeError, isRetryableError } from '@/shared/lib/errors/utils';
import type { ErrorBoundaryProps, ErrorBoundaryState, AppError } from '@/shared/lib/errors/types';

const DefaultErrorFallback: React.FC<{
  error: AppError;
  reset: () => void;
  retryCount: number;
}> = ({ error, reset, retryCount }) => {
  const isRetryable = isRetryableError(error);
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {error.title || 'Something went wrong'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {error.message}
          </CardDescription>
          {error.code && (
            <Badge variant="secondary" className="mt-2">
              {error.code}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            {isRetryable && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount})`}
              </Button>
            )}
            
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {isDevelopment && (
            <details className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Technical Details
              </summary>
              <div className="mt-2 space-y-2 text-xs">
                <div>
                  <strong>Error Code:</strong> {error.code}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
                </div>
                {error.type && (
                  <div>
                    <strong>Type:</strong> {error.type}
                  </div>
                )}
                {error.context && Object.keys(error.context).length > 0 && (
                  <div>
                    <strong>Context:</strong>
                    <pre className="mt-1 overflow-auto bg-white p-2 rounded border">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 overflow-auto bg-white p-2 rounded border text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = normalizeError(error);
    
    this.setState({
      error: appError,
      errorInfo,
    });

    // Log the error
    logError(appError, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.isolate ? 'isolated' : 'global',
    });

    // Call custom error handler if provided
    this.props.onError?.(appError, errorInfo);
  }

  handleReset = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: Fallback = DefaultErrorFallback, enableRetry = true, maxRetries = 3 } = this.props;

    if (hasError && error) {
      if (!enableRetry || retryCount >= maxRetries) {
        // Show fallback without retry button if max retries exceeded
        return <Fallback error={error} reset={() => {}} retryCount={retryCount} />;
      }
      
      return <Fallback error={error} reset={this.handleReset} retryCount={retryCount} />;
    }

    return children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((error: unknown) => {
    const appError = normalizeError(error);
    setError(appError);
    logError(appError);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // If there's an error, throw it to be caught by the nearest error boundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}
