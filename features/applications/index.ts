/**
 * Applications Feature - Public API
 */

// API hooks
export {
    useUserApplications,
    useJobApplications,
    useCreateApplication,
    useUpdateApplicationStatus,
    useUpdateApplicationNotes,
    useDeleteApplication,
} from "./api";

// Types
export type {
    ApplicationStatus,
    JobApplication,
    JobApplicationWithDetails,
    CreateApplicationInput,
    UpdateApplicationStatusInput,
} from "./types";

// Constants
export {
    APPLICATION_STATUS_LABELS,
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUS_ORDER,
} from "./constants";

// Components (will be added as they are migrated)
// export { ApplicationsPageContent } from "./components/ApplicationsPageContent";
