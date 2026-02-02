"use client";

/**
 * Profile Step Page - Step 3
 * Update NextStep Profile before submitting application
 * Design matches the NextStep application flow mockups
 */

import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Pencil,
    Plus,
    Building2,
    GraduationCap,
    Award,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";

// Mock profile data - in real app this would come from Convex
const mockProfileData = {
    careerHistory: [
        {
            id: "1",
            title: "Front End Developer",
            company: "Clink",
            startDate: "Jun 2022",
            endDate: "Present",
            duration: "2 years 10 months",
            description:
                "Developed and maintained responsive web applications using React, TypeScript, and Tailwind CSS. Collaborated with design team...",
        },
        {
            id: "2",
            title: "Junior Developer",
            company: "TechStart Inc.",
            startDate: "Jan 2021",
            endDate: "May 2022",
            duration: "1 year 5 months",
            description:
                "Built internal tools and contributed to client projects. Learned agile methodologies and best practices...",
        },
    ],
    education: [
        {
            id: "1",
            degree: "Bachelor of Science in Computer Science",
            institution: "University of Technology",
            year: "2020",
        },
    ],
    licenses: [
        {
            id: "1",
            name: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services",
            year: "2023",
        },
    ],
    skills: [
        "React",
        "TypeScript",
        "JavaScript",
        "Next.js",
        "Node.js",
        "Tailwind CSS",
        "Git",
        "REST APIs",
        "GraphQL",
        "PostgreSQL",
        "MongoDB",
        "AWS",
        "Docker",
        "Figma",
        "Agile",
        "CI/CD",
    ],
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
        <div className="space-y-6 sm:space-y-8">
            {/* Info Banner */}
            <Alert className="bg-primary/5 border-primary/20">
                <AlertDescription className="text-sm sm:text-base text-gray-700">
                    Your NextStep Profile is part of your application. Make sure it&apos;s
                    up-to-date.
                </AlertDescription>
            </Alert>

            {/* Career History */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Career History</h2>
                <div className="space-y-3 sm:space-y-4">
                    {mockProfileData.careerHistory.map((job) => (
                        <div
                            key={job.id}
                            className="border rounded-lg p-3 sm:p-4 bg-gray-50 relative group"
                        >
                            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                    <Building2 className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6 sm:pr-8">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{job.title}</h3>
                                    <p className="text-gray-600 text-sm">{job.company}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {job.startDate} – {job.endDate} · {job.duration}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                                        {job.description}
                                    </p>
                                    <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center gap-1">
                                        More <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Role
                </Button>
            </section>

            {/* Education */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Education</h2>
                <div className="space-y-3 sm:space-y-4">
                    {mockProfileData.education.map((edu) => (
                        <div
                            key={edu.id}
                            className="border rounded-lg p-3 sm:p-4 bg-white relative group"
                        >
                            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6 sm:pr-8">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{edu.degree}</h3>
                                    <p className="text-gray-600 text-sm sm:text-base">{edu.institution}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{edu.year}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                </Button>
            </section>

            {/* Licenses & Certifications */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Licences & certifications</h2>
                <div className="space-y-3 sm:space-y-4">
                    {mockProfileData.licenses.map((license) => (
                        <div
                            key={license.id}
                            className="border rounded-lg p-3 sm:p-4 bg-white relative group"
                        >
                            <button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <div className="flex items-start gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-6 sm:pr-8">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{license.name}</h3>
                                    <p className="text-gray-600 text-sm sm:text-base">{license.issuer}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{license.year}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add License or Certification
                </Button>
            </section>

            {/* Skills */}
            <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold">Skills</h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {mockProfileData.skills.map((skill) => (
                        <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-normal"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/5 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </section>

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
                    onClick={handleContinue}
                    className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-6"
                >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
