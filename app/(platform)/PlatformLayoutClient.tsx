"use client";

/**
 * Platform Layout Client Component
 * Handles onboarding guard logic on the client side
 */

import { usePathname } from "next/navigation";
import { OnboardingGuard } from "@/features/onboarding";
import { MobileBottomNav } from "@/shared/components/layout/MobileBottomNav";

export function PlatformLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide nav during onboarding flow (welcome + onboarding steps 1-4)
    const isOnboardingFlow = pathname === "/welcome" || pathname?.startsWith("/test-onboarding");

    return (
        <OnboardingGuard>
            <div className={isOnboardingFlow ? "" : "pb-16 md:pb-0"}>
                {children}
            </div>

            {!isOnboardingFlow && <MobileBottomNav />}
        </OnboardingGuard>
    );
}
