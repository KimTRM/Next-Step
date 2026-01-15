/**
 * Convex Query and Mutation Functions - Mentors
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all mentors
 */
export const getAllMentors = query({
    args: {},
    handler: async (ctx) => {
        const mentors = await ctx.db.query("mentors").collect();

        // Enrich with user data
        const enrichedMentors = await Promise.all(
            mentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                };
            })
        );

        return enrichedMentors;
    },
});

/**
 * Get verified mentors
 */
export const getVerifiedMentors = query({
    args: {},
    handler: async (ctx) => {
        const mentors = await ctx.db
            .query("mentors")
            .withIndex("by_is_verified", (q) => q.eq("isVerified", true))
            .collect();

        const enrichedMentors = await Promise.all(
            mentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                };
            })
        );

        return enrichedMentors;
    },
});

/**
 * Get mentor by ID
 */
export const getMentorById = query({
    args: { mentorId: v.id("mentors") },
    handler: async (ctx, args) => {
        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) return null;

        const user = await ctx.db.get(mentor.userId);
        return {
            ...mentor,
            name: user?.name || "Unknown",
            email: user?.email,
        };
    },
});

/**
 * Search mentors
 */
export const searchMentors = query({
    args: {
        searchTerm: v.string(),
        expertise: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let mentors = await ctx.db.query("mentors").collect();

        // Enrich with user data first
        const enrichedMentors = await Promise.all(
            mentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                };
            })
        );

        // Filter by search term
        if (args.searchTerm) {
            const term = args.searchTerm.toLowerCase();
            mentors = enrichedMentors.filter(
                (mentor) =>
                    mentor.name.toLowerCase().includes(term) ||
                    mentor.role.toLowerCase().includes(term) ||
                    mentor.company.toLowerCase().includes(term)
            );
        } else {
            mentors = enrichedMentors;
        }

        // Filter by expertise
        if (args.expertise && args.expertise !== "all") {
            mentors = mentors.filter((mentor) =>
                mentor.expertise.includes(args.expertise!)
            );
        }

        return mentors;
    },
});

/**
 * Create mentor profile
 */
export const createMentor = mutation({
    args: {
        role: v.string(),
        company: v.string(),
        location: v.string(),
        expertise: v.array(v.string()),
        experience: v.string(),
        bio: v.string(),
        availability: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated to become a mentor");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Check if mentor profile already exists
        const existingMentor = await ctx.db
            .query("mentors")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        if (existingMentor) {
            throw new Error("Mentor profile already exists");
        }

        return await ctx.db.insert("mentors", {
            ...args,
            userId: user._id,
            rating: 4.5, // Default starting rating
            mentees: 0,
            isVerified: false, // Requires admin verification
        });
    },
});

/**
 * Update mentor profile
 */
export const updateMentor = mutation({
    args: {
        mentorId: v.id("mentors"),
        role: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        expertise: v.optional(v.array(v.string())),
        experience: v.optional(v.string()),
        bio: v.optional(v.string()),
        availability: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { mentorId, ...updates } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const mentor = await ctx.db.get(mentorId);
        if (!mentor) {
            throw new Error("Mentor not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || mentor.userId !== user._id) {
            throw new Error("Not authorized to update this mentor profile");
        }

        await ctx.db.patch(mentorId, updates);
    },
});

/**
 * Update mentor rating
 */
export const updateMentorRating = mutation({
    args: {
        mentorId: v.id("mentors"),
        rating: v.number(),
    },
    handler: async (ctx, args) => {
        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            throw new Error("Mentor not found");
        }

        await ctx.db.patch(args.mentorId, {
            rating: args.rating,
        });
    },
});

/**
 * Increment mentee count
 */
export const incrementMentees = mutation({
    args: { mentorId: v.id("mentors") },
    handler: async (ctx, args) => {
        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            throw new Error("Mentor not found");
        }

        await ctx.db.patch(args.mentorId, {
            mentees: mentor.mentees + 1,
        });
    },
});

/**
 * Verify mentor (admin only)
 */
export const verifyMentor = mutation({
    args: {
        mentorId: v.id("mentors"),
        isVerified: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        // TODO: Add admin role check here

        await ctx.db.patch(args.mentorId, {
            isVerified: args.isVerified,
        });
    },
});
