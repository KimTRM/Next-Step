"use client";

/**
 * AuthError Component
 * User-friendly error display for authentication errors
 */

import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

type AuthErrorProps = {
    title?: string;
    message?: string;
    code?: string;
    onRetry?: () => void;
    showHomeLink?: boolean;
    showBackLink?: boolean;
};

// Map error codes to user-friendly messages
const errorMessages: Record<string, { title: string; message: string }> = {
    // Clerk auth errors
    "form_identifier_not_found": {
        title: "Account not found",
        message: "We couldn't find an account with that email. Please check your email or sign up for a new account.",
    },
    "form_password_incorrect": {
        title: "Incorrect password",
        message: "The password you entered is incorrect. Please try again or reset your password.",
    },
    "form_password_pwned": {
        title: "Password compromised",
        message: "This password has been found in a data breach. Please choose a different password.",
    },
    "form_password_length_too_short": {
        title: "Password too short",
        message: "Your password must be at least 8 characters long.",
    },
    "form_identifier_exists": {
        title: "Email already registered",
        message: "An account with this email already exists. Please sign in instead.",
    },
    "session_exists": {
        title: "Already signed in",
        message: "You're already signed in. Redirecting to your dashboard...",
    },

    // Rate limiting
    "too_many_requests": {
        title: "Too many attempts",
        message: "You've made too many attempts. Please wait a few minutes before trying again.",
    },
    "rate_limit_exceeded": {
        title: "Rate limit exceeded",
        message: "Too many requests. Please slow down and try again in a moment.",
    },

    // Email verification
    "form_code_incorrect": {
        title: "Invalid code",
        message: "The verification code you entered is incorrect. Please check and try again.",
    },
    "verification_expired": {
        title: "Code expired",
        message: "Your verification code has expired. Please request a new one.",
    },
    "verification_failed": {
        title: "Verification failed",
        message: "We couldn't verify your email. Please try again or request a new code.",
    },

    // OAuth errors
    "oauth_access_denied": {
        title: "Access denied",
        message: "You cancelled the sign-in process. Please try again when you're ready.",
    },
    "external_account_not_found": {
        title: "Account not linked",
        message: "This social account isn't linked to any existing account. Please sign up first.",
    },
    "external_account_exists": {
        title: "Account already linked",
        message: "This social account is already linked to another user.",
    },
    "account_exists_with_different_credential": {
        title: "Email already in use",
        message: "An account with this email already exists using a different sign-in method.",
    },

    // Network errors
    "network_error": {
        title: "Connection error",
        message: "We couldn't connect to our servers. Please check your internet connection and try again.",
    },
    "fetch_error": {
        title: "Connection failed",
        message: "Unable to reach our servers. Please check your connection and try again.",
    },

    // Generic errors
    "unknown_error": {
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    },
};

export function AuthErrorDisplay({
    title,
    message,
    code,
    onRetry,
    showHomeLink = true,
    showBackLink = false,
}: AuthErrorProps) {
    // Get error info from code or use provided values
    const errorInfo = code ? errorMessages[code] : null;
    const displayTitle = title || errorInfo?.title || "Something went wrong";
    const displayMessage = message || errorInfo?.message || "An unexpected error occurred. Please try again.";

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
            <div className="bg-red-50 rounded-full p-4 mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {displayTitle}
            </h1>

            <p className="text-gray-600 text-center max-w-md mb-8">
                {displayMessage}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </button>
                )}

                {showBackLink && (
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </button>
                )}

                {showHomeLink && (
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go home
                    </Link>
                )}
            </div>

            {code && process.env.NODE_ENV === "development" && (
                <p className="mt-6 text-xs text-gray-400">
                    Error code: {code}
                </p>
            )}
        </div>
    );
}

// Helper function to get user-friendly error message
export function getAuthErrorMessage(code: string): { title: string; message: string } {
    return errorMessages[code] || errorMessages["unknown_error"];
}
