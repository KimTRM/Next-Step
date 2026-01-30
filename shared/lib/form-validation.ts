/**
 * Form Validation Error Handling
 */

import { NextStepError, createValidationError } from './errors';
import { showError } from './toast';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  firstError?: ValidationError;
  errorMap: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

/**
 * Validate a single field against rules
 */
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string
): ValidationError | null {
  // Required validation
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      field: fieldName,
      message: rules.message || `${fieldName} is required`,
      code: 'REQUIRED',
      value,
    };
  }

  // Skip other validations if field is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return {
        field: fieldName,
        message: rules.message || `${fieldName} must be at least ${rules.minLength} characters`,
        code: 'MIN_LENGTH',
        value,
      };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        field: fieldName,
        message: rules.message || `${fieldName} must be no more than ${rules.maxLength} characters`,
        code: 'MAX_LENGTH',
        value,
      };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        field: fieldName,
        message: rules.message || `${fieldName} format is invalid`,
        code: 'PATTERN',
        value,
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return {
        field: fieldName,
        message: customError,
        code: 'CUSTOM',
        value,
      };
    }
  }

  return null;
}

/**
 * Validate entire form against schema
 */
export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema
): FormValidationResult {
  const errors: ValidationError[] = [];

  for (const [fieldName, rules] of Object.entries(schema)) {
    const error = validateField(data[fieldName], rules, fieldName);
    if (error) {
      errors.push(error);
    }
  }

  const errorMap: Record<string, string> = {};
  errors.forEach(error => {
    errorMap[error.field] = error.message;
  });

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
    errorMap,
  };
}

/**
 * Handle form submission with validation
 */
export async function handleFormSubmission<T>(
  data: Record<string, any>,
  schema: ValidationSchema,
  submitFn: (data: Record<string, any>) => Promise<T>,
  options?: {
    showToasts?: boolean;
    scrollToError?: boolean;
  }
): Promise<{
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}> {
  const { showToasts = true, scrollToError = true } = options || {};

  // Validate form
  const validation = validateForm(data, schema);
  
  if (!validation.isValid) {
    if (showToasts) {
      showError('Please fix the form errors');
    }

    if (scrollToError && validation.firstError) {
      scrollToField(validation.firstError.field);
    }

    return {
      success: false,
      errors: validation.errors,
    };
  }

  try {
    const result = await submitFn(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (showToasts) {
      showError('Submission failed', error instanceof Error ? error : undefined);
    }

    return {
      success: false,
      errors: [{
        field: '_form',
        message: error instanceof Error ? error.message : 'Submission failed',
        code: 'SUBMISSION_ERROR',
      }],
    };
  }
}

/**
 * Scroll to first error field
 */
function scrollToField(fieldName: string) {
  const element = document.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`) as HTMLElement;
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus();
  }
}

/**
 * React Hook for form validation
 */
export function useFormValidation(
  initialData: Record<string, any>,
  schema: ValidationSchema
) {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateSingleField = React.useCallback((fieldName: string, value: any) => {
    const fieldErrors: ValidationError[] = [];
    const error = validateField(value, schema[fieldName], fieldName);
    if (error) {
      fieldErrors.push(error);
    }

    setErrors(prev => {
      const filtered = prev.filter(e => e.field !== fieldName);
      return [...filtered, ...fieldErrors];
    });

    return fieldErrors.length === 0;
  }, [schema]);

  const setFieldValue = React.useCallback((fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateSingleField(fieldName, value);
    }
  }, [touched, validateSingleField]);

  const setFieldTouched = React.useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateSingleField(fieldName, data[fieldName]);
  }, [data, validateSingleField]);

  const validateAllFields = React.useCallback(() => {
    const validation = validateForm(data, schema);
    setErrors(validation.errors);
    setTouched(Object.keys(schema).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return validation;
  }, [data, schema]);

  const resetForm = React.useCallback(() => {
    setData(initialData);
    setErrors([]);
    setTouched({});
  }, [initialData]);

  const getFieldError = React.useCallback((fieldName: string) => {
    return errors.find(e => e.field === fieldName);
  }, [errors]);

  const getErrorMap = React.useCallback(() => {
    const errorMap: Record<string, string> = {};
    errors.forEach(error => {
      errorMap[error.field] = error.message;
    });
    return errorMap;
  }, [errors]);

  return {
    data,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField: validateSingleField,
    validateForm: validateAllFields,
    resetForm,
    getFieldError,
    getErrorMap,
    isValid: errors.length === 0,
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message,
  }),

  email: (message?: string): ValidationRule => ({
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address',
  }),

  password: (message?: string): ValidationRule => ({
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: message || 'Password must be at least 8 characters with uppercase, lowercase, and number',
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`,
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: message || 'Please enter a valid phone number',
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'Please enter a valid URL',
  }),

  custom: (validator: (value: any) => string | null, message?: string): ValidationRule => ({
    custom: validator,
    message,
  }),
};

/**
 * Handle API validation errors
 */
export function handleApiValidationErrors(
  error: any,
  setFieldError?: (field: string, message: string) => void
): ValidationError[] {
  if (error?.details?.errors) {
    const validationErrors: ValidationError[] = error.details.errors.map((err: any) => ({
      field: err.field || err.path?.join('.') || '_form',
      message: err.message,
      code: err.code,
      value: err.value,
    }));

    if (setFieldError) {
      validationErrors.forEach(err => {
        if (err.field !== '_form') {
          setFieldError(err.field, err.message);
        }
      });
    }

    return validationErrors;
  }

  return [{
    field: '_form',
    message: error?.message || 'Validation failed',
    code: 'UNKNOWN',
  }];
}

// Import React for the hook
import React from 'react';
