"use client";

/**
 * Global Error Boundary
 * Catches errors in the root layout (last resort error handler)
 */

import { AlertCircle, RefreshCw } from "lucide-react";

type GlobalErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                        <div
                            className="rounded-full p-4 w-fit mx-auto mb-6"
                            style={{ backgroundColor: "#fef2f2" }}
                        >
                            <AlertCircle
                                className="w-12 h-12"
                                style={{ color: "#ef4444" }}
                            />
                        </div>

                        <h1
                            className="text-2xl font-bold mb-2"
                            style={{ color: "#111827" }}
                        >
                            Something went wrong
                        </h1>

                        <p className="mb-8" style={{ color: "#4b5563" }}>
                            A critical error occurred. Please refresh the page or try again later.
                        </p>

                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2 font-medium rounded-lg transition-colors"
                            style={{
                                backgroundColor: "#16a34a",
                                color: "white",
                            }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </button>

                        {process.env.NODE_ENV === "development" && error.digest && (
                            <p
                                className="mt-6 text-xs"
                                style={{ color: "#9ca3af" }}
                            >
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
}
