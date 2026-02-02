"use client";

/**
 * Application Flow Layout
 * Provides shared context and UI (stepper, job info) for the multi-step application flow
 * Design matches the NextStep application flow mockups
 */

import { useRouter } from "next/navigation";
import { Building2, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { ApplicationFlowProvider } from "../../contexts/ApplicationFlowContext";
import { ApplicationPageStepper } from "./ApplicationPageStepper";
import {
    useJobForApplication,
    useCurrentUserForApplication,
    useCreateApplication,
} from "../../api";
import type {
    ApplicationFormData,
    ApplicationJob,
    ApplicationUser,
} from "../../types/apply-flow";

interface ApplicationFlowLayoutProps {
    jobId: string;
    children: React.ReactNode;
}

export function ApplicationFlowLayout({
    jobId,
    children,
}: ApplicationFlowLayoutProps) {
    const router = useRouter();

    // Fetch job data
    const jobData = useJobForApplication(jobId);
    const userData = useCurrentUserForApplication();
    const createApplication = useCreateApplication();

    // Track loading state
    const isLoading = jobData === undefined || userData === undefined;

    // Transform to ApplicationJob type
    const job: ApplicationJob | null =
        jobData === undefined
            ? null
            : jobData === null
                ? null
                : {
                    _id: jobData._id,
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    description: jobData.description,
                    employmentType: jobData.employmentType,
                    locationType: jobData.locationType,
                    minSalary: jobData.minSalary,
                    maxSalary: jobData.maxSalary,
                    salaryCurrency: jobData.salaryCurrency,
                    salaryPeriod: jobData.salaryPeriod,
                    requiredSkills: jobData.requiredSkills,
                    experienceLevel: jobData.experienceLevel,
                    postedDate: jobData.postedDate,
                };

    // Transform to ApplicationUser type
    const user: ApplicationUser | null =
        userData === undefined
            ? null
            : userData === null
                ? null
                : {
                    _id: userData._id,
                    name: userData.name || "User",
                    email: userData.email || "",
                    avatarUrl: userData.avatarUrl,
                    location: userData.location,
                    experience: userData.experience,
                    education: userData.education,
                    skills: userData.skills,
                };

    // Handle submit
    const handleSubmit = async (
        data: ApplicationFormData,
        submittedJob: ApplicationJob
    ) => {
        try {
            await createApplication({
                jobId: submittedJob._id as Parameters<
                    typeof createApplication
                >[0]["jobId"],
                notes: data.questions.additionalNotes,
            });
            toast.success("Application submitted successfully!", {
                description: `Your application for ${submittedJob.title} at ${submittedJob.company} has been submitted.`,
            });
            router.push("/applications");
        } catch (error) {
            console.error("Failed to create application:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to submit application";
            toast.error(message);
            throw error;
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Job not found
    if (job === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The job you&apos;re looking for doesn&apos;t exist or has
                    been removed.
                </p>
                <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
            </div>
        );
    }

    // User not logged in
    if (user === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
                <p className="text-muted-foreground mb-4">
                    Please sign in to apply for this job.
                </p>
                <Button onClick={() => router.push("/sign-up")}>Sign In</Button>
            </div>
        );
    }

    return (
        <ApplicationFlowProvider
            onSubmitAction={handleSubmit}
            job={job}
            applicant={user}
        >
            <div className="min-h-screen bg-gray-50/50">
                <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
                    {/* Job Header - Centered */}
                    <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
                        {/* Avatar Circle */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10 mb-4">
                            <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                        </div>

                        {/* Job Info */}
                        <p className="text-sm text-muted-foreground mb-1">
                            Applying For
                        </p>
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                            {job.title}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                        </div>
                        <button
                            onClick={() => router.push(`/jobs/${jobId}`)}
                            className="text-primary text-sm hover:underline font-medium"
                        >
                            View Description
                        </button>
                    </div>

                    {/* Stepper */}
                    <ApplicationPageStepper jobId={jobId} className="mb-8 sm:mb-10" />

                    {/* Step Content */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                        {children}
                    </div>
                </div>
            </div>
        </ApplicationFlowProvider>
    );
}
