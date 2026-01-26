/**
 * User Mutations
 * Create, update, and manage user profiles
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { calculateProfileCompletion } from "./helpers";

/**
 * Create or update user (upsert)
 * Called from Clerk webhook when user signs up/updates
 */
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.optional(
            v.union(
                v.literal("student"),
                v.literal("mentor"),
                v.literal("employer"),
            ),
        ),
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
 * Recalculates profile completion after update
 */
export const updateUserProfile = mutation({
    args: {
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
        age: v.optional(v.number()),
        skills: v.optional(v.array(v.string())),
        interests: v.optional(v.array(v.string())),
        careerGoals: v.optional(v.string()),
        lookingFor: v.optional(v.array(v.string())),
        timeline: v.optional(v.string()),
        educationLevel: v.optional(
            v.union(
                v.literal("high_school"),
                v.literal("undergraduate"),
                v.literal("graduate"),
                v.literal("phd"),
                v.literal("bootcamp"),
                v.literal("self_taught"),
            ),
        ),
        currentStatus: v.optional(v.string()),
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),
        role: v.optional(
            v.union(
                v.literal("student"),
                v.literal("mentor"),
                v.literal("employer"),
            ),
        ),
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

        // Merge existing user data with updates for completion calculation
        const updatedProfile = { ...user, ...args };
        const profileCompletion = calculateProfileCompletion(updatedProfile);

        await ctx.db.patch(user._id, {
            ...args,
            profileCompletion,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Mark onboarding as complete
 */
export const completeOnboarding = mutation({
    args: {},
    handler: async (ctx) => {
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

        await ctx.db.patch(user._id, {
            isOnboardingComplete: true,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Update user with onboarding data
 */
export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        onboardingCompleted: v.boolean(),
        onboardingStep: v.optional(v.number()),
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.number()),
        gender: v.optional(
            v.union(
                v.literal("male"),
                v.literal("female"),
                v.literal("other"),
                v.literal("prefer_not_to_say"),
            ),
        ),
        education: v.optional(
            v.array(
                v.object({
                    institution: v.string(),
                    degree: v.string(),
                    field: v.string(),
                    startDate: v.number(),
                    endDate: v.optional(v.number()),
                    isCurrent: v.boolean(),
                }),
            ),
        ),
        skills: v.optional(v.array(v.string())),
        interests: v.optional(v.array(v.string())),
        workStyles: v.optional(
            v.array(
                v.union(
                    v.literal("remote"),
                    v.literal("hybrid"),
                    v.literal("onsite"),
                    v.literal("flexible"),
                ),
            ),
        ),
        careerGoals: v.optional(v.string()),
        targetIndustries: v.optional(v.array(v.string())),
        targetRoles: v.optional(v.array(v.string())),
        salaryExpectation: v.optional(v.string()),
        availability: v.optional(
            v.union(
                v.literal("immediately"),
                v.literal("within_1_month"),
                v.literal("within_3_months"),
                v.literal("within_6_months"),
                v.literal("just_exploring"),
            ),
        ),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Remove clerkId from args as it's not part of the update
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { clerkId, ...updateData } = args;

        await ctx.db.patch(user._id, updateData);
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
