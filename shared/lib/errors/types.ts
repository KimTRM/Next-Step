/**
 * Error types and interfaces for comprehensive error handling
 */

import { ERROR_CODES, ERROR_SEVERITY } from './constants';

export interface BaseError {
  code: keyof typeof ERROR_CODES;
  message: string;
  title?: string;
  severity?: keyof typeof ERROR_SEVERITY;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
  originalError?: Error | unknown;
  type?: string;
}

export interface NetworkError extends BaseError {
  type: 'network';
  status?: number;
  url?: string;
  method?: string;
  retryable: boolean;
}

export interface ValidationError extends BaseError {
  type: 'validation';
  field?: string;
  value?: any;
  constraints?: Record<string, string>;
}

export interface DatabaseError extends BaseError {
  type: 'database';
  operation?: 'query' | 'mutation' | 'subscription';
  table?: string;
  query?: string;
}

export interface AuthenticationError extends BaseError {
  type: 'authentication';
  provider?: 'clerk' | 'custom';
  requiresReauth?: boolean;
}

export interface AuthorizationError extends BaseError {
  type: 'authorization';
  resource?: string;
  action?: string;
  requiredRole?: string;
}

export interface FileUploadError extends BaseError {
  type: 'file_upload';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export type AppError = 
  | NetworkError
  | ValidationError
  | DatabaseError
  | AuthenticationError
  | AuthorizationError
  | FileUploadError
  | BaseError;

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export interface ErrorToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  shouldRetry?: (error: AppError) => boolean;
  onRetry?: (attempt: number, error: AppError) => void;
}

export interface ErrorLogEntry {
  id: string;
  error: AppError;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  resolved: boolean;
}

export interface ErrorReportingService {
  report: (error: AppError, context?: Record<string, any>) => Promise<void>;
  setUser: (user: { id: string; email?: string; name?: string }) => void;
  clearUser: () => void;
  addBreadcrumb: (message: string, category?: string, level?: string) => void;
}

export interface FallbackComponentProps {
  error: AppError;
  reset: () => void;
  retryCount: number;
}

export type ErrorFallbackComponent = React.ComponentType<FallbackComponentProps>;

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ErrorFallbackComponent;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  isolate?: boolean;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  lastUpdated: number | null;
}

export interface AsyncOperation<T = any> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  retry: () => Promise<T>;
  cancel: () => void;
}

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: FormFieldError[];
  touched: Record<string, boolean>;
}

export interface ErrorContext {
  componentName?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  additionalData?: Record<string, any>;
}
