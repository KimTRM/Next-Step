"use client";

/**
 * Platform Error Boundary
 * Catches errors in protected platform pages
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

// Map platform-specific error patterns to user-friendly messages
function getPlatformErrorInfo(error: Error): { title: string; message: string; showSignOut: boolean } {
    const errorMessage = error.message.toLowerCase();

    // Authentication/session errors
    if (
        errorMessage.includes("unauthenticated") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("session")
    ) {
        return {
            title: "Session Expired",
            message: "Your session has expired. Please sign in again to continue.",
            showSignOut: true,
        };
    }

    // Permission errors
    if (errorMessage.includes("permission") || errorMessage.includes("forbidden")) {
        return {
            title: "Access Denied",
            message: "You don't have permission to access this page.",
            showSignOut: false,
        };
    }

    // Data loading errors
    if (errorMessage.includes("convex") || errorMessage.includes("query") || errorMessage.includes("mutation")) {
        return {
            title: "Data Error",
            message: "There was a problem loading your data. Please try again.",
            showSignOut: false,
        };
    }

    // Network errors
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        return {
            title: "Connection Error",
            message: "We couldn't connect to our servers. Please check your internet connection.",
            showSignOut: false,
        };
    }

    // Default error
    return {
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again.",
        showSignOut: false,
    };
}

export default function PlatformError({ error, reset }: ErrorProps) {
    const { signOut } = useClerk();
    const router = useRouter();

    useEffect(() => {
        // Log error to console in development
        console.error("Platform Error:", error);
    }, [error]);

    const { title, message, showSignOut } = getPlatformErrorInfo(error);

    const handleSignOut = async () => {
        await signOut();
        // Use router instead of window.location to avoid full page reload
        router.push("/auth");
    };

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
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

                    {showSignOut ? (
                        <button
                            onClick={handleSignOut}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign in again
                        </button>
                    ) : (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Go to dashboard
                        </Link>
                    )}
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
