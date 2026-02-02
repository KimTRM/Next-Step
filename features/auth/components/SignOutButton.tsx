"use client";

/**
 * SignOutButton Component
 * Custom sign-out button using Clerk
 */

import { LogOut, Loader2 } from "lucide-react";
import { useSignOut } from "../api";

type SignOutButtonProps = {
    variant?: "default" | "menu" | "icon";
    className?: string;
    showIcon?: boolean;
    label?: string;
};

export function SignOutButton({
    variant = "default",
    className = "",
    showIcon = true,
    label = "Sign Out",
}: SignOutButtonProps) {
    const { signOut, isLoading } = useSignOut();

    // Menu item variant (for sidebars/dropdowns)
    if (variant === "menu") {
        return (
            <button
                onClick={signOut}
                disabled={isLoading}
                className={`w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : showIcon ? (
                    <LogOut className="w-4 h-4" />
                ) : null}
                {label}
            </button>
        );
    }

    // Icon-only variant
    if (variant === "icon") {
        return (
            <button
                onClick={signOut}
                disabled={isLoading}
                className={`p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                title={label}
                aria-label={label}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <LogOut className="w-5 h-5" />
                )}
            </button>
        );
    }

    // Default button variant
    return (
        <button
            onClick={signOut}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : showIcon ? (
                <LogOut className="w-4 h-4" />
            ) : null}
            {label}
        </button>
    );
}
