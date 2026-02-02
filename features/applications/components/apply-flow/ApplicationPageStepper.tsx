"use client";

/**
 * Application Page Stepper - URL-based navigation stepper
 * Matches the NextStep design with dashed lines and labeled steps
 */

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/shared/components/ui/utils";
import type { ApplicationStep } from "../../types/apply-flow";
import { useApplicationFlow } from "../../contexts/ApplicationFlowContext";

const STEPS: ApplicationStep[] = [1, 2, 3, 4];

const STEP_LABELS: Record<ApplicationStep, string> = {
    1: "Choose documents",
    2: "Answer employer questions",
    3: "Update NextStep Profile",
    4: "Review and submit",
};

// Map steps to URL paths
const STEP_PATHS: Record<ApplicationStep, string> = {
    1: "",
    2: "/questions",
    3: "/profile",
    4: "/review",
};

interface ApplicationPageStepperProps {
    jobId: string;
    className?: string;
}

export function ApplicationPageStepper({
    jobId,
    className,
}: ApplicationPageStepperProps) {
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
        if (step < currentStep) return true;
        if (step > currentStep + 1) return false;
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
            <div className="hidden sm:block">
                {/* Dots, Lines, and Labels in one row */}
                <div className="flex items-start justify-between">
                    {STEPS.map((step, index) => {
                        const status = getStepStatus(step);
                        const isClickable = canNavigateToStep(step) || step < currentStep;
                        const isCompleted = status === "completed" || status === "active";

                        return (
                            <div key={step} className="flex flex-col items-center flex-1">
                                {/* Dot and Line Row */}
                                <div className="flex items-center w-full justify-center">
                                    {/* Left Line (except first) */}
                                    {index > 0 && (
                                        <div className="flex-1 h-0 border-t-2 border-dashed border-gray-300"
                                            style={{
                                                borderColor: step <= currentStep ? '#11A773' : '#D1D5DB'
                                            }}
                                        />
                                    )}

                                    {/* Dot */}
                                    <button
                                        type="button"
                                        onClick={() => handleStepClick(step)}
                                        disabled={!isClickable}
                                        className={cn(
                                            "w-3 h-3 rounded-full transition-all duration-200 shrink-0",
                                            isCompleted ? "bg-primary" : "bg-gray-300",
                                            isClickable && "cursor-pointer hover:scale-125",
                                            !isClickable && "cursor-not-allowed"
                                        )}
                                        aria-current={status === "active" ? "step" : undefined}
                                    />

                                    {/* Right Line (except last) */}
                                    {index < STEPS.length - 1 && (
                                        <div className="flex-1 h-0 border-t-2 border-dashed border-gray-300"
                                            style={{
                                                borderColor: step < currentStep ? '#11A773' : '#D1D5DB'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(step)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "text-xs text-center leading-tight mt-2 px-1",
                                        isCompleted ? "text-primary font-medium" : "text-gray-500",
                                        isClickable && "cursor-pointer hover:text-primary",
                                        !isClickable && "cursor-not-allowed"
                                    )}
                                >
                                    {STEP_LABELS[step]}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Stepper */}
            <div className="sm:hidden">
                {/* Dots and lines */}
                <div className="flex items-center justify-center mb-3">
                    {STEPS.map((step, index) => {
                        const isCompleted = step <= currentStep;

                        return (
                            <div key={step} className="flex items-center">
                                {/* Dot */}
                                <div
                                    className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        isCompleted ? "bg-primary" : "bg-gray-300"
                                    )}
                                />

                                {/* Line (except last) */}
                                {index < STEPS.length - 1 && (
                                    <div
                                        className="w-16 h-0 border-t-2 border-dashed mx-1"
                                        style={{
                                            borderColor: step < currentStep ? '#11A773' : '#D1D5DB'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Current step label */}
                <p className="text-center text-sm text-primary font-medium">
                    {STEP_LABELS[currentStep]}
                </p>
            </div>
        </nav>
    );
}
