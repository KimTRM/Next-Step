"use client";

/**
 * Auth Error Boundary
 * Catches errors in auth pages and displays auth-specific messages
 */

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

// Map auth-specific error patterns to user-friendly messages
function getAuthErrorInfo(error: Error): { title: string; message: string; action: string } {
    const errorMessage = error.message.toLowerCase();

    // Invalid credentials
    if (errorMessage.includes("password") || errorMessage.includes("incorrect")) {
        return {
            title: "Invalid Credentials",
            message: "The email or password you entered is incorrect. Please try again.",
            action: "Try again",
        };
    }

    // Account not found
    if (errorMessage.includes("not found") || errorMessage.includes("identifier")) {
        return {
            title: "Account Not Found",
            message: "We couldn't find an account with that email. Please check your email or sign up.",
            action: "Sign up",
        };
    }

    // Rate limiting
    if (errorMessage.includes("rate") || errorMessage.includes("too many")) {
        return {
            title: "Too Many Attempts",
            message: "You've made too many sign-in attempts. Please wait a few minutes before trying again.",
            action: "Wait and try again",
        };
    }

    // Email verification
    if (errorMessage.includes("verification") || errorMessage.includes("verify")) {
        return {
            title: "Verification Required",
            message: "Please verify your email address to continue. Check your inbox for the verification code.",
            action: "Resend code",
        };
    }

    // OAuth errors
    if (errorMessage.includes("oauth") || errorMessage.includes("social")) {
        return {
            title: "Social Login Failed",
            message: "There was a problem signing in with your social account. Please try again or use a different method.",
            action: "Try again",
        };
    }

    // Session errors
    if (errorMessage.includes("session") || errorMessage.includes("expired")) {
        return {
            title: "Session Expired",
            message: "Your session has expired. Please sign in again to continue.",
            action: "Sign in",
        };
    }

    // Network errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        return {
            title: "Connection Error",
            message: "We couldn't connect to our servers. Please check your internet connection.",
            action: "Try again",
        };
    }

    // Default error
    return {
        title: "Authentication Error",
        message: "Something went wrong during authentication. Please try again.",
        action: "Try again",
    };
}

export default function AuthError({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to console in development
        console.error("Auth Error:", error);
    }, [error]);

    const { title, message } = getAuthErrorInfo(error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
            <div className="max-w-md w-full text-center">
                <div className="bg-red-50 rounded-full p-4 w-fit mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                </h1>

                <p className="text-gray-600 mb-8">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </button>

                    <Link
                        href="/auth"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>
                </div>

                {process.env.NODE_ENV === "development" && error.digest && (
                    <p className="mt-6 text-xs text-gray-400">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
