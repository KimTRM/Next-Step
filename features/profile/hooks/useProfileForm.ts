"use client";

/**
 * useProfileForm Hook
 * Main form state management hook combining all profile sections
 */

import { useState, useCallback, useEffect } from "react";
import type { User, ProfileFormData, ProfileValidationError } from "../types";
import {
    validateBasicProfile,
    validateSocialLinks,
} from "../helpers/validation";
import { useEducationManager } from "./useEducationManager";
import { useExperienceManager } from "./useExperienceManager";

interface UseProfileFormProps {
    user: User | null;
    onSubmit?: (data: ProfileFormData) => Promise<void>;
}

interface UseProfileFormReturn {
    // Form data
    formData: ProfileFormData;
    isDirty: boolean;
    isSubmitting: boolean;

    // Basic field setters
    setName: (value: string) => void;
    setLocation: (value: string) => void;
    setEducationLevel: (value: ProfileFormData["educationLevel"]) => void;
    setBio: (value: string) => void;
    setCareerGoals: (value: string) => void;
    setSkills: (value: string[]) => void;
    setInterests: (value: string[]) => void;
    setLinkedInUrl: (value: string) => void;
    setGithubUrl: (value: string) => void;
    setPortfolioUrl: (value: string) => void;

    // Education management
    educationManager: ReturnType<typeof useEducationManager>;

    // Experience management
    experienceManager: ReturnType<typeof useExperienceManager>;

    // Validation
    errors: ProfileValidationError[];
    validate: () => boolean;
    clearErrors: () => void;

    // Form actions
    submit: () => Promise<void>;
    reset: () => void;
}

/**
 * Get default form values from user
 */
function getDefaultFormData(user: User | null): ProfileFormData {
    return {
        name: user?.name || "",
        location: user?.location || "",
        educationLevel: user?.educationLevel || "",
        bio: user?.bio || "",
        careerGoals: user?.careerGoals || "",
        skills: user?.skills || [],
        interests: user?.interests || [],
        linkedInUrl: user?.linkedInUrl || "",
        githubUrl: user?.githubUrl || "",
        portfolioUrl: user?.portfolioUrl || "",
        education: user?.education || [],
        experience: user?.experience || [],
    };
}

/**
 * Main profile form state management hook
 */
export function useProfileForm({
    user,
    onSubmit,
}: UseProfileFormProps): UseProfileFormReturn {
    const [formData, setFormData] = useState<ProfileFormData>(
        getDefaultFormData(user),
    );
    const [initialData, setInitialData] = useState<ProfileFormData>(
        getDefaultFormData(user),
    );
    const [isDirty, setIsDirty] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ProfileValidationError[]>([]);

    // Education manager
    const educationManager = useEducationManager({
        initialEntries: formData.education,
        onChange: (entries) => {
            setFormData((prev) => ({ ...prev, education: entries }));
            setIsDirty(true);
        },
    });

    // Experience manager
    const experienceManager = useExperienceManager({
        initialEntries: formData.experience,
        onChange: (entries) => {
            setFormData((prev) => ({ ...prev, experience: entries }));
            setIsDirty(true);
        },
    });

    // Reset form when user changes
    useEffect(() => {
        const newData = getDefaultFormData(user);
        setFormData(newData);
        setInitialData(newData);
        setIsDirty(false);
    }, [user]);

    // Check if form is dirty
    useEffect(() => {
        const isDifferent =
            JSON.stringify(formData) !== JSON.stringify(initialData);
        setIsDirty(isDifferent);
    }, [formData, initialData]);

    // Basic field setters
    const setName = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, name: value }));
    }, []);

    const setLocation = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, location: value }));
    }, []);

    const setEducationLevel = useCallback(
        (value: ProfileFormData["educationLevel"]) => {
            setFormData((prev) => ({ ...prev, educationLevel: value }));
        },
        [],
    );

    const setBio = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, bio: value }));
    }, []);

    const setCareerGoals = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, careerGoals: value }));
    }, []);

    const setSkills = useCallback((value: string[]) => {
        setFormData((prev) => ({ ...prev, skills: value }));
    }, []);

    const setInterests = useCallback((value: string[]) => {
        setFormData((prev) => ({ ...prev, interests: value }));
    }, []);

    const setLinkedInUrl = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, linkedInUrl: value }));
    }, []);

    const setGithubUrl = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, githubUrl: value }));
    }, []);

    const setPortfolioUrl = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, portfolioUrl: value }));
    }, []);

    // Validate form
    const validate = useCallback((): boolean => {
        const allErrors: ProfileValidationError[] = [];

        // Validate basic fields
        const basicErrors = validateBasicProfile({
            name: formData.name,
            bio: formData.bio,
            careerGoals: formData.careerGoals,
            educationLevel: formData.educationLevel,
        });
        allErrors.push(...basicErrors);

        // Validate social links
        const linkErrors = validateSocialLinks(
            formData.linkedInUrl,
            formData.githubUrl,
            formData.portfolioUrl,
        );
        allErrors.push(...linkErrors);

        // Validate education entries
        const educationValid = educationManager.validateAll();
        if (!educationValid) {
            allErrors.push({
                field: "education",
                message: "Please fix education entry errors",
            });
        }

        // Validate experience entries
        const experienceValid = experienceManager.validateAll();
        if (!experienceValid) {
            allErrors.push({
                field: "experience",
                message: "Please fix experience entry errors",
            });
        }

        setErrors(allErrors);
        return allErrors.length === 0;
    }, [formData, educationManager, experienceManager]);

    // Clear errors
    const clearErrors = useCallback(() => {
        setErrors([]);
        educationManager.clearErrors();
        experienceManager.clearErrors();
    }, [educationManager, experienceManager]);

    // Submit form
    const submit = useCallback(async () => {
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit?.(formData);
            // Update initial data after successful submit
            setInitialData(formData);
            setIsDirty(false);
            clearErrors();
        } catch (error) {
            console.error("Profile form submission error:", error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validate, onSubmit, clearErrors]);

    // Reset form
    const reset = useCallback(() => {
        setFormData(initialData);
        setIsDirty(false);
        clearErrors();
    }, [initialData, clearErrors]);

    return {
        formData,
        isDirty,
        isSubmitting,
        setName,
        setLocation,
        setEducationLevel,
        setBio,
        setCareerGoals,
        setSkills,
        setInterests,
        setLinkedInUrl,
        setGithubUrl,
        setPortfolioUrl,
        educationManager,
        experienceManager,
        errors,
        validate,
        clearErrors,
        submit,
        reset,
    };
}
