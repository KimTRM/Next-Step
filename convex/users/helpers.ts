/**
 * User Helpers
 * Shared utility functions for user operations
 */

/**
 * Calculate profile completion percentage
 * Tracks: name, email, bio, location, age, skills, interests, careerGoals,
 *         educationLevel, currentStatus, social links
 */
export function calculateProfileCompletion(profile: {
    name?: string;
    email?: string;
    bio?: string;
    location?: string;
    age?: number;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
    educationLevel?: string;
    currentStatus?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    lookingFor?: string[];
    timeline?: string;
}): number {
    const fields = [
        profile.name,
        profile.email,
        profile.bio,
        profile.location,
        profile.age,
        profile.skills && profile.skills.length > 0,
        profile.interests && profile.interests.length > 0,
        profile.careerGoals,
        profile.educationLevel,
        profile.currentStatus,
        profile.linkedInUrl || profile.githubUrl || profile.portfolioUrl, // At least one social link
        profile.lookingFor && profile.lookingFor.length > 0,
        profile.timeline,
    ];

    const filledFields = fields.filter(Boolean).length;
    const totalFields = fields.length;

    return Math.round((filledFields / totalFields) * 100);
}
