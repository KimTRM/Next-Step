import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createApplication = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
    coverLetter: v.string(),
    resumeUrl: v.string(),
    status: v.union(
        v.literal("pending"),
        v.literal("reviewing"),
        v.literal("interview"),
        v.literal("rejected"),
        v.literal("accepted"),
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already applied to this job
    const existingApplication = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId_userId", (q) => 
        q.eq("jobId", args.jobId).eq("userId", args.userId)
      )
      .first();

    if (existingApplication) {
      throw new Error("User has already applied to this job");
    }

    // Create the application
    const applicationId = await ctx.db.insert("jobApplications", {
      jobId: args.jobId,
      userId: args.userId,
      coverLetter: args.coverLetter,
      resumeUrl: args.resumeUrl,
      status: args.status,
      appliedDate: Date.now(),
    });

    // Increment the job's applicant count
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        applicants: (job.applicants || 0) + 1,
      });
    }

    return applicationId;
  },
});

export const deleteApplication = mutation({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the application
    const application = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId_userId", (q) => 
        q.eq("jobId", args.jobId).eq("userId", args.userId)
      )
      .first();

    if (!application) {
      throw new Error("Application not found");
    }

    // Delete the application
    await ctx.db.delete(application._id);

    // Decrement the job's applicant count
    const job = await ctx.db.get(args.jobId);
    if (job && job.applicants && job.applicants > 0) {
      await ctx.db.patch(args.jobId, {
        applicants: job.applicants - 1,
      });
    }

    return application._id;
  },
});

export const getUserApplications = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("jobApplications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return applications;
  },
});

export const checkUserApplied = query({
  args: {
    jobId: v.id("jobs"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId_userId", (q) => 
        q.eq("jobId", args.jobId).eq("userId", args.userId)
      )
      .first();

    return !!application;
  },
});
