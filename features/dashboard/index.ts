/**
 * Dashboard Feature - Public API
 */

// API hooks
export {
    useCurrentUser,
    useUserApplications,
    useUserMessages,
    useRecommendedJobs,
    useMentorProfile,
    useConnectionRequests,
    useEmployerJobs,
} from "./api";

// Types
export type {
    StudentDashboardStats,
    MentorDashboardStats,
    EmployerDashboardStats,
    DashboardActivity,
    QuickAction,
} from "./types";

// Components (will be added as they are migrated)
// export { StudentDashboard } from "./components/StudentDashboard";
// export { MentorDashboard } from "./components/MentorDashboard";
// export { EmployerDashboard } from "./components/EmployerDashboard";
