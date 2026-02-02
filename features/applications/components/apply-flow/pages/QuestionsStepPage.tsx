"use client";

/**
 * Questions Step Page - Step 2
 * Answer application questions - salary expectations and additional notes
 */

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import { SALARY_RANGES, type SalaryRange } from "../../../types/apply-flow";

export function QuestionsStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, updateQuestions, isStepValid } = useApplicationFlow();
    const { formData, job } = state;

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply`);
    };

    const handleContinue = () => {
        if (isStepValid(2)) {
            router.push(`/jobs/${jobId}/apply/profile`);
        }
    };

    const canContinue = isStepValid(2);
    const hasError = !formData.questions.expectedSalary;

    // Format salary display
    const formatSalaryDisplay = (value: string) => {
        const range = SALARY_RANGES.find((r: SalaryRange) => r.value === value);
        return range?.label || value;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Employer Questions</h2>
                <p className="text-muted-foreground">
                    Answer a few questions to help {job?.company || "the employer"} understand your expectations.
                </p>
            </div>

            {/* Expected Salary Card */}
            <Card className={cn(hasError && "border-amber-500")}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                                Expected Salary <span className="text-destructive">*</span>
                            </CardTitle>
                        </div>
                        <Badge variant="outline">Required</Badge>
                    </div>
                    <CardDescription>
                        What&apos;s your expected monthly basic salary?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expected-salary" className="sr-only">
                            Expected Monthly Salary
                        </Label>
                        <Select
                            value={formData.questions.expectedSalary || ""}
                            onValueChange={(value) => updateQuestions({ expectedSalary: value })}
                        >
                            <SelectTrigger
                                id="expected-salary"
                                className={cn(hasError && "border-amber-500")}
                            >
                                <SelectValue placeholder="Select your expected salary range" />
                            </SelectTrigger>
                            <SelectContent>
                                {SALARY_RANGES.map((range: SalaryRange) => (
                                    <SelectItem key={range.value} value={range.value}>
                                        <span className="flex items-center gap-2">
                                            <span className="font-medium">{range.label}</span>
                                            <span className="text-muted-foreground text-xs">/month</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected salary display */}
                    {formData.questions.expectedSalary && (
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Your expectation:</span>
                                <span className="font-semibold text-primary">
                                    {formatSalaryDisplay(formData.questions.expectedSalary)}
                                    <span className="text-muted-foreground font-normal text-sm"> /month</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Salary range hint based on job */}
                    {job?.minSalary && job?.maxSalary && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Job salary range:</span>{" "}
                                {job.salaryCurrency || "₱"}
                                {job.minSalary.toLocaleString()} - {job.salaryCurrency || "₱"}
                                {job.maxSalary.toLocaleString()}{" "}
                                {job.salaryPeriod && `per ${job.salaryPeriod}`}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Additional Notes (Optional)</CardTitle>
                    <CardDescription>
                        Is there anything else you&apos;d like the employer to know?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        id="additional-notes"
                        placeholder="Share any additional information that might be relevant to your application..."
                        value={formData.questions.additionalNotes || ""}
                        onChange={(e) => updateQuestions({ additionalNotes: e.target.value })}
                        rows={4}
                    />
                </CardContent>
            </Card>

            {/* Validation Message */}
            {hasError && (
                <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Please select your expected salary to continue</span>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button onClick={handleContinue} disabled={!canContinue}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
