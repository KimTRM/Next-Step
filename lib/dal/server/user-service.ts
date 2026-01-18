/**
 * User Data Access Layer
 * Handles user database operations
 */

import { queryConvex, mutateConvex, api } from "./convex";
import { DALError } from "../types/common.types";
import type {
    User,
    UpdateProfileInput,
    PublicUserProfile,
} from "../types/user.types";
import type { Id } from "@/convex/_generated/dataModel";

export class UserDAL {
    /**
     * Get all users
     */
    static async getAllUsers(params?: {
        role?: string;
        search?: string;
    }): Promise<User[]> {
        try {
            return await queryConvex<User[]>(api.users.getAllUsers, params);
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch users",
                error,
            );
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(id: Id<"users">): Promise<User | null> {
        try {
            return await queryConvex<User | null>(api.users.getUserById, {
                id,
            });
        } catch (error) {
            throw new DALError("DATABASE_ERROR", "Failed to fetch user", error);
        }
    }

    /**
     * Get user by Clerk ID
     */
    static async getUserByClerkId(clerkId: string): Promise<User | null> {
        try {
            return await queryConvex<User | null>(api.users.getUserByClerkId, {
                clerkId,
            });
        } catch (error) {
            throw new DALError("DATABASE_ERROR", "Failed to fetch user", error);
        }
    }

    /**
     * Get public user profile by ID
     * Returns only public-safe fields (excludes sensitive data)
     */
    static async getPublicProfile(
        id: Id<"users">,
    ): Promise<PublicUserProfile | null> {
        try {
            return await queryConvex<PublicUserProfile | null>(
                api.users.getUserByIdPublic,
                { id },
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch public profile",
                error,
            );
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        clerkId: string,
        updates: UpdateProfileInput,
    ): Promise<User> {
        try {
            return await mutateConvex<User>(
                api.userMutations.updateUserProfile,
                { clerkId, updates },
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to update profile",
                error,
            );
        }
    }

    /**
     * Complete onboarding for user
     */
    static async completeOnboarding(clerkId: string): Promise<User> {
        try {
            return await mutateConvex<User>(
                api.userMutations.completeOnboarding,
                { clerkId },
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to complete onboarding",
                error,
            );
        }
    }

    /**
     * Search users by skills
     */
    static async searchBySkills(params: {
        skills: string[];
        role?: string;
        limit?: number;
    }): Promise<PublicUserProfile[]> {
        try {
            return await queryConvex<PublicUserProfile[]>(
                api.users.searchUsersBySkills,
                params,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to search users",
                error,
            );
        }
    }
}
