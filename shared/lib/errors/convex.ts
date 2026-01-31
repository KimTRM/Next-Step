/**
 * Error handling utilities for Convex operations
 */

import type { AppError } from './types';
import { 
  createDatabaseError, 
  createAuthenticationError, 
  createAuthorizationError, 
  createValidationError,
  normalizeError,
  isRetryableError,
  retryOperation
} from './utils';
import { logError } from './logger';

/**
 * Standardized error response for Convex operations
 */
export interface ConvexResult<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  retryable?: boolean;
}

/**
 * Wraps a Convex mutation with comprehensive error handling
 */
export async function handleConvexMutation<T>(
  mutationName: string,
  mutationFn: () => Promise<T>,
  context?: {
    userId?: string;
    operation?: string;
    additionalData?: Record<string, any>;
  }
): Promise<ConvexResult<T>> {
  try {
    const data = await mutationFn();
    return {
      success: true,
      data,
    };
  } catch (error) {
    const appError = normalizeError(error);
    
    // Add context to the error
    appError.context = {
      ...appError.context,
      convexOperation: mutationName,
      operationType: 'mutation',
      ...context?.additionalData,
    };

    // Log the error
    logError(appError, {
      component: 'ConvexMutation',
      operation: mutationName,
      userId: context?.userId,
    });

    return {
      success: false,
      error: appError,
      retryable: isRetryableError(appError),
    };
  }
}

/**
 * Wraps a Convex query with comprehensive error handling
 */
export async function handleConvexQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  context?: {
    userId?: string;
    operation?: string;
    additionalData?: Record<string, any>;
  }
): Promise<ConvexResult<T>> {
  try {
    const data = await queryFn();
    return {
      success: true,
      data,
    };
  } catch (error) {
    const appError = normalizeError(error);
    
    // Add context to the error
    appError.context = {
      ...appError.context,
      convexOperation: queryName,
      operationType: 'query',
      ...context?.additionalData,
    };

    // Log the error
    logError(appError, {
      component: 'ConvexQuery',
      operation: queryName,
      userId: context?.userId,
    });

    return {
      success: false,
      error: appError,
      retryable: isRetryableError(appError),
    };
  }
}

/**
 * Wraps a Convex mutation with retry logic
 */
export async function handleConvexMutationWithRetry<T>(
  mutationName: string,
  mutationFn: () => Promise<T>,
  options?: {
    maxAttempts?: number;
    delay?: number;
    context?: {
      userId?: string;
      operation?: string;
      additionalData?: Record<string, any>;
    };
  }
): Promise<ConvexResult<T>> {
  try {
    const data = await retryOperation(mutationFn, {
      maxAttempts: options?.maxAttempts || 3,
      delay: options?.delay || 1000,
      shouldRetry: isRetryableError,
      onRetry: (attempt, error) => {
        logError(error, {
          component: 'ConvexMutationRetry',
          operation: mutationName,
          attempt,
          userId: options?.context?.userId,
        });
      },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    const appError = normalizeError(error);
    
    appError.context = {
      ...appError.context,
      convexOperation: mutationName,
      operationType: 'mutation_with_retry',
      ...options?.context?.additionalData,
    };

    logError(appError, {
      component: 'ConvexMutationRetry',
      operation: mutationName,
      finalAttempt: true,
      userId: options?.context?.userId,
    });

    return {
      success: false,
      error: appError,
      retryable: false, // Already retried
    };
  }
}

/**
 * Creates a standardized authentication error for Convex
 */
export function createConvexAuthError(message: string = 'Authentication required'): AppError {
  return createAuthenticationError(false, 'clerk', new Error(message));
}

/**
 * Creates a standardized authorization error for Convex
 */
export function createConvexAuthzError(
  resource: string,
  action: string,
  requiredRole?: string
): AppError {
  return createAuthorizationError(resource, action, requiredRole);
}

/**
 * Creates a standardized validation error for Convex
 */
export function createConvexValidationError(
  field: string,
  message: string,
  value?: any
): AppError {
  return createValidationError(field, message, value);
}

/**
 * Error handler specifically for Convex authentication failures
 */
export function handleConvexAuthError(identity: any): AppError | null {
  if (!identity) {
    return createConvexAuthError('User must be authenticated to perform this action');
  }
  return null;
}

/**
 * Error handler specifically for Convex authorization failures
 */
export function handleConvexAuthzError(
  resourceOwner: string,
  currentUserId: string,
  resource: string,
  action: string
): AppError | null {
  if (resourceOwner !== currentUserId) {
    return createConvexAuthzError(resource, action);
  }
  return null;
}

/**
 * Validates common Convex input patterns
 */
export function validateConvexInput(
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  }>
): AppError | null {
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      return createConvexValidationError(field, `${field} is required`);
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return createConvexValidationError(
          field, 
          `${field} must be at least ${rule.minLength} characters`,
          value
        );
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return createConvexValidationError(
          field,
          `${field} cannot exceed ${rule.maxLength} characters`,
          value
        );
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return createConvexValidationError(
          field,
          `${field} format is invalid`,
          value
        );
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return createConvexValidationError(field, customError, value);
      }
    }
  }

  return null;
}

/**
 * Higher-order function to wrap Convex mutation functions
 */
export function withConvexMutationErrorHandling<T extends any[], R>(
  mutationName: string,
  mutationFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ConvexResult<R>> => {
    return handleConvexMutation(mutationName, () => mutationFn(...args));
  };
}

/**
 * Higher-order function to wrap Convex query functions
 */
export function withConvexQueryErrorHandling<T extends any[], R>(
  queryName: string,
  queryFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ConvexResult<R>> => {
    return handleConvexQuery(queryName, () => queryFn(...args));
  };
}

/**
 * React hook for handling Convex operations with error handling
 */
export function useConvexOperation() {
  const executeMutation = async <T>(
    mutationName: string,
    mutationFn: () => Promise<T>,
    context?: {
      userId?: string;
      operation?: string;
      additionalData?: Record<string, any>;
    }
  ): Promise<ConvexResult<T>> => {
    return handleConvexMutation(mutationName, mutationFn, context);
  };

  const executeQuery = async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
    context?: {
      userId?: string;
      operation?: string;
      additionalData?: Record<string, any>;
    }
  ): Promise<ConvexResult<T>> => {
    return handleConvexQuery(queryName, queryFn, context);
  };

  const executeMutationWithRetry = async <T>(
    mutationName: string,
    mutationFn: () => Promise<T>,
    options?: {
      maxAttempts?: number;
      delay?: number;
      context?: {
        userId?: string;
        operation?: string;
        additionalData?: Record<string, any>;
      };
    }
  ): Promise<ConvexResult<T>> => {
    return handleConvexMutationWithRetry(mutationName, mutationFn, options);
  };

  return {
    executeMutation,
    executeQuery,
    executeMutationWithRetry,
  };
}
