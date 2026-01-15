/**
 * Convex Query and Mutation Functions - Jobs
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all active jobs
 */
export const getAllJobs = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("jobs")
            .withIndex("by_is_active", (q) => q.eq("isActive", true))
            .order("desc")
            .collect();
    },
});

/**
 * Get jobs by type
 */
export const getJobsByType = query({
    args: {
        type: v.union(
            v.literal("full-time"),
            v.literal("part-time"),
            v.literal("internship"),
            v.literal("contract")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("jobs")
            .withIndex("by_type", (q) => q.eq("type", args.type))
            .filter((q) => q.eq(q.field("isActive"), true))
            .order("desc")
            .collect();
    },
});

/**
 * Get jobs by category
 */
export const getJobsByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("jobs")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .filter((q) => q.eq(q.field("isActive"), true))
            .order("desc")
            .collect();
    },
});

/**
 * Search jobs
 */
export const searchJobs = query({
    args: {
        searchTerm: v.string(),
        type: v.optional(v.string()),
        category: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let jobs = await ctx.db
            .query("jobs")
            .withIndex("by_is_active", (q) => q.eq("isActive", true))
            .collect();

        // Filter by search term
        if (args.searchTerm) {
            const term = args.searchTerm.toLowerCase();
            jobs = jobs.filter(
                (job) =>
                    job.title.toLowerCase().includes(term) ||
                    job.company.toLowerCase().includes(term) ||
                    job.location.toLowerCase().includes(term)
            );
        }

        // Filter by type
        if (args.type && args.type !== "all") {
            jobs = jobs.filter((job) => job.type === args.type);
        }

        // Filter by category
        if (args.category && args.category !== "all") {
            jobs = jobs.filter((job) => job.category === args.category);
        }

        return jobs;
    },
});

/**
 * Get job by ID
 */
export const getJobById = query({
    args: { jobId: v.id("jobs") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.jobId);
    },
});

/**
 * Create a new job posting
 */
export const createJob = mutation({
    args: {
        title: v.string(),
        company: v.string(),
        location: v.string(),
        type: v.union(
            v.literal("full-time"),
            v.literal("part-time"),
            v.literal("internship"),
            v.literal("contract")
        ),
        category: v.string(),
        salary: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated to create job");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        return await ctx.db.insert("jobs", {
            ...args,
            postedBy: user._id,
            postedDate: Date.now(),
            applicants: 0,
            isActive: true,
        });
    },
});

/**
 * Update job posting
 */
export const updateJob = mutation({
    args: {
        jobId: v.id("jobs"),
        title: v.optional(v.string()),
        company: v.optional(v.string()),
        location: v.optional(v.string()),
        type: v.optional(
            v.union(
                v.literal("full-time"),
                v.literal("part-time"),
                v.literal("internship"),
                v.literal("contract")
            )
        ),
        category: v.optional(v.string()),
        salary: v.optional(v.string()),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { jobId, ...updates } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const job = await ctx.db.get(jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || job.postedBy !== user._id) {
            throw new Error("Not authorized to update this job");
        }

        await ctx.db.patch(jobId, updates);
    },
});

/**
 * Delete job posting (soft delete by marking inactive)
 */
export const deleteJob = mutation({
    args: { jobId: v.id("jobs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || job.postedBy !== user._id) {
            throw new Error("Not authorized to delete this job");
        }

        await ctx.db.patch(args.jobId, { isActive: false });
    },
});

/**
 * Increment applicant count
 */
export const incrementApplicants = mutation({
    args: { jobId: v.id("jobs") },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        await ctx.db.patch(args.jobId, {
            applicants: job.applicants + 1,
        });
    },
});
