"use client";

/**
 * Questions Step Page - Step 2
 * Answer employer questions - salary expectations
 * Design matches the NextStep application flow mockups
 */

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import { SALARY_RANGES, type SalaryRange } from "../../../types/apply-flow";

export function QuestionsStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, updateQuestions, isStepValid } = useApplicationFlow();
    const { formData } = state;

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply`);
    };

    const handleContinue = () => {
        if (isStepValid(2)) {
            router.push(`/jobs/${jobId}/apply/profile`);
        }
    };

    const canContinue = isStepValid(2);

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Question */}
            <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                    What&apos;s your expected monthly basic salary?
                </h2>

                <Select
                    value={formData.questions.expectedSalary || ""}
                    onValueChange={(value) => updateQuestions({ expectedSalary: value })}
                >
                    <SelectTrigger className="w-full sm:max-w-md bg-gray-100 border-0 h-12">
                        <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                        {SALARY_RANGES.map((range: SalaryRange) => (
                            <SelectItem key={range.value} value={range.value}>
                                {range.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Navigation */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 sm:pt-6">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300 w-full sm:w-auto"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-6"
                >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
