"use client";

/**
 * Job Application Flow - Context and State Management
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import type {
    ApplicationStep,
    ApplicationFlowState,
    ApplicationFormData,
    DocumentsStepData,
    QuestionsStepData,
    ProfileStepData,
    StepValidation,
    ApplicationJob,
    ApplicationUser,
} from "../types/apply-flow";
import {
    APPLICATION_STEPS,
    INITIAL_FORM_DATA,
    INITIAL_VALIDATION,
} from "../types/apply-flow";

// Action types
type ApplicationAction =
    | { type: "SET_JOB"; payload: ApplicationJob }
    | { type: "SET_APPLICANT"; payload: ApplicationUser }
    | { type: "SET_STEP"; payload: ApplicationStep }
    | { type: "NEXT_STEP" }
    | { type: "PREV_STEP" }
    | { type: "UPDATE_DOCUMENTS"; payload: Partial<DocumentsStepData> }
    | { type: "UPDATE_QUESTIONS"; payload: Partial<QuestionsStepData> }
    | { type: "UPDATE_PROFILE"; payload: Partial<ProfileStepData> }
    | { type: "SET_CONFIRMATION"; payload: boolean }
    | { type: "SET_VALIDATION"; payload: { step: ApplicationStep; validation: StepValidation } }
    | { type: "SET_SUBMITTING"; payload: boolean }
    | { type: "SET_COMPLETE"; payload: boolean }
    | { type: "RESET_FLOW" }
    | { type: "INITIALIZE"; payload: { job: ApplicationJob; applicant: ApplicationUser } };

// Initial state
const initialState: ApplicationFlowState = {
    currentStep: APPLICATION_STEPS.DOCUMENTS,
    job: null,
    applicant: null,
    formData: INITIAL_FORM_DATA,
    validation: INITIAL_VALIDATION,
    isSubmitting: false,
    isComplete: false,
};

// Reducer
function applicationReducer(
    state: ApplicationFlowState,
    action: ApplicationAction
): ApplicationFlowState {
    switch (action.type) {
        case "SET_JOB":
            return { ...state, job: action.payload };

        case "SET_APPLICANT":
            return { ...state, applicant: action.payload };

        case "SET_STEP":
            return { ...state, currentStep: action.payload };

        case "NEXT_STEP":
            if (state.currentStep < APPLICATION_STEPS.REVIEW) {
                return { ...state, currentStep: (state.currentStep + 1) as ApplicationStep };
            }
            return state;

        case "PREV_STEP":
            if (state.currentStep > APPLICATION_STEPS.DOCUMENTS) {
                return { ...state, currentStep: (state.currentStep - 1) as ApplicationStep };
            }
            return state;

        case "UPDATE_DOCUMENTS":
            return {
                ...state,
                formData: {
                    ...state.formData,
                    documents: { ...state.formData.documents, ...action.payload },
                },
            };

        case "UPDATE_QUESTIONS":
            return {
                ...state,
                formData: {
                    ...state.formData,
                    questions: { ...state.formData.questions, ...action.payload },
                },
            };

        case "UPDATE_PROFILE":
            return {
                ...state,
                formData: {
                    ...state.formData,
                    profile: { ...state.formData.profile, ...action.payload },
                },
            };

        case "SET_CONFIRMATION":
            return {
                ...state,
                formData: {
                    ...state.formData,
                    review: { ...state.formData.review, isConfirmed: action.payload },
                },
            };

        case "SET_VALIDATION":
            return {
                ...state,
                validation: {
                    ...state.validation,
                    [action.payload.step]: action.payload.validation,
                },
            };

        case "SET_SUBMITTING":
            return { ...state, isSubmitting: action.payload };

        case "SET_COMPLETE":
            return { ...state, isComplete: action.payload };

        case "RESET_FLOW":
            return initialState;

        case "INITIALIZE":
            return {
                ...initialState,
                job: action.payload.job,
                applicant: action.payload.applicant,
                formData: {
                    ...INITIAL_FORM_DATA,
                    profile: {
                        experience: action.payload.applicant.experience || [],
                        education: action.payload.applicant.education || [],
                        certifications: [],
                        skills: action.payload.applicant.skills || [],
                    },
                },
            };

        default:
            return state;
    }
}

// Context type
type ApplicationContextType = {
    state: ApplicationFlowState;
    // Navigation
    goToStep: (step: ApplicationStep) => void;
    nextStep: () => void;
    prevStep: () => void;
    // Data updates
    updateDocuments: (data: Partial<DocumentsStepData>) => void;
    updateQuestions: (data: Partial<QuestionsStepData>) => void;
    updateProfile: (data: Partial<ProfileStepData>) => void;
    setConfirmation: (confirmed: boolean) => void;
    // Validation
    validateStep: (step: ApplicationStep) => StepValidation;
    isStepValid: (step: ApplicationStep) => boolean;
    canProceed: () => boolean;
    // Flow control
    initialize: (job: ApplicationJob, applicant: ApplicationUser) => void;
    reset: () => void;
    submitAction: () => Promise<void>;
};

// Create context
const ApplicationContext = createContext<ApplicationContextType | null>(null);

// Provider props
type ApplicationProviderProps = {
    children: React.ReactNode;
    onSubmitAction?: (data: ApplicationFormData, job: ApplicationJob) => Promise<void>;
};

// Provider component
export function ApplicationFlowProvider({ children, onSubmitAction }: ApplicationProviderProps) {
    const [state, dispatch] = useReducer(applicationReducer, initialState);

    // Navigation handlers
    const goToStep = useCallback((step: ApplicationStep) => {
        dispatch({ type: "SET_STEP", payload: step });
    }, []);

    const nextStep = useCallback(() => {
        dispatch({ type: "NEXT_STEP" });
    }, []);

    const prevStep = useCallback(() => {
        dispatch({ type: "PREV_STEP" });
    }, []);

    // Data update handlers
    const updateDocuments = useCallback((data: Partial<DocumentsStepData>) => {
        dispatch({ type: "UPDATE_DOCUMENTS", payload: data });
    }, []);

    const updateQuestions = useCallback((data: Partial<QuestionsStepData>) => {
        dispatch({ type: "UPDATE_QUESTIONS", payload: data });
    }, []);

    const updateProfile = useCallback((data: Partial<ProfileStepData>) => {
        dispatch({ type: "UPDATE_PROFILE", payload: data });
    }, []);

    const setConfirmation = useCallback((confirmed: boolean) => {
        dispatch({ type: "SET_CONFIRMATION", payload: confirmed });
    }, []);

    // Validation
    const validateStep = useCallback((step: ApplicationStep): StepValidation => {
        const errors: string[] = [];

        switch (step) {
            case APPLICATION_STEPS.DOCUMENTS:
                if (!state.formData.documents.resume) {
                    errors.push("Please upload or select a resume");
                }
                break;

            case APPLICATION_STEPS.QUESTIONS:
                if (!state.formData.questions.expectedSalary) {
                    errors.push("Please select your expected salary");
                }
                break;

            case APPLICATION_STEPS.PROFILE:
                // Profile updates are optional
                break;

            case APPLICATION_STEPS.REVIEW:
                // Check all previous steps are valid
                if (!state.formData.documents.resume) {
                    errors.push("Resume is required");
                }
                if (!state.formData.questions.expectedSalary) {
                    errors.push("Expected salary is required");
                }
                if (!state.formData.review.isConfirmed) {
                    errors.push("Please confirm your application details");
                }
                break;
        }

        const validation = { isValid: errors.length === 0, errors };
        dispatch({ type: "SET_VALIDATION", payload: { step, validation } });
        return validation;
    }, [state.formData]);

    const isStepValid = useCallback((step: ApplicationStep): boolean => {
        return validateStep(step).isValid;
    }, [validateStep]);

    const canProceed = useCallback((): boolean => {
        return isStepValid(state.currentStep);
    }, [isStepValid, state.currentStep]);

    // Flow control
    const initialize = useCallback((job: ApplicationJob, applicant: ApplicationUser) => {
        dispatch({ type: "INITIALIZE", payload: { job, applicant } });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET_FLOW" });
    }, []);

    const submitAction = useCallback(async () => {
        if (!state.job) return;

        // Validate all steps
        const step4Validation = validateStep(APPLICATION_STEPS.REVIEW);
        if (!step4Validation.isValid) {
            throw new Error("Please complete all required fields");
        }

        dispatch({ type: "SET_SUBMITTING", payload: true });

        try {
            if (onSubmitAction) {
                await onSubmitAction(state.formData, state.job);
            }
            dispatch({ type: "SET_COMPLETE", payload: true });
        } finally {
            dispatch({ type: "SET_SUBMITTING", payload: false });
        }
    }, [state.job, state.formData, validateStep, onSubmitAction]);

    // Memoized context value
    const value = useMemo<ApplicationContextType>(() => ({
        state,
        goToStep,
        nextStep,
        prevStep,
        updateDocuments,
        updateQuestions,
        updateProfile,
        setConfirmation,
        validateStep,
        isStepValid,
        canProceed,
        initialize,
        reset,
        submitAction,
    }), [
        state,
        goToStep,
        nextStep,
        prevStep,
        updateDocuments,
        updateQuestions,
        updateProfile,
        setConfirmation,
        validateStep,
        isStepValid,
        canProceed,
        initialize,
        reset,
        submitAction,
    ]);

    return (
        <ApplicationContext.Provider value={value}>
            {children}
        </ApplicationContext.Provider>
    );
}

// Hook to use the context
export function useApplicationFlow() {
    const context = useContext(ApplicationContext);
    if (!context) {
        throw new Error("useApplicationFlow must be used within an ApplicationFlowProvider");
    }
    return context;
}
