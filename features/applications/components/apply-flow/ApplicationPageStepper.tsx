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
                {/* Dots and Lines - Centered */}
                <div className="flex items-center justify-center mb-4">
                    {STEPS.map((step, index) => {
                        const status = getStepStatus(step);
                        const isClickable = canNavigateToStep(step) || step < currentStep;

                        return (
                            <div key={step} className="flex items-center">
                                {/* Dot */}
                                <button
                                    type="button"
                                    onClick={() => handleStepClick(step)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "w-3 h-3 rounded-full transition-all duration-200 shrink-0",
                                        status === "completed" && "bg-primary",
                                        status === "active" && "bg-primary",
                                        status === "upcoming" && "bg-gray-300",
                                        isClickable && "cursor-pointer hover:scale-125",
                                        !isClickable && "cursor-not-allowed"
                                    )}
                                    aria-current={status === "active" ? "step" : undefined}
                                />

                                {/* Dashed Line */}
                                {index < STEPS.length - 1 && (
                                    <div className="w-20 lg:w-28 mx-1">
                                        <div
                                            className={cn(
                                                "border-t-2 border-dashed",
                                                step < currentStep
                                                    ? "border-primary"
                                                    : "border-gray-300"
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Labels - Centered */}
                <div className="flex justify-center gap-4 lg:gap-8">
                    {STEPS.map((step) => {
                        const status = getStepStatus(step);
                        const isClickable = canNavigateToStep(step) || step < currentStep;

                        return (
                            <button
                                key={step}
                                type="button"
                                onClick={() => handleStepClick(step)}
                                disabled={!isClickable}
                                className={cn(
                                    "text-xs text-center leading-tight w-24 lg:w-28",
                                    status === "completed" && "text-primary font-medium",
                                    status === "active" && "text-primary font-medium",
                                    status === "upcoming" && "text-muted-foreground",
                                    isClickable && "cursor-pointer hover:text-primary",
                                    !isClickable && "cursor-not-allowed"
                                )}
                            >
                                {STEP_LABELS[step]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Stepper */}
            <div className="sm:hidden">
                <div className="text-center mb-3">
                    <span className="text-sm font-medium text-gray-900">
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                        {STEP_LABELS[currentStep]}
                    </p>
                </div>
                <div className="flex gap-2 justify-center">
                    {STEPS.map((step) => (
                        <div
                            key={step}
                            className={cn(
                                "w-12 h-1.5 rounded-full transition-colors duration-200",
                                step <= currentStep ? "bg-primary" : "bg-gray-200"
                            )}
                        />
                    ))}
                </div>
            </div>
        </nav>
    );
}
