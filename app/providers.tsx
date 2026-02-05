/**
 * Providers Component
 * 
 * Wraps the app with Clerk and Convex providers.
 * 
 * IMPORTANT: This is a client component because ClerkProvider requires hooks.
 * However, it does NOT do any auth checking - that's handled by middleware.
 */

"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { AuthSyncProvider } from "@/features/auth";
import { useRouter } from "next/navigation";

// Validate required environment variables at build time
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CONVEX_URL) {
    throw new Error(
        "Missing NEXT_PUBLIC_CONVEX_URL environment variable.\n" +
        "Please add it to your .env.local file.\n" +
        "Run 'npx convex dev' to get your Convex URL."
    );
}

if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error(
        "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.\n" +
        "Please add it to your .env.local file.\n" +
        "Get your key from: https://dashboard.clerk.com"
    );
}

if (!CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
    throw new Error(
        "Invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format.\n" +
        "Publishable keys should start with 'pk_test_' or 'pk_live_'."
    );
}

// Create Convex client once (singleton)
const convex = new ConvexReactClient(CONVEX_URL);

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/onboarding"
            afterSignOutUrl="/"
            appearance={{
                variables: {
                    colorPrimary: "#10b981",
                },
            }}
            // Required for handling post-login navigation
            routerPush={(to) => router.push(to)}
            routerReplace={(to) => router.replace(to)}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <AuthSyncProvider>
                    {children}
                </AuthSyncProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
