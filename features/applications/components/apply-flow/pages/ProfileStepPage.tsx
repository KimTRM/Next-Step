"use client";

/**
 * Profile Step Page - Step 3
 * Update NextStep Profile before submitting application
 * Design matches the NextStep application flow mockups exactly
 */

import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Pencil,
    Clock,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";

// Mock profile data matching the design
const mockProfileData = {
    careerHistory: [
        {
            id: "1",
            title: "App Development Intern",
            company: "Bapple Technologies, Inc",
            dateRange: "Apr 2025 - Jun 2025 (3 months)",
            description:
                "Developed backend APIs using Python and Django to support user and service...",
        },
        {
            id: "2",
            title: "App Development Intern",
            company: "Bapple Technologies, Inc",
            dateRange: "Apr 2025 - Jun 2025 (3 months)",
            description:
                "Developed backend APIs using Python and Django to support user and service...",
        },
    ],
    education: [
        {
            id: "1",
            degree: "Bachelor of Science in Computer Science",
            institution: "University of Nueva Caceres",
            status: "In progress",
        },
    ],
    licenses: [
        {
            id: "1",
            name: "Web Development National Certificate III",
            issuer: "TESDA: Technical Education and Skills Development Authority",
            dateRange: "Apr 2025 - Apr 2030",
        },
    ],
    skills: ["UX/UI Designing", "Videography", "Photography"],
};

export function ProfileStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { } = useApplicationFlow();

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply/questions`);
    };

    const handleContinue = () => {
        router.push(`/jobs/${jobId}/apply/review`);
    };

    return (
        <div className="space-y-8">
            {/* Info Banner */}
            <div className="flex items-start gap-2 text-gray-600">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-sm">
                    Your NextStep Profile is part of your application. Make sure it&apos;s up-to-date.
                </p>
            </div>

            {/* Career History */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Career History</h2>
                <div className="space-y-4">
                    {mockProfileData.careerHistory.map((job) => (
                        <div
                            key={job.id}
                            className="border border-gray-200 rounded-lg p-4 bg-white relative"
                        >
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="pr-8">
                                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                <p className="text-gray-600 text-sm">{job.company}</p>
                                <p className="text-primary text-sm mt-1">{job.dateRange}</p>
                                <p className="text-gray-600 text-sm mt-2">{job.description}</p>
                                <button className="text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1">
                                    More <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5"
                >
                    Add Role
                </Button>
            </section>

            {/* Education */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
                <div className="space-y-4">
                    {mockProfileData.education.map((edu) => (
                        <div
                            key={edu.id}
                            className="border border-gray-200 rounded-lg p-4 bg-white relative"
                        >
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="pr-8">
                                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                                <p className="text-gray-600 text-sm">{edu.institution}</p>
                                <p className="text-primary text-sm mt-1">{edu.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5"
                >
                    Add Education
                </Button>
            </section>

            {/* Licenses & Certifications */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Licences & certifications</h2>
                <div className="space-y-4">
                    {mockProfileData.licenses.map((license) => (
                        <div
                            key={license.id}
                            className="border border-gray-200 rounded-lg p-4 bg-white relative"
                        >
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="pr-8">
                                <h3 className="font-semibold text-gray-900">{license.name}</h3>
                                <p className="text-gray-600 text-sm">{license.issuer}</p>
                                <p className="text-primary text-sm mt-1">{license.dateRange}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5"
                >
                    Add License or Certification
                </Button>
            </section>

            {/* Skills */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex flex-wrap gap-2">
                        {mockProfileData.skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 text-sm font-normal rounded-full"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5"
                >
                    Add Skill
                </Button>
            </section>

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
                    onClick={handleContinue}
                    className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
