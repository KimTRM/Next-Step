/**
 * Job Application Flow - Type Definitions
 * Self-contained types to avoid cross-feature dependencies
 */

// Application flow steps
export type ApplicationStep = 1 | 2 | 3 | 4;

export const APPLICATION_STEPS = {
    DOCUMENTS: 1,
    QUESTIONS: 2,
    PROFILE: 3,
    REVIEW: 4,
} as const;

export const STEP_LABELS: Record<ApplicationStep, string> = {
    1: "Choose Documents",
    2: "Employer Questions",
    3: "Update Profile",
    4: "Review & Submit",
};

// Document types
export type ResumeSource = "upload" | "existing" | null;
export type CoverLetterOption = "upload" | "write" | "skip" | null;

export type ResumeDocument = {
    id: string;
    name: string;
    url?: string;
    file?: File;
    source: ResumeSource;
    uploadedAt?: number;
};

export type CoverLetterDocument = {
    id: string;
    name?: string;
    url?: string;
    file?: File;
    content?: string;
    option: CoverLetterOption;
    uploadedAt?: number;
};

// Step 1: Documents data
export type DocumentsStepData = {
    resume: ResumeDocument | null;
    coverLetter: CoverLetterDocument | null;
};

// Step 2: Questions data
export type QuestionsStepData = {
    expectedSalary: string;
    salaryCurrency: string;
    additionalNotes?: string;
};

// Education entry type (matches profile feature)
export type EducationEntry = {
    id?: string;
    institution: string;
    degree: string;
    field?: string;
    startDate: number;
    endDate?: number;
    isCurrent: boolean;
    description?: string;
};

// Experience entry type (matches profile feature)
export type ExperienceEntry = {
    id?: string;
    title: string;
    company: string;
    location?: string;
    startDate: number;
    endDate?: number;
    isCurrent: boolean;
    description?: string;
};

// Certification entry type
export type CertificationEntry = {
    id?: string;
    name: string;
    issuingOrganization: string;
    issueDate?: number;
    expiryDate?: number;
    credentialId?: string;
    credentialUrl?: string;
    neverExpires?: boolean;
};

// Step 3: Profile data
export type ProfileStepData = {
    experience: ExperienceEntry[];
    education: EducationEntry[];
    certifications: CertificationEntry[];
    skills: string[];
};

// Step 4: Review data (summary of all steps)
export type ReviewStepData = {
    isConfirmed: boolean;
};

// Complete application form data
export type ApplicationFormData = {
    documents: DocumentsStepData;
    questions: QuestionsStepData;
    profile: ProfileStepData;
    review: ReviewStepData;
};

// Validation state per step
export type StepValidation = {
    isValid: boolean;
    errors: string[];
};

// Minimal Job type for application flow (avoids cross-feature dependency)
export type ApplicationJob = {
    _id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    employmentType?: string;
    locationType?: string;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: string;
    requiredSkills?: string[];
    experienceLevel?: string;
    postedDate: number;
};

// Minimal User type for application flow (avoids cross-feature dependency)
export type ApplicationUser = {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    location?: string;
    experience?: ExperienceEntry[];
    education?: EducationEntry[];
    skills?: string[];
};

// Application flow state
export type ApplicationFlowState = {
    currentStep: ApplicationStep;
    job: ApplicationJob | null;
    applicant: ApplicationUser | null;
    formData: ApplicationFormData;
    validation: Record<ApplicationStep, StepValidation>;
    isSubmitting: boolean;
    isComplete: boolean;
};

// Salary range options (PHP)
export const SALARY_RANGES = [
    { value: "15000", label: "₱15,000" },
    { value: "20000", label: "₱20,000" },
    { value: "25000", label: "₱25,000" },
    { value: "30000", label: "₱30,000" },
    { value: "35000", label: "₱35,000" },
    { value: "40000", label: "₱40,000" },
    { value: "45000", label: "₱45,000" },
    { value: "50000", label: "₱50,000" },
    { value: "60000", label: "₱60,000" },
    { value: "70000", label: "₱70,000" },
    { value: "80000", label: "₱80,000" },
    { value: "90000", label: "₱90,000" },
    { value: "100000", label: "₱100,000" },
    { value: "120000", label: "₱120,000" },
    { value: "150000", label: "₱150,000+" },
] as const;

export type SalaryRange = (typeof SALARY_RANGES)[number];

// Initial form data
export const INITIAL_FORM_DATA: ApplicationFormData = {
    documents: {
        resume: null,
        coverLetter: null,
    },
    questions: {
        expectedSalary: "",
        salaryCurrency: "PHP",
    },
    profile: {
        experience: [],
        education: [],
        certifications: [],
        skills: [],
    },
    review: {
        isConfirmed: false,
    },
};

// Initial validation state
export const INITIAL_VALIDATION: Record<ApplicationStep, StepValidation> = {
    1: { isValid: false, errors: [] },
    2: { isValid: false, errors: [] },
    3: { isValid: true, errors: [] },
    4: { isValid: false, errors: [] },
};
