/**
 * Profile Components - Shared Types and Constants
 */

import type { EducationLevel } from '../../types';

// Form data type for profile editing
export type ProfileFormData = {
    name: string;
    location: string;
    educationLevel: EducationLevel | '';
    bio: string;
    careerGoals: string;
    skills: string[];
    interests: string[];
    linkedInUrl: string;
    githubUrl: string;
    portfolioUrl: string;
};

// Profile completion result
export type ProfileCompletionResult = {
    percentage: number;
    incomplete: string[];
};

// Education level display labels
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
    high_school: 'High School',
    undergraduate: 'Undergraduate',
    graduate: 'Graduate',
    phd: 'PhD',
    bootcamp: 'Bootcamp',
    self_taught: 'Self-Taught',
};

export const EDUCATION_LEVELS = [
    { value: 'high_school', label: 'High School' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'self_taught', label: 'Self-Taught' },
] as const;

// Skill suggestions
export const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'HTML/CSS', 'SQL', 'Git', 'Communication', 'Problem Solving', 'Teamwork',
];

// Interest suggestions
export const INTEREST_SUGGESTIONS = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science', 'DevOps',
    'UI/UX Design', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'Gaming',
];

// URL validation regex pattern
export const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Validation helper for URLs
export function isValidUrl(url: string): boolean {
    if (!url) return true; // Empty is valid (optional field)
    return URL_PATTERN.test(url);
}

// Auto-save debounce delay in milliseconds
export const AUTO_SAVE_DELAY = 2000;
