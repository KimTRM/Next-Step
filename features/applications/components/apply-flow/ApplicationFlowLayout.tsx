"use client";

/**
 * Application Flow Layout
 * Provides shared context and UI (stepper, job info) for the multi-step application flow
 */

import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ApplicationFlowProvider } from "../../contexts/ApplicationFlowContext";
import { ApplicationPageStepper } from "./ApplicationPageStepper";
import { useJobForApplication, useCurrentUserForApplication, useCreateApplication } from "../../api";
import type { ApplicationFormData, ApplicationJob, ApplicationUser } from "../../types/apply-flow";

interface ApplicationFlowLayoutProps {
    jobId: string;
    children: React.ReactNode;
}

export function ApplicationFlowLayout({ jobId, children }: ApplicationFlowLayoutProps) {
    const router = useRouter();

    // Fetch job data
    const jobData = useJobForApplication(jobId);
    const userData = useCurrentUserForApplication();
    const createApplication = useCreateApplication();

    // Track loading state
    const isLoading = jobData === undefined || userData === undefined;

    // Transform to ApplicationJob type
    const job: ApplicationJob | null = jobData === undefined
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
    const user: ApplicationUser | null = userData === undefined
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
    const handleSubmit = async (data: ApplicationFormData, submittedJob: ApplicationJob) => {
        try {
            await createApplication({
                jobId: submittedJob._id as Parameters<typeof createApplication>[0]["jobId"],
                notes: data.questions.additionalNotes,
            });
            toast.success("Application submitted successfully!", {
                description: `Your application for ${submittedJob.title} at ${submittedJob.company} has been submitted.`,
            });
            // Redirect to applications page after success
            router.push("/applications");
        } catch (error) {
            console.error("Failed to create application:", error);
            const message = error instanceof Error ? error.message : "Failed to submit application";
            toast.error(message);
            throw error;
        }
    };

    // Format employment type
    const formatEmploymentType = (type?: string) => {
        if (!type) return "";
        return type
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    // Format date
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
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
                <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-4">
                    The job you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Button onClick={() => router.push("/jobs")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse Jobs
                </Button>
            </div>
        );
    }

    // User not logged in
    if (user === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
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
            <div className="container max-w-4xl py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/jobs`)}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Button>

                {/* Job Summary Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Briefcase className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-semibold mb-2">{job.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4" />
                                        {job.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(job.postedDate)}
                                    </span>
                                </div>
                                {job.employmentType && (
                                    <Badge variant="secondary" className="mt-2">
                                        {formatEmploymentType(job.employmentType)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stepper */}
                <ApplicationPageStepper jobId={jobId} className="mb-8" />

                {/* Step Content */}
                <Card>
                    <CardContent className="pt-6">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </ApplicationFlowProvider>
    );
}
