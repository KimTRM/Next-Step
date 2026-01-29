"use client";

/**
 * Platform Layout
 * Wraps all protected platform routes with onboarding check
 */

import { OnboardingGuard } from "@/features/onboarding";

export default function PlatformLayout({
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
