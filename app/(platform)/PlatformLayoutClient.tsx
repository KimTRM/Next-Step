"use client";

/**
 * Platform Layout Client Component
 * Handles onboarding guard logic on the client side
 */

import { OnboardingGuard } from "@/features/onboarding";
import { MobileBottomNav } from "@/shared/components/layout/MobileBottomNav";

export function PlatformLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnboardingGuard>
            <div className="pb-16 md:pb-0">
                {children}
            </div>
            <MobileBottomNav />
        </OnboardingGuard>
    );
}
