import { internalMutation, mutation } from "../_generated/server";

/**
 * Migration to clear old jobs and reseed with new schema
 * Run manually: npx convex run migration:clearAndReseedJobs
 */
export const clearAndReseedJobs = internalMutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting migration: Clearing old jobs...");

        // Delete all existing jobs
        const existingJobs = await ctx.db.query("jobs").collect();
        for (const job of existingJobs) {
            await ctx.db.delete(job._id);
        }
        console.log(`✓ Deleted ${existingJobs.length} old jobs`);

        // Get employer users to assign jobs to
        const employers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "employer"))
            .collect();

        if (employers.length === 0) {
            console.log("✗ No employers found. Please seed users first.");
            return { success: false, message: "No employers found" };
        }

        const employerId = employers[0]._id;

        // Seed new jobs with correct schema
        const mockJobs = [
            {
                title: "Junior Software Developer",
                company: "TechStart Solutions",
                location: "Naga City, Camarines Sur",
                employmentType: "full-time" as const,
                locationType: "hybrid" as const,
                jobCategory: "technology",
                minSalary: 20000,
                maxSalary: 28000,
                salaryCurrency: "₱",
                salaryPeriod: "month" as const,
                description:
                    "Looking for fresh graduates with strong programming fundamentals and eagerness to learn.",
                requiredSkills: ["JavaScript", "React", "Node.js", "Git"],
                experienceLevel: "entry" as const,
                education: "bachelor" as const,
                postedBy: employerId,
                views: 23,
                industry: "Technology",
                tags: ["entry-level", "fresh-grad-friendly"],
            },
            {
                title: "Marketing Assistant",
                company: "Creative Minds Agency",
                location: "Naga City, Camarines Sur",
                employmentType: "full-time" as const,
                locationType: "on-site" as const,
                jobCategory: "marketing",
                minSalary: 18000,
                maxSalary: 22000,
                salaryCurrency: "₱",
                salaryPeriod: "month" as const,
                description:
                    "Entry-level position perfect for communication graduates ready to start their marketing career.",
                requiredSkills: [
                    "Social Media",
                    "Content Writing",
                    "Communication",
                    "MS Office",
                ],
                experienceLevel: "entry" as const,
                education: "bachelor" as const,
                postedBy: employerId,
                views: 41,
                industry: "Marketing",
                tags: ["entry-level", "communications"],
            },
            {
                title: "Customer Support Intern",
                company: "BPO Connect",
                location: "Naga City, Camarines Sur",
                employmentType: "internship" as const,
                locationType: "on-site" as const,
                jobCategory: "customer-service",
                minSalary: 8000,
                maxSalary: 12000,
                salaryCurrency: "₱",
                salaryPeriod: "month" as const,
                description:
                    "3-month internship program with potential for full-time employment. Training provided.",
                requiredSkills: [
                    "Communication",
                    "Customer Service",
                    "Problem Solving",
                ],
                experienceLevel: "entry" as const,
                postedBy: employerId,
                views: 67,
                industry: "BPO",
                tags: ["internship", "training-provided"],
            },
            {
                title: "Junior Business Analyst",
                company: "DataDrive Corp",
                location: "Naga City, Camarines Sur",
                employmentType: "full-time" as const,
                locationType: "hybrid" as const,
                jobCategory: "business",
                minSalary: 22000,
                maxSalary: 30000,
                salaryCurrency: "₱",
                salaryPeriod: "month" as const,
                description:
                    "Fresh graduates with analytical mindset welcome. Experience with Excel and data analysis a plus.",
                requiredSkills: [
                    "Excel",
                    "Data Analysis",
                    "SQL",
                    "Analytical Thinking",
                ],
                experienceLevel: "entry" as const,
                education: "bachelor" as const,
                postedBy: employerId,
                views: 34,
                industry: "Technology",
                tags: ["entry-level", "data"],
            },
            {
                title: "Teaching Assistant",
                company: "NextGen Academy",
                location: "Naga City, Camarines Sur",
                employmentType: "part-time" as const,
                locationType: "on-site" as const,
                jobCategory: "education",
                minSalary: 300,
                maxSalary: 500,
                salaryCurrency: "₱",
                salaryPeriod: "hour" as const,
                description:
                    "Part-time opportunity for education graduates to assist in classroom instruction and tutoring.",
                requiredSkills: [
                    "Teaching",
                    "Communication",
                    "Patience",
                    "Subject Knowledge",
                ],
                experienceLevel: "entry" as const,
                education: "bachelor" as const,
                postedBy: employerId,
                views: 18,
                industry: "Education",
                tags: ["part-time", "teaching"],
            },
        ];

        const jobIds = [];
        for (const job of mockJobs) {
            const id = await ctx.db.insert("jobs", {
                ...job,
                postedDate:
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                isActive: true,
            });
            jobIds.push(id);
        }

        console.log(`✓ Created ${jobIds.length} new jobs`);

        return {
            success: true,
            message: `Migration complete: ${jobIds.length} jobs created`,
            jobIds,
        };
    },
});

/**
 * Migration to convert messages from old `read` field to new `isRead` field
 * Run manually: npx convex run utils/migration:migrateMessagesReadField
 */
export const migrateMessagesReadField = mutation({
    args: {},
    handler: async (ctx) => {
        console.log("Starting migration: Converting read -> isRead in messages...");

        // Get all messages (we need to use a raw query approach)
        const allMessages = await ctx.db.query("messages").collect();

        let migratedCount = 0;
        let skippedCount = 0;

        for (const message of allMessages) {
            // Check if message has old 'read' field but no 'isRead' field
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = message as any;

            if (msg.read !== undefined && msg.isRead === undefined) {
                // Update the message with the new field
                await ctx.db.patch(message._id, {
                    isRead: msg.read,
                });

                // We can't delete the old field directly, but the schema will ignore it
                migratedCount++;
            } else if (msg.isRead !== undefined) {
                skippedCount++;
            }
        }

        console.log(`✓ Migrated ${migratedCount} messages`);
        console.log(`✓ Skipped ${skippedCount} messages (already migrated)`);

        return {
            success: true,
            message: `Migration complete: ${migratedCount} messages migrated, ${skippedCount} skipped`,
            migratedCount,
            skippedCount,
        };
    },
});
