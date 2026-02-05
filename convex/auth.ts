/**
 * Convex Auth Utilities
 *
 * Centralized authentication helpers for Convex queries and mutations.
 * Use these to ensure consistent auth checks across the codebase.
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Error thrown when a user is not authenticated
 */
export class AuthenticationError extends Error {
    constructor(message = "Authentication required") {
        super(message);
        this.name = "AuthenticationError";
    }
}

/**
 * Error thrown when a user is not authorized to perform an action
 */
export class AuthorizationError extends Error {
    constructor(message = "You are not authorized to perform this action") {
        super(message);
        this.name = "AuthorizationError";
    }
}

/**
 * Get the authenticated user's Clerk ID from the context
 * Returns null if not authenticated
 */
export async function getClerkUserId(
    ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject ?? null;
}

/**
 * Require authentication - throws if not authenticated
 * Returns the Clerk user ID
 */
export async function requireAuth(
    ctx: QueryCtx | MutationCtx,
): Promise<string> {
    const clerkId = await getClerkUserId(ctx);
    if (!clerkId) {
        throw new AuthenticationError();
    }
    return clerkId;
}

/**
 * Get the current user from the database
 * Returns null if not authenticated or user not found
 */
export async function getCurrentUser(
    ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
    const clerkId = await getClerkUserId(ctx);
    if (!clerkId) {
        return null;
    }

    return await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .unique();
}

/**
 * Require the current user - throws if not authenticated or user not found
 * Returns the full user document
 */
export async function requireUser(
    ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
    const user = await getCurrentUser(ctx);
    if (!user) {
        throw new AuthenticationError("User not found. Please sign in again.");
    }
    return user;
}

/**
 * Require a specific role - throws if user doesn't have the role
 */
export async function requireRole(
    ctx: QueryCtx | MutationCtx,
    allowedRoles: Array<Doc<"users">["role"]>,
): Promise<Doc<"users">> {
    const user = await requireUser(ctx);
    if (!allowedRoles.includes(user.role)) {
        throw new AuthorizationError(
            `This action requires one of these roles: ${allowedRoles.join(", ")}`,
        );
    }
    return user;
}

/**
 * Check if the current user is authenticated (without throwing)
 */
export async function isAuthenticated(
    ctx: QueryCtx | MutationCtx,
): Promise<boolean> {
    const clerkId = await getClerkUserId(ctx);
    return clerkId !== null;
}

/**
 * Check if a user exists in the database by Clerk ID
 */
export async function userExists(
    ctx: QueryCtx | MutationCtx,
    clerkId: string,
): Promise<boolean> {
    const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .unique();
    return user !== null;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(
    ctx: QueryCtx | MutationCtx,
    clerkId: string,
): Promise<Doc<"users"> | null> {
    return await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .unique();
}
