/**
 * Job Queries
 * Retrieve and search job listings
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get all active jobs with pagination
 */
export const getAllJobs = query({
    args: {
        paginationOpts: v.optional(
            v.object({
                numItems: v.number(),
                cursor: v.union(v.string(), v.null()),
            }),
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Get active jobs sorted by posted date (newest first)
        const jobsQuery = ctx.db
            .query("jobs")
            .withIndex("by_isActive_postedDate", (q) => q.eq("isActive", true))
            .order("desc");

        // Apply pagination if provided
        if (args.paginationOpts) {
            const results = await jobsQuery.paginate(args.paginationOpts);

            // Filter out expired jobs
            const activeJobs = results.page.filter(
                (job) => !job.expiresDate || job.expiresDate > now,
            );

            return {
                ...results,
                page: activeJobs,
            };
        }

        // Without pagination, get all active non-expired jobs
        const allJobs = await jobsQuery.collect();
        return allJobs.filter(
            (job) => !job.expiresDate || job.expiresDate > now,
        );
    },
});

/**
 * Get job by ID with full details
 */
export const getJobById = query({
    args: {
        jobId: v.id("jobs"),
    },
    handler: async (ctx, args) => {
        const job = await ctx.db.get(args.jobId);

        if (!job) {
            return null;
        }

        // Get poster information
        const poster = await ctx.db.get(job.postedBy);

        return {
            ...job,
            poster:
                poster ?
                    {
                        _id: poster._id,
                        name: poster.name,
                        role: poster.role,
                        avatarUrl: poster.avatarUrl,
                    }
                :   null,
        };
    },
});

/**
 * Search jobs with filters
 */
export const searchJobs = query({
    args: {
        searchTerm: v.optional(v.string()),
        skills: v.optional(v.array(v.string())),
        location: v.optional(v.string()),
        employmentType: v.optional(
            v.union(
                v.literal("full-time"),
                v.literal("part-time"),
                v.literal("contract"),
                v.literal("internship"),
                v.literal("temporary"),
            ),
        ),
        experienceLevel: v.optional(
            v.union(
                v.literal("entry"),
                v.literal("mid"),
                v.literal("senior"),
                v.literal("lead"),
                v.literal("executive"),
            ),
        ),
        locationType: v.optional(
            v.union(
                v.literal("on-site"),
                v.literal("remote"),
                v.literal("hybrid"),
            ),
        ),
        minSalary: v.optional(v.number()),
        maxSalary: v.optional(v.number()),
        industry: v.optional(v.string()),
        jobCategory: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Start with active jobs
        let jobs = await ctx.db
            .query("jobs")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        // Filter out expired jobs
        jobs = jobs.filter((job) => !job.expiresDate || job.expiresDate > now);

        // Apply filters
        if (args.employmentType) {
            jobs = jobs.filter(
                (job) => job.employmentType === args.employmentType,
            );
        }

        if (args.experienceLevel) {
            jobs = jobs.filter(
                (job) => job.experienceLevel === args.experienceLevel,
            );
        }

        if (args.locationType) {
            jobs = jobs.filter((job) => job.locationType === args.locationType);
        }

        if (args.location) {
            const locationLower = args.location.toLowerCase();
            jobs = jobs.filter((job) =>
                job.location.toLowerCase().includes(locationLower),
            );
        }

        if (args.industry) {
            jobs = jobs.filter((job) => job.industry === args.industry);
        }

        if (args.jobCategory) {
            jobs = jobs.filter((job) => job.jobCategory === args.jobCategory);
        }

        if (args.minSalary) {
            jobs = jobs.filter((job) =>
                job.maxSalary ? job.maxSalary >= args.minSalary! : true,
            );
        }

        if (args.maxSalary) {
            jobs = jobs.filter((job) =>
                job.minSalary ? job.minSalary <= args.maxSalary! : true,
            );
        }

        // Search by term (title, company, description)
        if (args.searchTerm) {
            const searchLower = args.searchTerm.toLowerCase();
            jobs = jobs.filter(
                (job) =>
                    job.title.toLowerCase().includes(searchLower) ||
                    job.company.toLowerCase().includes(searchLower) ||
                    job.description.toLowerCase().includes(searchLower),
            );
        }

        // Filter by skills with match scoring
        if (args.skills && args.skills.length > 0) {
            const skillsLower = args.skills.map((s) => s.toLowerCase());

            const jobsWithScores = jobs.map((job) => {
                const jobSkillsLower = (job.requiredSkills || []).map((s) =>
                    s.toLowerCase(),
                );
                const matchCount = skillsLower.filter((skill) =>
                    jobSkillsLower.includes(skill),
                ).length;

                return {
                    job,
                    matchScore: matchCount,
                };
            });

            jobs = jobsWithScores
                .filter((item) => item.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore)
                .map((item) => item.job);
        } else {
            // Sort by posted date (newest first) if no skills filter
            jobs.sort((a, b) => b.postedDate - a.postedDate);
        }

        // Apply limit
        if (args.limit) {
            jobs = jobs.slice(0, args.limit);
        }

        // Fetch poster information for each job
        const jobsWithPosters = await Promise.all(
            jobs.map(async (job) => {
                const poster = await ctx.db.get(job.postedBy);
                return {
                    ...job,
                    poster:
                        poster ?
                            {
                                _id: poster._id,
                                name: poster.name,
                                role: poster.role,
                                avatarUrl: poster.avatarUrl,
                            }
                        :   null,
                };
            }),
        );

        return jobsWithPosters;
    },
});

/**
 * Get jobs by company
 */
export const getJobsByCompany = query({
    args: {
        company: v.string(),
        activeOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const activeOnly = args.activeOnly ?? true;
        const now = Date.now();

        let jobs = await ctx.db
            .query("jobs")
            .withIndex("by_company", (q) => q.eq("company", args.company))
            .collect();

        // Filter by active status if requested
        if (activeOnly) {
            jobs = jobs.filter((job) => job.isActive);
        }

        // Filter out expired jobs
        jobs = jobs.filter((job) => !job.expiresDate || job.expiresDate > now);

        // Sort by posted date (newest first)
        jobs.sort((a, b) => b.postedDate - a.postedDate);

        return jobs;
    },
});

/**
 * Get jobs posted by a specific user
 */
export const getJobsByUser = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const jobs = await ctx.db
            .query("jobs")
            .withIndex("by_postedBy", (q) => q.eq("postedBy", args.userId))
            .collect();

        // Sort by posted date (newest first)
        jobs.sort((a, b) => b.postedDate - a.postedDate);

        return jobs;
    },
});

/**
 * Get recommended jobs for a user based on their skills
 */
export const getRecommendedJobs = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Get user's skills
        const user = await ctx.db.get(args.userId);
        if (!user || !user.skills || user.skills.length === 0) {
            return [];
        }

        const now = Date.now();
        const limit = args.limit ?? 10;

        // Get active jobs
        let jobs = await ctx.db
            .query("jobs")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        // Filter out expired jobs
        jobs = jobs.filter((job) => !job.expiresDate || job.expiresDate > now);

        // Calculate match score for each job
        const userSkillsLower = user.skills.map((s) => s.toLowerCase());

        const jobsWithScores = jobs.map((job) => {
            const jobSkillsLower = (job.requiredSkills || []).map((s) =>
                s.toLowerCase(),
            );
            const matchCount = userSkillsLower.filter((skill) =>
                jobSkillsLower.includes(skill),
            ).length;

            return {
                ...job,
                matchScore: matchCount,
            };
        });

        // Filter jobs with at least one matching skill and sort by match score
        const recommendedJobs = jobsWithScores
            .filter((job) => job.matchScore > 0)
            .sort((a, b) => {
                // First sort by match score
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                // Then by posted date (newer first)
                return b.postedDate - a.postedDate;
            })
            .slice(0, limit);

        return recommendedJobs;
    },
});

/**
 * Get related jobs based on current job's skills and company
 */
export const getRelatedJobs = query({
    args: {
        jobId: v.id("jobs"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const currentJob = await ctx.db.get(args.jobId);
        if (!currentJob) {
            return [];
        }

        const now = Date.now();
        const limit = args.limit ?? 4;

        // Get active jobs excluding current job
        let jobs = await ctx.db
            .query("jobs")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();

        // Filter out expired jobs and current job
        jobs = jobs.filter(
            (job) =>
                job._id !== args.jobId &&
                (!job.expiresDate || job.expiresDate > now),
        );

        // Calculate match score based on skills and company
        const currentSkillsLower = (currentJob.requiredSkills || []).map((s) =>
            s.toLowerCase(),
        );

        const jobsWithScores = jobs.map((job) => {
            const jobSkillsLower = (job.requiredSkills || []).map((s) =>
                s.toLowerCase(),
            );
            const skillMatchCount = currentSkillsLower.filter((skill) =>
                jobSkillsLower.includes(skill),
            ).length;

            // Bonus points for same company
            const companyMatch = job.company === currentJob.company ? 10 : 0;

            return {
                ...job,
                matchScore: skillMatchCount + companyMatch,
            };
        });

        // Filter jobs with at least some match and sort by score
        const relatedJobs = jobsWithScores
            .filter((job) => job.matchScore > 0)
            .sort((a, b) => {
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                return b.postedDate - a.postedDate;
            })
            .slice(0, limit);

        return relatedJobs;
    },
});
