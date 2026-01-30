/**
 * Error Fallback UI Components
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Search, Shield, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface ErrorFallbackProps {
  type?: 'network' | 'server' | 'not-found' | 'permission' | 'generic';
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  retryText?: string;
  showRetry?: boolean;
  showHome?: boolean;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  type = 'generic',
  title,
  description,
  onRetry,
  onGoHome,
  retryText = 'Try Again',
  showRetry = true,
  showHome = true,
  className = '',
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Issue',
          defaultDescription: 'Unable to connect. Please check your internet connection and try again.',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
          borderColor: 'border-orange-200',
        };
      case 'server':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Server Error',
          defaultDescription: 'Something went wrong on our end. Please try again in a few moments.',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
        };
      case 'not-found':
        return {
          icon: Search,
          defaultTitle: 'Not Found',
          defaultDescription: 'The requested resource could not be found.',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
        };
      case 'permission':
        return {
          icon: Shield,
          defaultTitle: 'Access Denied',
          defaultDescription: 'You don\'t have permission to access this resource.',
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-200',
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something Went Wrong',
          defaultDescription: 'An unexpected error occurred. Please try again.',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-center min-h-[200px] p-4 ${className}`}>
      <Card className={`w-full max-w-md ${config.bgColor} ${config.borderColor}`}>
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 ${config.bgColor.replace('50', '100')} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {title || config.defaultTitle}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {description || config.defaultDescription}
          </CardDescription>
        </CardHeader>

        {(showRetry || showHome) && (
          <CardContent className="flex gap-2 justify-center">
            {showRetry && onRetry && (
              <Button onClick={onRetry} variant="default" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryText}
              </Button>
            )}
            {showHome && onGoHome && (
              <Button onClick={onGoHome} variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

// Specialized fallback components
export const NetworkErrorFallback: React.FC<Omit<ErrorFallbackProps, 'type'>> = (props) => (
  <ErrorFallback type="network" {...props} />
);

export const ServerErrorFallback: React.FC<Omit<ErrorFallbackProps, 'type'>> = (props) => (
  <ErrorFallback type="server" {...props} />
);

export const NotFoundFallback: React.FC<Omit<ErrorFallbackProps, 'type'>> = (props) => (
  <ErrorFallback type="not-found" {...props} />
);

export const PermissionErrorFallback: React.FC<Omit<ErrorFallbackProps, 'type'>> = (props) => (
  <ErrorFallback type="permission" {...props} />
);

// Inline error component for smaller spaces
export const InlineError: React.FC<{
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}> = ({ message, onRetry, compact = false }) => (
  <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''} text-red-600`}>
    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
      >
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </div>
);

// Loading error component for async operations
export const LoadingError: React.FC<{
  error: string;
  onRetry?: () => void;
  fullPage?: boolean;
}> = ({ error, onRetry, fullPage = false }) => {
  if (fullPage) {
    return (
      <ErrorFallback
        type="server"
        title="Loading Failed"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};
