"use client";

/**
 * AuthSyncProvider Component
 * Ensures user is synced to Convex when authenticated
 * Acts as a fallback if webhook doesn't create the user
 */

import { useEffect, useRef, ReactNode } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type AuthSyncProviderProps = {
    children: ReactNode;
};

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
    const { isLoaded: authLoaded, isSignedIn } = useAuth();
    const { user, isLoaded: userLoaded } = useUser();
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
                console.log("User synced to Convex");
            } catch (error) {
                console.error("Error syncing user to Convex:", error);
            }
        };

        syncUser();
    }, [authLoaded, userLoaded, isSignedIn, user, convexUser, upsertUser]);

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
        isStudent: convexUser?.role === "student",
        isMentor: convexUser?.role === "mentor",
        isEmployer: convexUser?.role === "employer",
    };
}
