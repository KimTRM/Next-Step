/**
 * Profile Feature - Constants
 * Shared constants for profile feature
 */

/**
 * Skill suggestions for skill selector
 */
export const SKILL_SUGGESTIONS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "HTML/CSS",
    "SQL",
    "Git",
    "Communication",
    "Problem Solving",
    "Teamwork",
];

/**
 * Interest suggestions for interest selector
 */
export const INTEREST_SUGGESTIONS = [
    "Web Development",
    "Mobile Apps",
    "AI/ML",
    "Data Science",
    "DevOps",
    "UI/UX Design",
    "Cloud Computing",
    "Cybersecurity",
    "Blockchain",
    "Gaming",
];

/**
 * Education level options with labels
 */
export const EDUCATION_LEVELS = [
    { value: "high_school", label: "High School" },
    { value: "undergraduate", label: "Undergraduate" },
    { value: "graduate", label: "Graduate" },
    { value: "phd", label: "PhD" },
    { value: "bootcamp", label: "Bootcamp" },
    { value: "self_taught", label: "Self-Taught" },
] as const;
