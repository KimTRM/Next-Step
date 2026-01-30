/**
 * Authentication error handling utilities
 */

import type { AppError } from "./types";
import { ERROR_CODES } from "./constants";
import {
    createAuthenticationError,
    createAuthorizationError,
    normalizeError,
    isRetryableError,
} from "./utils";
import { logError, logUserAction } from "./logger";
import { showAuthErrorToast, showRetryToast, showErrorToast } from "./toast";

/**
 * Authentication error types
 */
export enum AuthErrorType {
    UNAUTHORIZED = "UNAUTHORIZED",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    SESSION_EXPIRED = "SESSION_EXPIRED",
    FORBIDDEN = "FORBIDDEN",
    RATE_LIMITED = "RATE_LIMITED",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
    TWO_FACTOR_REQUIRED = "TWO_FACTOR_REQUIRED",
    PASSWORD_RESET_REQUIRED = "PASSWORD_RESET_REQUIRED",
}

/**
 * Authentication context for error handling
 */
export interface AuthContext {
    userId?: string;
    email?: string;
    sessionId?: string;
    operation?: string;
    resource?: string;
    action?: string;
}

/**
 * Handle authentication errors with appropriate user feedback
 */
export function handleAuthError(
    error: unknown,
    context?: AuthContext,
    options?: {
        onSignIn?: () => void;
        onRetry?: () => void;
        showToast?: boolean;
    },
): AppError {
    const appError = normalizeError(error);

    // Add auth context to the error
    appError.context = {
        ...appError.context,
        component: "Authentication",
        ...context,
    };

    // Log the error
    logError(appError, {
        component: "Authentication",
        operation: context?.operation || "unknown",
        userId: context?.userId,
        email: context?.email,
    });

    // Show appropriate toast notification
    if (options?.showToast !== false) {
        if (
            appError.code === "UNAUTHORIZED" ||
            appError.code === "TOKEN_EXPIRED"
        ) {
            showAuthErrorToast(appError, options?.onSignIn);
        } else if (isRetryableError(appError)) {
            showRetryToast(
                appError,
                options?.onRetry || (() => window.location.reload()),
            );
        } else {
            showErrorToast(appError);
        }
    }

    return appError;
}

/**
 * Handle Clerk authentication errors specifically
 */
export function handleClerkError(
    error: unknown,
    context?: AuthContext,
): AppError {
    // Clerk error mapping
    const clerkErrorMap: Record<
        string,
        { code: AuthErrorType; message: string }
    > = {
        authentication_invalid: {
            code: AuthErrorType.INVALID_CREDENTIALS,
            message: "Invalid email or password",
        },
        token_verification_failed: {
            code: AuthErrorType.TOKEN_EXPIRED,
            message: "Your session has expired",
        },
        session_expired: {
            code: AuthErrorType.SESSION_EXPIRED,
            message: "Your session has expired due to inactivity",
        },
        forbidden: {
            code: AuthErrorType.FORBIDDEN,
            message: "You don't have permission to access this resource",
        },
        rate_limit_exceeded: {
            code: AuthErrorType.RATE_LIMITED,
            message: "Too many authentication attempts. Please try again later",
        },
        email_not_verified: {
            code: AuthErrorType.EMAIL_NOT_VERIFIED,
            message: "Please verify your email address before continuing",
        },
        second_factor_required: {
            code: AuthErrorType.TWO_FACTOR_REQUIRED,
            message: "Two-factor authentication is required",
        },
        password_reset_required: {
            code: AuthErrorType.PASSWORD_RESET_REQUIRED,
            message: "You need to reset your password before continuing",
        },
    };

    interface ClerkErrorItem {
        code?: string;
        message?: string;
    }

    interface ClerkErrorObject {
        errors?: ClerkErrorItem[];
    }

    function isClerkErrorObject(obj: unknown): obj is ClerkErrorObject {
        return (
            typeof obj === "object" &&
            obj !== null &&
            "errors" in obj &&
            Array.isArray((obj as ClerkErrorObject).errors)
        );
    }

    const errorsArray: ClerkErrorItem[] =
        isClerkErrorObject(error) ? (error as ClerkErrorObject).errors! : [];

    const firstErrorCode =
        errorsArray.length > 0 ? errorsArray[0]?.code : undefined;
    const errorInfo = (firstErrorCode && clerkErrorMap[firstErrorCode]) || {
        code: AuthErrorType.UNAUTHORIZED,
        message: errorsArray[0]?.message || "Authentication failed",
    };

    return handleAuthError(
        createAuthenticationError(
            errorInfo.code === AuthErrorType.TOKEN_EXPIRED,
            "clerk",
            error,
        ),
        context,
    );
}

/**
 * Check if user needs re-authentication
 */
export function needsReauth(error: AppError): boolean {
    return ["TOKEN_EXPIRED", "SESSION_EXPIRED", "UNAUTHORIZED"].includes(
        error.code,
    );
}

/**
 * Check if error is account-related
 */
export function isAccountError(error: AppError): boolean {
    return [
        "ACCOUNT_LOCKED",
        "EMAIL_NOT_VERIFIED",
        "PASSWORD_RESET_REQUIRED",
    ].includes(error.code);
}

/**
 * Create authentication error with context
 */
export function createAuthError(
    type: AuthErrorType,
    message?: string,
    context?: AuthContext,
): AppError {
    const baseError = createAuthenticationError(
        type === AuthErrorType.TOKEN_EXPIRED,
        "clerk",
    );

    baseError.code = type as keyof typeof ERROR_CODES;
    baseError.message = message || baseError.message;
    baseError.context = {
        ...baseError.context,
        ...context,
    };

    return baseError;
}

/**
 * Handle authorization errors
 */
export function handleAuthzError(
    resource: string,
    action: string,
    userRole?: string,
    requiredRole?: string,
    context?: AuthContext,
): AppError {
    const error = createAuthorizationError(resource, action, requiredRole);

    error.context = {
        ...error.context,
        userRole,
        component: "Authorization",
        ...context,
    };

    logError(error, {
        component: "Authorization",
        operation: action,
        resource,
        userRole,
        requiredRole,
        userId: context?.userId,
    });

    showErrorToast(error);

    return error;
}

/**
 * Check session validity
 */
export function checkSessionValidity(
    session: { expireAt?: number; status?: string } | null | undefined,
    context?: AuthContext,
): AppError | null {
    if (!session) {
        return createAuthError(
            AuthErrorType.UNAUTHORIZED,
            "No active session found",
            context,
        );
    }

    if (session.expireAt && session.expireAt < Date.now()) {
        return createAuthError(
            AuthErrorType.SESSION_EXPIRED,
            "Your session has expired",
            context,
        );
    }

    if (session.status === "revoked") {
        return createAuthError(
            AuthErrorType.UNAUTHORIZED,
            "Your session has been revoked",
            context,
        );
    }

    return null;
}

/**
 * Handle authentication flow errors
 */
export function handleAuthFlowError(
    step: "sign_in" | "sign_up" | "sign_out" | "refresh" | "verify",
    error: unknown,
    context?: AuthContext,
): AppError {
    const appError = normalizeError(error);

    appError.context = {
        ...appError.context,
        component: "AuthFlow",
        authStep: step,
        ...context,
    };

    logUserAction(`Auth flow error: ${step}`, {
        error: appError.message,
        code: appError.code,
    });

    logError(appError, {
        component: "AuthFlow",
        operation: step,
        userId: context?.userId,
    });

    // Show appropriate feedback based on step
    switch (step) {
        case "sign_in":
            if (appError.code === "INVALID_CREDENTIALS") {
                showAuthErrorToast(appError);
            } else {
                showRetryToast(appError, () => window.location.reload());
            }
            break;

        case "sign_up":
            if (appError.code === "VALIDATION_ERROR") {
                showErrorToast(appError);
            } else {
                showRetryToast(appError, () => window.location.reload());
            }
            break;

        case "sign_out":
            // Don't show toast for sign out errors, just log
            break;

        case "refresh":
            // Silent retry for token refresh
            break;

        case "verify":
            showAuthErrorToast(appError);
            break;
    }

    return appError;
}

/**
 * React hook for authentication error handling
 */
export function useAuthErrorHandler() {
    const handleError = (
        error: unknown,
        context?: AuthContext,
        options?: {
            onSignIn?: () => void;
            onRetry?: () => void;
            showToast?: boolean;
        },
    ) => {
        return handleAuthError(error, context, options);
    };

    const handleClerkError = (error: unknown, context?: AuthContext) => {
        return handleClerkError(error, context);
    };

    const handleFlowError = (
        step: "sign_in" | "sign_up" | "sign_out" | "refresh" | "verify",
        error: unknown,
        context?: AuthContext,
    ) => {
        return handleAuthFlowError(step, error, context);
    };

    const checkSession = (
        session: { expireAt?: number; status?: string } | null | undefined,
        context?: AuthContext,
    ) => {
        return checkSessionValidity(session, context);
    };

    const handleAuthz = (
        resource: string,
        action: string,
        userRole?: string,
        requiredRole?: string,
        context?: AuthContext,
    ) => {
        return handleAuthzError(
            resource,
            action,
            userRole,
            requiredRole,
            context,
        );
    };

    return {
        handleError,
        handleClerkError,
        handleFlowError,
        checkSession,
        handleAuthz,
        needsReauth,
        isAccountError,
    };
}

/**
 * Authentication middleware for API calls
 */
export function withAuthHandling<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context?: AuthContext,
) {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            const authError = handleAuthError(error, context);
            throw authError;
        }
    };
}
