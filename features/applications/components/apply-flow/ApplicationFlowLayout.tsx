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
            <div className="min-h-screen bg-white">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
                    {/* Job Header - Left aligned with avatar */}
                    <div className="flex items-start gap-4 sm:gap-6 mb-8">
                        {/* Large Avatar Circle with green border */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-primary flex items-center justify-center bg-primary/5 shrink-0">
                            <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm text-gray-500 mb-1">
                                Applying For
                            </p>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                                {job.title}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                                <Building2 className="w-4 h-4" />
                                <span>{job.company}</span>
                            </div>
                            <button
                                onClick={() => router.push(`/jobs/${jobId}`)}
                                className="text-primary text-sm hover:underline"
                            >
                                View Description
                            </button>
                        </div>
                    </div>

                    {/* Stepper */}
                    <ApplicationPageStepper jobId={jobId} className="mb-8" />

                    {/* Step Content - No card wrapper */}
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </ApplicationFlowProvider>
    );
}
