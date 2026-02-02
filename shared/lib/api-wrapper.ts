/**
 * API Error Handling Wrapper
 */

import { NextStepError, createNetworkError, createServerError, createAuthError, createForbiddenError, createNotFoundError, createValidationError } from './errors';
import { logError, logApiCall } from './logger';
import { retryWithToast, networkRetryOptions } from './retry';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: NextStepError;
  status?: number;
  headers?: Record<string, string>;
}

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  showToasts?: boolean;
  operation?: string;
  fallbackData?: any;
}

/**
 * Enhanced fetch with error handling and retry logic
 */
export async function safeApiCall<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 10000,
    retries = networkRetryOptions.maxAttempts,
    showToasts = true,
    operation = 'API call',
    fallbackData,
  } = options;

  const startTime = Date.now();

  try {
    const response = await retryWithToast(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      {
        ...networkRetryOptions,
        maxAttempts: retries,
        operation,
        showToast: showToasts,
      }
    );

    const duration = Date.now() - startTime;
    logApiCall(url, method, response.status, duration);

    // Handle successful responses
    if (response.ok) {
      try {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };
      } catch (parseError) {
        // If response is ok but JSON parsing fails, return empty data
        return {
          success: true,
          data: null as T,
          status: response.status,
        };
      }
    }

    // Handle error responses
    const errorData = await parseErrorResponse(response);
    const nextStepError = handleApiError(response, errorData, operation);

    logError(nextStepError, {
      component: 'api-wrapper',
      action: 'api-call',
      additionalData: {
        url,
        method,
        status: response.status,
        errorData,
        duration,
      },
    });

    // Return fallback data for queries if provided
    if (method === 'GET' && fallbackData !== undefined) {
      return {
        success: false,
        data: fallbackData,
        error: nextStepError,
        status: response.status,
      };
    }

    return {
      success: false,
      error: nextStepError,
      status: response.status,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const nextStepError = handleNetworkError(error, operation);

    logError(nextStepError, {
      component: 'api-wrapper',
      action: 'network-error',
      additionalData: {
        url,
        method,
        duration,
      },
    });

    // Return fallback data for queries if provided
    if (method === 'GET' && fallbackData !== undefined) {
      return {
        success: false,
        data: fallbackData,
        error: nextStepError,
      };
    }

    return {
      success: false,
      error: nextStepError,
    };
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<any> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Handle HTTP status codes and convert to NextStepError
 */
function handleApiError(
  response: Response,
  errorData: any,
  operation: string
): NextStepError {
  const status = response.status;
  const message = errorData?.message || errorData?.error || response.statusText;

  switch (status) {
    case 400:
      return createValidationError(errorData, {
        component: 'api',
        action: operation,
      });

    case 401:
      return createAuthError(message || 'Authentication required', {
        component: 'api',
        action: operation,
      });

    case 403:
      return createForbiddenError({
        component: 'api',
        action: operation,
      });

    case 404:
      return createNotFoundError('Resource', {
        component: 'api',
        action: operation,
      });

    case 408:
    case 429:
      return createNetworkError(message || 'Request timeout or rate limited', {
        component: 'api',
        action: operation,
      });

    case 500:
    case 502:
    case 503:
    case 504:
      return createServerError(errorData, {
        component: 'api',
        action: operation,
      });

    default:
      return createServerError(
        { status, message, errorData },
        {
          component: 'api',
          action: operation,
        }
      );
  }
}

/**
 * Handle network/connection errors
 */
function handleNetworkError(error: any, operation: string): NextStepError {
  if (error.name === 'AbortError') {
    return createNetworkError('Request timed out', {
      component: 'api',
      action: operation,
    });
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createNetworkError('Network connection failed', {
      component: 'api',
      action: operation,
    });
  }

  return createNetworkError(error.message || 'Network error', {
    component: 'api',
    action: operation,
  });
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    safeApiCall<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    safeApiCall<T>(url, { ...options, method: 'POST', body }),

  put: <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    safeApiCall<T>(url, { ...options, method: 'PUT', body }),

  patch: <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    safeApiCall<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T>(url: string, options?: Omit<ApiOptions, 'method'>) =>
    safeApiCall<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * React hook for API calls with loading states
 */
export function useApi() {
  const get = <T>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return api.get<T>(url, options);
  };

  const post = <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return api.post<T>(url, body, options);
  };

  const put = <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return api.put<T>(url, body, options);
  };

  const patch = <T>(url: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) => {
    return api.patch<T>(url, body, options);
  };

  const del = <T>(url: string, options?: Omit<ApiOptions, 'method'>) => {
    return api.delete<T>(url, options);
  };

  return { get, post, put, patch, delete: del };
}

/**
 * Batch multiple API calls
 */
export async function batchApiCalls<T>(
  calls: Array<{
    url: string;
    options?: ApiOptions;
    key?: string;
  }>,
  options?: {
    showToasts?: boolean;
    stopOnFirstError?: boolean;
  }
): Promise<{
  success: boolean;
  results: Record<string, ApiResponse<T>>;
  errors: NextStepError[];
}> {
  const { showToasts = true, stopOnFirstError = true } = options || {};
  const results: Record<string, ApiResponse<T>> = {};
  const errors: NextStepError[] = [];

  for (const call of calls) {
    const key = call.key || call.url;
    
    try {
      const result = await safeApiCall<T>(call.url, {
        ...call.options,
        showToasts,
      });
      
      results[key] = result;
      
      if (!result.success) {
        errors.push(result.error!);
        
        if (stopOnFirstError) {
          break;
        }
      }
    } catch (error) {
      const nextStepError = createNetworkError(
        error instanceof Error ? error.message : 'Unknown error',
        {
          component: 'api-wrapper',
          action: 'batch-call',
        }
      );
      
      results[key] = {
        success: false,
        error: nextStepError,
      };
      
      errors.push(nextStepError);
      
      if (stopOnFirstError) {
        break;
      }
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
  };
}
