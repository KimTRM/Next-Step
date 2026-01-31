/**
 * Retry Logic with Exponential Backoff
 */

import { NextStepError, isRetryable } from './errors';
import { logError, logPerformance } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  shouldRetry: () => true,
  onRetry: () => {},
  retryCondition: isRetryable,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  let delay = options.baseDelay * Math.pow(options.backoffFactor, attempt - 1);
  delay = Math.min(delay, options.maxDelay);

  if (options.jitter) {
    // Add random jitter to prevent thundering herd
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...defaultOptions, ...options };
  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const data = await fn();
      const duration = Date.now() - startTime;
      
      logPerformance('retry-success', duration, 'ms');
      
      return {
        success: true,
        data,
        attempts: attempt,
        totalDuration: duration,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry this error
      if (!opts.retryCondition(lastError)) {
        break;
      }

      // Check custom should retry condition
      if (!opts.shouldRetry(lastError, attempt)) {
        break;
      }

      // Don't retry on the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Log retry attempt
      logError(lastError, {
        component: 'retry',
        action: `attempt-${attempt}`,
        additionalData: {
          maxAttempts: opts.maxAttempts,
          nextDelay: calculateDelay(attempt + 1, opts),
        },
      });

      // Call retry callback
      opts.onRetry(attempt, lastError);

      // Wait before retrying
      const delay = calculateDelay(attempt, opts);
      await sleep(delay);
    }
  }

  const duration = Date.now() - startTime;
  
  return {
    success: false,
    error: lastError,
    attempts: opts.maxAttempts,
    totalDuration: duration,
  };
}

/**
 * Retry with automatic toast notifications
 */
export async function retryWithToast<T>(
  fn: () => Promise<T>,
  options: RetryOptions & {
    operation?: string;
    showToast?: boolean;
  } = {}
): Promise<T> {
  const { operation = 'operation', showToast = true, ...retryOptions } = options;
  
  if (showToast) {
    const { showLoading, showError, showSuccess } = await import('./toast');
    const toastId = showLoading(`${operation} in progress...`);
    
    try {
      const result = await retry(fn, retryOptions);
      
      if (result.success && result.data !== undefined) {
        showSuccess(`${operation} completed successfully`);
        return result.data;
      } else {
        showError(`${operation} failed`, result.error);
        throw result.error || new Error('Operation failed');
      }
    } catch (error) {
      if (showToast) {
        const { showError } = await import('./toast');
        showError(`${operation} failed`, error instanceof Error ? error : undefined);
      }
      throw error;
    }
  } else {
    const result = await retry(fn, retryOptions);
    
    if (result.success && result.data !== undefined) {
      return result.data;
    } else {
      throw result.error || new Error('Operation failed');
    }
  }
}

/**
 * Create a retryable function wrapper
 */
export function createRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithToast(() => fn(...args), options);
  }) as T;
}

/**
 * Network-specific retry configuration
 */
export const networkRetryOptions: RetryOptions = {
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch') ||
      // HTTP status codes that should be retried
      (error as any).status === 408 || // Request Timeout
      (error as any).status === 429 || // Too Many Requests
      (error as any).status >= 500 // Server errors
    );
  },
};

/**
 * Convex-specific retry configuration
 */
export const convexRetryOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  jitter: true,
  retryCondition: (error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('convex') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('network')
    );
  },
};

/**
 * Debounced retry for user actions
 */
export function debouncedRetry<T>(
  fn: () => Promise<T>,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await retry(fn, { maxAttempts: 1 });
        if (result.success && result.data !== undefined) {
          resolve(result.data);
        } else {
          reject(result.error || new Error('Operation failed'));
        }
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private options: {
      failureThreshold?: number;
      recoveryTime?: number;
      monitoringPeriod?: number;
    } = {}
  ) {
    this.options = {
      failureThreshold: 5,
      recoveryTime: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      ...options,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTime!) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold!) {
      this.state = 'open';
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}
