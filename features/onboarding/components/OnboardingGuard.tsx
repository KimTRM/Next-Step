"use client";

/**
 * OnboardingGuard Component
 * Redirects users who haven't completed onboarding
 */

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FullPageLoading } from "@/features/auth";

type OnboardingGuardProps = {
    children: ReactNode;
    /** If true, allows users to skip/bypass onboarding check */
    allowIncomplete?: boolean;
    /** Custom redirect path (defaults to /onboarding) */
    redirectTo?: string;
};

/**
 * Wraps content and redirects to onboarding if not completed
 */
export function OnboardingGuard({
    children,
    allowIncomplete = false,
    redirectTo = "/onboarding",
}: OnboardingGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const user = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );

    const isLoading = !authLoaded || (isSignedIn && user === undefined);
    const needsOnboarding = user !== null && user?.onboardingCompleted !== true;
    const isOnOnboardingPage = pathname?.startsWith("/onboarding");

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // Skip if not signed in (auth will handle redirect)
        if (!isSignedIn) return;

        // Skip if allowing incomplete
        if (allowIncomplete) return;

        // Skip if already on onboarding page (prevent infinite loop)
        if (isOnOnboardingPage) return;

        // Redirect to onboarding if needed
        if (needsOnboarding) {
            router.push(redirectTo);
        }
    }, [isLoading, isSignedIn, needsOnboarding, allowIncomplete, redirectTo, router, isOnOnboardingPage]);

    // Show loading while checking
    if (isLoading) {
        return <FullPageLoading />;
    }

    // Redirect in progress (but not if already on onboarding)
    if (!allowIncomplete && needsOnboarding && !isOnOnboardingPage) {
        return <FullPageLoading />;
    }

    return <>{children}</>;
}

/**
 * Hook to check if onboarding is needed
 */
export function useOnboardingStatus() {
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const user = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );

    const isLoading = !authLoaded || (isSignedIn && user === undefined);
    const isComplete = user?.onboardingCompleted === true;
    const currentStep = user?.onboardingStep ?? 0;

    return {
        isLoading,
        isComplete,
        needsOnboarding: !isLoading && isSignedIn && !isComplete,
        currentStep,
        user,
    };
}
