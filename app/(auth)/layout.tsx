"use client";

/**
 * Auth Layout
 * Wraps auth-related pages including the welcome page
 * Uses OnboardingGuard to handle routing based on onboarding status
 */

import { OnboardingGuard } from "@/features/onboarding";
import { usePathname } from "next/navigation";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Only apply OnboardingGuard to /welcome route
    // Other auth routes (login, sign-up) don't need onboarding check
    if (pathname === "/welcome") {
        return <OnboardingGuard>{children}</OnboardingGuard>;
    }

    return <>{children}</>;
}
