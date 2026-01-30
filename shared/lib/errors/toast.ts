/**
 * Toast notification system for errors
 */

import { toast } from 'sonner';
import type { AppError, ErrorToastOptions } from './types';
import { getErrorMessage, isRetryableError } from './utils';

/**
 * Shows an error toast with user-friendly message
 */
export function showErrorToast(
  error: AppError,
  options?: ErrorToastOptions
): string | number {
  const { title, message, action } = getErrorMessage(error);
  
  return toast.error(title, {
    description: message,
    duration: options?.duration || 5000,
    action: options?.action || {
      label: action,
      onClick: () => {
        // Default action based on error type
        if (isRetryableError(error)) {
          window.location.reload();
        }
      },
    },
    dismissible: options?.dismissible !== false,
    position: options?.position || 'bottom-right',
  });
}

/**
 * Shows a success toast
 */
export function showSuccessToast(
  title: string,
  description?: string,
  options?: { duration?: number }
): string | number {
  return toast.success(title, {
    description,
    duration: options?.duration || 3000,
  });
}

/**
 * Shows an info toast
 */
export function showInfoToast(
  title: string,
  description?: string,
  options?: { duration?: number }
): string | number {
  return toast.info(title, {
    description,
    duration: options?.duration || 4000,
  });
}

/**
 * Shows a warning toast
 */
export function showWarningToast(
  title: string,
  description?: string,
  options?: { duration?: number }
): string | number {
  return toast.warning(title, {
    description,
    duration: options?.duration || 4000,
  });
}

/**
 * Shows a loading toast that can be updated later
 */
export function showLoadingToast(
  title: string,
  description?: string
): string | number {
  return toast.loading(title, {
    description,
  });
}

/**
 * Updates an existing toast (useful for loading states)
 */
export function updateToast(
  toastId: string | number,
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  description?: string,
  options?: { duration?: number }
): void {
  toast[type](title, {
    id: toastId,
    description,
    duration: options?.duration || 3000,
  });
}

/**
 * Dismisses a specific toast
 */
export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId);
}

/**
 * Dismisses all toasts
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}

/**
 * Shows a retry toast for retryable errors
 */
export function showRetryToast(
  error: AppError,
  onRetry: () => void | Promise<void>,
  options?: ErrorToastOptions
): string | number {
  const { title, message } = getErrorMessage(error);
  
  return toast.error(title, {
    description: message,
    duration: options?.duration || 10000, // Longer duration for retry toasts
    action: {
      label: 'Retry',
      onClick: async () => {
        try {
          await onRetry();
          showSuccessToast('Success', 'The operation completed successfully.');
        } catch (retryError) {
          // Error will be handled by the caller
          console.error('Retry failed:', retryError);
        }
      },
    },
    dismissible: options?.dismissible !== false,
    position: options?.position || 'bottom-right',
  });
}

/**
 * Shows an authentication error toast with sign-in action
 */
export function showAuthErrorToast(
  error: AppError,
  onSignIn?: () => void
): string | number {
  const { title, message } = getErrorMessage(error);
  
  return toast.error(title, {
    description: message,
    duration: 8000,
    action: onSignIn ? {
      label: 'Sign In',
      onClick: onSignIn,
    } : {
      label: 'Reload',
      onClick: () => window.location.reload(),
    },
    position: 'top-center',
  });
}

/**
 * Shows a network error toast with retry option
 */
export function showNetworkErrorToast(
  error: AppError,
  onRetry?: () => void | Promise<void>
): string | number {
  const { title, message } = getErrorMessage(error);
  
  return toast.error(title, {
    description: message,
    duration: 10000,
    action: onRetry ? {
      label: 'Retry',
      onClick: async () => {
        try {
          await onRetry();
          showSuccessToast('Connection Restored', 'Successfully reconnected to the server.');
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      },
    } : {
      label: 'Reload',
      onClick: () => window.location.reload(),
    },
    position: 'bottom-right',
  });
}

/**
 * Shows a validation error toast for form submissions
 */
export function showValidationErrorToast(
  errors: string[] | string,
  options?: { duration?: number }
): string | number {
  const errorMessages = Array.isArray(errors) ? errors : [errors];
  const description = errorMessages.length > 1 
    ? `${errorMessages.length} issues need to be fixed.`
    : errorMessages[0];

  return toast.error('Validation Error', {
    description,
    duration: options?.duration || 6000,
    action: errorMessages.length > 1 ? {
      label: 'View Details',
      onClick: () => {
        // You could show a modal with all validation errors here
        console.log('Validation errors:', errorMessages);
      },
    } : undefined,
  });
}

/**
 * Shows a file upload error toast
 */
export function showFileUploadErrorToast(
  error: AppError,
  onRetry?: () => void
): string | number {
  const { title, message } = getErrorMessage(error);
  
  return toast.error(title, {
    description: message,
    duration: 6000,
    action: onRetry ? {
      label: 'Try Again',
      onClick: onRetry,
    } : undefined,
  });
}

/**
 * Shows a rate limit error toast with countdown
 */
export function showRateLimitToast(
  error: AppError,
  retryAfter?: number
): string | number {
  const { title, message } = getErrorMessage(error);
  const duration = retryAfter ? retryAfter * 1000 : 30000;
  
  return toast.error(title, {
    description: retryAfter 
      ? `Please wait ${Math.ceil(retryAfter)} seconds before trying again.`
      : message,
    duration,
    position: 'top-center',
  });
}

/**
 * Promise-based toast that shows loading, success, or error states
 */
export function promiseToast<T>(
  promise: Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  const toastId = showLoadingToast(loadingMessage);
  
  return promise
    .then((result) => {
      updateToast(toastId, 'success', successMessage);
      return result;
    })
    .catch((error) => {
      updateToast(toastId, 'error', errorMessage);
      throw error;
    });
}
