/**
 * Mentor Mutations
 * Create, update, and manage mentor profiles and sessions
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create mentor profile
 */
export const createMentor = mutation({
    args: {
        role: v.string(),
        company: v.string(),
        location: v.string(),
        expertise: v.array(v.string()),
        yearsOfExperience: v.number(),
        bio: v.string(),
        availability: v.string(),
        hourlyRate: v.optional(v.number()),
        currency: v.optional(v.string()),
        timezone: v.optional(v.string()),
        languages: v.optional(v.array(v.string())),
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),
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
            rating: 0, // Start with no rating
            totalReviews: 0,
            mentees: 0,
            sessionsCompleted: 0,
            isVerified: false, // Requires admin verification
            isAvailableForNewMentees: true,
            createdAt: Date.now(),
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
        specializations: v.optional(v.array(v.string())),
        yearsOfExperience: v.optional(v.number()),
        bio: v.optional(v.string()),
        longBio: v.optional(v.string()),
        tagline: v.optional(v.string()),
        availability: v.optional(v.string()),
        availableDays: v.optional(v.array(v.string())),
        hourlyRate: v.optional(v.number()),
        currency: v.optional(v.string()),
        offersFreeSession: v.optional(v.boolean()),
        timezone: v.optional(v.string()),
        languages: v.optional(v.array(v.string())),
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),
        twitterUrl: v.optional(v.string()),
        mentoringStyle: v.optional(v.array(v.string())),
        focusAreas: v.optional(v.array(v.string())),
        isAvailableForNewMentees: v.optional(v.boolean()),
        maxMentees: v.optional(v.number()),
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

        await ctx.db.patch(mentorId, {
            ...updates,
            updatedAt: Date.now(),
        });
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
            verifiedAt: args.isVerified ? Date.now() : undefined,
        });
    },
});

/**
 * Book mentorship session
 */
export const bookSession = mutation({
    args: {
        mentorId: v.id("mentors"),
        topic: v.string(),
        scheduledDate: v.number(),
        duration: v.number(),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated to book a session");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            throw new Error("Mentor not found");
        }

        if (!mentor.isAvailableForNewMentees) {
            throw new Error("Mentor is not accepting new mentees");
        }

        // Create mentorship session
        const sessionId = await ctx.db.insert("mentorshipSessions", {
            mentorId: mentor.userId,
            studentId: user._id,
            topic: args.topic,
            scheduledDate: args.scheduledDate,
            duration: args.duration,
            status: "scheduled",
        });

        // TODO: Send notification/message to mentor

        return sessionId;
    },
});

/**
 * Send connection request to mentor
 */
export const sendConnectionRequest = mutation({
    args: {
        mentorId: v.id("mentors"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            throw new Error("Mentor not found");
        }

        // Create message to mentor
        const messageId = await ctx.db.insert("messages", {
            senderId: user._id,
            receiverId: mentor.userId,
            content: args.message,
            timestamp: Date.now(),
            read: false,
        });

        return messageId;
    },
});
