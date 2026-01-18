/**
 * User Data Access Layer
 * Handles user database operations
 */

import { queryConvex, api } from "./convex";
import { DALError } from "../types/common.types";
import type { User } from "../types/user.types";
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
}
