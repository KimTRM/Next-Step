"use client";

/**
 * OnboardingRedirect Component
 * 
 * Lightweight component that redirects users to onboarding if they haven't completed it.
 * This does NOT block rendering - it only triggers a redirect in the background.
 * 
 * IMPORTANT: Route protection (auth check) is handled by middleware.
 * This component only handles the onboarding redirect for authenticated users.
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useConvexAuth } from "@/features/auth";

export function OnboardingRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoading, isAuthenticated, user } = useConvexAuth();

    useEffect(() => {
        // Wait for auth to load
        if (isLoading) return;

        // Skip if not authenticated (middleware handles this)
        if (!isAuthenticated || !user) return;

        // Get onboarding status
        const onboardingStatus = user.onboardingStatus ?? "not_started";

        // Skip if onboarding is complete
        if (onboardingStatus === "completed") return;

        // Skip if already on onboarding pages
        if (pathname?.startsWith("/onboarding") || pathname === "/welcome") return;

        // Redirect to onboarding
        router.replace("/onboarding");
    }, [isLoading, isAuthenticated, user, pathname, router]);

    // This component doesn't render anything
    return null;
}
