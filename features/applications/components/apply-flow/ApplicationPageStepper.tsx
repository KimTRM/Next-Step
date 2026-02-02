"use client";

/**
 * Application Page Stepper - URL-based navigation stepper
 */

import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/shared/components/ui/utils";
import type { ApplicationStep } from "../../types/apply-flow";
import { STEP_LABELS } from "../../types/apply-flow";
import { useApplicationFlow } from "../../contexts/ApplicationFlowContext";

const STEPS: ApplicationStep[] = [1, 2, 3, 4];

// Map steps to URL paths
const STEP_PATHS: Record<ApplicationStep, string> = {
    1: "",           // /jobs/[id]/apply
    2: "/questions", // /jobs/[id]/apply/questions
    3: "/profile",   // /jobs/[id]/apply/profile
    4: "/review",    // /jobs/[id]/apply/review
};

interface ApplicationPageStepperProps {
    jobId: string;
    className?: string;
}

export function ApplicationPageStepper({ jobId, className }: ApplicationPageStepperProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isStepValid } = useApplicationFlow();

    // Determine current step from URL
    const getCurrentStep = (): ApplicationStep => {
        if (pathname.endsWith("/review")) return 4;
        if (pathname.endsWith("/profile")) return 3;
        if (pathname.endsWith("/questions")) return 2;
        return 1;
    };

    const currentStep = getCurrentStep();

    const getStepStatus = (step: ApplicationStep) => {
        if (step < currentStep) return "completed";
        if (step === currentStep) return "active";
        return "upcoming";
    };

    const canNavigateToStep = (step: ApplicationStep): boolean => {
        // Can always go back
        if (step < currentStep) return true;
        // Can't skip ahead more than one step
        if (step > currentStep + 1) return false;
        // Can proceed if current step is valid
        if (step === currentStep + 1) return isStepValid(currentStep);
        return false;
    };

    const handleStepClick = (step: ApplicationStep) => {
        if (canNavigateToStep(step) || step < currentStep) {
            const basePath = `/jobs/${jobId}/apply`;
            const stepPath = STEP_PATHS[step];
            router.push(`${basePath}${stepPath}`);
        }
    };

    return (
        <nav aria-label="Application progress" className={cn("w-full", className)}>
            {/* Desktop Stepper */}
            <ol className="hidden sm:flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const status = getStepStatus(step);
                    const isClickable = canNavigateToStep(step) || step < currentStep;

                    return (
                        <li key={step} className="flex-1 flex items-center">
                            <button
                                type="button"
                                onClick={() => handleStepClick(step)}
                                disabled={!isClickable}
                                className={cn(
                                    "flex items-center gap-3 group w-full",
                                    isClickable && "cursor-pointer",
                                    !isClickable && "cursor-not-allowed"
                                )}
                                aria-current={status === "active" ? "step" : undefined}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 shrink-0",
                                        status === "completed" && "bg-primary border-primary text-primary-foreground",
                                        status === "active" && "border-primary bg-primary/10 text-primary",
                                        status === "upcoming" && "border-muted-foreground/30 text-muted-foreground/50",
                                        isClickable && status !== "active" && "group-hover:border-primary/70"
                                    )}
                                >
                                    {status === "completed" ? (
                                        <Check className="w-5 h-5" aria-hidden="true" />
                                    ) : (
                                        <span className="text-sm font-semibold">{step}</span>
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="flex flex-col items-start min-w-0">
                                    <span
                                        className={cn(
                                            "text-sm font-medium truncate",
                                            status === "completed" && "text-primary",
                                            status === "active" && "text-foreground",
                                            status === "upcoming" && "text-muted-foreground/60"
                                        )}
                                    >
                                        {STEP_LABELS[step]}
                                    </span>
                                </div>
                            </button>

                            {/* Connector Line */}
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-4 transition-colors duration-200",
                                        step < currentStep ? "bg-primary" : "bg-muted"
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Mobile Stepper */}
            <div className="sm:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {STEP_LABELS[currentStep]}
                    </span>
                </div>
                <div className="flex gap-1">
                    {STEPS.map((step) => (
                        <div
                            key={step}
                            className={cn(
                                "flex-1 h-2 rounded-full transition-colors duration-200",
                                step < currentStep && "bg-primary",
                                step === currentStep && "bg-primary/50",
                                step > currentStep && "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}
