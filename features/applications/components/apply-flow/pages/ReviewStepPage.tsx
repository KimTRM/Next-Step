"use client";

/**
 * Review Step Page - Step 4
 * Review all application details before submission
 * Design matches the NextStep application flow mockups
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Pencil,
    FileText,
    Mail,
    MapPin,
    Phone,
    User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import { useCreateApplication } from "../../../api";
import { SALARY_RANGES, type SalaryRange } from "../../../types/apply-flow";
import type { Id } from "../../../types";

export function ReviewStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, reset } = useApplicationFlow();
    const { formData, applicant } = state;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createApplication = useCreateApplication();

    // Get salary label from value
    const getSalaryLabel = (value: string | undefined) => {
        if (!value) return "Not specified";
        const range = SALARY_RANGES.find((r: SalaryRange) => r.value === value);
        return range?.label || value;
    };

    // Mock profile data counts - in real app this would come from Convex
    const profileCounts = {
        careerHistory: 2,
        education: 1,
        licenses: 1,
        skills: 16,
    };

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply/profile`);
    };

    const handleEditStep = (step: string) => {
        switch (step) {
            case "documents":
                router.push(`/jobs/${jobId}/apply`);
                break;
            case "questions":
                router.push(`/jobs/${jobId}/apply/questions`);
                break;
            case "profile":
                router.push(`/jobs/${jobId}/apply/profile`);
                break;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create the application
            await createApplication({
                jobId: jobId as Id<"jobs">,
                notes: formData.documents.coverLetter?.content || "",
            });

            toast.success("Application submitted successfully!");
            reset();
            router.push(`/applications`);
        } catch (error) {
            console.error("Failed to submit application:", error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get resume display text
    const getResumeDisplay = () => {
        const resume = formData.documents.resume;
        if (!resume) return "No resume selected";
        return resume.name || (resume.source === "upload" ? "Uploaded file" : "Selected resume");
    };

    // Helper to get cover letter display text
    const getCoverLetterDisplay = () => {
        const coverLetter = formData.documents.coverLetter;
        if (!coverLetter) return "Not included";
        if (coverLetter.option === "write") return "You wrote";
        if (coverLetter.option === "upload") return coverLetter.name || "Uploaded file";
        return "Not included";
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-xl bg-gray-50">
                {/* Green diagonal stripes on right side */}
                <div
                    className="absolute top-0 right-0 w-1/3 h-full"
                    style={{
                        background: `repeating-linear-gradient(
                            -55deg,
                            transparent,
                            transparent 8px,
                            rgba(17, 167, 115, 0.15) 8px,
                            rgba(17, 167, 115, 0.15) 16px
                        )`,
                    }}
                />
                <div className="relative p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold truncate">
                                    {applicant?.name || "User"}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mt-1">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                    <span className="truncate">{applicant?.email || "email@example.com"}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-gray-600 text-xs sm:text-sm mt-1">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        <span>{applicant?.location || "Manila, Philippines"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                                        <span>+63 912 345 6789</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("documents")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Documents Included */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Documents Included</h2>
                <div className="space-y-3">
                    {/* Resume */}
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm sm:text-base">Resumé</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    {getResumeDisplay()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("documents")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Cover Letter */}
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                            <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm sm:text-base">Cover Letter</p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    {getCoverLetterDisplay()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("documents")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Employer's Question */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Employer&apos;s Question</h2>
                <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                    <div className="min-w-0 pr-2">
                        <p className="text-gray-600 text-sm sm:text-base">
                            What&apos;s your expected monthly basic salary?
                        </p>
                        <p className="font-medium text-gray-900 mt-1 text-sm sm:text-base">
                            {getSalaryLabel(formData.questions.expectedSalary)}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStep("questions")}
                        className="text-gray-500 hover:text-gray-700 shrink-0"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                </div>
            </section>

            {/* NextStep Profile */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">NextStep Profile</h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                    The employer will be able to view your career history, education,
                    licenses, certifications and skills as provided on your NextStep
                    Profile.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div>
                            <p className="text-gray-600 text-sm sm:text-base">Career history</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {profileCounts.careerHistory} roles
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div>
                            <p className="text-gray-600 text-sm sm:text-base">Education</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {profileCounts.education} qualification
                                {profileCounts.education !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div>
                            <p className="text-gray-600 text-sm sm:text-base">License & Certification</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {profileCounts.licenses} credential
                                {profileCounts.licenses !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <div>
                            <p className="text-gray-600 text-sm sm:text-base">Skills</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {profileCounts.skills} skills
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Privacy Notice */}
            <p className="text-xs sm:text-sm text-gray-500">
                By clicking &quot;Submit Application&quot;, you agree to share your
                application details with the employer. Your application will be reviewed
                according to NextStep&apos;s{" "}
                <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                </a>
                .
            </p>

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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-6"
                >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
            </div>
        </div>
    );
}
