"use client";

/**
 * Review Step Page - Step 4
 * Review all application details before submission
 * Design matches the NextStep application flow mockups exactly
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Pencil,
    Mail,
    MapPin,
    Phone,
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

    // Mock profile data counts
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
        return resume.name || "RESUME_LAURELES.pdf";
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
        <div className="space-y-8">
            {/* Profile Card with diagonal stripes */}
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
                {/* Green diagonal stripes background on right side */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full"
                    style={{
                        background: `repeating-linear-gradient(
                            -55deg,
                            transparent,
                            transparent 10px,
                            rgba(17, 167, 115, 0.12) 10px,
                            rgba(17, 167, 115, 0.12) 20px
                        )`,
                    }}
                />

                <div className="relative p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {applicant?.name || "John David Laureles"}
                    </h2>

                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{applicant?.email || "kimlabrador71@gmail.com"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{applicant?.location || "Naga City, Camarines Sur"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>+63 9602662884</span>
                        </div>
                    </div>

                    {/* Edit Button - Dark style matching design */}
                    <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-6 right-6 bg-gray-700 hover:bg-gray-800 text-white"
                        onClick={() => handleEditStep("documents")}
                    >
                        <Pencil className="w-3 h-3 mr-1.5" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Documents Included */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Documents Included</h2>
                <div className="space-y-0">
                    {/* Resume */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">Resumé</p>
                            <p className="text-sm text-gray-600">{getResumeDisplay()}</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("documents")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cover Letter */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">Cover Letter</p>
                            <p className="text-sm text-gray-600">{getCoverLetterDisplay()}</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("documents")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Employer's Question */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Employer&apos;s Question</h2>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                        <p className="text-gray-600">What&apos;s your expected monthly basic salary?</p>
                        <p className="font-semibold text-gray-900 mt-1">
                            {getSalaryLabel(formData.questions.expectedSalary)}
                        </p>
                    </div>
                    <button
                        onClick={() => handleEditStep("questions")}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* NextStep Profile */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">NextStep Profile</h2>
                <p className="text-sm text-gray-600">
                    When you apply for a job, your NextStep Profile and any verified credentials will be accessed by novare Philippines Inc. as part of your job application.
                </p>
                <div className="space-y-0">
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">Career history</p>
                            <p className="text-sm text-gray-600">{profileCounts.careerHistory} roles</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">Education</p>
                            <p className="text-sm text-gray-600">{profileCounts.education} qualification</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">License & Certification</p>
                            <p className="text-sm text-gray-600">{profileCounts.licenses} credential</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                        <div>
                            <p className="font-semibold text-gray-900">Skills</p>
                            <p className="text-sm text-gray-600">{profileCounts.skills} skills</p>
                        </div>
                        <button
                            onClick={() => handleEditStep("profile")}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500">
                When you apply on NextStep, your NextStep Profile including any verified credentials will be accessed by the employer. If your Profile Visibility setting is set to Standard or Limited, other employers and recruiters can also approach you with job opportunities.{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                    LEARN MORE
                </a>
            </p>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300 text-gray-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
            </div>
        </div>
    );
}
