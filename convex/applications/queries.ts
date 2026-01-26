/**
 * Application Queries
 * Retrieve job application data
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all applications for current user
 */
export const getUserJobApplications = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            return [];
        }

        const applications = await ctx.db
            .query("jobApplications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        // Enrich with job data
        const enrichedApplications = await Promise.all(
            applications.map(async (app) => {
                const job = await ctx.db.get(app.jobId);
                return {
                    ...app,
                    jobTitle: job?.title || "Unknown Position",
                    company: job?.company || "Unknown Company",
                    location: job?.location || "Unknown",
                };
            }),
        );

        return enrichedApplications;
    },
});

/**
 * Get applications for a specific job
 */
export const getJobApplications = query({
    args: { jobId: v.id("jobs") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("jobApplications")
            .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
            .collect();
    },
});
