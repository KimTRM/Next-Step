/**
 * Mentors Feature - Constants
 */

// Expertise areas for filtering
export const EXPERTISE_AREAS = [
    "all",
    "technology",
    "business",
    "marketing",
    "finance",
    "healthcare",
    "education",
    "design",
] as const;

export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

// Mentoring styles
export const MENTORING_STYLES = [
    { value: "structured", label: "Structured (Regular meetings)" },
    { value: "flexible", label: "Flexible (On-demand)" },
    { value: "project-based", label: "Project-based" },
    { value: "career-coaching", label: "Career Coaching" },
    { value: "skill-development", label: "Skill Development" },
] as const;

// Session durations (in minutes)
export const SESSION_DURATIONS = [
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1.5 hours" },
    { value: 120, label: "2 hours" },
] as const;

// Availability options
export const AVAILABILITY_OPTIONS = [
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "evenings", label: "Evenings only" },
    { value: "flexible", label: "Flexible" },
] as const;
