/**
 * Toast Notification System for NextStep Platform
 */

import { toast, Toaster } from 'sonner';
import { NextStepError } from './errors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  id?: string;
}

class ToastManager {
  private defaultDuration = 5000;
  private defaultPosition: ToastOptions['position'] = 'bottom-right';

  // Success toasts
  success(message: string, options?: ToastOptions): void {
    toast.success(message, {
      duration: options?.duration || this.defaultDuration,
      position: options?.position || this.defaultPosition,
      description: options?.description,
      action: options?.action,
      dismissible: options?.dismissible !== false,
      id: options?.id,
    });
  }

  // Error toasts
  error(message: string, error?: Error | NextStepError, options?: ToastOptions): void {
    const description = error instanceof NextStepError ? error.userMessage : error?.message;
    
    toast.error(message, {
      duration: options?.duration || (error instanceof NextStepError && error.severity === 'critical' ? 10000 : this.defaultDuration),
      position: options?.position || this.defaultPosition,
      description: description || options?.description,
      action: options?.action || this.getRetryAction(error),
      dismissible: options?.dismissible !== false,
      id: options?.id,
    });
  }

  // Warning toasts
  warning(message: string, options?: ToastOptions): void {
    toast.warning(message, {
      duration: options?.duration || this.defaultDuration,
      position: options?.position || this.defaultPosition,
      description: options?.description,
      action: options?.action,
      dismissible: options?.dismissible !== false,
      id: options?.id,
    });
  }

  // Info toasts
  info(message: string, options?: ToastOptions): void {
    toast.info(message, {
      duration: options?.duration || this.defaultDuration,
      position: options?.position || this.defaultPosition,
      description: options?.description,
      action: options?.action,
      dismissible: options?.dismissible !== false,
      id: options?.id,
    });
  }

  // Loading toast (for async operations)
  loading(message: string, options?: { id?: string }): string | number {
    return toast.loading(message, {
      id: options?.id,
      position: this.defaultPosition,
    });
  }

  // Dismiss specific toast
  dismiss(id?: string): void {
    toast.dismiss(id);
  }

  // Dismiss all toasts
  dismissAll(): void {
    toast.dismiss();
  }

  // Update existing toast
  update(id: string, options: { message: string; type?: ToastType; description?: string }): void {
    try {
      if (options.type === 'success') {
        toast.success(options.message, { id });
      } else if (options.type === 'error') {
        toast.error(options.message, { id, description: options.description });
      } else if (options.type === 'warning') {
        toast.warning(options.message, { id, description: options.description });
      } else {
        toast.info(options.message, { id, description: options.description });
      }
    } catch (error) {
      console.warn('Failed to update toast:', error);
    }
  }

  // Get retry action for retryable errors
  private getRetryAction(error?: Error | NextStepError) {
    if (error instanceof NextStepError && error.retryable) {
      return {
        label: 'Retry',
        onClick: () => {
          // This will be handled by the component that triggered the error
          window.dispatchEvent(new CustomEvent('retry-error', { detail: error }));
        },
      };
    }
    return undefined;
  }

  // Specialized toast methods for common scenarios
  networkError(error?: Error): void {
    this.error(
      'Connection issue',
      error,
      {
        description: 'Please check your internet connection and try again.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      }
    );
  }

  authError(): void {
    this.error(
      'Authentication required',
      undefined,
      {
        description: 'Please sign in to continue.',
        action: {
          label: 'Sign In',
          onClick: () => {
            // Redirect to sign-in page
            window.location.href = '/auth/sign-in';
          },
        },
      }
    );
  }

  permissionError(): void {
    this.error(
      'Access denied',
      undefined,
      {
        description: 'You don\'t have permission to perform this action.',
      }
    );
  }

  serverError(): void {
    this.error(
      'Server error',
      undefined,
      {
        description: 'Something went wrong on our end. Please try again later.',
        action: {
          label: 'Reload',
          onClick: () => window.location.reload(),
        },
      }
    );
  }

  validationError(fieldErrors?: Record<string, string>): void {
    const message = Object.keys(fieldErrors || {}).length > 0 
      ? 'Please check the form for errors'
      : 'Invalid input provided';
    
    this.error(message, undefined, {
      description: Object.keys(fieldErrors || {}).length > 0 
        ? Object.values(fieldErrors!).join(', ')
        : 'Please review your input and try again.',
    });
  }

  // Success messages for common actions
  saveSuccess(item?: string): void {
    this.success(`${item || 'Item'} saved successfully`);
  }

  deleteSuccess(item?: string): void {
    this.success(`${item || 'Item'} deleted successfully`);
  }

  updateSuccess(item?: string): void {
    this.success(`${item || 'Item'} updated successfully`);
  }

  copySuccess(item?: string): void {
    this.success(`${item || 'Item'} copied to clipboard`);
  }

  // Progress notifications
  progress(current: number, total: number, operation: string): void {
    const percentage = Math.round((current / total) * 100);
    this.info(`${operation}: ${percentage}%`, {
      id: `progress-${operation}`,
      dismissible: false,
    });
  }
}

// Create singleton instance
export const toastManager = new ToastManager();

// Export convenience functions
export const showSuccess = (message: string, options?: ToastOptions) => 
  toastManager.success(message, options);

export const showError = (message: string, error?: Error | NextStepError, options?: ToastOptions) => 
  toastManager.error(message, error, options);

export const showWarning = (message: string, options?: ToastOptions) => 
  toastManager.warning(message, options);

export const showInfo = (message: string, options?: ToastOptions) => 
  toastManager.info(message, options);

export const showLoading = (message: string, options?: { id?: string }) => 
  toastManager.loading(message, options);

export const dismissToast = (id?: string) => 
  toastManager.dismiss(id);

export const dismissAllToasts = () => 
  toastManager.dismissAll();

// Export Toaster component for app setup
export { Toaster };

// Export specialized methods
export const {
  networkError,
  authError,
  permissionError,
  serverError,
  validationError,
  saveSuccess,
  deleteSuccess,
  updateSuccess,
  copySuccess,
  progress,
} = toastManager;
