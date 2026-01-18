/**
 * Seed Script for Convex Database
 *
 * Populates the database with initial data from mock files
 * Run with: npx convex run seed:seedAll
 */

import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Seed all data
 */
export const seedAll = internalMutation({
    args: {},
    handler: async (ctx) => {
        console.log("🌱 Starting database seed...");

        // Clear existing data (development only!)
        await clearAllData(ctx);

        // Seed users
        const userIds = await seedUsers(ctx);
        console.log(`✓ Seeded ${userIds.length} users`);

        // Seed opportunities
        const opportunityIds = await seedOpportunities(ctx, userIds);
        console.log(`✓ Seeded ${opportunityIds.length} opportunities`);

        // Seed applications
        const applicationIds = await seedApplications(
            ctx,
            userIds,
            opportunityIds,
        );
        console.log(`✓ Seeded ${applicationIds.length} applications`);

        // Seed messages
        const messageIds = await seedMessages(ctx, userIds);
        console.log(`✓ Seeded ${messageIds.length} messages`);

        // Seed jobs
        const jobIds = await seedJobs(ctx, userIds);
        console.log(`✓ Seeded ${jobIds.length} jobs`);

        // Seed mentors
        const mentorIds = await seedMentors(ctx, userIds);
        console.log(`✓ Seeded ${mentorIds.length} mentors`);

        console.log("✅ Database seeding complete!");
        return {
            users: userIds.length,
            opportunities: opportunityIds.length,
            applications: applicationIds.length,
            messages: messageIds.length,
            jobs: jobIds.length,
            mentors: mentorIds.length,
        };
    },
});

/**
 * Clear all data (use with caution!)
 */
async function clearAllData(ctx: MutationCtx) {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
        await ctx.db.delete(user._id);
    }

    const opportunities = await ctx.db.query("opportunities").collect();
    for (const opp of opportunities) {
        await ctx.db.delete(opp._id);
    }

    const applications = await ctx.db.query("applications").collect();
    for (const app of applications) {
        await ctx.db.delete(app._id);
    }

    const messages = await ctx.db.query("messages").collect();
    for (const msg of messages) {
        await ctx.db.delete(msg._id);
    }

    console.log("✓ Cleared existing data");
}

/**
 * Seed users
 */
async function seedUsers(ctx: MutationCtx): Promise<Id<"users">[]> {
    const mockUsers = [
        {
            clerkId: "user_mock_1",
            name: "Alex Johnson",
            email: "alex.j@email.com",
            role: "student" as const,
            bio: "Computer Science student passionate about web development",
            skills: ["React", "TypeScript", "Node.js"],
            location: "Toronto, ON",
            avatarUrl: "/assets/avatars/alex.jpg",
        },
        {
            clerkId: "user_mock_2",
            name: "Sarah Chen",
            email: "sarah.c@email.com",
            role: "mentor" as const,
            bio: "Senior Software Engineer at TechCorp with 8 years experience",
            skills: [
                "JavaScript",
                "Python",
                "System Design",
                "Career Guidance",
            ],
            location: "Vancouver, BC",
            avatarUrl: "/assets/avatars/sarah.jpg",
        },
        {
            clerkId: "user_mock_3",
            name: "Michael Brown",
            email: "michael.b@company.com",
            role: "employer" as const,
            bio: "HR Manager at StartupXYZ looking for talented interns",
            skills: [],
            location: "Montreal, QC",
            avatarUrl: "/assets/avatars/michael.jpg",
        },
        {
            clerkId: "user_mock_4",
            name: "Emily Rodriguez",
            email: "emily.r@email.com",
            role: "student" as const,
            bio: "Marketing major interested in digital marketing and UX design",
            skills: ["Figma", "Content Writing", "Social Media"],
            location: "Calgary, AB",
            avatarUrl: "/assets/avatars/emily.jpg",
        },
        {
            clerkId: "user_mock_5",
            name: "David Kim",
            email: "david.k@techcompany.com",
            role: "mentor" as const,
            bio: "Product Manager helping youth navigate tech careers",
            skills: ["Product Management", "Agile", "Leadership"],
            location: "Toronto, ON",
            avatarUrl: "/assets/avatars/david.jpg",
        },
    ];

    const userIds = [];
    for (const user of mockUsers) {
        const id = await ctx.db.insert("users", {
            ...user,
            profileCompletion: 75,
            isOnboardingComplete: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        userIds.push(id);
    }

    return userIds;
}

/**
 * Seed opportunities
 */
async function seedOpportunities(
    ctx: MutationCtx,
    userIds: Id<"users">[],
): Promise<Id<"opportunities">[]> {
    const mockOpportunities = [
        {
            title: "Frontend Developer Intern",
            type: "internship" as const,
            description: "Work on React and TypeScript projects with our team",
            company: "TechCorp Inc.",
            location: "Toronto, ON",
            skills: ["React", "TypeScript", "CSS"],
            postedBy: userIds[2], // employer
            isRemote: false,
            salary: "$20-25/hour",
        },
        {
            title: "Junior Full Stack Developer",
            type: "job" as const,
            description: "Join our startup as a full-time developer",
            company: "StartupXYZ",
            location: "Vancouver, BC",
            skills: ["JavaScript", "Node.js", "PostgreSQL"],
            postedBy: userIds[2],
            isRemote: true,
            salary: "$50,000-60,000/year",
        },
        {
            title: "Career Mentorship - Software Engineering",
            type: "mentorship" as const,
            description: "1-on-1 mentorship for aspiring software engineers",
            mentor: "Sarah Chen",
            location: "Remote",
            skills: ["Career Guidance", "Interview Prep", "System Design"],
            postedBy: userIds[1], // mentor
            isRemote: true,
        },
        {
            title: "Marketing Coordinator Internship",
            type: "internship" as const,
            description: "Digital marketing and content creation role",
            company: "MediaCo",
            location: "Montreal, QC",
            skills: ["Social Media", "Content Writing", "Analytics"],
            postedBy: userIds[2],
            isRemote: false,
            salary: "$18-22/hour",
        },
        {
            title: "Product Management Mentorship",
            type: "mentorship" as const,
            description: "Learn product management from an experienced PM",
            mentor: "David Kim",
            location: "Remote",
            skills: ["Product Management", "Strategy", "Leadership"],
            postedBy: userIds[4], // mentor
            isRemote: true,
        },
    ];

    const opportunityIds = [];
    for (const opp of mockOpportunities) {
        const id = await ctx.db.insert("opportunities", {
            ...opp,
            postedDate: Date.now(),
            deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        });
        opportunityIds.push(id);
    }

    return opportunityIds;
}

/**
 * Seed applications
 */
async function seedApplications(
    ctx: MutationCtx,
    userIds: Id<"users">[],
    opportunityIds: Id<"opportunities">[],
): Promise<Id<"applications">[]> {
    const mockApplications = [
        {
            opportunityId: opportunityIds[0],
            userId: userIds[0], // student
            status: "pending" as const,
            coverLetter:
                "I'm very interested in this internship opportunity...",
        },
        {
            opportunityId: opportunityIds[1],
            userId: userIds[0],
            status: "accepted" as const,
            coverLetter:
                "I have strong experience with full stack development...",
        },
        {
            opportunityId: opportunityIds[3],
            userId: userIds[3], // student
            status: "pending" as const,
            coverLetter: "My marketing skills would be a great fit...",
        },
    ];

    const applicationIds = [];
    for (const app of mockApplications) {
        const id = await ctx.db.insert("applications", {
            ...app,
            appliedDate: Date.now(),
        });
        applicationIds.push(id);
    }

    return applicationIds;
}

/**
 * Seed messages
 */
async function seedMessages(
    ctx: MutationCtx,
    userIds: Id<"users">[],
): Promise<Id<"messages">[]> {
    const mockMessages = [
        {
            senderId: userIds[0], // student
            receiverId: userIds[1], // mentor
            content:
                "Hi Sarah, I'd love to learn more about your mentorship program!",
            read: true,
        },
        {
            senderId: userIds[1],
            receiverId: userIds[0],
            content: "Hello Alex! I'd be happy to help. Let's schedule a call.",
            read: false,
        },
        {
            senderId: userIds[2], // employer
            receiverId: userIds[0], // student
            content: "We'd like to interview you for the intern position.",
            read: false,
        },
    ];

    const messageIds = [];
    for (const msg of mockMessages) {
        const id = await ctx.db.insert("messages", {
            ...msg,
            timestamp: Date.now(),
        });
        messageIds.push(id);
    }

    return messageIds;
}

/**
 * Seed jobs
 */
async function seedJobs(
    ctx: MutationCtx,
    userIds: Id<"users">[],
): Promise<Id<"jobs">[]> {
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
            postedBy: userIds[2], // employer
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
            postedBy: userIds[2],
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
            postedBy: userIds[2],
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
            postedBy: userIds[2],
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
            postedBy: userIds[2],
            views: 18,
            industry: "Education",
            tags: ["part-time", "teaching"],
        },
    ];

    const jobIds = [];
    for (const job of mockJobs) {
        const id = await ctx.db.insert("jobs", {
            ...job,
            postedDate: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            isActive: true,
        });
        jobIds.push(id);
    }

    return jobIds;
}

/**
 * Seed mentors
 */
async function seedMentors(
    ctx: MutationCtx,
    userIds: Id<"users">[],
): Promise<Id<"mentors">[]> {
    const mockMentors = [
        {
            userId: userIds[1], // mentor
            role: "Senior Software Engineer",
            company: "TechCorp Philippines",
            currentPosition: "Lead Engineer",
            yearsOfExperience: 8,
            industry: "Technology",
            bio: "Passionate about helping fresh graduates transition into tech careers.",
            longBio:
                "With 8 years of experience in web development and software engineering, I've worked on projects ranging from startups to enterprise applications. My mission is to guide the next generation of Filipino tech professionals through the challenges of breaking into the industry. I specialize in modern web technologies, system design, and career navigation in tech.",
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
            verifiedAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
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
            createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000, // 180 days ago
            updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
            lastActiveAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        },
        {
            userId: userIds[2], // employer (also a mentor)
            role: "Marketing Director",
            company: "Creative Solutions Inc.",
            currentPosition: "Director of Digital Marketing",
            yearsOfExperience: 10,
            industry: "Marketing & Advertising",
            bio: "Experienced marketing professional dedicated to guiding young marketers.",
            longBio:
                "I've spent a decade building brands and launching campaigns across digital and traditional media. From startups to Fortune 500 companies, I've seen it all. Now I'm passionate about mentoring the next wave of Filipino marketing professionals, helping them navigate the rapidly evolving digital landscape and build fulfilling careers.",
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
            verifiedAt: Date.now() - 120 * 24 * 60 * 60 * 1000, // 120 days ago
            isAvailableForNewMentees: true,
            maxMentees: 35,
            linkedInUrl: "https://linkedin.com/in/marketing-mentor",
            portfolioUrl: "https://portfolio.example.com",
            twitterUrl: "https://twitter.com/marketingmentor",
            mentoringStyle: ["advisory", "career-coaching"],
            focusAreas: ["career-growth", "skill-building", "portfolio-review"],
            createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000, // 200 days ago
            updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
            lastActiveAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        },
        {
            userId: userIds[1], // Additional mentor profile
            role: "UX Design Lead",
            company: "Design Hub Manila",
            currentPosition: "Senior UX Designer",
            yearsOfExperience: 6,
            industry: "Design & UX",
            bio: "Product designer focused on empowering aspiring designers in the Philippines.",
            longBio:
                "After 6 years designing products for companies in Manila and abroad, I've learned that good design is about people, not pixels. I mentor aspiring designers on everything from UX fundamentals to landing their first design role. Whether you're switching careers or leveling up, I'm here to help.",
            tagline: "Design with purpose, mentor with passion",
            location: "Makati",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: ["UX Design", "UI Design", "Figma", "User Research"],
            specializations: [
                "Interaction Design",
                "Design Systems",
                "Prototyping",
            ],
            languages: ["English", "Filipino"],
            availability: "Flexible weekdays",
            availableDays: ["monday", "wednesday", "friday"],
            availableTimeSlots: ["afternoon", "evening"],
            hourlyRate: 45,
            currency: "USD",
            offersFreeSession: true,
            rating: 5.0,
            totalReviews: 28,
            mentees: 15,
            sessionsCompleted: 89,
            responseTime: "within 6 hours",
            acceptanceRate: 95,
            isVerified: true,
            verifiedAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
            isAvailableForNewMentees: true,
            maxMentees: 20,
            linkedInUrl: "https://linkedin.com/in/ux-mentor",
            portfolioUrl: "https://uxportfolio.example.com",
            mentoringStyle: ["hands-on", "portfolio-review"],
            focusAreas: [
                "career-transition",
                "portfolio-building",
                "skill-building",
            ],
            createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000, // 150 days ago
            updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
            lastActiveAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
        },
    ];

    const mentorIds = [];
    for (const mentor of mockMentors) {
        const id = await ctx.db.insert("mentors", mentor);
        mentorIds.push(id);
    }

    return mentorIds;
}
