"use client";

/**
 * GoalsSelectionContent Component
 * Allows user to select 1-3 goals for their journey
 * Goals are role-aware but not role-exclusive
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { cn } from "@/shared/utils/";
import { FullPageLoading } from "@/features/auth";

type UserRole = "job_seeker" | "mentor" | "employer";

interface GoalOption {
    id: string;
    title: string;
    description: string;
    forRoles: UserRole[];
}

const GOAL_OPTIONS: GoalOption[] = [
    // Job Seeker goals
    {
        id: "find_job",
        title: "Find a Job",
        description: "Discover job opportunities that match my skills and interests",
        forRoles: ["job_seeker"],
    },
    {
        id: "find_internship",
        title: "Find an Internship",
        description: "Get hands-on experience through internship programs",
        forRoles: ["job_seeker"],
    },
    {
        id: "get_mentorship",
        title: "Get Mentorship",
        description: "Connect with mentors who can guide my career journey",
        forRoles: ["job_seeker"],
    },
    {
        id: "build_skills",
        title: "Build Skills",
        description: "Develop new skills to advance my career",
        forRoles: ["job_seeker", "mentor"],
    },
    {
        id: "network",
        title: "Expand My Network",
        description: "Connect with professionals and grow my network",
        forRoles: ["job_seeker", "mentor", "employer"],
    },
    // Mentor goals
    {
        id: "help_others",
        title: "Help Others Grow",
        description: "Share my knowledge and experience with aspiring professionals",
        forRoles: ["mentor"],
    },
    {
        id: "give_back",
        title: "Give Back to Community",
        description: "Contribute to the next generation of professionals",
        forRoles: ["mentor"],
    },
    {
        id: "stay_current",
        title: "Stay Current",
        description: "Keep up with industry trends through teaching and mentoring",
        forRoles: ["mentor"],
    },
    // Employer goals
    {
        id: "hire_talent",
        title: "Hire Talent",
        description: "Find qualified candidates for open positions",
        forRoles: ["employer"],
    },
    {
        id: "build_team",
        title: "Build a Team",
        description: "Grow my organization with the right people",
        forRoles: ["employer"],
    },
    {
        id: "find_interns",
        title: "Find Interns",
        description: "Discover promising interns for our programs",
        forRoles: ["employer"],
    },
    {
        id: "employer_brand",
        title: "Build Employer Brand",
        description: "Showcase our company culture to potential candidates",
        forRoles: ["employer"],
    },
];

export default function GoalsSelectionContent() {
    const router = useRouter();
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current user to filter goals by role
    const user = useQuery(api.users.index.getCurrentUser, {});

    // Mutation to save goals
    const setGoals = useMutation(api.users.index.setGoals);

    const role = user?.role as UserRole | undefined;

    // Filter goals based on user role
    const availableGoals = GOAL_OPTIONS.filter(
        (goal) => !role || goal.forRoles.includes(role)
    );

    // Toggle goal selection
    const toggleGoal = (goalId: string) => {
        setError(null);
        if (selectedGoals.includes(goalId)) {
            setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
        } else {
            if (selectedGoals.length >= 3) {
                setError("You can select up to 3 goals");
                return;
            }
            setSelectedGoals([...selectedGoals, goalId]);
        }
    };

    const handleContinue = async () => {
        if (selectedGoals.length === 0) {
            setError("Please select at least one goal");
            return;
        }

        if (isSaving) return;

        setIsSaving(true);
        try {
            // Save the selected goals
            await setGoals({ goals: selectedGoals });

            // Redirect to finish step
            router.push("/onboarding/finish");
        } catch (err) {
            console.error("Failed to save goals:", err);
            setError("Failed to save goals. Please try again.");
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        router.push("/onboarding/profile");
    };

    // Show loading while fetching user
    if (user === undefined) {
        return <FullPageLoading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        What are your goals?
                    </h1>
                    <p className="text-lg text-gray-600">
                        Select 1 to 3 goals that best describe what you want to achieve.
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                </div>

                {/* Goal Options */}
                <div className="space-y-4 mb-12">
                    {availableGoals.map((goal) => {
                        const isSelected = selectedGoals.includes(goal.id);
                        return (
                            <Card
                                key={goal.id}
                                className={cn(
                                    "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                                    isSelected
                                        ? "border-green-600 bg-white shadow-lg"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                )}
                                onClick={() => toggleGoal(goal.id)}
                            >
                                <CardHeader className="flex flex-row items-start gap-6 p-6">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl font-semibold text-gray-900">
                                            {goal.title}
                                        </CardTitle>
                                        <CardDescription className="text-base mt-2 text-gray-600">
                                            {goal.description}
                                        </CardDescription>
                                    </div>
                                    {/* Checkbox indicator */}
                                    <div
                                        className={cn(
                                            "h-6 w-6 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                                            isSelected
                                                ? "border-green-600 bg-green-600"
                                                : "border-gray-300"
                                        )}
                                    >
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-center text-red-500 mb-8">{error}</p>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button
                        onClick={handleContinue}
                        disabled={selectedGoals.length === 0 || isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Helper text */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    Your goals help us personalize your experience.
                </p>
            </div>
        </div>
    );
}
