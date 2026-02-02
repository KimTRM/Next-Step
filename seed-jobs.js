// Simple seed script to add sample jobs for testing
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("http://localhost:3001");

const sampleJobs = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp Philippines",
    description: "We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web technologies. You will be responsible for building responsive web applications and leading the frontend team.",
    employmentType: "full-time",
    location: "Makati City, Philippines",
    locationType: "hybrid",
    minSalary: 80000,
    maxSalary: 120000,
    salaryCurrency: "₱",
    salaryPeriod: "month",
    requiredSkills: ["React", "TypeScript", "CSS", "JavaScript", "Node.js"],
    experienceLevel: "senior",
    education: "bachelor",
    postedDate: Date.now() - 86400000 * 5, // 5 days ago
    isActive: true,
    views: 145,
    postedBy: "user123", // This would need to be a real user ID
    industry: "technology",
    jobCategory: "technology",
    tags: ["frontend", "react", "typescript", "senior"],
  },
  {
    title: "Marketing Manager",
    company: "Digital Growth Agency",
    description: "Seeking an experienced Marketing Manager to develop and execute marketing strategies. Experience with digital marketing, social media, and content creation required.",
    employmentType: "full-time",
    location: "BGC, Taguig",
    locationType: "on-site",
    minSalary: 60000,
    maxSalary: 90000,
    salaryCurrency: "₱",
    salaryPeriod: "month",
    requiredSkills: ["Digital Marketing", "Social Media", "Content Strategy", "Analytics"],
    experienceLevel: "mid",
    education: "bachelor",
    postedDate: Date.now() - 86400000 * 3, // 3 days ago
    isActive: true,
    views: 89,
    postedBy: "user123",
    industry: "marketing",
    jobCategory: "marketing",
    tags: ["marketing", "digital", "strategy"],
  },
  {
    title: "UX/UI Design Intern",
    company: "Design Studio Pro",
    description: "Looking for a creative UX/UI Design Intern to assist with user research, wireframing, and prototyping. Great opportunity to learn and grow in a professional design environment.",
    employmentType: "internship",
    location: "Remote",
    locationType: "remote",
    minSalary: 10000,
    maxSalary: 15000,
    salaryCurrency: "₱",
    salaryPeriod: "month",
    requiredSkills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    experienceLevel: "entry",
    education: "bachelor",
    postedDate: Date.now() - 86400000 * 1, // 1 day ago
    isActive: true,
    views: 67,
    postedBy: "user123",
    industry: "design",
    jobCategory: "technology",
    tags: ["ux", "ui", "design", "internship"],
  },
  {
    title: "Full Stack Developer (Contract)",
    company: "StartupHub",
    description: "Need a Full Stack Developer for a 6-month contract project. Must be proficient in MERN stack and have experience with cloud deployment.",
    employmentType: "contract",
    location: "Cebu City",
    locationType: "remote",
    minSalary: 100000,
    maxSalary: 150000,
    salaryCurrency: "₱",
    salaryPeriod: "month",
    requiredSkills: ["MongoDB", "Express", "React", "Node.js", "AWS"],
    experienceLevel: "senior",
    education: "bachelor",
    postedDate: Date.now() - 86400000 * 7, // 7 days ago
    isActive: true,
    views: 203,
    postedBy: "user123",
    industry: "technology",
    jobCategory: "technology",
    tags: ["fullstack", "mern", "contract"],
  },
  {
    title: "Customer Service Representative",
    company: "Global Support Solutions",
    description: "Hiring Customer Service Representatives to handle customer inquiries via phone, email, and chat. Excellent communication skills required.",
    employmentType: "full-time",
    location: "Quezon City",
    locationType: "on-site",
    minSalary: 18000,
    maxSalary: 25000,
    salaryCurrency: "₱",
    salaryPeriod: "month",
    requiredSkills: ["Customer Service", "Communication", "Problem Solving"],
    experienceLevel: "entry",
    education: "high_school",
    postedDate: Date.now() - 86400000 * 2, // 2 days ago
    isActive: true,
    views: 156,
    postedBy: "user123",
    industry: "customer-service",
    jobCategory: "customer-service",
    tags: ["customer", "support", "service"],
  },
];

async function seedJobs() {
  try {
    console.log("Seeding sample jobs...");
    
    for (const job of sampleJobs) {
      try {
        const result = await client.mutation("jobs:createJob", job);
        console.log(`Created job: ${job.title} with ID: ${result}`);
      } catch (error) {
        console.error(`Error creating job ${job.title}:`, error);
      }
    }
    
    console.log("Job seeding completed!");
  } catch (error) {
    console.error("Error seeding jobs:", error);
  }
}

seedJobs();
