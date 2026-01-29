"use client";

/**
 * RoleSelectionContent Component
 * Allows user to select their role: job_seeker, mentor, or employer
 * Saves role to Convex and redirects to profile step
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowRight, Loader2, Briefcase, Users, Building2 } from "lucide-react";
import { cn } from "@/shared/utils";

type UserRole = "job_seeker" | "mentor" | "employer";

interface RoleOption {
    value: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
    {
        value: "job_seeker",
        title: "Job Seeker",
        description: "I'm looking for job opportunities, internships, or career growth",
        icon: <Briefcase className="h-8 w-8" />,
    },
    {
        value: "mentor",
        title: "Mentor",
        description: "I want to guide and help others in their career journey",
        icon: <Users className="h-8 w-8" />,
    },
    {
        value: "employer",
        title: "Employer",
        description: "I'm hiring talent for my organization or company",
        icon: <Building2 className="h-8 w-8" />,
    },
];

export default function RoleSelectionContent() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Mutation to save role
    const setRole = useMutation(api.users.index.setRole);

    const handleContinue = async () => {
        if (!selectedRole || isSaving) return;

        setIsSaving(true);
        try {
            // Save the selected role
            await setRole({ role: selectedRole });

            // Redirect to profile step
            router.push("/onboarding/profile");
        } catch (error) {
            console.error("Failed to save role:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        What brings you here?
                    </h1>
                    <p className="text-lg text-gray-600">
                        Select the option that best describes you. This helps us personalize your experience.
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                </div>

                {/* Role Options */}
                <div className="grid gap-4 sm:gap-6">
                    {ROLE_OPTIONS.map((option) => (
                        <Card
                            key={option.value}
                            className={cn(
                                "cursor-pointer transition-all duration-200 hover:shadow-md",
                                selectedRole === option.value
                                    ? "ring-2 ring-green-600 bg-green-50 border-green-200"
                                    : "hover:border-gray-300"
                            )}
                            onClick={() => setSelectedRole(option.value)}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div
                                    className={cn(
                                        "p-3 rounded-lg",
                                        selectedRole === option.value
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{option.title}</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        {option.description}
                                    </CardDescription>
                                </div>
                                {/* Radio indicator */}
                                <div
                                    className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                                        selectedRole === option.value
                                            ? "border-green-600 bg-green-600"
                                            : "border-gray-300"
                                    )}
                                >
                                    {selectedRole === option.value && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="mt-10 flex justify-center">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedRole || isSaving}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-lg px-8 py-6 rounded-xl"
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
                <p className="text-center text-sm text-gray-500 mt-6">
                    You can always change this later in your settings.
                </p>
            </div>
        </div>
    );
}
