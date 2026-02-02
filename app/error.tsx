"use client";

/**
 * Root Error Boundary
 * Catches errors in the app and displays user-friendly messages
 */

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

// Map common error patterns to user-friendly messages
function getErrorInfo(error: Error): { title: string; message: string } {
    const errorMessage = error.message.toLowerCase();

    // Clerk auth errors
    if (errorMessage.includes("clerk") || errorMessage.includes("authentication")) {
        return {
            title: "Authentication Error",
            message: "There was a problem with your authentication. Please try signing in again.",
        };
    }

    // Network errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("failed to fetch")) {
        return {
            title: "Connection Error",
            message: "We couldn't connect to our servers. Please check your internet connection and try again.",
        };
    }

    // Rate limiting
    if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
        return {
            title: "Too Many Requests",
            message: "You've made too many requests. Please wait a moment before trying again.",
        };
    }

    // Convex errors
    if (errorMessage.includes("convex")) {
        return {
            title: "Data Error",
            message: "There was a problem loading your data. Please refresh the page.",
        };
    }

    // Default error
    return {
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    };
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to console in development
        console.error("App Error:", error);
    }, [error]);

    const { title, message } = getErrorInfo(error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
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
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Go home
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
