/**
 * Convex Mutation Functions - User Management
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create or update user (upsert)
 * Called from Clerk webhook when user signs up/updates
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal("student"), v.literal("mentor"), v.literal("employer"))),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        role: args.role || "student",
        avatarUrl: args.avatarUrl,
        createdAt: Date.now(),
      });
      return userId;
    }
  },
});

/**
 * Update user profile
 */
export const updateUserProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    role: v.optional(v.union(v.literal("student"), v.literal("mentor"), v.literal("employer"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, args);
    return user._id;
  },
});

/**
 * Delete user
 */
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
    return true;
  },
});
