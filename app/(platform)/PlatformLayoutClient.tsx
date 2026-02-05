"use client";

/**
 * Platform Layout Client Component
 * 
 * Provides mobile navigation for platform pages.
 * 
 * IMPORTANT: 
 * - Route protection is handled by middleware.ts
 * - Onboarding redirect is handled by OnboardingRedirect component (if needed)
 */

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/shared/components/layout/MobileBottomNav";
import { OnboardingRedirect } from "@/features/onboarding";

export function PlatformLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide nav during onboarding flow
    const isOnboardingFlow = pathname === "/welcome" || pathname?.startsWith("/onboarding");

    return (
        <>
            {/* Only redirect to onboarding if not already on onboarding pages */}
            {!isOnboardingFlow && <OnboardingRedirect />}

            <div className={isOnboardingFlow ? "" : "pb-16 md:pb-0"}>
                {children}
            </div>

            {!isOnboardingFlow && <MobileBottomNav />}
        </>
    );
}
