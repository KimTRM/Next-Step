"use client";

/**
 * FinishOnboardingContent Component
 * Shows a summary of the user's profile and completes onboarding
 * On confirm: sets onboardingStatus = "completed" and redirects to dashboard
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    User,
    Briefcase,
    Target,
    Sparkles,
} from "lucide-react";
import { FullPageLoading } from "@/features/auth";

// Goal ID to title mapping
const GOAL_TITLES: Record<string, string> = {
    find_job: "Find a Job",
    find_internship: "Find an Internship",
    get_mentorship: "Get Mentorship",
    build_skills: "Build Skills",
    network: "Expand My Network",
    help_others: "Help Others Grow",
    give_back: "Give Back to Community",
    stay_current: "Stay Current",
    hire_talent: "Hire Talent",
    build_team: "Build a Team",
    find_interns: "Find Interns",
    employer_brand: "Build Employer Brand",
};

// Role display names
const ROLE_DISPLAY: Record<string, string> = {
    job_seeker: "Job Seeker",
    mentor: "Mentor",
    employer: "Employer",
};

// Education level display names
const EDUCATION_DISPLAY: Record<string, string> = {
    high_school: "High School",
    undergraduate: "Undergraduate",
    graduate: "Graduate",
    phd: "PhD",
    bootcamp: "Bootcamp",
    self_taught: "Self-Taught",
};

export default function FinishOnboardingContent() {
    const router = useRouter();
    const [isCompleting, setIsCompleting] = useState(false);

    // Get current user data for summary
    const user = useQuery(api.users.index.getCurrentUser, {});

    // Mutation to complete onboarding
    const setOnboardingStatus = useMutation(api.users.index.setOnboardingStatus);

    const handleComplete = async () => {
        if (isCompleting) return;

        setIsCompleting(true);
        try {
            // Set onboarding status to completed
            await setOnboardingStatus({ status: "completed" });

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
            setIsCompleting(false);
        }
    };

    const handleBack = () => {
        router.push("/onboarding/goals");
    };

    // Show loading while fetching user
    if (user === undefined) {
        return <FullPageLoading />;
    }

    const role = user?.role || "job_seeker";
    const goals = user?.goals || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        You&apos;re all set!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Review your profile and complete your setup.
                    </p>
                </div>

                {/* Progress indicator - all complete */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                </div>

                {/* Summary Card */}
                <Card className="shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="h-5 w-5 text-green-600" />
                            Profile Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium">{user?.name || "Not set"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Role</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {ROLE_DISPLAY[role] || role}
                                </Badge>
                            </div>

                            {/* Role-specific fields */}
                            {role === "job_seeker" && (
                                <>
                                    {user?.currentStatus && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Current Status</span>
                                            <span className="font-medium">{user.currentStatus}</span>
                                        </div>
                                    )}
                                    {user?.educationLevel && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Education</span>
                                            <span className="font-medium">
                                                {EDUCATION_DISPLAY[user.educationLevel] || user.educationLevel}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}

                            {role === "employer" && user?.organizationName && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">Organization</span>
                                    <span className="font-medium">{user.organizationName}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Skills/Expertise */}
                        {(role === "job_seeker" || role === "mentor") && user?.skills && user.skills.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-500">
                                        {role === "mentor" ? "Expertise" : "Skills"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map((skill) => (
                                        <Badge key={skill} variant="outline">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bio for mentors */}
                        {role === "mentor" && user?.bio && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <span className="text-gray-500">Bio</span>
                                    <p className="text-gray-700">{user.bio}</p>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Goals */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-500">Goals</span>
                            </div>
                            <div className="space-y-2">
                                {goals.length > 0 ? (
                                    goals.map((goalId) => (
                                        <div key={goalId} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <span>{GOAL_TITLES[goalId] || goalId}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No goals selected</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="mt-10 flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="px-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                    >
                        {isCompleting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Completing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Complete Setup
                            </>
                        )}
                    </Button>
                </div>

                {/* Helper text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can update your profile anytime from settings.
                </p>
            </div>
        </div>
    );
}
