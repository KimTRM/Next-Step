/**
 * Authentication Data Access Layer
 * Handles Clerk authentication operations
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { DALError } from "../types/common.types";
import type { UserSession, UserRole } from "../types/user.types";

export class AuthDAL {
    /**
     * Get current user ID (returns null if not authenticated)
     */
    static async getCurrentUserId(): Promise<string | null> {
        const { userId } = await auth();
        return userId;
    }

    /**
     * Require authentication (throws if not authenticated)
     */
    static async requireAuth(): Promise<string> {
        const userId = await this.getCurrentUserId();
        if (!userId) {
            throw new DALError("AUTH_REQUIRED", "Authentication required");
        }
        return userId;
    }

    /**
     * Get current user session
     */
    static async getSession(): Promise<UserSession | null> {
        const user = await currentUser();
        if (!user) return null;

        const role = user.publicMetadata?.role as UserRole | undefined;

        return {
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            name:
                `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                "User",
            role: role || "student",
            avatarUrl: user.imageUrl,
        };
    }

    /**
     * Verify user owns a resource
     */
    static verifyOwnership(userId: string, resourceOwnerId: string): void {
        if (userId !== resourceOwnerId) {
            throw new DALError(
                "FORBIDDEN",
                "You do not have permission to access this resource",
            );
        }
    }
}
