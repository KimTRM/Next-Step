"use client";

/**
 * AuthSyncProvider Component
 * Ensures user is synced to Convex when authenticated
 * Acts as a fallback if webhook doesn't create the user
 */

import { useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type AuthSyncProviderProps = {
    children: ReactNode;
};

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();
    const router = useRouter();
    const upsertUser = useMutation(api.users.index.upsertUser);
    const convexUser = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );
    const hasSynced = useRef(false);

    useEffect(() => {
        // Only sync once per session
        if (hasSynced.current) return;

        // Wait for auth and user to load
        if (!authLoaded || !userLoaded) return;

        // Only sync if signed in
        if (!isSignedIn || !user) return;

        // Check if user already exists in Convex
        // convexUser will be null if user doesn't exist, undefined if loading
        if (convexUser === undefined) return;

        // If user already exists, no need to sync
        if (convexUser !== null) {
            hasSynced.current = true;
            return;
        }

        // User is signed in but doesn't exist in Convex - create them
        const syncUser = async () => {
            try {
                const email = user.primaryEmailAddress?.emailAddress;
                if (!email) {
                    console.error("No email found for user");
                    return;
                }

                await upsertUser({
                    clerkId: user.id,
                    email,
                    name: user.fullName || user.firstName || email.split("@")[0],
                    avatarUrl: user.imageUrl,
                });

                hasSynced.current = true;
            } catch (error) {
                console.error("Error syncing user to Convex:", error);
            }
        };

        syncUser();
    }, [authLoaded, userLoaded, isSignedIn, user, convexUser, upsertUser]);

    // If Clerk reports not signed in but a server session cookie exists,
    // trigger a router refresh to allow ClerkProvider to rehydrate client state.
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            // Only attempt once per page load
            if (hasSynced.current) return;

            if (authLoaded && !isSignedIn) {
                const hasSessionCookie = document.cookie.includes("__session=");
                if (hasSessionCookie) {
                    console.warn(
                        "AuthSyncProvider: detected server session cookie but Clerk reports not signed in. Refreshing router to resync client auth state.",
                    );
                    hasSynced.current = true;
                    // Use Next router refresh to re-run server components / middleware
                    void router.refresh();
                }
            }
        } catch (e) {
            // Non-fatal - ignore
            console.error("AuthSyncProvider: refresh check failed:", e);
        }
    }, [authLoaded, isSignedIn, router]);

    return <>{children}</>;
}

/**
 * Hook to get combined auth state from Clerk and Convex
 */
export function useConvexAuth() {
    const { isLoaded: authLoaded, isSignedIn, userId } = useAuth();
    const { user: clerkUser, isLoaded: userLoaded } = useUser();
    const convexUser = useQuery(
        api.users.index.getCurrentUser,
        authLoaded && isSignedIn ? {} : "skip"
    );
    const convexSession = useQuery(
        api.users.index.getCurrentSession,
        authLoaded && isSignedIn ? {} : "skip"
    );

    const isLoading = !authLoaded || !userLoaded || (isSignedIn && convexUser === undefined);
    const isAuthenticated = isSignedIn === true && convexUser !== null;
    const needsOnboarding = isAuthenticated && convexUser?.isOnboardingComplete !== true;

    return {
        // Auth state
        isLoading,
        isAuthenticated,
        needsOnboarding,

        // Clerk data
        clerkUserId: userId,
        clerkUser,

        // Convex data
        user: convexUser,
        session: convexSession,

        // Role helpers
        isJobSeeker: convexUser?.role === "job_seeker",
        isMentor: convexUser?.role === "mentor",
        isEmployer: convexUser?.role === "employer",
    };
}
