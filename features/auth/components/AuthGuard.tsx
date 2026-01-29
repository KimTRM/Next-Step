"use client";

/**
 * AuthGuard Component
 * Protects content and shows loading state while auth resolves
 */

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type AuthGuardProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

/**
 * AuthGuard - Ensures user is authenticated before showing content
 * Shows loading state while auth is resolving
 * Redirects to login if not authenticated
 */
export function AuthGuard({
    children,
    fallback,
    redirectTo = "/auth",
}: AuthGuardProps) {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // Get current path for redirect back after login
            const currentPath = window.location.pathname;
            router.push(`${redirectTo}?redirect_url=${encodeURIComponent(currentPath)}`);
        }
    }, [isLoaded, isSignedIn, router, redirectTo]);

    // Show loading state while auth is resolving
    if (!isLoaded) {
        return fallback || <AuthGuardLoading />;
    }

    // User is not signed in - will be redirected
    if (!isSignedIn) {
        return fallback || <AuthGuardLoading message="Redirecting to login..." />;
    }

    // User is authenticated - show content
    return <>{children}</>;
}

/**
 * Default loading component for AuthGuard
 */
function AuthGuardLoading({ message = "Checking authentication..." }: { message?: string }) {
    return (
        <div className="min-h-[200px] flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-green-600 mb-2" />
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    );
}

/**
 * Hook to check if user is ready (auth loaded and signed in)
 */
export function useAuthReady() {
    const { isLoaded, isSignedIn, userId } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();

    return {
        isReady: isLoaded && userLoaded,
        isAuthenticated: isSignedIn === true,
        userId,
        user,
    };
}
