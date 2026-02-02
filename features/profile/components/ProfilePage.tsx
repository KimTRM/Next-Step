"use client";

/**
 * ProfilePage Component
 * Main orchestrator for profile view/edit modes
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useProfile, useUpsertProfile } from "../api";
import { useProfileCompletion } from "../hooks/useProfileCompletion";
import { ProfileViewMode } from "./ProfileViewMode";
import { ProfileEditMode } from "./ProfileEditMode";
import { Button } from "@/shared/components/ui/button";

export function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const currentUser = useProfile();
    const upsertUser = useUpsertProfile();

    const profileCompletion = useProfileCompletion(currentUser ?? null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Create user in Convex if they exist in Clerk but not in our DB
    useEffect(() => {
        const createUser = async () => {
            if (clerkUser && currentUser === null && !isCreatingUser) {
                setIsCreatingUser(true);
                try {
                    await upsertUser({
                        clerkId: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress || "",
                        name: clerkUser.fullName || clerkUser.firstName || "User",
                        avatarUrl: clerkUser.imageUrl,
                    });
                } catch (error) {
                    console.error("Failed to create user:", error);
                    toast.error("Failed to set up profile");
                } finally {
                    setIsCreatingUser(false);
                }
            }
        };
        createUser();
    }, [clerkUser, currentUser, upsertUser, isCreatingUser]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    // Loading state
    if (!mounted || !clerkLoaded || currentUser === undefined) {
        return (
            <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                    <p className="text-lg text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Not signed in
    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center flex-col gap-4">
                <p className="text-lg text-gray-600">Please sign in to view your profile</p>
                <Button asChild>
                    <a href="/auth">Sign In</a>
                </Button>
            </div>
        );
    }

    // User not created yet
    if (currentUser === null) {
        return (
            <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center flex-col gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                <p className="text-lg text-gray-600">Setting up your profile...</p>
                <p className="text-sm text-gray-500">
                    Signed in as {clerkUser.emailAddresses[0]?.emailAddress}
                </p>
                <p className="text-xs text-gray-400">If this persists, try refreshing the page</p>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
                <ProfileEditMode
                    user={currentUser}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                />
            </div>
        );
    }

    // View mode
    return (
        <ProfileViewMode
            user={currentUser}
            profileCompletion={profileCompletion}
            onEditClick={handleEditClick}
        />
    );
}
