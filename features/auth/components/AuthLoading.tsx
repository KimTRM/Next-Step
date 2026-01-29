"use client";

/**
 * AuthLoading Component
 * Loading states for auth pages
 */

import { Loader2 } from "lucide-react";
import Image from "next/image";

type AuthLoadingProps = {
    message?: string;
};

export function AuthLoading({ message = "Loading..." }: AuthLoadingProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-gray-600 text-sm">{message}</p>
            </div>
        </div>
    );
}

/**
 * AuthLoadingSkeleton Component
 * Skeleton placeholder for auth form
 */
export function AuthLoadingSkeleton() {
    return (
        <div className="w-full max-w-md px-8 animate-pulse">
            {/* Title skeleton */}
            <div className="h-12 bg-gray-200 rounded-lg mb-8 mx-auto w-3/4" />

            {/* Form fields skeleton */}
            <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-10 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded-lg mt-4" />
            </div>

            {/* OAuth section skeleton */}
            <div className="mt-8 flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="flex gap-4">
                    <div className="w-12 h-10 bg-gray-200 rounded-lg" />
                    <div className="w-12 h-10 bg-gray-200 rounded-lg" />
                    <div className="w-12 h-10 bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/**
 * FullPageLoading Component
 * Full page loading with branding
 */
export function FullPageLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-green-500 to-green-700">
            <Image
                src="/logo-white.png"
                alt="NextStep"
                width={64}
                height={64}
                className="w-16 h-auto mb-6 animate-pulse"
                style={{ height: "auto" }}
                priority
            />
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
    );
}
