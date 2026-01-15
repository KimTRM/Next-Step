/**
 * Seed Script for Convex Database
 * 
 * Populates the database with initial data from mock files
 * Run with: npx convex run seed:seedAll
 */

import { internalMutation } from "./_generated/server";

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
    const applicationIds = await seedApplications(ctx, userIds, opportunityIds);
    console.log(`✓ Seeded ${applicationIds.length} applications`);

    // Seed messages
    const messageIds = await seedMessages(ctx, userIds);
    console.log(`✓ Seeded ${messageIds.length} messages`);

    console.log("✅ Database seeding complete!");
    return {
      users: userIds.length,
      opportunities: opportunityIds.length,
      applications: applicationIds.length,
      messages: messageIds.length,
    };
  },
});

/**
 * Clear all data (use with caution!)
 */
async function clearAllData(ctx: any) {
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
async function seedUsers(ctx: any) {
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
      skills: ["JavaScript", "Python", "System Design", "Career Guidance"],
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
      createdAt: Date.now(),
    });
    userIds.push(id);
  }

  return userIds;
}

/**
 * Seed opportunities
 */
async function seedOpportunities(ctx: any, userIds: any[]) {
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
async function seedApplications(ctx: any, userIds: any[], opportunityIds: any[]) {
  const mockApplications = [
    {
      opportunityId: opportunityIds[0],
      userId: userIds[0], // student
      status: "pending" as const,
      coverLetter: "I'm very interested in this internship opportunity...",
    },
    {
      opportunityId: opportunityIds[1],
      userId: userIds[0],
      status: "accepted" as const,
      coverLetter: "I have strong experience with full stack development...",
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
async function seedMessages(ctx: any, userIds: any[]) {
  const mockMessages = [
    {
      senderId: userIds[0], // student
      receiverId: userIds[1], // mentor
      content: "Hi Sarah, I'd love to learn more about your mentorship program!",
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
