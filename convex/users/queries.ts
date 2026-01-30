/**
 * User Queries
 * Retrieve and search user data (read-only)
 */

import { query } from "../_generated/server";
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
                    user.email.toLowerCase().includes(searchLower),
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
 * Returns the full user object for the currently authenticated user
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

/**
 * Get current user session info
 * Returns simplified session data with auth identity
 */
export const getCurrentSession = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            return null;
        }

        return {
            id: identity.subject,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            userId: user._id,
            onboardingStatus: user.onboardingStatus ?? "not_started",
        };
    },
});

/**
 * Get user by ID (public profile only - no sensitive data)
 */
export const getUserByIdPublic = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) return null;

        // Return only public-safe fields
        return {
            _id: user._id,
            _creationTime: user._creationTime,
            name: user.name,
            role: user.role,
            bio: user.bio,
            location: user.location,
            avatarUrl: user.avatarUrl,
            skills: user.skills,
            interests: user.interests,
            careerGoals: user.careerGoals,
            educationLevel: user.educationLevel,
            currentStatus: user.currentStatus,
            linkedInUrl: user.linkedInUrl,
            githubUrl: user.githubUrl,
            portfolioUrl: user.portfolioUrl,
            lookingFor: user.lookingFor,
            profileCompletion: user.profileCompletion,
            // Exclude: email, clerkId, age, timeline, lastSeenAt
        };
    },
});

/**
 * Search users by skills
 * Returns users ranked by number of matching skills
 */
export const searchUsersBySkills = query({
    args: {
        skills: v.array(v.string()),
        role: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let users = await ctx.db.query("users").collect();

        // Filter by role if specified
        if (args.role) {
            users = users.filter((user) => user.role === args.role);
        }

        // Calculate match score and filter users with at least one matching skill
        const usersWithScores = users
            .map((user) => {
                const userSkills = user.skills || [];
                const matchCount = args.skills.filter((skill) =>
                    userSkills.some((userSkill) =>
                        userSkill.toLowerCase().includes(skill.toLowerCase()),
                    ),
                ).length;

                return {
                    user,
                    matchCount,
                };
            })
            .filter((item) => item.matchCount > 0)
            .sort((a, b) => b.matchCount - a.matchCount);

        // Apply limit
        const limitedResults =
            args.limit ? usersWithScores.slice(0, args.limit) : usersWithScores;

        // Return users with match scores
        return limitedResults.map((item) => ({
            ...item.user,
            matchScore: item.matchCount,
        }));
    },
});
