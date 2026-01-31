/**
 * API error handling utilities
 */

import type { AppError } from './types';
import { 
  createNetworkError, 
  createAuthenticationError, 
  createAuthorizationError, 
  createValidationError,
  normalizeError,
  isRetryableError,
  retryOperation
} from './utils';
import { logError } from './logger';

/**
 * Standardized API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
  meta?: {
    requestId?: string;
    timestamp: number;
    duration?: number;
  };
}

/**
 * API request configuration
 */
export interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Enhanced fetch with comprehensive error handling
 */
export async function apiRequest<T = any>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  const {
    timeout = 30000,
    retries = 0,
    retryDelay = 1000,
    skipAuth = false,
    metadata = {},
    ...fetchConfig
  } = config;

  try {
    // Execute request with retry logic
    const response = await retryOperation(
      () => executeRequest<T>(url, { ...fetchConfig, timeout }),
      {
        maxAttempts: retries + 1,
        delay: retryDelay,
        shouldRetry: (error) => isRetryableError(error) && retries > 0,
        onRetry: (attempt, error) => {
          logError(error, {
            component: 'ApiRequest',
            operation: 'retry',
            attempt,
            url,
            requestId,
          });
        },
      }
    );

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: response,
      meta: {
        requestId,
        timestamp: Date.now(),
        duration,
      },
    };
  } catch (error) {
    const appError = normalizeError(error);
    const duration = Date.now() - startTime;

    // Add context to the error
    appError.context = {
      ...appError.context,
      url,
      method: fetchConfig.method || 'GET',
      requestId,
      duration,
      ...metadata,
    };

    // Log the error
    logError(appError, {
      component: 'ApiRequest',
      operation: fetchConfig.method || 'GET',
      url,
      requestId,
      duration,
    });

    return {
      success: false,
      error: appError,
      meta: {
        requestId,
        timestamp: Date.now(),
        duration,
      },
    };
  }
}

/**
 * Execute the actual HTTP request
 */
async function executeRequest<T>(
  url: string,
  config: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = 30000, ...fetchConfig } = config;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchConfig.headers,
      },
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      throw createNetworkError(
        response.status,
        url,
        fetchConfig.method || 'GET',
        await getErrorMessage(response)
      );
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return (await response.text()) as unknown as T;
    }
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw createNetworkError(408, url, fetchConfig.method, error);
      }
      
      if (error.message.includes('fetch')) {
        throw createNetworkError(0, url, fetchConfig.method, error);
      }
    }

    throw error;
  }
}

/**
 * Get error message from HTTP response
 */
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return data.message || data.error || response.statusText;
    }
    return response.statusText;
  } catch {
    return response.statusText;
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * HTTP method helpers
 */
export const api = {
  get: <T = any>(url: string, config?: ApiRequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'GET' }),

  post: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(url: string, data?: any, config?: ApiRequestConfig) =>
    apiRequest<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, config?: ApiRequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'DELETE' }),
};

/**
 * File upload with error handling
 */
export async function uploadFile(
  url: string,
  file: File,
  config?: ApiRequestConfig & {
    onProgress?: (progress: number) => void;
    fieldName?: string;
    additionalData?: Record<string, any>;
  }
): Promise<ApiResponse<{ url: string }>> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  const {
    timeout = 60000, // Longer timeout for uploads
    onProgress,
    fieldName = 'file',
    additionalData = {},
    metadata = {},
    ...fetchConfig
  } = config || {};

  try {
    // Validate file
    if (!file) {
      throw createValidationError('file', 'No file provided');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw createValidationError('file', `File size exceeds ${maxSize / 1024 / 1024}MB limit`, {
        fileName: file.name,
        fileSize: file.size,
        maxSize,
      });
    }

    // Create form data
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        xhr.abort();
        reject(createNetworkError(408, url, 'POST', new Error('Upload timeout')));
      }, timeout);

      // Track progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        clearTimeout(timeoutId);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              data,
              meta: {
                requestId,
                timestamp: Date.now(),
                duration: Date.now() - startTime,
              },
            });
          } catch (error) {
            reject(createValidationError('response', 'Invalid JSON response', xhr.responseText));
          }
        } else {
          reject(createNetworkError(xhr.status, url, 'POST', xhr.responseText));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        clearTimeout(timeoutId);
        reject(createNetworkError(0, url, 'POST', new Error('Network error during upload')));
      });

      xhr.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(createNetworkError(0, url, 'POST', new Error('Upload was aborted')));
      });

      // Send request
      xhr.open('POST', url);
      
      // Add headers
      if (fetchConfig.headers) {
        Object.entries(fetchConfig.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, String(value));
        });
      }

      xhr.send(formData);
    });
  } catch (error) {
    const appError = normalizeError(error);
    const duration = Date.now() - startTime;

    appError.context = {
      ...appError.context,
      url,
      method: 'POST',
      requestId,
      duration,
      fileName: file.name,
      fileSize: file.size,
      ...metadata,
    };

    logError(appError, {
      component: 'FileUpload',
      operation: 'upload',
      url,
      requestId,
      duration,
      fileName: file.name,
    });

    return {
      success: false,
      error: appError,
      meta: {
        requestId,
        timestamp: Date.now(),
        duration,
      },
    };
  }
}

/**
 * React hook for API operations
 */
export function useApi() {
  const request = async <T>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> => {
    return apiRequest<T>(url, config);
  };

  const get = <T>(url: string, config?: ApiRequestConfig) =>
    api.get<T>(url, config);

  const post = <T>(url: string, data?: any, config?: ApiRequestConfig) =>
    api.post<T>(url, data, config);

  const put = <T>(url: string, data?: any, config?: ApiRequestConfig) =>
    api.put<T>(url, data, config);

  const patch = <T>(url: string, data?: any, config?: ApiRequestConfig) =>
    api.patch<T>(url, data, config);

  const del = <T>(url: string, config?: ApiRequestConfig) =>
    api.delete<T>(url, config);

  const upload = (
    url: string,
    file: File,
    config?: ApiRequestConfig & {
      onProgress?: (progress: number) => void;
      fieldName?: string;
      additionalData?: Record<string, any>;
    }
  ) => uploadFile(url, file, config);

  return {
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
  };
}
