/**
 * Providers Component
 * 
 * Wraps the app with Clerk and Convex providers
 * Must be a client component to use hooks
 */

"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { AuthSyncProvider } from "@/features/auth";

// Validate required environment variables
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
        "Get your key from: https://dashboard.clerk.com\n" +
        "See docs/CONVEX-CLERK-SETUP.md for setup instructions."
    );
}

if (!CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
    throw new Error(
        "Invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format.\n" +
        "Publishable keys should start with 'pk_test_' or 'pk_live_'.\n" +
        "Check your .env.local file and verify you copied the correct key."
    );
}

const convex = new ConvexReactClient(CONVEX_URL);

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider
            publishableKey={CLERK_PUBLISHABLE_KEY}
            appearance={{
                variables: {
                    colorPrimary: "#10b981", // Green to match NextStep branding
                },
            }}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <AuthSyncProvider>
                    {children}
                </AuthSyncProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
