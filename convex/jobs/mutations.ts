/**
 * Job Mutations
 * Create, update, and manage job listings
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a new job listing
 */
export const createJob = mutation({
    args: {
        title: v.string(),
        company: v.string(),
        description: v.string(),
        employmentType: v.union(
            v.literal("full-time"),
            v.literal("part-time"),
            v.literal("contract"),
            v.literal("internship"),
            v.literal("temporary"),
        ),
        location: v.string(),
        locationType: v.union(
            v.literal("on-site"),
            v.literal("remote"),
            v.literal("hybrid"),
        ),
        minSalary: v.optional(v.number()),
        maxSalary: v.optional(v.number()),
        salaryCurrency: v.optional(v.string()),
        salaryPeriod: v.optional(
            v.union(v.literal("hour"), v.literal("month"), v.literal("year")),
        ),
        requiredSkills: v.array(v.string()),
        experienceLevel: v.union(
            v.literal("entry"),
            v.literal("mid"),
            v.literal("senior"),
            v.literal("lead"),
            v.literal("executive"),
        ),
        education: v.optional(
            v.union(
                v.literal("high_school"),
                v.literal("associate"),
                v.literal("bachelor"),
                v.literal("master"),
                v.literal("phd"),
                v.literal("none"),
            ),
        ),
        applicationDeadline: v.optional(v.number()),
        applicationUrl: v.optional(v.string()),
        howToApply: v.optional(v.string()),
        expiresDate: v.optional(v.number()),
        companyLogo: v.optional(v.string()),
        companyWebsite: v.optional(v.string()),
        industry: v.optional(v.string()),
        jobCategory: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        postedBy: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Validation
        if (!args.title || args.title.length < 3) {
            throw new Error("Job title must be at least 3 characters");
        }

        if (!args.company || args.company.length < 2) {
            throw new Error("Company name must be at least 2 characters");
        }

        if (!args.description || args.description.length < 50) {
            throw new Error("Job description must be at least 50 characters");
        }

        if (args.description.length > 5000) {
            throw new Error("Job description cannot exceed 5000 characters");
        }

        if (args.requiredSkills.length === 0) {
            throw new Error("At least one required skill must be specified");
        }

        // Validate salary range if both provided
        if (
            args.minSalary &&
            args.maxSalary &&
            args.minSalary > args.maxSalary
        ) {
            throw new Error(
                "Minimum salary cannot be greater than maximum salary",
            );
        }

        // Validate application URL if provided
        if (args.applicationUrl && !args.applicationUrl.startsWith("http")) {
            throw new Error("Application URL must be a valid URL");
        }

        // Create job
        const jobId = await ctx.db.insert("jobs", {
            title: args.title,
            company: args.company,
            description: args.description,
            employmentType: args.employmentType,
            location: args.location,
            locationType: args.locationType,
            minSalary: args.minSalary,
            maxSalary: args.maxSalary,
            salaryCurrency: args.salaryCurrency,
            salaryPeriod: args.salaryPeriod,
            requiredSkills: args.requiredSkills,
            experienceLevel: args.experienceLevel,
            education: args.education,
            applicationDeadline: args.applicationDeadline,
            applicationUrl: args.applicationUrl,
            howToApply: args.howToApply,
            postedDate: Date.now(),
            expiresDate: args.expiresDate,
            isActive: true,
            views: 0,
            postedBy: args.postedBy,
            companyLogo: args.companyLogo,
            companyWebsite: args.companyWebsite,
            industry: args.industry,
            jobCategory: args.jobCategory,
            tags: args.tags,
        });

        return await ctx.db.get(jobId);
    },
});

/**
 * Update an existing job listing
 */
export const updateJob = mutation({
    args: {
        jobId: v.id("jobs"),
        userId: v.id("users"), // For permission check
        updates: v.object({
            title: v.optional(v.string()),
            company: v.optional(v.string()),
            description: v.optional(v.string()),
            employmentType: v.optional(
                v.union(
                    v.literal("full-time"),
                    v.literal("part-time"),
                    v.literal("contract"),
                    v.literal("internship"),
                    v.literal("temporary"),
                ),
            ),
            location: v.optional(v.string()),
            locationType: v.optional(
                v.union(
                    v.literal("on-site"),
                    v.literal("remote"),
                    v.literal("hybrid"),
                ),
            ),
            minSalary: v.optional(v.number()),
            maxSalary: v.optional(v.number()),
            salaryCurrency: v.optional(v.string()),
            salaryPeriod: v.optional(
                v.union(
                    v.literal("hour"),
                    v.literal("month"),
                    v.literal("year"),
                ),
            ),
            requiredSkills: v.optional(v.array(v.string())),
            experienceLevel: v.optional(
                v.union(
                    v.literal("entry"),
                    v.literal("mid"),
                    v.literal("senior"),
                    v.literal("lead"),
                    v.literal("executive"),
                ),
            ),
            education: v.optional(
                v.union(
                    v.literal("high_school"),
                    v.literal("associate"),
                    v.literal("bachelor"),
                    v.literal("master"),
                    v.literal("phd"),
                    v.literal("none"),
                ),
            ),
            applicationDeadline: v.optional(v.number()),
            applicationUrl: v.optional(v.string()),
            howToApply: v.optional(v.string()),
            expiresDate: v.optional(v.number()),
            companyLogo: v.optional(v.string()),
            companyWebsite: v.optional(v.string()),
            industry: v.optional(v.string()),
            jobCategory: v.optional(v.string()),
            tags: v.optional(v.array(v.string())),
        }),
    },
    handler: async (ctx, args) => {
        // Get existing job
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        // Permission check - only poster can update
        if (job.postedBy !== args.userId) {
            throw new Error(
                "Unauthorized: Only the job poster can update this job",
            );
        }

        // Validation
        if (args.updates.title && args.updates.title.length < 3) {
            throw new Error("Job title must be at least 3 characters");
        }

        if (args.updates.description && args.updates.description.length < 50) {
            throw new Error("Job description must be at least 50 characters");
        }

        if (
            args.updates.description &&
            args.updates.description.length > 5000
        ) {
            throw new Error("Job description cannot exceed 5000 characters");
        }

        if (
            args.updates.requiredSkills &&
            args.updates.requiredSkills.length === 0
        ) {
            throw new Error("At least one required skill must be specified");
        }

        // Validate salary range if both provided
        const minSalary = args.updates.minSalary ?? job.minSalary;
        const maxSalary = args.updates.maxSalary ?? job.maxSalary;
        if (minSalary && maxSalary && minSalary > maxSalary) {
            throw new Error(
                "Minimum salary cannot be greater than maximum salary",
            );
        }

        // Update job
        await ctx.db.patch(args.jobId, args.updates);

        return await ctx.db.get(args.jobId);
    },
});

/**
 * Deactivate a job listing (soft delete)
 */
export const deactivateJob = mutation({
    args: {
        jobId: v.id("jobs"),
        userId: v.id("users"), // For permission check
    },
    handler: async (ctx, args) => {
        // Get existing job
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        // Permission check - only poster can deactivate
        if (job.postedBy !== args.userId) {
            throw new Error(
                "Unauthorized: Only the job poster can deactivate this job",
            );
        }

        // Deactivate job
        await ctx.db.patch(args.jobId, { isActive: false });

        return { success: true, message: "Job deactivated successfully" };
    },
});

/**
 * Reactivate a job listing
 */
export const reactivateJob = mutation({
    args: {
        jobId: v.id("jobs"),
        userId: v.id("users"), // For permission check
    },
    handler: async (ctx, args) => {
        // Get existing job
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        // Permission check - only poster can reactivate
        if (job.postedBy !== args.userId) {
            throw new Error(
                "Unauthorized: Only the job poster can reactivate this job",
            );
        }

        // Reactivate job
        await ctx.db.patch(args.jobId, { isActive: true });

        return { success: true, message: "Job reactivated successfully" };
    },
});

/**
 * Increment view count for a job
 */
export const incrementViews = mutation({
    args: {
        jobId: v.id("jobs"),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);
        if (!job) {
            throw new Error("Job not found");
        }

        await ctx.db.patch(args.jobId, {
            views: job.views + 1,
        });

        return { views: job.views + 1 };
    },
});
