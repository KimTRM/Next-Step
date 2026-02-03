"use client";

/**
 * OnboardingGuard Component
 * Handles all onboarding-based redirects:
 * - Not authenticated → /auth (handled by middleware)
 * - Authenticated + onboardingStatus === "not_started" → /welcome
 * - Authenticated + onboardingStatus === "in_progress" → /onboarding/role
 * - Authenticated + onboardingStatus === "completed" → /dashboard
 * - Prevents completed users from accessing /welcome or /onboarding/*
 */

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FullPageLoading } from "@/features/auth";

type OnboardingStatus = "not_started" | "in_progress" | "completed";

type OnboardingGuardProps = {
    children: ReactNode;
    /** If true, allows users to bypass onboarding check */
    allowIncomplete?: boolean;
};

/**
 * Wraps content and handles onboarding-based redirects
 */
export function OnboardingGuard({
    children,
    allowIncomplete = false,
}: OnboardingGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const user = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );

    const isLoading = !authLoaded || (isSignedIn && user === undefined);
    const onboardingStatus: OnboardingStatus = user?.onboardingStatus ?? "not_started";

    // Route detection
    const isOnWelcomePage = pathname === "/welcome";
    const isOnOnboardingPage = pathname?.startsWith("/onboarding");
    const isOnDashboard = pathname?.startsWith("/dashboard");

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // Skip if not signed in (middleware handles redirect to /auth)
        if (!isSignedIn) return;

        // Skip if user not found in DB yet (AuthSyncProvider will create)
        if (user === null) return;

        // Skip if allowing incomplete
        if (allowIncomplete) return;

        // REDIRECT LOGIC BASED ON ONBOARDING STATUS

        if (onboardingStatus === "completed") {
            // Completed users should NOT be on /welcome or /onboarding/*
            if (isOnWelcomePage || isOnOnboardingPage) {
                router.replace("/dashboard");
                return;
            }
            // Otherwise, allow access to current page
            return;
        }

        if (onboardingStatus === "not_started") {
            // Users who haven't started should go to /onboarding to begin the flow
            if (!isOnOnboardingPage && !isOnWelcomePage) {
                router.replace("/onboarding");
                return;
            }
            // Already on onboarding or welcome, allow
            return;
        }

        if (onboardingStatus === "in_progress") {
            // Users in progress should be on /onboarding page (single-page flow)
            if (!isOnOnboardingPage) {
                // Redirect to the onboarding flow
                router.replace("/onboarding");
                return;
            }
            // Already on onboarding page, allow
            return;
        }
    }, [
        isLoading,
        isSignedIn,
        user,
        onboardingStatus,
        allowIncomplete,
        router,
        isOnWelcomePage,
        isOnOnboardingPage,
        isOnDashboard,
        pathname,
    ]);

    // Show loading while checking auth/user state
    if (isLoading) {
        return <FullPageLoading />;
    }

    // Show loading during redirect
    if (!allowIncomplete && isSignedIn && user) {
        // Check if we need to redirect
        if (onboardingStatus === "completed" && (isOnWelcomePage || isOnOnboardingPage)) {
            return <FullPageLoading />;
        }
        if (onboardingStatus === "not_started" && !isOnOnboardingPage && !isOnWelcomePage) {
            return <FullPageLoading />;
        }
        if (onboardingStatus === "in_progress" && !isOnOnboardingPage) {
            return <FullPageLoading />;
        }
    }

    return <>{children}</>;
}

/**
 * Hook to check onboarding status
 */
export function useOnboardingStatus() {
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const user = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );

    const isLoading = !authLoaded || (isSignedIn && user === undefined);
    const status: OnboardingStatus = user?.onboardingStatus ?? "not_started";
    const isComplete = status === "completed";
    const isInProgress = status === "in_progress";
    const isNotStarted = status === "not_started";

    return {
        isLoading,
        status,
        isComplete,
        isInProgress,
        isNotStarted,
        needsOnboarding: !isLoading && isSignedIn && !isComplete,
        user,
    };
}
