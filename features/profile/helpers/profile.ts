/**
 * Profile Helpers
 * Utility functions for profile management
 */

import type {
    User,
    IncompleteSection,
    EducationEntry,
    ExperienceEntry,
} from "../types";

/**
 * Detect incomplete sections in profile
 */
export function detectIncompleteSections(
    user: User | null,
): IncompleteSection[] {
    if (!user) return [];

    const incompleteSections: IncompleteSection[] = [];

    // Basic Information
    const basicFields: string[] = [];
    if (!user.name || user.name.trim() === "") basicFields.push("Name");
    if (!user.educationLevel) basicFields.push("Education Level");
    if (!user.bio || user.bio.trim() === "") basicFields.push("Bio");
    if (basicFields.length > 0) {
        incompleteSections.push({
            section: "Basic Information",
            fields: basicFields,
            priority: "high",
        });
    }

    // Skills & Interests
    const skillsFields: string[] = [];
    if (!user.skills || user.skills.length === 0) skillsFields.push("Skills");
    if (!user.interests || user.interests.length === 0)
        skillsFields.push("Interests");
    if (skillsFields.length > 0) {
        incompleteSections.push({
            section: "Skills & Interests",
            fields: skillsFields,
            priority: "high",
        });
    }

    // Career Goals
    const careerFields: string[] = [];
    if (!user.careerGoals || user.careerGoals.trim() === "")
        careerFields.push("Career Goals");
    if (!user.goals || user.goals.length === 0) careerFields.push("Goals");
    if (careerFields.length > 0) {
        incompleteSections.push({
            section: "Career Goals",
            fields: careerFields,
            priority: "medium",
        });
    }

    // Education Details
    if (!user.education || user.education.length === 0) {
        incompleteSections.push({
            section: "Education",
            fields: ["Add at least one education entry"],
            priority: "medium",
        });
    }

    // Work Experience
    if (!user.experience || user.experience.length === 0) {
        incompleteSections.push({
            section: "Experience",
            fields: ["Add at least one work experience entry"],
            priority: "medium",
        });
    }

    // Social Links
    const socialFields: string[] = [];
    if (!user.linkedInUrl) socialFields.push("LinkedIn");
    if (!user.githubUrl) socialFields.push("GitHub");
    if (!user.portfolioUrl) socialFields.push("Portfolio");
    if (socialFields.length === 3) {
        // Only flag if ALL are missing
        incompleteSections.push({
            section: "Social Links",
            fields: ["Add at least one social link"],
            priority: "low",
        });
    }

    return incompleteSections;
}

/**
 * Get profile strength message based on completion
 */
export function getProfileStrengthMessage(percentage: number): string {
    if (percentage >= 90) return "Excellent! Your profile is nearly complete.";
    if (percentage >= 70) return "Great job! Just a few more details to go.";
    if (percentage >= 50) return "Good start! Keep filling in your profile.";
    if (percentage >= 30)
        return "Getting there! Add more details to stand out.";
    return "Let's get started! Complete your profile to attract opportunities.";
}

/**
 * Sort education entries by date (most recent first)
 */
export function sortEducationByDate(
    entries: EducationEntry[],
): EducationEntry[] {
    return [...entries].sort((a, b) => {
        // Current entries first
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;

        // Then by end date (most recent first)
        const aEnd = a.endDate || Date.now();
        const bEnd = b.endDate || Date.now();
        return bEnd - aEnd;
    });
}

/**
 * Sort experience entries by date (most recent first)
 */
export function sortExperienceByDate(
    entries: ExperienceEntry[],
): ExperienceEntry[] {
    return [...entries].sort((a, b) => {
        // Current entries first
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;

        // Then by end date (most recent first)
        const aEnd = a.endDate || Date.now();
        const bEnd = b.endDate || Date.now();
        return bEnd - aEnd;
    });
}

/**
 * Format date range for display
 */
export function formatDateRange(
    startDate: number,
    endDate?: number,
    isCurrent?: boolean,
): string {
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });

    if (isCurrent) {
        return `${startFormatted} – Present`;
    }

    if (endDate) {
        const end = new Date(endDate);
        const endFormatted = end.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });

        // Calculate duration
        const months = Math.round(
            (endDate - startDate) / (1000 * 60 * 60 * 24 * 30),
        );
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let duration = "";
        if (years > 0) duration += `${years} year${years > 1 ? "s" : ""}`;
        if (remainingMonths > 0) {
            if (duration) duration += " ";
            duration += `${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
        }

        return `${startFormatted} – ${endFormatted}${duration ? ` (${duration})` : ""}`;
    }

    return startFormatted;
}

/**
 * Check if profile has minimum required fields
 */
export function hasMinimumProfile(user: User | null): boolean {
    if (!user) return false;
    return !!(
        user.name &&
        user.educationLevel &&
        user.skills &&
        user.skills.length > 0
    );
}

/**
 * Get next recommended action for profile
 */
export function getNextRecommendedAction(user: User | null): string | null {
    if (!user) return "Create your profile";

    if (!user.name) return "Add your name";
    if (!user.educationLevel) return "Select your education level";
    if (!user.bio) return "Write a short bio";
    if (!user.skills || user.skills.length === 0) return "Add your skills";
    if (!user.careerGoals) return "Describe your career goals";
    if (!user.education || user.education.length === 0)
        return "Add education details";
    if (!user.experience || user.experience.length === 0)
        return "Add work experience";
    if (!user.linkedInUrl && !user.githubUrl && !user.portfolioUrl)
        return "Add a social link";

    return null; // Profile is complete
}
