/**
 * Convex Error Handling Wrapper
 */

import { NextStepError, createConvexError, createValidationError, createNotFoundError, createAuthError, createForbiddenError } from './errors';
import { logError, logApiCall } from './logger';
import { retryWithToast, convexRetryOptions } from './retry';

export interface ConvexResult<T> {
  success: boolean;
  data?: T;
  error?: NextStepError;
  code?: string;
}

/**
 * Handle and convert Convex errors to NextStepError
 */
export function handleConvexError(error: any, operation: string): NextStepError {
  // Handle network/connection errors
  if (error.name === 'ConvexConnectionError' || 
      error.message?.includes('CONVEX_DEPLOYMENT') ||
      error.message?.includes('connection')) {
    return createConvexError(error.message || 'Connection error', {
      component: 'convex',
      action: operation,
    });
  }

  // Handle timeout errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return createConvexError(`Operation timed out: ${error.message}`, {
      component: 'convex',
      action: operation,
    });
  }

  // Handle specific error messages from Convex mutations/queries
  const message = error.message || error.data?.message || 'Unknown error';
  
  if (message.includes('authenticated')) {
    return createAuthError(message, {
      component: 'convex',
      action: operation,
    });
  }
  
  if (message.includes('authorized') || message.includes('permission')) {
    return createForbiddenError({
      component: 'convex',
      action: operation,
    });
  }
  
  if (message.includes('not found')) {
    return createNotFoundError('Resource', {
      component: 'convex',
      action: operation,
    });
  }
  
  if (message.includes('validation') || message.includes('must be')) {
    return createValidationError(error.data, {
      component: 'convex',
      action: operation,
    });
  }

  return createConvexError(message, {
    component: 'convex',
    action: operation,
  });
}

/**
 * Wrap a Convex mutation function with error handling
 */
export function withMutationErrorHandling<T extends any[], R>(
  mutationFn: (...args: T) => Promise<R>,
  operationName: string,
  options?: {
    showToasts?: boolean;
  }
) {
  return async (...args: T): Promise<ConvexResult<R>> => {
    const { showToasts = true } = options || {};
    
    try {
      logApiCall(`mutation/${operationName}`, 'POST', 200);
      
      const result = await retryWithToast(
        () => mutationFn(...args),
        {
          ...convexRetryOptions,
          operation: operationName,
          showToast: showToasts,
        }
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const nextStepError = handleConvexError(error, operationName);
      
      logError(nextStepError, {
        component: 'convex-wrapper',
        action: 'mutation',
        additionalData: {
          operation: operationName,
          args,
        },
      });

      return {
        success: false,
        error: nextStepError,
        code: nextStepError.code,
      };
    }
  };
}

/**
 * Wrap a Convex query function with error handling
 */
export function withQueryErrorHandling<T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  operationName: string,
  options?: {
    showToasts?: boolean;
    fallbackData?: R;
  }
) {
  return async (...args: T): Promise<ConvexResult<R>> => {
    const { showToasts = false, fallbackData } = options || {};
    
    try {
      logApiCall(`query/${operationName}`, 'GET', 200);
      
      const result = await retryWithToast(
        () => queryFn(...args),
        {
          ...convexRetryOptions,
          operation: operationName,
          showToast: showToasts,
          maxAttempts: 2, // Fewer retries for queries
        }
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const nextStepError = handleConvexError(error, operationName);
      
      logError(nextStepError, {
        component: 'convex-wrapper',
        action: 'query',
        additionalData: {
          operation: operationName,
          args,
        },
      });

      // For queries, we might want to return fallback data
      if (fallbackData !== undefined) {
        return {
          success: false,
          data: fallbackData,
          error: nextStepError,
          code: nextStepError.code,
        };
      }

      return {
        success: false,
        error: nextStepError,
        code: nextStepError.code,
      };
    }
  };
}

/**
 * Create a safe mutation wrapper for React hooks
 */
export function createSafeMutation<T extends any[], R>(
  mutationFn: (...args: T) => Promise<R>,
  operationName: string
) {
  const safeMutation = withMutationErrorHandling(mutationFn, operationName);
  
  return {
    execute: safeMutation,
    loading: false,
    error: null as NextStepError | null,
  };
}

/**
 * Create a safe query wrapper for React hooks
 */
export function createSafeQuery<T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  operationName: string,
  fallbackData?: R
) {
  const safeQuery = withQueryErrorHandling(queryFn, operationName, { fallbackData });
  
  return {
    execute: safeQuery,
    loading: false,
    error: null as NextStepError | null,
  };
}

/**
 * Optimistic update helper with rollback on error
 */
export async function optimisticUpdate<T>(
  updateFn: () => Promise<any>,
  rollbackFn: () => void,
  options?: {
    showToasts?: boolean;
    operation?: string;
  }
): Promise<ConvexResult<T>> {
  const { showToasts = true, operation = 'update' } = options || {};
  
  try {
    const result = await retryWithToast(updateFn, {
      ...convexRetryOptions,
      operation,
      showToast: showToasts,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // Rollback on error
    try {
      rollbackFn();
    } catch (rollbackError) {
      logError(rollbackError instanceof Error ? rollbackError : new Error('Rollback failed'), {
        component: 'convex-wrapper',
        action: 'rollback',
      });
    }

    const nextStepError = handleConvexError(error, operation);
    
    logError(nextStepError, {
      component: 'convex-wrapper',
      action: 'optimistic-update',
    });

    return {
      success: false,
      error: nextStepError,
    };
  }
}
