/**
 * Jobs Feature - Public API
 * Export only what should be accessible to other parts of the app
 */

// API hooks
export {
    useAllJobs,
    useJobById,
    useSearchJobs,
    useJobsByCompany,
    useJobsByUser,
    useRecommendedJobs,
    useRelatedJobs,
    useCreateJob,
    useUpdateJob,
    useDeactivateJob,
    useReactivateJob,
    useIncrementViews,
} from "./api";

// Types
export type {
    Job,
    JobWithPoster,
    JobWithMatchScore,
    JobSearchFilters,
    CreateJobInput,
    EmploymentType,
    ExperienceLevel,
    LocationType,
    EducationLevel,
    SalaryPeriod,
} from "./types";

// Constants
export {
    JOB_CATEGORIES,
    JOB_TYPES,
    EXPERIENCE_LEVELS,
    LOCATION_TYPES,
    EDUCATION_LEVELS,
    EMPLOYMENT_TYPE_LABELS,
} from "./constants";

export type { JobCategory } from "./constants";

// Components (will be added as they are migrated)
// export { JobCard } from "./components/JobCard";
// export { JobFilters } from "./components/JobFilters";
// export { JobStats } from "./components/JobStats";
// export { JobsPageContent } from "./components/JobsPageContent";
