/**
 * Mentors Feature - Public API
 */

// API hooks
export {
    useAllMentors,
    useVerifiedMentors,
    useMentorById,
    useSearchMentors,
    useTopRatedMentors,
    useRecommendedMentors,
    useMentorsByExpertise,
    useSimilarMentors,
    useMentorProfile,
    useMentees,
    useConnectionRequests,
    useCreateMentor,
    useUpdateMentor,
    useUpdateMentorRating,
    useIncrementMentees,
    useVerifyMentor,
    useBookSession,
    useSendConnectionRequest,
} from "./api";

// Types
export type {
    Mentor,
    MentorWithUser,
    MentorWithMatchScore,
    MentorshipSession,
    Mentee,
    CreateMentorInput,
    UpdateMentorInput,
    BookSessionInput,
} from "./types";

// Constants
export {
    EXPERTISE_AREAS,
    MENTORING_STYLES,
    SESSION_DURATIONS,
    AVAILABILITY_OPTIONS,
} from "./constants";

export type { ExpertiseArea } from "./constants";

// Components (will be added as they are migrated)
// export { MentorCard } from "./components/MentorCard";
// export { MentorFilters } from "./components/MentorFilters";
// export { MentorsPageContent } from "./components/MentorsPageContent";
// export { BookingModal } from "./components/BookingModal";
// export { ConnectModal } from "./components/ConnectModal";
