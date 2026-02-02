"use client";

/**
 * Job Application Modal
 * Main container for the multi-step application flow
 */

import { useEffect, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/components/ui/utils";
import { ApplicationFlowProvider, useApplicationFlow } from "@/features/applications/contexts/ApplicationFlowContext";
import { ApplicationStepper } from "./ApplicationStepper";
import { DocumentsStep, QuestionsStep, ProfileStep, ReviewStep } from "./steps";
import { APPLICATION_STEPS } from "@/features/applications/types/apply-flow";
import type { ApplicationFormData, ApplicationJob, ApplicationUser } from "@/features/applications/types/apply-flow";

// ============================================
// Inner Content Component (uses context)
// ============================================

interface ApplicationModalContentProps {
    onClose: () => void;
    onViewDescription?: () => void;
    onEditProfile?: () => void;
}

function ApplicationModalContent({
    onClose,
    onViewDescription,
    onEditProfile,
}: ApplicationModalContentProps) {
    const {
        state,
        nextStep,
        prevStep,
        validateStep,
        canProceed,
        submitAction,
    } = useApplicationFlow();

    const { currentStep, isSubmitting, isComplete, job } = state;

    // Handle Continue button
    const handleContinue = useCallback(() => {
        const validation = validateStep(currentStep);
        if (validation.isValid) {
            nextStep();
        }
    }, [currentStep, validateStep, nextStep]);

    // Handle Submit button
    const handleSubmit = useCallback(async () => {
        try {
            await submitAction();
        } catch (error) {
            console.error("Application submission failed:", error);
        }
    }, [submitAction]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case APPLICATION_STEPS.DOCUMENTS:
                return (
                    <DocumentsStep
                        onViewDescription={onViewDescription}
                        onEditProfile={onEditProfile}
                    />
                );
            case APPLICATION_STEPS.QUESTIONS:
                return <QuestionsStep />;
            case APPLICATION_STEPS.PROFILE:
                return <ProfileStep />;
            case APPLICATION_STEPS.REVIEW:
                return <ReviewStep />;
            default:
                return null;
        }
    };

    // Show success state
    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Application Submitted!</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Your application for <span className="font-medium">{job?.title}</span> at{" "}
                    <span className="font-medium">{job?.company}</span> has been successfully
                    submitted. You&apos;ll receive updates via email.
                </p>
                <Button onClick={onClose}>Close</Button>
            </div>
        );
    }

    const isFirstStep = currentStep === APPLICATION_STEPS.DOCUMENTS;
    const isLastStep = currentStep === APPLICATION_STEPS.REVIEW;

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b shrink-0">
                <div className="flex items-center justify-between">
                    <DialogTitle className="text-lg font-semibold">
                        Apply to {job?.company || "Company"}
                    </DialogTitle>
                </div>
            </DialogHeader>

            {/* Stepper */}
            <div className="px-6 py-4 border-b shrink-0 bg-muted/30">
                <ApplicationStepper />
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-2xl mx-auto">
                    {renderStepContent()}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="px-6 py-4 border-t shrink-0 bg-background">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {/* Back Button */}
                    <Button
                        variant="outline"
                        onClick={isFirstStep ? onClose : prevStep}
                        disabled={isSubmitting}
                    >
                        {isFirstStep ? (
                            <>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </>
                        )}
                    </Button>

                    {/* Step Indicator (mobile) */}
                    <span className="text-sm text-muted-foreground sm:hidden">
                        {currentStep} / 4
                    </span>

                    {/* Continue/Submit Button */}
                    {isLastStep ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !canProceed()}
                            className="min-w-35"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleContinue} className="min-w-25">
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main Modal Component
// ============================================

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: ApplicationJob | null;
    applicant: ApplicationUser | null;
    onSubmitAction?: (data: ApplicationFormData, job: ApplicationJob) => Promise<void>;
    onViewDescription?: () => void;
    onEditProfile?: () => void;
}

export function JobApplicationModal({
    isOpen,
    onClose,
    job,
    applicant,
    onSubmitAction,
    onViewDescription,
    onEditProfile,
}: JobApplicationModalProps) {
    // Don't render if no job or applicant
    if (!job || !applicant) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "max-w-3xl w-full p-0 gap-0 overflow-hidden",
                    "max-h-[90vh] sm:max-h-[85vh]"
                )}
                // Remove default close button - we have our own
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <ApplicationFlowProvider onSubmitAction={onSubmitAction}>
                    <ApplicationModalInitializer job={job} applicant={applicant}>
                        <ApplicationModalContent
                            onClose={onClose}
                            onViewDescription={onViewDescription}
                            onEditProfile={onEditProfile}
                        />
                    </ApplicationModalInitializer>
                </ApplicationFlowProvider>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Initializer Component (sets initial data)
// ============================================

interface ApplicationModalInitializerProps {
    job: ApplicationJob;
    applicant: ApplicationUser;
    children: React.ReactNode;
}

function ApplicationModalInitializer({
    job,
    applicant,
    children,
}: ApplicationModalInitializerProps) {
    const { initialize } = useApplicationFlow();

    useEffect(() => {
        initialize(job, applicant);
    }, [job, applicant, initialize]);

    return <>{children}</>;
}
