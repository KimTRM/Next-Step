/**
 * Migration Script - Clear and Reseed Mentors
 *
 * Clears old mentor data and reseeds with new comprehensive schema
 */

import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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
