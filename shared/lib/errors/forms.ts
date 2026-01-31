/**
 * Form validation error handling utilities
 */

import type { AppError, FormFieldError, FormValidationState } from './types';
import { createValidationError, normalizeError } from './utils';
import { logError } from './logger';

/**
 * Validation rule interface
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
  message?: string;
}

/**
 * Form validation schema
 */
export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

/**
 * Validate a single field
 */
export function validateField(
  fieldName: string,
  value: any,
  rule: ValidationRule
): FormFieldError | null {
  // Check required fields
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} is required`,
      code: 'REQUIRED',
    };
  }

  // Skip validation if field is not provided and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
        code: 'MIN_LENGTH',
      };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} cannot exceed ${rule.maxLength} characters`,
        code: 'MAX_LENGTH',
      };
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} format is invalid`,
        code: 'PATTERN',
      };
    }

    if (rule.email && !isValidEmail(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be a valid email address`,
        code: 'EMAIL',
      };
    }

    if (rule.url && !isValidUrl(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be a valid URL`,
        code: 'URL',
      };
    }

    if (rule.phone && !isValidPhone(value)) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be a valid phone number`,
        code: 'PHONE',
      };
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must be at least ${rule.min}`,
        code: 'MIN',
      };
    }

    if (rule.max !== undefined && value > rule.max) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} cannot exceed ${rule.max}`,
        code: 'MAX',
      };
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (rule.minLength && value.length < rule.minLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} must have at least ${rule.minLength} items`,
        code: 'MIN_LENGTH',
      };
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return {
        field: fieldName,
        message: rule.message || `${fieldName} cannot have more than ${rule.maxLength} items`,
        code: 'MAX_LENGTH',
      };
    }
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return {
        field: fieldName,
        message: customError,
        code: 'CUSTOM',
      };
    }
  }

  return null;
}

/**
 * Validate entire form
 */
export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema
): FormValidationState {
  const errors: FormFieldError[] = [];
  const touched: Record<string, boolean> = {};

  // Validate each field
  for (const [fieldName, rule] of Object.entries(schema)) {
    const error = validateField(fieldName, data[fieldName], rule);
    if (error) {
      errors.push(error);
    }
    touched[fieldName] = true;
  }

  return {
    isValid: errors.length === 0,
    errors,
    touched,
  };
}

/**
 * Validate a single field and return validation state
 */
export function validateFormField(
  fieldName: string,
  value: any,
  schema: ValidationSchema,
  currentErrors: FormFieldError[] = []
): FormValidationState {
  const rule = schema[fieldName];
  if (!rule) {
    return {
      isValid: true,
      errors: currentErrors,
      touched: { [fieldName]: true },
    };
  }

  const error = validateField(fieldName, value, rule);
  const newErrors = currentErrors.filter(e => e.field !== fieldName);
  
  if (error) {
    newErrors.push(error);
  }

  return {
    isValid: newErrors.length === 0,
    errors: newErrors,
    touched: { [fieldName]: true },
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  fieldName: string,
  errors: FormFieldError[]
): string | null {
  const error = errors.find(e => e.field === fieldName);
  return error ? error.message : null;
}

/**
 * Check if a field has an error
 */
export function hasFieldError(
  fieldName: string,
  errors: FormFieldError[]
): boolean {
  return errors.some(e => e.field === fieldName);
}

/**
 * Handle form submission errors
 */
export function handleFormSubmissionError(
  error: unknown,
  context?: {
    formName?: string;
    userId?: string;
    additionalData?: Record<string, any>;
  }
): AppError {
  const appError = normalizeError(error);

  // Add form context to the error
  appError.context = {
    ...appError.context,
    component: 'FormSubmission',
    formName: context?.formName || 'UnknownForm',
    ...context?.additionalData,
  };

  // Log the error
  logError(appError, {
    component: 'FormSubmission',
    operation: 'submit',
    formName: context?.formName,
    userId: context?.userId,
  });

  return appError;
}

/**
 * Create validation error from API response
 */
export function createValidationErrorFromApi(
  apiErrors: Record<string, string[]> | string[]
): FormFieldError[] {
  if (Array.isArray(apiErrors)) {
    // Global errors - return as field errors with empty field name
    return apiErrors.map((message, index) => ({
      field: '_global',
      message,
      code: 'API_ERROR',
    }));
  }

  // Field-specific errors
  return Object.entries(apiErrors).map(([field, messages]) => ({
    field,
    message: messages[0], // Take first message for each field
    code: 'API_ERROR',
  }));
}

/**
 * React Hook Form integration utilities
 */
export function createReactHookFormError(
  errors: Record<string, any>
): FormFieldError[] {
  const fieldErrors: FormFieldError[] = [];

  for (const [fieldName, error] of Object.entries(errors)) {
    if (error && typeof error === 'object' && 'message' in error) {
      fieldErrors.push({
        field: fieldName,
        message: error.message as string,
        code: 'FORM_ERROR',
      });
    }
  }

  return fieldErrors;
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9-]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

/**
 * Common validation rules
 */
export const CommonValidations = {
  required: { required: true },
  email: { email: true },
  url: { url: true },
  phone: { phone: true },
  password: {
    pattern: ValidationPatterns.password,
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  },
  username: {
    pattern: ValidationPatterns.username,
    message: 'Username must be 3-20 characters, letters, numbers, and underscores only',
  },
  slug: {
    pattern: ValidationPatterns.slug,
    message: 'Must contain only lowercase letters, numbers, and hyphens',
  },
  minLength: (min: number) => ({ minLength: min }),
  maxLength: (max: number) => ({ maxLength: max }),
  min: (min: number) => ({ min }),
  max: (max: number) => ({ max }),
  range: (min: number, max: number) => ({ min, max }),
  lengthRange: (min: number, max: number) => ({ minLength: min, maxLength: max }),
  custom: (validator: (value: any) => string | null, message?: string) => ({
    custom: validator,
    message,
  }),
};

/**
 * Helper functions
 */
function isValidEmail(email: string): boolean {
  return ValidationPatterns.email.test(email);
}

function isValidUrl(url: string): boolean {
  return ValidationPatterns.url.test(url);
}

function isValidPhone(phone: string): boolean {
  return ValidationPatterns.phone.test(phone);
}

/**
 * Form state management hook utilities
 */
export function createFormState<T extends Record<string, any>>(
  initialValues: T,
  schema: ValidationSchema
) {
  return {
    values: initialValues,
    errors: [] as FormFieldError[],
    touched: {} as Record<string, boolean>,
    isSubmitting: false,
    isValid: validateForm(initialValues, schema).isValid,
    schema,
  };
}

/**
 * Async form validation
 */
export async function validateFieldAsync(
  fieldName: string,
  value: any,
  asyncValidator: (value: any) => Promise<string | null>
): Promise<FormFieldError | null> {
  try {
    const error = await asyncValidator(value);
    if (error) {
      return {
        field: fieldName,
        message: error,
        code: 'ASYNC_ERROR',
      };
    }
    return null;
  } catch (error) {
    return {
      field: fieldName,
      message: 'Validation failed',
      code: 'ASYNC_ERROR',
    };
  }
}

/**
 * Debounced field validation
 */
export function createDebouncedValidator(
  validator: (fieldName: string, value: any) => FormFieldError | null,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (fieldName: string, value: any, callback: (error: FormFieldError | null) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validator(fieldName, value);
      callback(error);
    }, delay);
  };
}
