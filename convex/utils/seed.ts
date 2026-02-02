/**
 * Seed Script for Convex Database
 *
 * Populates the database with initial data from mock files
 * Run with: npx convex run seed:seedAll
 */

import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

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

        // Seed applications
        const applicationIds = await seedApplications(ctx, userIds);
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
            role: "job_seeker" as const,
            bio: "Computer Science graduate passionate about web development",
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
            role: "job_seeker" as const,
            bio: "Marketing graduate interested in digital marketing and UX design",
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
 * Seed applications
 */
async function seedApplications(
    ctx: MutationCtx,
    userIds: Id<"users">[],
): Promise<Id<"applications">[]> {
    // Applications seeding can be added when opportunities table exists
    return [];
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
            isRead: true,
        },
        {
            senderId: userIds[1],
            receiverId: userIds[0],
            content: "Hello Alex! I'd be happy to help. Let's schedule a call.",
            isRead: false,
        },
        {
            senderId: userIds[2], // employer
            receiverId: userIds[0], // student
            content: "We'd like to interview you for the intern position.",
            isRead: false,
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
            applicants: 0,
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
        // Additional mentors to exceed pagination limit
        {
            userId: userIds[4],
            role: "Data Scientist",
            company: "Analytics Hub",
            currentPosition: "Senior Data Scientist",
            yearsOfExperience: 7,
            industry: "Data & AI",
            bio: "Helping grads break into data science with real-world projects.",
            longBio:
                "I have led data teams delivering ML models to production. I mentor on Python, ML, and MLOps.",
            tagline: "From zero to production ML",
            location: "Quezon City",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["Python", "Machine Learning", "MLOps", "SQL"],
            specializations: [
                "Model Deployment",
                "Feature Engineering",
                "Career Guidance",
            ],
            languages: ["English", "Filipino"],
            availability: "Weeknights",
            availableDays: ["tuesday", "thursday"],
            availableTimeSlots: ["evening"],
            hourlyRate: 55,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.7,
            totalReviews: 33,
            mentees: 18,
            sessionsCompleted: 120,
            responseTime: "within 8 hours",
            acceptanceRate: 90,
            isVerified: true,
            verifiedAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 25,
            linkedInUrl: "https://linkedin.com/in/data-mentor",
            githubUrl: "https://github.com/data-mentor",
            focusAreas: ["skill-building", "project-guidance"],
            createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 6 * 60 * 60 * 1000,
        },
        {
            userId: userIds[4],
            role: "Cloud Engineer",
            company: "SkyStack",
            currentPosition: "Principal Cloud Engineer",
            yearsOfExperience: 9,
            industry: "Cloud",
            bio: "Guiding engineers to become cloud-native pros.",
            longBio:
                "AWS and Azure certified. I mentor on IaC, Kubernetes, and cost-optimized architectures.",
            tagline: "Ship reliable cloud systems",
            location: "Pasig",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: ["AWS", "Azure", "Terraform", "Kubernetes"],
            specializations: ["DevOps", "Infrastructure", "Cost Optimization"],
            languages: ["English", "Filipino"],
            availability: "Weekdays",
            availableDays: ["monday", "wednesday", "friday"],
            availableTimeSlots: ["morning", "afternoon"],
            hourlyRate: 65,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.9,
            totalReviews: 54,
            mentees: 22,
            sessionsCompleted: 180,
            responseTime: "within 6 hours",
            acceptanceRate: 93,
            isVerified: true,
            verifiedAt: Date.now() - 70 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 28,
            linkedInUrl: "https://linkedin.com/in/cloud-mentor",
            githubUrl: "https://github.com/cloud-mentor",
            focusAreas: ["career-growth", "certification"],
            createdAt: Date.now() - 110 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 4 * 60 * 60 * 1000,
        },
        {
            userId: userIds[4],
            role: "Product Manager",
            company: "BrightLabs",
            currentPosition: "Senior PM",
            yearsOfExperience: 8,
            industry: "Product",
            bio: "Helping future PMs master discovery and delivery.",
            longBio:
                "I mentor PMs on roadmapping, stakeholder management, and metrics. Ex-startup founder.",
            tagline: "Ship products users love",
            location: "Taguig",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["Product Strategy", "Roadmaps", "Metrics", "Agile"],
            specializations: ["Discovery", "Experimentation", "Stakeholders"],
            languages: ["English", "Filipino"],
            availability: "Evenings",
            availableDays: ["tuesday", "thursday"],
            availableTimeSlots: ["evening"],
            hourlyRate: 70,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.85,
            totalReviews: 40,
            mentees: 19,
            sessionsCompleted: 140,
            responseTime: "within 12 hours",
            acceptanceRate: 91,
            isVerified: true,
            verifiedAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 24,
            linkedInUrl: "https://linkedin.com/in/pm-mentor",
            focusAreas: ["career-transition", "roadmapping"],
            createdAt: Date.now() - 140 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 10 * 60 * 60 * 1000,
        },
        {
            userId: userIds[1],
            role: "Mobile Engineer",
            company: "AppWorks",
            currentPosition: "iOS Lead",
            yearsOfExperience: 6,
            industry: "Mobile",
            bio: "iOS engineer mentoring Swift and SwiftUI devs.",
            longBio:
                "Built and launched multiple consumer apps. I help with architecture, testing, and App Store readiness.",
            tagline: "Polish your next app",
            location: "Davao",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["Swift", "SwiftUI", "Combine", "iOS"],
            specializations: ["Architecture", "Testing", "UI/UX"],
            languages: ["English", "Filipino"],
            availability: "Weekends",
            availableDays: ["saturday", "sunday"],
            availableTimeSlots: ["morning", "afternoon"],
            hourlyRate: 60,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.75,
            totalReviews: 22,
            mentees: 14,
            sessionsCompleted: 95,
            responseTime: "within 10 hours",
            acceptanceRate: 88,
            isVerified: true,
            verifiedAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 18,
            linkedInUrl: "https://linkedin.com/in/ios-mentor",
            githubUrl: "https://github.com/ios-mentor",
            focusAreas: ["skill-building", "architecture"],
            createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 18 * 60 * 60 * 1000,
        },
        {
            userId: userIds[3],
            role: "Cybersecurity Engineer",
            company: "SecureNet",
            currentPosition: "Security Lead",
            yearsOfExperience: 11,
            industry: "Security",
            bio: "Security lead mentoring on blue team and threat modeling.",
            longBio:
                "Ran security programs for fintech. I mentor on SOC, incident response, and secure SDLC.",
            tagline: "Build secure systems",
            location: "Baguio",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: [
                "Security",
                "Threat Modeling",
                "SIEM",
                "Incident Response",
            ],
            specializations: ["Blue Team", "AppSec", "IR"],
            languages: ["English", "Filipino"],
            availability: "Weekday mornings",
            availableDays: ["monday", "wednesday"],
            availableTimeSlots: ["morning"],
            hourlyRate: 80,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.9,
            totalReviews: 48,
            mentees: 20,
            sessionsCompleted: 160,
            responseTime: "within 4 hours",
            acceptanceRate: 94,
            isVerified: true,
            verifiedAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 20,
            linkedInUrl: "https://linkedin.com/in/security-mentor",
            focusAreas: ["security-career", "appsec"],
            createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 5 * 60 * 60 * 1000,
        },
        {
            userId: userIds[2],
            role: "Backend Engineer",
            company: "APIWorks",
            currentPosition: "Staff Backend Engineer",
            yearsOfExperience: 9,
            industry: "Software",
            bio: "Helping devs design resilient backend services.",
            longBio:
                "I mentor on distributed systems, APIs, and database design. Pragmatic and hands-on.",
            tagline: "Design solid APIs",
            location: "Iloilo",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["Node.js", "PostgreSQL", "Distributed Systems", "gRPC"],
            specializations: ["Scalability", "Performance", "Data Modeling"],
            languages: ["English", "Filipino"],
            availability: "Weeknights",
            availableDays: ["monday", "wednesday", "friday"],
            availableTimeSlots: ["evening"],
            hourlyRate: 58,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.82,
            totalReviews: 36,
            mentees: 21,
            sessionsCompleted: 130,
            responseTime: "within 8 hours",
            acceptanceRate: 89,
            isVerified: true,
            verifiedAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 22,
            linkedInUrl: "https://linkedin.com/in/backend-mentor",
            githubUrl: "https://github.com/backend-mentor",
            focusAreas: ["system-design", "career-growth"],
            createdAt: Date.now() - 160 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 7 * 60 * 60 * 1000,
        },
        {
            userId: userIds[3],
            role: "QA Engineer",
            company: "QualityFirst",
            currentPosition: "QA Lead",
            yearsOfExperience: 7,
            industry: "Quality Assurance",
            bio: "QA lead mentoring on test automation and quality strategy.",
            longBio:
                "I help engineers build reliable test suites and shift-left quality practices.",
            tagline: "Ship with confidence",
            location: "Laguna",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: [
                "Cypress",
                "Playwright",
                "Test Strategy",
                "API Testing",
            ],
            specializations: ["Automation", "Quality Strategy", "Tooling"],
            languages: ["English", "Filipino"],
            availability: "Weekdays",
            availableDays: ["tuesday", "thursday"],
            availableTimeSlots: ["afternoon"],
            hourlyRate: 45,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.65,
            totalReviews: 18,
            mentees: 12,
            sessionsCompleted: 80,
            responseTime: "within 16 hours",
            acceptanceRate: 87,
            isVerified: true,
            verifiedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 15,
            linkedInUrl: "https://linkedin.com/in/qa-mentor",
            focusAreas: ["testing", "automation"],
            createdAt: Date.now() - 130 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 20 * 60 * 60 * 1000,
        },
        {
            userId: userIds[4],
            role: "Frontend Engineer",
            company: "UIWorks",
            currentPosition: "Staff Frontend Engineer",
            yearsOfExperience: 8,
            industry: "Web",
            bio: "Frontend mentor focused on React and performance.",
            longBio:
                "I help engineers level up on React, performance, and accessibility with practical guidance.",
            tagline: "Build fast, accessible UIs",
            location: "Quezon City",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["React", "TypeScript", "Performance", "Accessibility"],
            specializations: ["Perf", "A11y", "Architecture"],
            languages: ["English", "Filipino"],
            availability: "Flexible",
            availableDays: ["monday", "tuesday", "thursday"],
            availableTimeSlots: ["afternoon", "evening"],
            hourlyRate: 62,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.88,
            totalReviews: 52,
            mentees: 24,
            sessionsCompleted: 175,
            responseTime: "within 5 hours",
            acceptanceRate: 92,
            isVerified: true,
            verifiedAt: Date.now() - 95 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 26,
            linkedInUrl: "https://linkedin.com/in/frontend-mentor",
            githubUrl: "https://github.com/frontend-mentor",
            focusAreas: ["performance", "a11y", "architecture"],
            createdAt: Date.now() - 170 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
            userId: userIds[1],
            role: "Full Stack Engineer",
            company: "DevForge",
            currentPosition: "Tech Lead",
            yearsOfExperience: 7,
            industry: "Software",
            bio: "Mentoring full stack devs on pragmatic delivery.",
            longBio:
                "From monoliths to microservices, I help devs make the right trade-offs and ship reliably.",
            tagline: "Ship value faster",
            location: "Cainta",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: ["Node.js", "React", "PostgreSQL", "DevOps"],
            specializations: ["Delivery", "Architecture", "Team Practices"],
            languages: ["English", "Filipino"],
            availability: "Weekdays",
            availableDays: ["monday", "wednesday", "friday"],
            availableTimeSlots: ["morning"],
            hourlyRate: 55,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.76,
            totalReviews: 31,
            mentees: 17,
            sessionsCompleted: 110,
            responseTime: "within 9 hours",
            acceptanceRate: 90,
            isVerified: true,
            verifiedAt: Date.now() - 85 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 20,
            linkedInUrl: "https://linkedin.com/in/fullstack-mentor",
            githubUrl: "https://github.com/fullstack-mentor",
            focusAreas: ["system-design", "delivery"],
            createdAt: Date.now() - 145 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 16 * 60 * 60 * 1000,
        },
        {
            userId: userIds[4],
            role: "AI Engineer",
            company: "ModelLab",
            currentPosition: "Lead AI Engineer",
            yearsOfExperience: 6,
            industry: "AI",
            bio: "Mentoring on LLM apps and prompt engineering.",
            longBio:
                "Built LLM-powered products. I help with prompt design, evaluation, and responsible AI.",
            tagline: "Ship useful AI",
            location: "Makati",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["LLMs", "Prompt Engineering", "Python", "LangChain"],
            specializations: ["RAG", "Evaluation", "Product"],
            languages: ["English", "Filipino"],
            availability: "Flexible",
            availableDays: ["tuesday", "thursday", "saturday"],
            availableTimeSlots: ["afternoon", "evening"],
            hourlyRate: 75,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.83,
            totalReviews: 29,
            mentees: 16,
            sessionsCompleted: 105,
            responseTime: "within 7 hours",
            acceptanceRate: 89,
            isVerified: true,
            verifiedAt: Date.now() - 65 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 18,
            linkedInUrl: "https://linkedin.com/in/ai-mentor",
            githubUrl: "https://github.com/ai-mentor",
            focusAreas: ["ai-product", "prompting"],
            createdAt: Date.now() - 125 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 9 * 60 * 60 * 1000,
        },
        {
            userId: userIds[2],
            role: "Data Analyst",
            company: "InsightWorks",
            currentPosition: "Analytics Lead",
            yearsOfExperience: 5,
            industry: "Analytics",
            bio: "Analyst mentoring SQL, dashboards, and storytelling.",
            longBio:
                "I help analysts build strong fundamentals in SQL, data viz, and stakeholder communication.",
            tagline: "Tell stories with data",
            location: "Quezon City",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["SQL", "Tableau", "Looker", "Stakeholder Management"],
            specializations: ["Dashboards", "Storytelling", "Metrics"],
            languages: ["English", "Filipino"],
            availability: "Weeknights",
            availableDays: ["monday", "wednesday"],
            availableTimeSlots: ["evening"],
            hourlyRate: 40,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.7,
            totalReviews: 21,
            mentees: 13,
            sessionsCompleted: 85,
            responseTime: "within 10 hours",
            acceptanceRate: 86,
            isVerified: true,
            verifiedAt: Date.now() - 55 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 16,
            linkedInUrl: "https://linkedin.com/in/analytics-mentor",
            focusAreas: ["analytics", "career"],
            createdAt: Date.now() - 115 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 21 * 60 * 60 * 1000,
        },
        {
            userId: userIds[3],
            role: "DevRel Engineer",
            company: "OpenAPI Co",
            currentPosition: "Senior DevRel",
            yearsOfExperience: 6,
            industry: "Developer Relations",
            bio: "DevRel mentor focusing on talks, docs, and community.",
            longBio:
                "I help engineers share knowledge through talks, content, and OSS contributions.",
            tagline: "Level up your DevRel",
            location: "Cebu",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["Public Speaking", "Docs", "OSS", "APIs"],
            specializations: ["Content", "Talks", "Community"],
            languages: ["English", "Filipino"],
            availability: "Weekends",
            availableDays: ["saturday"],
            availableTimeSlots: ["afternoon"],
            hourlyRate: 38,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.68,
            totalReviews: 17,
            mentees: 9,
            sessionsCompleted: 60,
            responseTime: "within 18 hours",
            acceptanceRate: 85,
            isVerified: true,
            verifiedAt: Date.now() - 75 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 12,
            linkedInUrl: "https://linkedin.com/in/devrel-mentor",
            focusAreas: ["devrel", "public-speaking"],
            createdAt: Date.now() - 135 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 26 * 60 * 60 * 1000,
        },
        {
            userId: userIds[1],
            role: "Data Engineer",
            company: "Pipeline Pro",
            currentPosition: "Senior Data Engineer",
            yearsOfExperience: 8,
            industry: "Data",
            bio: "Mentoring on modern data stacks and pipelines.",
            longBio:
                "Built batch and streaming pipelines. I mentor on dbt, Airflow, and warehouse modeling.",
            tagline: "Robust data pipelines",
            location: "Pasay",
            timezone: "Asia/Manila",
            isRemoteOnly: false,
            expertise: ["Python", "Airflow", "dbt", "Snowflake"],
            specializations: ["ETL", "Data Modeling", "Ops"],
            languages: ["English", "Filipino"],
            availability: "Weekdays",
            availableDays: ["monday", "tuesday", "thursday"],
            availableTimeSlots: ["morning", "afternoon"],
            hourlyRate: 63,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.84,
            totalReviews: 27,
            mentees: 18,
            sessionsCompleted: 125,
            responseTime: "within 7 hours",
            acceptanceRate: 90,
            isVerified: true,
            verifiedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 20,
            linkedInUrl: "https://linkedin.com/in/dataeng-mentor",
            githubUrl: "https://github.com/dataeng-mentor",
            focusAreas: ["data-engineering", "career"],
            createdAt: Date.now() - 155 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 16 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 14 * 60 * 60 * 1000,
        },
        {
            userId: userIds[4],
            role: "SRE",
            company: "Uptime Co",
            currentPosition: "Site Reliability Engineer",
            yearsOfExperience: 7,
            industry: "SRE",
            bio: "SRE mentoring on reliability, alerting, and incident response.",
            longBio:
                "Ran on-call rotations and improved SLIs/SLOs. I help teams build reliable services.",
            tagline: "Keep services healthy",
            location: "Makati",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["SRE", "Observability", "On-call", "Kubernetes"],
            specializations: ["SLI/SLO", "Incident Response", "Observability"],
            languages: ["English", "Filipino"],
            availability: "Weeknights",
            availableDays: ["tuesday", "thursday"],
            availableTimeSlots: ["evening"],
            hourlyRate: 68,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.79,
            totalReviews: 24,
            mentees: 16,
            sessionsCompleted: 118,
            responseTime: "within 6 hours",
            acceptanceRate: 91,
            isVerified: true,
            verifiedAt: Date.now() - 105 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 18,
            linkedInUrl: "https://linkedin.com/in/sre-mentor",
            githubUrl: "https://github.com/sre-mentor",
            focusAreas: ["reliability", "observability"],
            createdAt: Date.now() - 165 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 19 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 11 * 60 * 60 * 1000,
        },
        {
            userId: userIds[2],
            role: "HR/People Partner",
            company: "People First",
            currentPosition: "People Partner",
            yearsOfExperience: 9,
            industry: "People Ops",
            bio: "Mentoring on career growth, interviewing, and feedback.",
            longBio:
                "People partner with experience in hiring, performance, and coaching. I help candidates stand out.",
            tagline: "Navigate your career",
            location: "QC",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: [
                "Interviewing",
                "Career Coaching",
                "Feedback",
                "Negotiation",
            ],
            specializations: ["Interviews", "Negotiation", "Soft Skills"],
            languages: ["English", "Filipino"],
            availability: "Weekends",
            availableDays: ["saturday"],
            availableTimeSlots: ["morning"],
            hourlyRate: 35,
            currency: "USD",
            offersFreeSession: true,
            rating: 4.6,
            totalReviews: 15,
            mentees: 11,
            sessionsCompleted: 70,
            responseTime: "within 20 hours",
            acceptanceRate: 84,
            isVerified: true,
            verifiedAt: Date.now() - 115 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 14,
            linkedInUrl: "https://linkedin.com/in/people-mentor",
            focusAreas: ["career", "interview"],
            createdAt: Date.now() - 175 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 25 * 60 * 60 * 1000,
        },
        {
            userId: userIds[3],
            role: "UX Researcher",
            company: "Insight Labs",
            currentPosition: "Lead UX Researcher",
            yearsOfExperience: 8,
            industry: "UX",
            bio: "Mentoring on research planning and synthesis.",
            longBio:
                "I guide researchers on planning studies, interviewing, and synthesizing insights for product teams.",
            tagline: "Find the right insights",
            location: "Manila",
            timezone: "Asia/Manila",
            isRemoteOnly: true,
            expertise: ["UX Research", "Interviews", "Synthesis", "Workshops"],
            specializations: ["Generative", "Evaluative", "Research Ops"],
            languages: ["English", "Filipino"],
            availability: "Weekdays",
            availableDays: ["monday", "wednesday"],
            availableTimeSlots: ["afternoon"],
            hourlyRate: 52,
            currency: "USD",
            offersFreeSession: false,
            rating: 4.74,
            totalReviews: 19,
            mentees: 12,
            sessionsCompleted: 90,
            responseTime: "within 9 hours",
            acceptanceRate: 88,
            isVerified: true,
            verifiedAt: Date.now() - 125 * 24 * 60 * 60 * 1000,
            isAvailableForNewMentees: true,
            maxMentees: 16,
            linkedInUrl: "https://linkedin.com/in/uxr-mentor",
            focusAreas: ["ux-research", "career"],
            createdAt: Date.now() - 185 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now() - 22 * 24 * 60 * 60 * 1000,
            lastActiveAt: Date.now() - 27 * 60 * 60 * 1000,
        },
    ];

    const mentorIds = [];
    for (const mentor of mockMentors) {
        const id = await ctx.db.insert("mentors", mentor);
        mentorIds.push(id);
    }

    return mentorIds;
}
