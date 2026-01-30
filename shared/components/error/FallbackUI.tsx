/**
 * Fallback UI components for various error states
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Search, 
  WifiOff, 
  Lock, 
  ShieldX,
  FileX,
  UploadCloud,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { AppError } from '@/shared/lib/errors/types';

interface BaseFallbackProps {
  error: AppError;
  reset?: () => void;
  className?: string;
}

/**
 * Network Error Fallback
 */
export const NetworkErrorFallback: React.FC<BaseFallbackProps> = ({ error, reset, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-6 h-6 text-orange-600" />
      </div>
      <CardTitle>Connection Error</CardTitle>
      <CardDescription>
        We couldn't connect to our servers. Please check your internet connection.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {reset && (
        <Button onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
        Refresh Page
      </Button>
    </CardContent>
  </Card>
);

/**
 * Authentication Error Fallback
 */
export const AuthErrorFallback: React.FC<BaseFallbackProps & { onSignIn?: () => void }> = ({ 
  error, 
  onSignIn, 
  className 
}) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-red-600" />
      </div>
      <CardTitle>Authentication Required</CardTitle>
      <CardDescription>
        Please sign in to access this feature.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {onSignIn ? (
        <Button onClick={onSignIn} className="w-full">
          Sign In
        </Button>
      ) : (
        <Link href="/auth/sign-in" className="w-full">
          <Button className="w-full">Sign In</Button>
        </Link>
      )}
      <Link href="/" className="w-full">
        <Button variant="outline" className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/**
 * Authorization Error Fallback
 */
export const AuthorizationErrorFallback: React.FC<BaseFallbackProps> = ({ error, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <ShieldX className="w-6 h-6 text-yellow-600" />
      </div>
      <CardTitle>Access Denied</CardTitle>
      <CardDescription>
        You don't have permission to access this resource.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Link href="/" className="w-full">
        <Button className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </Link>
      <Button variant="outline" onClick={() => window.history.back()} className="w-full">
        Go Back
      </Button>
    </CardContent>
  </Card>
);

/**
 * Not Found Error Fallback
 */
export const NotFoundErrorFallback: React.FC<BaseFallbackProps> = ({ error, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Search className="w-6 h-6 text-blue-600" />
      </div>
      <CardTitle>Page Not Found</CardTitle>
      <CardDescription>
        The page you're looking for doesn't exist or has been moved.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Link href="/" className="w-full">
        <Button className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </Link>
      <Button variant="outline" onClick={() => window.history.back()} className="w-full">
        Go Back
      </Button>
    </CardContent>
  </Card>
);

/**
 * Server Error Fallback
 */
export const ServerErrorFallback: React.FC<BaseFallbackProps> = ({ error, reset, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <CardTitle>Server Error</CardTitle>
      <CardDescription>
        Something went wrong on our end. Our team has been notified.
      </CardDescription>
      {process.env.NODE_ENV === 'development' && error.code && (
        <Badge variant="destructive" className="mt-2">
          {error.code}
        </Badge>
      )}
    </CardHeader>
    <CardContent className="space-y-3">
      {reset && (
        <Button onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
        Refresh Page
      </Button>
      <Link href="/support" className="w-full">
        <Button variant="ghost" className="w-full">
          <HelpCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/**
 * File Upload Error Fallback
 */
export const FileUploadErrorFallback: React.FC<BaseFallbackProps & { onRetry?: () => void }> = ({ 
  error, 
  onRetry, 
  className 
}) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <UploadCloud className="w-6 h-6 text-red-600" />
      </div>
      <CardTitle>Upload Failed</CardTitle>
      <CardDescription>
        {error.message || 'We couldn\'t upload your file. Please try again.'}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {onRetry && (
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      <Button variant="outline" onClick={() => window.history.back()} className="w-full">
        Cancel
      </Button>
    </CardContent>
  </Card>
);

/**
 * Loading Error Fallback (for components that fail to load)
 */
export const LoadingErrorFallback: React.FC<BaseFallbackProps> = ({ error, reset, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileX className="w-6 h-6 text-gray-600" />
      </div>
      <CardTitle>Failed to Load</CardTitle>
      <CardDescription>
        {error.message || 'This content could not be loaded.'}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {reset && (
        <Button onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
        Refresh Page
      </Button>
    </CardContent>
  </Card>
);

/**
 * Rate Limit Error Fallback
 */
export const RateLimitErrorFallback: React.FC<BaseFallbackProps & { retryAfter?: number }> = ({ 
  error, 
  retryAfter,
  className 
}) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 text-yellow-600" />
      </div>
      <CardTitle>Too Many Requests</CardTitle>
      <CardDescription>
        {retryAfter 
          ? `Please wait ${Math.ceil(retryAfter)} seconds before trying again.`
          : 'Please wait a moment before trying again.'
        }
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()} 
        className="w-full"
        disabled={!!retryAfter}
      >
        {retryAfter ? `Wait ${Math.ceil(retryAfter)}s` : 'Try Again'}
      </Button>
    </CardContent>
  </Card>
);

/**
 * Generic Error Fallback for unknown errors
 */
export const GenericErrorFallback: React.FC<BaseFallbackProps> = ({ error, reset, className }) => (
  <Card className={`w-full max-w-md mx-auto ${className}`}>
    <CardHeader className="text-center">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-gray-600" />
      </div>
      <CardTitle>Something Went Wrong</CardTitle>
      <CardDescription>
        {error.message || 'An unexpected error occurred.'}
      </CardDescription>
      {process.env.NODE_ENV === 'development' && error.code && (
        <Badge variant="secondary" className="mt-2">
          {error.code}
        </Badge>
      )}
    </CardHeader>
    <CardContent className="space-y-3">
      {reset && (
        <Button onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
        Refresh Page
      </Button>
      <Link href="/" className="w-full">
        <Button variant="ghost" className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </Link>
    </CardContent>
  </Card>
);

/**
 * Component that renders the appropriate fallback based on error type
 */
export const ErrorFallback: React.FC<BaseFallbackProps & { 
  onSignIn?: () => void;
  onRetry?: () => void;
  retryAfter?: number;
}> = ({ error, ...props }) => {
  const errorType = error.type || 'unknown';

  switch (errorType) {
    case 'network':
      return <NetworkErrorFallback error={error} {...props} />;
    
    case 'authentication':
      return <AuthErrorFallback error={error} onSignIn={props.onSignIn} {...props} />;
    
    case 'authorization':
      return <AuthorizationErrorFallback error={error} {...props} />;
    
    case 'file_upload':
      return <FileUploadErrorFallback error={error} onRetry={props.onRetry} {...props} />;
    
    default:
      // Handle by error code for more specific cases
      switch (error.code) {
        case 'NOT_FOUND':
        case 'RESOURCE_NOT_FOUND':
          return <NotFoundErrorFallback error={error} {...props} />;
        
        case 'RATE_LIMIT_EXCEEDED':
        case 'TOO_MANY_REQUESTS':
          return <RateLimitErrorFallback error={error} retryAfter={props.retryAfter} {...props} />;
        
        case 'INTERNAL_SERVER_ERROR':
        case 'SERVICE_UNAVAILABLE':
          return <ServerErrorFallback error={error} {...props} />;
        
        default:
          return <GenericErrorFallback error={error} {...props} />;
      }
  }
};
