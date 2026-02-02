/**
 * Profile Validation Helpers
 * Validation functions for profile fields
 */

import type {
    ProfileValidationError,
    EducationEntry,
    ExperienceEntry,
} from "../types";

/**
 * URL validation regex
 */
const URL_PATTERN =
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
    if (!url || url.trim() === "") return true; // Empty is valid (optional)
    return URL_PATTERN.test(url.trim());
}

/**
 * Validate required field
 */
export function validateRequired(
    value: string | undefined | null,
    fieldName: string,
): ProfileValidationError | null {
    if (!value || value.trim() === "") {
        return {
            field: fieldName,
            message: `${fieldName} is required`,
        };
    }
    return null;
}

/**
 * Validate max length
 */
export function validateMaxLength(
    value: string | undefined,
    maxLength: number,
    fieldName: string,
): ProfileValidationError | null {
    if (value && value.length > maxLength) {
        return {
            field: fieldName,
            message: `${fieldName} must be ${maxLength} characters or less`,
        };
    }
    return null;
}

/**
 * Validate min length
 */
export function validateMinLength(
    value: string | undefined,
    minLength: number,
    fieldName: string,
): ProfileValidationError | null {
    if (value && value.trim().length > 0 && value.trim().length < minLength) {
        return {
            field: fieldName,
            message: `${fieldName} must be at least ${minLength} characters`,
        };
    }
    return null;
}

/**
 * Validate date range (start date must be before end date)
 */
export function validateDateRange(
    startDate: number,
    endDate?: number,
): ProfileValidationError | null {
    if (endDate && startDate > endDate) {
        return {
            field: "dateRange",
            message: "End date must be after start date",
        };
    }
    return null;
}

/**
 * Validate education entry
 */
export function validateEducationEntry(
    entry: EducationEntry,
): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    // Required fields
    const institutionError = validateRequired(entry.institution, "Institution");
    if (institutionError) errors.push(institutionError);

    const degreeError = validateRequired(entry.degree, "Degree");
    if (degreeError) errors.push(degreeError);

    const fieldError = validateRequired(entry.field, "Field of study");
    if (fieldError) errors.push(fieldError);

    // Date validation
    if (!entry.isCurrent && !entry.endDate) {
        errors.push({
            field: "endDate",
            message: "End date is required when not current",
        });
    }

    if (entry.endDate) {
        const dateError = validateDateRange(entry.startDate, entry.endDate);
        if (dateError) errors.push(dateError);
    }

    // Description length
    const descError = validateMaxLength(entry.description, 500, "Description");
    if (descError) errors.push(descError);

    return errors;
}

/**
 * Validate experience entry
 */
export function validateExperienceEntry(
    entry: ExperienceEntry,
): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    // Required fields
    const titleError = validateRequired(entry.title, "Job title");
    if (titleError) errors.push(titleError);

    const companyError = validateRequired(entry.company, "Company");
    if (companyError) errors.push(companyError);

    // Date validation
    if (!entry.isCurrent && !entry.endDate) {
        errors.push({
            field: "endDate",
            message: "End date is required when not current",
        });
    }

    if (entry.endDate) {
        const dateError = validateDateRange(entry.startDate, entry.endDate);
        if (dateError) errors.push(dateError);
    }

    // Description length
    const descError = validateMaxLength(entry.description, 1000, "Description");
    if (descError) errors.push(descError);

    return errors;
}

/**
 * Validate social link URLs
 */
export function validateSocialLinks(
    linkedInUrl?: string,
    githubUrl?: string,
    portfolioUrl?: string,
): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    if (linkedInUrl && !validateUrl(linkedInUrl)) {
        errors.push({
            field: "linkedInUrl",
            message: "Please enter a valid LinkedIn URL",
        });
    }

    if (githubUrl && !validateUrl(githubUrl)) {
        errors.push({
            field: "githubUrl",
            message: "Please enter a valid GitHub URL",
        });
    }

    if (portfolioUrl && !validateUrl(portfolioUrl)) {
        errors.push({
            field: "portfolioUrl",
            message: "Please enter a valid portfolio URL",
        });
    }

    return errors;
}

/**
 * Validate basic profile fields
 */
export function validateBasicProfile(data: {
    name?: string;
    bio?: string;
    careerGoals?: string;
    educationLevel?: string;
}): ProfileValidationError[] {
    const errors: ProfileValidationError[] = [];

    // Required: name and education
    const nameError = validateRequired(data.name, "Name");
    if (nameError) errors.push(nameError);

    const nameMinError = validateMinLength(data.name, 2, "Name");
    if (nameMinError) errors.push(nameMinError);

    const educationError = validateRequired(
        data.educationLevel,
        "Education level",
    );
    if (educationError) errors.push(educationError);

    // Optional but with limits
    const bioError = validateMaxLength(data.bio, 500, "Bio");
    if (bioError) errors.push(bioError);

    const goalsError = validateMaxLength(
        data.careerGoals,
        1000,
        "Career goals",
    );
    if (goalsError) errors.push(goalsError);

    return errors;
}
