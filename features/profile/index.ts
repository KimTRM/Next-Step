/**
 * Profile Feature - Public API
 * Central export point for the profile feature
 */

// Components
export { ProfilePage } from "./components/ProfilePage";
export { ProfileViewMode } from "./components/ProfileViewMode";
export { ProfileEditMode } from "./components/ProfileEditMode";

// Hooks
export { useProfileCompletion } from "./hooks/useProfileCompletion";
export { useEducationManager } from "./hooks/useEducationManager";
export { useExperienceManager } from "./hooks/useExperienceManager";
export { useProfileForm } from "./hooks/useProfileForm";

// API
export { useProfile, useUpdateProfile, useUpsertProfile } from "./api";

// Helpers
export * from "./helpers/validation";
export * from "./helpers/profile";

// Constants
export * from "./constants";

// Types
export type {
    ProfileFormData,
    ProfileCompletion,
    ProfileField,
    User,
    EducationLevel,
    EducationEntry,
    ExperienceEntry,
    DocumentEntry,
    ProfileValidationError,
    IncompleteSection,
} from "./types";
