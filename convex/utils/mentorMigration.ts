/**
 * Migration Script - Clear and Reseed Mentors
 *
 * Clears old mentor data and reseeds with new comprehensive schema
 */

import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const clearAndReseedMentors = mutation({
    args: {},
    handler: async (ctx) => {
        // Delete all existing mentors
        const oldMentors = await ctx.db.query("mentors").collect();
        for (const mentor of oldMentors) {
            await ctx.db.delete(mentor._id);
        }

        // Get existing users for mentor profiles
        const users = await ctx.db.query("users").collect();
        if (users.length < 2) {
            throw new Error("Need at least 2 users to create mentor profiles");
        }

        const mockMentors = [
            {
                userId: users[1]._id,
                role: "Senior Software Engineer",
                company: "TechCorp Philippines",
                currentPosition: "Lead Engineer",
                yearsOfExperience: 8,
                industry: "Technology",
                bio: "Passionate about helping fresh graduates transition into tech careers.",
                longBio:
                    "With 8 years of experience in web development and software engineering, I've worked on projects ranging from startups to enterprise applications. My mission is to guide the next generation of Filipino tech professionals through the challenges of breaking into the industry.",
                tagline: "Helping fresh graduates break into tech",
                location: "Manila",
                timezone: "Asia/Manila",
                isRemoteOnly: false,
                expertise: ["JavaScript", "React", "Node.js", "System Design"],
                specializations: [
                    "Web Development",
                    "Career Mentorship",
                    "Interview Preparation",
                ],
                languages: ["English", "Filipino"],
                availability: "Weekends",
                availableDays: ["saturday", "sunday"],
                availableTimeSlots: ["morning", "afternoon"],
                hourlyRate: 50,
                currency: "USD",
                offersFreeSession: true,
                rating: 4.9,
                totalReviews: 47,
                mentees: 23,
                sessionsCompleted: 156,
                responseTime: "within 24 hours",
                acceptanceRate: 85,
                isVerified: true,
                verifiedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
                isAvailableForNewMentees: true,
                maxMentees: 30,
                linkedInUrl: "https://linkedin.com/in/sample-mentor",
                githubUrl: "https://github.com/sample-mentor",
                mentoringStyle: ["hands-on", "project-based"],
                focusAreas: [
                    "career-transition",
                    "skill-building",
                    "interview-prep",
                ],
                createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
                updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
                lastActiveAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
            },
            {
                userId: users[0]._id,
                role: "Marketing Director",
                company: "Creative Solutions Inc.",
                currentPosition: "Director of Digital Marketing",
                yearsOfExperience: 10,
                industry: "Marketing & Advertising",
                bio: "Experienced marketing professional dedicated to guiding young marketers.",
                longBio:
                    "I've spent a decade building brands and launching campaigns across digital and traditional media. Now I'm passionate about mentoring the next wave of Filipino marketing professionals.",
                tagline: "Building the next generation of marketing leaders",
                location: "Cebu City",
                timezone: "Asia/Manila",
                isRemoteOnly: true,
                expertise: [
                    "Digital Marketing",
                    "Brand Strategy",
                    "Content Marketing",
                    "SEO",
                ],
                specializations: [
                    "Social Media Strategy",
                    "Campaign Management",
                    "Analytics",
                ],
                languages: ["English", "Filipino", "Cebuano"],
                availability: "Tuesday & Thursday evenings",
                availableDays: ["tuesday", "thursday"],
                availableTimeSlots: ["evening"],
                hourlyRate: 60,
                currency: "USD",
                offersFreeSession: false,
                rating: 4.8,
                totalReviews: 62,
                mentees: 31,
                sessionsCompleted: 203,
                responseTime: "within 12 hours",
                acceptanceRate: 92,
                isVerified: true,
                verifiedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
                isAvailableForNewMentees: true,
                maxMentees: 35,
                linkedInUrl: "https://linkedin.com/in/marketing-mentor",
                portfolioUrl: "https://portfolio.example.com",
                twitterUrl: "https://twitter.com/marketingmentor",
                mentoringStyle: ["advisory", "career-coaching"],
                focusAreas: [
                    "career-growth",
                    "skill-building",
                    "portfolio-review",
                ],
                createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
                updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
                lastActiveAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
            },
        ];

        const mentorIds: Id<"mentors">[] = [];
        for (const mentor of mockMentors) {
            const id = await ctx.db.insert("mentors", mentor);
            mentorIds.push(id);
        }

        return {
            message: `Migration complete: ${mentorIds.length} mentors created`,
            mentorIds,
        };
    },
});

/**
 * Repair: Create mentor profiles for users with role "mentor" but no mentor entry
 * This fixes existing users who completed onboarding as mentors before the auto-create was added
 */
export const repairMentorProfiles = mutation({
    args: {},
    handler: async (ctx) => {
        // Find all users with role "mentor"
        const mentorUsers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "mentor"))
            .collect();

        let created = 0;
        let skipped = 0;

        for (const user of mentorUsers) {
            // Check if mentor profile exists (using collect() to handle potential duplicates)
            const existingMentors = await ctx.db
                .query("mentors")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            if (existingMentors.length === 0) {
                // Create mentor profile
                await ctx.db.insert("mentors", {
                    userId: user._id,
                    role: "Mentor",
                    company: "",
                    location: user.location || "",
                    expertise: user.skills || [],
                    bio: user.bio || "",
                    availability: "To be determined",
                    rating: 0,
                    mentees: 0,
                    sessionsCompleted: 0,
                    totalReviews: 0,
                    isVerified: false,
                    isAvailableForNewMentees: true,
                    createdAt: Date.now(),
                });
                created++;
                console.log(
                    `[repairMentorProfiles] Created mentor profile for user: ${user._id} (${user.email})`,
                );
            } else {
                skipped++;
                // Log if there are duplicates
                if (existingMentors.length > 1) {
                    console.log(
                        `[repairMentorProfiles] Warning: User ${user._id} has ${existingMentors.length} mentor profiles`,
                    );
                }
            }
        }

        console.log(
            `[repairMentorProfiles] Complete. Created: ${created}, Skipped: ${skipped}`,
        );
        return { created, skipped, total: mentorUsers.length };
    },
});

/**
 * Cleanup: Remove duplicate mentor profiles, keeping only the first one for each user
 */
export const cleanupDuplicateMentorProfiles = mutation({
    args: {},
    handler: async (ctx) => {
        // Get all users with role "mentor"
        const mentorUsers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "mentor"))
            .collect();

        let totalDeleted = 0;

        for (const user of mentorUsers) {
            const mentorProfiles = await ctx.db
                .query("mentors")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            if (mentorProfiles.length > 1) {
                // Sort by createdAt to keep the oldest one (or first if no createdAt)
                const sorted = mentorProfiles.sort(
                    (a, b) => (a.createdAt || 0) - (b.createdAt || 0),
                );

                // Keep the first one, delete the rest
                for (let i = 1; i < sorted.length; i++) {
                    await ctx.db.delete(sorted[i]._id);
                    totalDeleted++;
                }
                console.log(
                    `[cleanupDuplicateMentorProfiles] Deleted ${sorted.length - 1} duplicate profiles for user: ${user._id}`,
                );
            }
        }

        console.log(
            `[cleanupDuplicateMentorProfiles] Total deleted: ${totalDeleted}`,
        );
        return { totalDeleted };
    },
});
