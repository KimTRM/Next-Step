/**
 * Error handling constants and user-friendly messages
 */

export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Not found errors
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Database/Convex errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONVEX_ERROR: 'CONVEX_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  MUTATION_FAILED: 'MUTATION_FAILED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: {
    title: 'Connection Error',
    message: 'We couldn\'t connect to our servers. Please check your internet connection and try again.',
    action: 'Retry',
  },
  
  [ERROR_CODES.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    action: 'Retry',
  },
  
  [ERROR_CODES.CONNECTION_FAILED]: {
    title: 'Connection Failed',
    message: 'Unable to establish a connection. Please check your network and try again.',
    action: 'Retry',
  },
  
  [ERROR_CODES.UNAUTHORIZED]: {
    title: 'Authentication Required',
    message: 'Please sign in to access this feature.',
    action: 'Sign In',
  },
  
  [ERROR_CODES.TOKEN_EXPIRED]: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    action: 'Sign In Again',
  },
  
  [ERROR_CODES.INVALID_CREDENTIALS]: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please try again.',
    action: 'Try Again',
  },
  
  [ERROR_CODES.SESSION_EXPIRED]: {
    title: 'Session Expired',
    message: 'Your session has expired due to inactivity. Please sign in again.',
    action: 'Sign In Again',
  },
  
  [ERROR_CODES.FORBIDDEN]: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource. Contact your administrator if you think this is a mistake.',
    action: 'Go Back',
  },
  
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
    title: 'Insufficient Permissions',
    message: 'You need higher permissions to perform this action.',
    action: 'Contact Admin',
  },
  
  [ERROR_CODES.NOT_FOUND]: {
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist or has been moved.',
    action: 'Go Home',
  },
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: {
    title: 'Resource Not Found',
    message: 'The requested resource could not be found.',
    action: 'Go Back',
  },
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified and is working on a fix.',
    action: 'Try Again',
  },
  
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    title: 'Service Unavailable',
    message: 'Our service is temporarily unavailable for maintenance. Please try again later.',
    action: 'Try Again Later',
  },
  
  [ERROR_CODES.VALIDATION_ERROR]: {
    title: 'Validation Error',
    message: 'Please check your input and correct any errors.',
    action: 'Fix Errors',
  },
  
  [ERROR_CODES.INVALID_INPUT]: {
    title: 'Invalid Input',
    message: 'The information you provided is not valid. Please check and try again.',
    action: 'Correct Input',
  },
  
  [ERROR_CODES.DATABASE_ERROR]: {
    title: 'Data Error',
    message: 'There was a problem accessing your data. Please refresh the page and try again.',
    action: 'Refresh',
  },
  
  [ERROR_CODES.CONVEX_ERROR]: {
    title: 'Database Error',
    message: 'We encountered an issue with our database. Please try again in a moment.',
    action: 'Retry',
  },
  
  [ERROR_CODES.QUERY_FAILED]: {
    title: 'Data Loading Error',
    message: 'Failed to load the requested data. Please refresh the page.',
    action: 'Refresh',
  },
  
  [ERROR_CODES.MUTATION_FAILED]: {
    title: 'Action Failed',
    message: 'We couldn\'t complete your request. Please try again.',
    action: 'Try Again',
  },
  
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: {
    title: 'Rate Limit Exceeded',
    message: 'You\'ve made too many requests. Please wait a moment before trying again.',
    action: 'Wait and Retry',
  },
  
  [ERROR_CODES.TOO_MANY_REQUESTS]: {
    title: 'Too Many Requests',
    message: 'Please slow down your requests. You can try again in a few moments.',
    action: 'Wait',
  },
  
  [ERROR_CODES.FILE_TOO_LARGE]: {
    title: 'File Too Large',
    message: 'The file you\'re trying to upload exceeds the maximum size limit.',
    action: 'Choose Smaller File',
  },
  
  [ERROR_CODES.INVALID_FILE_TYPE]: {
    title: 'Invalid File Type',
    message: 'This file type is not supported. Please choose a valid file.',
    action: 'Choose Valid File',
  },
  
  [ERROR_CODES.UPLOAD_FAILED]: {
    title: 'Upload Failed',
    message: 'We couldn\'t upload your file. Please try again.',
    action: 'Retry Upload',
  },
  
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'Try Again',
  },
  
  [ERROR_CODES.UNEXPECTED_ERROR]: {
    title: 'Unexpected Error',
    message: 'We encountered an unexpected error. Please refresh the page and try again.',
    action: 'Refresh Page',
  },
} as const;

export const HTTP_STATUS_TO_ERROR_CODE: Record<number, keyof typeof ERROR_CODES> = {
  400: ERROR_CODES.VALIDATION_ERROR,
  401: ERROR_CODES.UNAUTHORIZED,
  403: ERROR_CODES.FORBIDDEN,
  404: ERROR_CODES.NOT_FOUND,
  408: ERROR_CODES.TIMEOUT_ERROR,
  429: ERROR_CODES.RATE_LIMIT_EXCEEDED,
  500: ERROR_CODES.INTERNAL_SERVER_ERROR,
  502: ERROR_CODES.SERVICE_UNAVAILABLE,
  503: ERROR_CODES.SERVICE_UNAVAILABLE,
  504: ERROR_CODES.TIMEOUT_ERROR,
};

export const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
export const MAX_RETRY_ATTEMPTS = 3;

export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;
