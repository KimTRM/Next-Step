/**
 * Error utilities and factory functions
 */

import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS_TO_ERROR_CODE, RETRY_DELAYS } from './constants';
import { ERROR_SEVERITY } from './constants';
import type { 
  AppError, 
  NetworkError, 
  ValidationError, 
  DatabaseError, 
  AuthenticationError, 
  AuthorizationError, 
  FileUploadError,
  ErrorContext,
  RetryOptions
} from './types';

/**
 * Creates a standardized error object
 */
export function createError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  context?: ErrorContext,
  originalError?: Error | unknown
): AppError {
  const errorInfo = ERROR_MESSAGES[code];
  const timestamp = Date.now();

  return {
    code,
    message: message || errorInfo.message,
    title: errorInfo.title,
    severity: 'medium' as keyof typeof ERROR_SEVERITY,
    timestamp,
    context,
    stack: originalError instanceof Error ? originalError.stack : undefined,
    originalError,
  };
}

/**
 * Creates a network error
 */
export function createNetworkError(
  status: number,
  url?: string,
  method?: string,
  originalError?: Error | unknown
): NetworkError {
  const code = HTTP_STATUS_TO_ERROR_CODE[status] || ERROR_CODES.NETWORK_ERROR;
  const baseError = createError(code, undefined, { additionalData: { url, method } }, originalError);

  return {
    ...baseError,
    type: 'network',
    status,
    url,
    method,
    retryable: isRetryableStatus(status),
  };
}

/**
 * Creates a validation error
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any,
  constraints?: Record<string, string>
): ValidationError {
  const baseError = createError(ERROR_CODES.VALIDATION_ERROR);

  return {
    ...baseError,
    type: 'validation',
    field,
    value,
    constraints,
  };
}

/**
 * Creates a database error
 */
export function createDatabaseError(
  operation: 'query' | 'mutation' | 'subscription',
  originalError?: Error | unknown,
  context?: ErrorContext
): DatabaseError {
  const baseError = createError(ERROR_CODES.DATABASE_ERROR, undefined, context, originalError);

  return {
    ...baseError,
    type: 'database',
    operation,
  };
}

/**
 * Creates an authentication error
 */
export function createAuthenticationError(
  requiresReauth: boolean = false,
  provider?: 'clerk' | 'custom',
  originalError?: Error | unknown
): AuthenticationError {
  const code = requiresReauth ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.UNAUTHORIZED;
  const baseError = createError(code, undefined, { additionalData: { provider } }, originalError);

  return {
    ...baseError,
    type: 'authentication',
    provider,
    requiresReauth,
  };
}

/**
 * Creates an authorization error
 */
export function createAuthorizationError(
  resource?: string,
  action?: string,
  requiredRole?: string
): AuthorizationError {
  const baseError = createError(ERROR_CODES.FORBIDDEN);

  return {
    ...baseError,
    type: 'authorization',
    resource,
    action,
    requiredRole,
  };
}

/**
 * Creates a file upload error
 */
export function createFileUploadError(
  fileName: string,
  reason: 'size' | 'type' | 'upload',
  details?: {
    fileSize?: number;
    fileType?: string;
    maxFileSize?: number;
    allowedTypes?: string[];
  }
): FileUploadError {
  let code: keyof typeof ERROR_CODES;
  
  switch (reason) {
    case 'size':
      code = ERROR_CODES.FILE_TOO_LARGE;
      break;
    case 'type':
      code = ERROR_CODES.INVALID_FILE_TYPE;
      break;
    case 'upload':
    default:
      code = ERROR_CODES.UPLOAD_FAILED;
      break;
  }

  const baseError = createError(code);

  return {
    ...baseError,
    type: 'file_upload',
    fileName,
    ...(details || {}),
  };
}

/**
 * Checks if a status code is retryable
 */
function isRetryableStatus(status: number): boolean {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  if (error.type === 'network') {
    return (error as NetworkError).retryable;
  }
  
  return [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.CONNECTION_FAILED,
    ERROR_CODES.DATABASE_ERROR,
    ERROR_CODES.CONVEX_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE,
  ].includes(error.code);
}

/**
 * Implements retry logic with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    shouldRetry = isRetryableError,
    onRetry,
  } = options;

  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const appError = normalizeError(error);
      lastError = appError;

      if (attempt === maxAttempts || !shouldRetry(appError)) {
        throw appError;
      }

      const retryDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      
      onRetry?.(attempt, appError);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError!;
}

/**
 * Normalizes any error to AppError format
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return createNetworkError(0, undefined, undefined, error);
    }
    
    if (message.includes('clerk') || message.includes('authentication')) {
      return createAuthenticationError(false, 'clerk', error);
    }
    
    if (message.includes('convex')) {
      return createDatabaseError('query', error);
    }

    return createError(ERROR_CODES.UNKNOWN_ERROR, error.message, undefined, error);
  }

  if (typeof error === 'string') {
    return createError(ERROR_CODES.UNKNOWN_ERROR, error);
  }

  return createError(ERROR_CODES.UNEXPECTED_ERROR);
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

/**
 * Extracts error information for logging
 */
export function extractErrorInfo(error: AppError): Record<string, any> {
  return {
    code: error.code,
    message: error.message,
    title: error.title,
    severity: error.severity,
    timestamp: error.timestamp,
    type: error.type || 'unknown',
    context: error.context,
    stack: error.stack,
    // Don't include originalError in logs as it might contain sensitive data
  };
}

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(error: AppError): { title: string; message: string; action: string } {
  const errorInfo = ERROR_MESSAGES[error.code];
  
  return {
    title: error.title || errorInfo.title,
    message: error.message || errorInfo.message,
    action: errorInfo.action,
  };
}

/**
 * Debounces error reporting to avoid spam
 */
export function debounceErrorReporting(
  reportFn: (error: AppError) => void,
  delay: number = 1000
): (error: AppError) => void {
  const recentErrors = new Map<string, number>();

  return (error: AppError) => {
    const key = `${error.code}-${error.message}`;
    const now = Date.now();
    const lastReported = recentErrors.get(key);

    if (lastReported && now - lastReported < delay) {
      return; // Skip reporting to avoid spam
    }

    recentErrors.set(key, now);
    reportFn(error);

    // Clean up old entries
    setTimeout(() => {
      recentErrors.delete(key);
    }, delay * 2);
  };
}

/**
 * Creates a unique error ID for tracking
 */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if error is critical (should be reported immediately)
 */
export function isCriticalError(error: AppError): boolean {
  return error.severity === 'CRITICAL' || 
         error.code === ERROR_CODES.INTERNAL_SERVER_ERROR ||
         error.code === ERROR_CODES.DATABASE_ERROR;
}
