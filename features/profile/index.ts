/**
 * Profile Feature - Public API
 * Central export point for the profile feature
 */

// Components
export { ProfilePage } from "./components/ProfilePage";
export { ProfileViewMode } from "./components/ProfileViewMode";

// Hooks
export { useProfileCompletion } from "./hooks/useProfileCompletion";

// API
export { useProfile, useUpdateProfile, useUpsertProfile } from "./api";

// Types
export type {
    ProfileFormData,
    ProfileCompletion,
    ProfileField,
    User,
    EducationLevel,
} from "./types";
