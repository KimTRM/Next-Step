/**
 * Error Handling System for NextStep Platform
 */

export enum ErrorCode {
  // Network & Server Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Data & Validation
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_DATA = 'INVALID_DATA',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // Convex Specific
  CONVEX_CONNECTION_ERROR = 'CONVEX_CONNECTION_ERROR',
  CONVEX_QUERY_ERROR = 'CONVEX_QUERY_ERROR',
  CONVEX_MUTATION_ERROR = 'CONVEX_MUTATION_ERROR',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

export class NextStepError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly retryable: boolean;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly context?: ErrorContext;

  constructor({
    code,
    message,
    userMessage,
    details,
    retryable = false,
    severity = 'medium',
    context,
  }: {
    code: ErrorCode;
    message: string;
    userMessage: string;
    details?: any;
    retryable?: boolean;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: ErrorContext;
  }) {
    super(message);
    this.name = 'NextStepError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
    this.timestamp = new Date();
    this.retryable = retryable;
    this.severity = severity;
    this.context = context;
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
      severity: this.severity,
    };
  }
}

// Error Factory Functions
export const createNetworkError = (message?: string, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.NETWORK_ERROR,
    message: message || 'Network connection failed',
    userMessage: 'Unable to connect. Please check your internet connection and try again.',
    retryable: true,
    severity: 'medium',
    context,
  });

export const createServerError = (details?: any, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.SERVER_ERROR,
    message: 'Internal server error',
    userMessage: 'Something went wrong on our end. Please try again in a few moments.',
    details,
    retryable: true,
    severity: 'high',
    context,
  });

export const createAuthError = (message: string, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.UNAUTHORIZED,
    message,
    userMessage: 'Please sign in to continue.',
    retryable: false,
    severity: 'medium',
    context,
  });

export const createForbiddenError = (context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.FORBIDDEN,
    message: 'Access forbidden',
    userMessage: 'You don\'t have permission to perform this action.',
    retryable: false,
    severity: 'medium',
    context,
  });

export const createNotFoundError = (resource?: string, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.NOT_FOUND,
    message: `${resource || 'Resource'} not found`,
    userMessage: `The ${resource?.toLowerCase() || 'requested resource'} could not be found.`,
    retryable: false,
    severity: 'low',
    context,
  });

export const createValidationError = (details: any, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.VALIDATION_ERROR,
    message: 'Validation failed',
    userMessage: 'Please check your input and try again.',
    details,
    retryable: false,
    severity: 'low',
    context,
  });

export const createConvexError = (message: string, context?: ErrorContext): NextStepError =>
  new NextStepError({
    code: ErrorCode.CONVEX_CONNECTION_ERROR,
    message,
    userMessage: 'Database connection issue. Please refresh the page and try again.',
    retryable: true,
    severity: 'medium',
    context,
  });

// Utility function to check if error is retryable
export const isRetryable = (error: Error | NextStepError): boolean => {
  if (error instanceof NextStepError) {
    return error.retryable;
  }
  
  // For generic errors, assume network-related errors are retryable
  const message = error.message.toLowerCase();
  return message.includes('network') || 
         message.includes('timeout') || 
         message.includes('connection');
};

// Utility function to get user-friendly message
export const getUserMessage = (error: Error | NextStepError): string => {
  if (error instanceof NextStepError) {
    return error.userMessage;
  }
  
  // Fallback for generic errors
  const message = error.message.toLowerCase();
  if (message.includes('network')) {
    return 'Network connection issue. Please check your internet and try again.';
  }
  if (message.includes('unauthorized')) {
    return 'Please sign in to continue.';
  }
  if (message.includes('forbidden')) {
    return 'You don\'t have permission to perform this action.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};
