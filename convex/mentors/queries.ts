/**
 * Mentor Queries
 * Retrieve and search mentor profiles
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

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
 * Get current user's mentor profile
 */
export const getMentorProfile = query({
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

        const mentor = await ctx.db
            .query("mentors")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .unique();

        if (!mentor) {
            return null;
        }

        return {
            ...mentor,
            name: user.name || "Unknown",
            email: user.email,
        };
    },
});

/**
 * Get mentees for a mentor
 */
export const getMentees = query({
    args: { mentorId: v.id("mentors") },
    handler: async (ctx, args) => {
        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            return [];
        }

        // Get all mentorship sessions for this mentor
        const sessions = await ctx.db
            .query("mentorshipSessions")
            .filter((q) => q.eq(q.field("mentorId"), mentor.userId))
            .collect();

        // Get unique student IDs
        const studentIds = [...new Set(sessions.map((s) => s.studentId))];

        // Get student details
        const mentees = await Promise.all(
            studentIds.map(async (studentId) => {
                const user = await ctx.db.get(studentId);
                if (!user) return null;

                return {
                    _id: user._id,
                    name: user.name || "Unknown",
                    email: user.email || "",
                    role: user.role || "Student",
                    bio: user.bio,
                    skills: user.skills,
                    location: user.location,
                };
            }),
        );

        return mentees.filter((m) => m !== null);
    },
});

/**
 * Get connection requests for a mentor
 */
export const getConnectionRequests = query({
    args: { mentorId: v.id("mentors") },
    handler: async (ctx, args) => {
        const mentor = await ctx.db.get(args.mentorId);
        if (!mentor) {
            return [];
        }

        // Get all jobs posted by this mentor
        const jobs = await ctx.db
            .query("jobs")
            .filter((q) => q.eq(q.field("postedBy"), mentor.userId))
            .collect();

        const jobIds = jobs.map((j) => j._id);

        // Get all applications for these jobs
        const allApplications = await ctx.db.query("jobApplications").collect();

        const relevantApplications = allApplications.filter((app) =>
            jobIds.includes(app.jobId),
        );

        // Enrich applications with job data
        const enrichedApplications = await Promise.all(
            relevantApplications.map(async (app) => {
                const job = jobs.find((j) => j._id === app.jobId);
                const applicant = await ctx.db.get(app.userId);

                if (!job) return null;

                return {
                    _id: app._id,
                    jobId: app.jobId,
                    userId: app.userId,
                    status: app.status,
                    appliedDate: app.appliedDate,
                    nextStep: app.nextStep,
                    interviewDate: app.interviewDate,
                    notes: app.notes,
                    applicant:
                        applicant ?
                            {
                                name: applicant.name || "Unknown",
                                email: applicant.email,
                                avatarUrl: applicant.avatarUrl,
                            }
                        :   null,
                    job: {
                        _id: job._id,
                        title: job.title,
                        description: job.description,
                        employmentType: job.employmentType,
                        postedDate: job.postedDate,
                        location: job.location,
                    },
                };
            }),
        );

        return enrichedApplications.filter((a) => a !== null);
    },
});
