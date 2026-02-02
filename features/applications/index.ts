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

// Apply Flow Types
export type {
    ApplicationStep,
    ApplicationFormData,
    DocumentsStepData,
    QuestionsStepData,
    ProfileStepData,
    ReviewStepData,
    ResumeDocument,
    CoverLetterDocument,
    CertificationEntry,
    ExperienceEntry,
    EducationEntry,
    ApplicationJob,
    ApplicationUser,
    SalaryRange,
} from "./types/apply-flow";

// Constants
export {
    APPLICATION_STATUS_LABELS,
    APPLICATION_STATUS_COLORS,
    APPLICATION_STATUS_ORDER,
} from "./constants";

// Apply Flow Constants
export {
    APPLICATION_STEPS,
    STEP_LABELS,
    SALARY_RANGES,
} from "./types/apply-flow";

// Components
export {
    ApplicationsPageContent,
    ApplicationStepper,
    JobApplicationModal,
    DocumentsStep,
    QuestionsStep,
    ProfileStep,
    ReviewStep,
    ApplicationFlowProvider,
    useApplicationFlow,
} from "./components";
