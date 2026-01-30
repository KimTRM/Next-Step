"use client";

/**
 * Platform Layout Client Component
 * Handles onboarding guard logic on the client side
 */

import { OnboardingGuard } from "@/features/onboarding";

export function PlatformLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <OnboardingGuard>
            {children}
        </OnboardingGuard>
    );
}
