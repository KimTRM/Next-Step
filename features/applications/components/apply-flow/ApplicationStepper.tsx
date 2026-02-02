"use client";

/**
 * Application Stepper - Visual progress indicator
 */

import { Check } from "lucide-react";
import { cn } from "@/shared/components/ui/utils";
import type { ApplicationStep } from "../../types/apply-flow";
import { STEP_LABELS } from "../../types/apply-flow";
import { useApplicationFlow } from "../../contexts/ApplicationFlowContext";

const STEPS: ApplicationStep[] = [1, 2, 3, 4];

interface ApplicationStepperProps {
    className?: string;
}

export function ApplicationStepper({ className }: ApplicationStepperProps) {
    const { state, goToStep, isStepValid } = useApplicationFlow();
    const { currentStep } = state;

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
            goToStep(step);
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
                                    <span className="text-xs text-muted-foreground sr-only">
                                        Step {step} of {STEPS.length}
                                    </span>
                                </div>
                            </button>

                            {/* Connector Line */}
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-4 transition-colors duration-200",
                                        step < currentStep ? "bg-primary" : "bg-muted-foreground/20"
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
                    <span className="text-sm font-medium text-foreground">
                        Step {currentStep}: {STEP_LABELS[currentStep]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {currentStep} of {STEPS.length}
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        role="progressbar"
                        aria-valuenow={currentStep}
                        aria-valuemin={1}
                        aria-valuemax={STEPS.length}
                    />
                </div>
                {/* Step Dots */}
                <div className="flex justify-between mt-2">
                    {STEPS.map((step) => {
                        const status = getStepStatus(step);
                        return (
                            <button
                                key={step}
                                type="button"
                                onClick={() => handleStepClick(step)}
                                disabled={!canNavigateToStep(step) && step > currentStep}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-200",
                                    status === "completed" && "bg-primary",
                                    status === "active" && "bg-primary ring-2 ring-primary/30",
                                    status === "upcoming" && "bg-muted-foreground/30"
                                )}
                                aria-label={`Go to ${STEP_LABELS[step]}`}
                                aria-current={status === "active" ? "step" : undefined}
                            />
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
