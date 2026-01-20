/**
 * Convex Query and Mutation Functions - Mentors
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

/**
 * Get all mentors with user enrichment
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
                    avatarUrl: user?.avatarUrl,
                };
            }),
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
            }),
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
            }),
        );

        // Filter by search term
        if (args.searchTerm) {
            const term = args.searchTerm.toLowerCase();
            mentors = enrichedMentors.filter(
                (mentor) =>
                    mentor.name.toLowerCase().includes(term) ||
                    mentor.role.toLowerCase().includes(term) ||
                    mentor.company.toLowerCase().includes(term),
            );
        } else {
            mentors = enrichedMentors;
        }

        // Filter by expertise
        if (args.expertise && args.expertise !== "all") {
            mentors = mentors.filter((mentor) =>
                mentor.expertise.includes(args.expertise!),
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
 * Get top-rated mentors
 */
export const getTopRatedMentors = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;

        const mentors = await ctx.db
            .query("mentors")
            .withIndex("by_rating_verified", (q) => q.eq("isVerified", true))
            .order("desc")
            .take(limit);

        // Enrich with user data
        const enrichedMentors = await Promise.all(
            mentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                    avatarUrl: user?.avatarUrl,
                };
            }),
        );

        return enrichedMentors;
    },
});

/**
 * Get recommended mentors based on user skills and interests
 */
export const getRecommendedMentors = query({
    args: {
        userId: v.optional(v.id("users")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 6;

        // If userId provided, get user's skills and interests for matching
        let userSkills: string[] = [];
        let userInterests: string[] = [];

        if (args.userId) {
            const user = await ctx.db.get(args.userId);
            if (user) {
                userSkills = user.skills || [];
                userInterests = user.interests || [];
            }
        }

        // Get all verified mentors
        const allMentors = await ctx.db
            .query("mentors")
            .withIndex("by_is_verified", (q) => q.eq("isVerified", true))
            .filter((q) => q.eq(q.field("isAvailableForNewMentees"), true))
            .collect();

        // Score mentors based on expertise match
        const scoredMentors = allMentors.map((mentor) => {
            let score = 0;

            // Match expertise with user skills
            const expertiseMatch = (mentor.expertise || []).filter((exp) =>
                [...userSkills, ...userInterests].some(
                    (skill) =>
                        exp.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(exp.toLowerCase()),
                ),
            ).length;

            score += expertiseMatch * 3;

            // Boost highly-rated mentors
            score += mentor.rating;

            // Boost mentors with free sessions for new users
            if (mentor.offersFreeSession) {
                score += 2;
            }

            // Boost mentors with high acceptance rate
            if (mentor.acceptanceRate && mentor.acceptanceRate > 80) {
                score += 1;
            }

            return { ...mentor, matchScore: score };
        });

        // Sort by score and take top results
        const topMentors = scoredMentors
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        // Enrich with user data
        const enrichedMentors = await Promise.all(
            topMentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                    avatarUrl: user?.avatarUrl,
                };
            }),
        );

        return enrichedMentors;
    },
});

/**
 * Get mentors by specific expertise
 */
export const getMentorsByExpertise = query({
    args: {
        expertise: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 20;

        // Get all verified mentors and filter by expertise
        const allMentors = await ctx.db
            .query("mentors")
            .filter((q) => q.eq(q.field("isVerified"), true))
            .collect();

        // Filter mentors that have the requested expertise
        const mentors = allMentors
            .filter((mentor) =>
                (mentor.expertise || []).some((exp) =>
                    exp.toLowerCase().includes(args.expertise.toLowerCase()),
                ),
            )
            .slice(0, limit);

        // Enrich with user data
        const enrichedMentors = await Promise.all(
            mentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                    avatarUrl: user?.avatarUrl,
                };
            }),
        );

        return enrichedMentors;
    },
});

/**
 * Get similar mentors based on expertise and industry
 */
export const getSimilarMentors = query({
    args: {
        mentorId: v.id("mentors"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 4;

        const currentMentor = await ctx.db.get(args.mentorId);
        if (!currentMentor) return [];

        // Get all mentors except current one
        const allMentors = await ctx.db
            .query("mentors")
            .filter((q) => q.neq(q.field("_id"), args.mentorId))
            .filter((q) => q.eq(q.field("isVerified"), true))
            .collect();

        // Score based on similarity
        const scoredMentors = allMentors.map((mentor) => {
            let score = 0;

            // Match expertise
            const expertiseMatch = (mentor.expertise || []).filter((exp) =>
                (currentMentor.expertise || []).includes(exp),
            ).length;
            score += expertiseMatch * 3;

            // Match industry
            if (
                mentor.industry &&
                currentMentor.industry &&
                mentor.industry === currentMentor.industry
            ) {
                score += 2;
            }

            // Match specializations
            const specializationMatch = (mentor.specializations || []).filter(
                (spec) => (currentMentor.specializations || []).includes(spec),
            ).length;
            score += specializationMatch * 2;

            return { ...mentor, matchScore: score };
        });

        // Sort by score and take top results
        const topMentors = scoredMentors
            .filter((m) => m.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        // Enrich with user data
        const enrichedMentors = await Promise.all(
            topMentors.map(async (mentor) => {
                const user = await ctx.db.get(mentor.userId);
                return {
                    ...mentor,
                    name: user?.name || "Unknown",
                    email: user?.email,
                    avatarUrl: user?.avatarUrl,
                };
            }),
        );

        return enrichedMentors;
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
