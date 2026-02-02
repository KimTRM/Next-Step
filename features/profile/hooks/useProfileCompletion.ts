"use client";

/**
 * Profile Completion Hook
 * Calculates profile completion percentage and identifies incomplete fields
 */

import { useMemo } from "react";
import type { User } from "../types";
import type {
    ProfileCompletion,
    ProfileField,
    ProfileFormData,
} from "../types";

/**
 * Profile fields with weights for completion calculation
 */
const PROFILE_FIELDS: ProfileField[] = [
    { key: "name", label: "Name", weight: 12 },
    { key: "educationLevel", label: "Education Level", weight: 10 },
    { key: "bio", label: "Bio", weight: 12 },
    { key: "skills", label: "Skills", weight: 12, isArray: true },
    { key: "interests", label: "Interests", weight: 8, isArray: true },
    { key: "goals", label: "Goals", weight: 8, isArray: true },
    { key: "careerGoals", label: "Career Goals", weight: 8 },
    { key: "education", label: "Education Details", weight: 10, isArray: true },
    { key: "experience", label: "Work Experience", weight: 10, isArray: true },
    { key: "linkedInUrl", label: "LinkedIn", weight: 5 },
    { key: "githubUrl", label: "GitHub", weight: 3 },
    { key: "portfolioUrl", label: "Portfolio", weight: 2 },
];

/**
 * Calculate profile completion from User object
 */
function calculateUserCompletion(user: User | null): ProfileCompletion {
    if (!user) return { percentage: 0, incomplete: [] };

    let totalWeight = 0;
    let completedWeight = 0;
    const incomplete: string[] = [];

    for (const field of PROFILE_FIELDS) {
        totalWeight += field.weight;
        const value = user[field.key as keyof User];

        if (field.isArray) {
            if (Array.isArray(value) && value.length > 0) {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        } else {
            if (value && String(value).trim() !== "") {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        }
    }

    return {
        percentage: Math.round((completedWeight / totalWeight) * 100),
        incomplete,
    };
}

/**
 * Calculate profile completion from form data
 */
function calculateFormCompletion(data: ProfileFormData): ProfileCompletion {
    const fields = [
        { key: "name", value: data.name, label: "Name", weight: 12 },
        {
            key: "educationLevel",
            value: data.educationLevel,
            label: "Education Level",
            weight: 10,
        },
        { key: "bio", value: data.bio, label: "Bio", weight: 12 },
        {
            key: "skills",
            value: data.skills,
            label: "Skills",
            weight: 12,
            isArray: true,
        },
        {
            key: "interests",
            value: data.interests,
            label: "Interests",
            weight: 8,
            isArray: true,
        },
        {
            key: "careerGoals",
            value: data.careerGoals,
            label: "Career Goals",
            weight: 8,
        },
        {
            key: "education",
            value: data.education,
            label: "Education Details",
            weight: 10,
            isArray: true,
        },
        {
            key: "experience",
            value: data.experience,
            label: "Work Experience",
            weight: 10,
            isArray: true,
        },
        {
            key: "linkedInUrl",
            value: data.linkedInUrl,
            label: "LinkedIn",
            weight: 5,
        },
        { key: "githubUrl", value: data.githubUrl, label: "GitHub", weight: 3 },
        {
            key: "portfolioUrl",
            value: data.portfolioUrl,
            label: "Portfolio",
            weight: 2,
        },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const incomplete: string[] = [];

    for (const field of fields) {
        totalWeight += field.weight;
        if (field.isArray) {
            if (Array.isArray(field.value) && field.value.length > 0) {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        } else {
            if (field.value && String(field.value).trim() !== "") {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        }
    }

    return {
        percentage: Math.round((completedWeight / totalWeight) * 100),
        incomplete,
    };
}

/**
 * Hook to calculate profile completion
 * @param user - Current user object
 * @param formData - Optional form data (for edit mode)
 * @param isEditing - Whether currently in edit mode
 */
export function useProfileCompletion(
    user: User | null,
    formData?: ProfileFormData,
    isEditing?: boolean,
): ProfileCompletion {
    return useMemo(() => {
        if (isEditing && formData) {
            return calculateFormCompletion(formData);
        }
        return calculateUserCompletion(user);
    }, [user, formData, isEditing]);
}
