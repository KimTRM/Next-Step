/**
 * Main error handling exports
 */

// Types and interfaces
export type {
  AppError,
  NetworkError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  FileUploadError,
  BaseError,
  ErrorBoundaryState,
  ErrorToastOptions,
  RetryOptions,
  ErrorLogEntry,
  ErrorReportingService,
  FallbackComponentProps,
  ErrorFallbackComponent,
  ErrorBoundaryProps,
  AsyncState,
  AsyncOperation,
  FormFieldError,
  FormValidationState,
  ErrorContext,
} from './types';

// Constants
export {
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS_TO_ERROR_CODE,
  RETRY_DELAYS,
  MAX_RETRY_ATTEMPTS,
  ERROR_SEVERITY,
} from './constants';

// Utilities
export {
  createError,
  createNetworkError,
  createValidationError,
  createDatabaseError,
  createAuthenticationError,
  createAuthorizationError,
  createFileUploadError,
  normalizeError,
  isAppError,
  isRetryableError,
  retryOperation,
  extractErrorInfo,
  getErrorMessage,
  debounceErrorReporting,
  generateErrorId,
  isCriticalError,
} from './utils';

// Logger
export {
  errorLogger,
  logError,
  logUserAction,
  logNavigation,
  logPerformance,
  logFeatureUsage,
  setErrorUser,
  clearErrorUser,
  getErrorLogs,
  clearErrorLogs,
} from './logger';

// Toast notifications
export {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  showLoadingToast,
  updateToast,
  dismissToast,
  dismissAllToasts,
  showRetryToast,
  showAuthErrorToast,
  showNetworkErrorToast,
  showValidationErrorToast,
  showFileUploadErrorToast,
  showRateLimitToast,
  promiseToast,
} from './toast';

// Convex error handling
export {
  handleConvexMutation,
  handleConvexQuery,
  handleConvexMutationWithRetry,
  createConvexAuthError,
  createConvexAuthzError,
  createConvexValidationError,
  handleConvexAuthError,
  handleConvexAuthzError,
  validateConvexInput,
  withConvexMutationErrorHandling,
  withConvexQueryErrorHandling,
  useConvexOperation,
  type ConvexResult,
} from './convex';

// API error handling
export {
  apiRequest,
  api,
  uploadFile,
  useApi,
  type ApiResponse,
  type ApiRequestConfig,
} from './api';

// Form validation error handling
export {
  validateField,
  validateForm,
  validateFormField,
  getFieldError,
  hasFieldError,
  handleFormSubmissionError,
  createValidationErrorFromApi,
  createReactHookFormError,
  ValidationPatterns,
  CommonValidations,
  createFormState,
  validateFieldAsync,
  createDebouncedValidator,
  type ValidationRule,
  type ValidationSchema,
} from './forms';

// Authentication error handling
export {
  handleAuthError,
  handleClerkError,
  needsReauth,
  isAccountError,
  createAuthError,
  handleAuthzError,
  checkSessionValidity,
  handleAuthFlowError,
  useAuthErrorHandler,
  withAuthHandling,
  AuthErrorType,
  type AuthContext,
} from './auth';

// React components
export { ErrorBoundary, withErrorBoundary, useErrorHandler } from '../../components/error/ErrorBoundary';
export {
  ErrorFallback,
  NetworkErrorFallback,
  AuthErrorFallback,
  AuthorizationErrorFallback,
  NotFoundErrorFallback,
  ServerErrorFallback,
  FileUploadErrorFallback,
  LoadingErrorFallback,
  RateLimitErrorFallback,
  GenericErrorFallback,
} from '../../components/error/FallbackUI';
