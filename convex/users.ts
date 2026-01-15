/**
 * Convex Query Functions - Users
 * 
 * Query operations for user data (read-only)
 */

import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all users with optional filtering
 */
export const getAllUsers = query({
  args: {
    role: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();

    // Filter by role
    if (args.role) {
      users = users.filter((user) => user.role === args.role);
    }

    // Search by name or email
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    return users;
  },
});

/**
 * Get a single user by ID
 */
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get user by Clerk ID
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Get current user (authenticated)
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
