"use client";

/**
 * AuthSyncProvider Component
 * 
 * Ensures the authenticated Clerk user is synced to Convex database.
 * This is a fallback mechanism - the primary sync happens via Clerk webhooks.
 * 
 * IMPORTANT: This component does NOT handle routing or redirects.
 * Route protection is handled by middleware.ts
 */

import { useEffect, useRef, ReactNode, createContext, useContext, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useCurrentUser, useUpsertUser, type Doc } from "../api";

// ============================================
// TYPES
// ============================================

type ConvexAuthContextValue = {
    /** Whether auth state is still loading */
    isLoading: boolean;
    /** Whether user is authenticated (signed in and exists in Convex) */
    isAuthenticated: boolean;
    /** Whether user needs to complete onboarding */
    needsOnboarding: boolean;
    /** The Clerk user ID */
    clerkUserId: string | null;
    /** The Convex user document */
    user: Doc<"users"> | null | undefined;
    /** Role helpers */
    isJobSeeker: boolean;
    isMentor: boolean;
    isEmployer: boolean;
};

// ============================================
// CONTEXT
// ============================================

const ConvexAuthContext = createContext<ConvexAuthContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

type AuthSyncProviderProps = {
    children: ReactNode;
};

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
    const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
    const { user: clerkUser, isLoaded: userLoaded } = useUser();

    // Convex hooks from auth api layer
    const upsertUser = useUpsertUser();
    const convexUser = useCurrentUser();

    // Track if we've synced this session
    const hasSyncedRef = useRef(false);
    const syncingRef = useRef(false);

    // Sync user to Convex when authenticated
    useEffect(() => {
        // Reset sync flag when user signs out
        if (!isSignedIn) {
            hasSyncedRef.current = false;
            return;
        }

        // Skip if already synced this session
        if (hasSyncedRef.current) return;

        // Skip if currently syncing
        if (syncingRef.current) return;

        // Wait for all data to load
        if (!authLoaded || !userLoaded || !clerkUser) return;

        // Wait for Convex query to resolve
        if (convexUser === undefined) return;

        // If user already exists in Convex, mark as synced
        if (convexUser !== null) {
            hasSyncedRef.current = true;
            return;
        }

        // User is signed in but doesn't exist in Convex - create them
        const syncUser = async () => {
            syncingRef.current = true;

            try {
                const email = clerkUser.primaryEmailAddress?.emailAddress;
                if (!email) {
                    console.error("[AuthSync] No email found for user");
                    return;
                }

                await upsertUser({
                    clerkId: clerkUser.id,
                    email,
                    name: clerkUser.fullName || clerkUser.firstName || email.split("@")[0],
                    avatarUrl: clerkUser.imageUrl,
                });

                hasSyncedRef.current = true;
                console.log("[AuthSync] User synced to Convex:", clerkUser.id);
            } catch (error) {
                console.error("[AuthSync] Failed to sync user:", error);
            } finally {
                syncingRef.current = false;
            }
        };

        syncUser();
    }, [authLoaded, userLoaded, isSignedIn, clerkUser, convexUser, upsertUser]);

    // Compute auth context value
    const contextValue = useMemo<ConvexAuthContextValue>(() => {
        const isLoading = !authLoaded || !userLoaded || (isSignedIn && convexUser === undefined);
        const isAuthenticated = isSignedIn === true && convexUser !== null && convexUser !== undefined;
        const needsOnboarding = isAuthenticated && convexUser?.onboardingStatus !== "completed";

        return {
            isLoading,
            isAuthenticated,
            needsOnboarding,
            clerkUserId: userId ?? null,
            user: convexUser,
            isJobSeeker: convexUser?.role === "job_seeker",
            isMentor: convexUser?.role === "mentor",
            isEmployer: convexUser?.role === "employer",
        };
    }, [authLoaded, userLoaded, isSignedIn, userId, convexUser]);

    return (
        <ConvexAuthContext.Provider value={contextValue}>
            {children}
        </ConvexAuthContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to get combined auth state from Clerk and Convex
 * 
 * Usage:
 * ```tsx
 * const { isLoading, isAuthenticated, user, needsOnboarding } = useConvexAuth();
 * ```
 */
export function useConvexAuth(): ConvexAuthContextValue {
    const context = useContext(ConvexAuthContext);

    if (!context) {
        throw new Error("useConvexAuth must be used within AuthSyncProvider");
    }

    return context;
}
