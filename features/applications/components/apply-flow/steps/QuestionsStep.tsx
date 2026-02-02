"use client";

/**
 * Step 2: Answer Employer Questions
 * Salary expectations and additional questions
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { DollarSign, HelpCircle, AlertCircle } from "lucide-react";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import { SALARY_RANGES, type SalaryRange } from "../../../types/apply-flow";

export function QuestionsStep() {
    const { state, updateQuestions } = useApplicationFlow();
    const { formData, validation, job } = state;
    const { questions } = formData;

    const handleSalaryChange = (value: string) => {
        updateQuestions({ expectedSalary: value });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateQuestions({ additionalNotes: e.target.value });
    };

    const stepValidation = validation[2];
    const hasError = stepValidation.errors.length > 0;

    // Format salary display
    const formatSalaryDisplay = (value: string) => {
        const range = SALARY_RANGES.find((r: SalaryRange) => r.value === value);
        return range?.label || value;
    };

    return (
        <div className="space-y-6">
            {/* Context Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Employer Questions</CardTitle>
                            <CardDescription className="mt-1">
                                Answer a few questions to help {job?.company || "the employer"} understand your expectations.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Salary Expectation Card */}
            <Card className={cn(hasError && !questions.expectedSalary && "border-destructive")}>
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
                            value={questions.expectedSalary}
                            onValueChange={handleSalaryChange}
                        >
                            <SelectTrigger
                                id="expected-salary"
                                className={cn(
                                    "w-full",
                                    hasError && !questions.expectedSalary && "border-destructive"
                                )}
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

                        {/* Error message */}
                        {hasError && !questions.expectedSalary && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="w-4 h-4" />
                                <span>Please select your expected salary</span>
                            </div>
                        )}
                    </div>

                    {/* Selected salary display */}
                    {questions.expectedSalary && (
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Your expectation:</span>
                                <span className="font-semibold text-primary">
                                    {formatSalaryDisplay(questions.expectedSalary)}
                                    <span className="text-muted-foreground font-normal text-sm"> /month</span>
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Currency: Philippine Peso (₱)
                            </p>
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

            {/* Additional Notes Card (Optional) */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Additional Notes</CardTitle>
                        <Badge variant="secondary">Optional</Badge>
                    </div>
                    <CardDescription>
                        Anything else you&apos;d like the employer to know?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={questions.additionalNotes || ""}
                        onChange={handleNotesChange}
                        placeholder="E.g., your availability, willingness to relocate, or any questions you have about the role..."
                        className="min-h-30"
                        aria-label="Additional notes for employer"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                        {(questions.additionalNotes || "").length}/500 characters
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
