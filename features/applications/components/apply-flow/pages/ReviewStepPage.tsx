"use client";

/**
 * Review Step Page - Step 4
 * Final review and submit application
 */

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, HelpCircle, User, Send, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import { SALARY_RANGES, type SalaryRange } from "../../../types/apply-flow";

export function ReviewStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, setConfirmation, submitAction } = useApplicationFlow();
    const { job, applicant, formData, isSubmitting, isComplete } = state;

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply/profile`);
    };

    const handleSubmit = async () => {
        try {
            await submitAction();
        } catch (error) {
            // Error is handled in submitAction with toast
            console.error("Submit error:", error);
        }
    };

    // Success state
    if (isComplete) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Application Submitted!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your application for {job?.title} at {job?.company} has been successfully submitted.
                    You&apos;ll receive a confirmation email shortly.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.push("/jobs")}>
                        Browse More Jobs
                    </Button>
                    <Button onClick={() => router.push("/applications")}>
                        View My Applications
                    </Button>
                </div>
            </div>
        );
    }

    if (!job || !applicant) {
        return null;
    }

    const canSubmit = formData.review.isConfirmed && !isSubmitting;

    // Format salary display
    const formatSalary = (value: string) => {
        const range = SALARY_RANGES.find((r: SalaryRange) => r.value === value);
        return range?.label || value;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Review Your Application</h2>
                <p className="text-muted-foreground">
                    Please review your application details before submitting.
                </p>
            </div>

            {/* Documents Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Documents</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Resume</span>
                            <span className="text-sm font-medium">
                                {formData.documents.resume?.name || "Not uploaded"}
                            </span>
                        </div>
                        {formData.documents.coverLetter && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Cover Letter</span>
                                <span className="text-sm font-medium">
                                    {formData.documents.coverLetter.option === "write"
                                        ? "Custom written"
                                        : formData.documents.coverLetter.name || "Uploaded"}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Questions Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Application Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Expected Salary</span>
                            <span className="text-sm font-medium">
                                {formData.questions.expectedSalary
                                    ? formatSalary(formData.questions.expectedSalary)
                                    : "Not specified"}
                            </span>
                        </div>
                        {formData.questions.additionalNotes && (
                            <>
                                <Separator />
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-1">Additional Notes</span>
                                    <p className="text-sm">{formData.questions.additionalNotes}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Profile</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Name</span>
                            <span className="text-sm font-medium">{applicant.name}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Email</span>
                            <span className="text-sm font-medium">{applicant.email}</span>
                        </div>
                        {formData.profile.skills && formData.profile.skills.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Skills</span>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.profile.skills.slice(0, 5).map((skill, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {formData.profile.skills.length > 5 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{formData.profile.skills.length - 5} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Checkbox */}
            <Card className={cn(
                "transition-colors",
                formData.review.isConfirmed && "border-primary/50 bg-primary/5"
            )}>
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="confirm"
                            checked={formData.review.isConfirmed}
                            onCheckedChange={(checked) => setConfirmation(checked === true)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="confirm"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                I confirm that all information provided is accurate
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                By submitting this application, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
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
            </div>
        </div>
    );
}
