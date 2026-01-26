/**
 * Users Feature - Public API
 */

// API hooks
export {
    useAllUsers,
    useUserById,
    useUserByClerkId,
    useCurrentUser,
    useCurrentSession,
    usePublicUserProfile,
    useSearchUsersBySkills,
    useUpsertUser,
    useUpdateUserProfile,
    useCompleteOnboarding,
    useUpdateUser,
    useDeleteUser,
    useAuth,
} from "./api";

// Types
export type {
    User,
    UserRole,
    UserSession,
    PublicUserProfile,
    UserWithMatchScore,
    UpdateProfileInput,
    EducationLevel,
    Gender,
    WorkStyle,
    Availability,
    EducationEntry,
} from "./types";

// Components (will be added as they are migrated)
// export { ProfilePageContent } from "./components/ProfilePageContent";
