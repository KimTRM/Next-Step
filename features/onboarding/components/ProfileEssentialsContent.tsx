"use client";

/**
 * ProfileEssentialsContent Component
 * Role-based minimal profile form:
 * - Job Seeker: name, field, level, skills
 * - Mentor: expertise, experience, bio
 * - Employer: organizationName (REQUIRED)
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { ArrowRight, ArrowLeft, Loader2, X, Plus } from "lucide-react";
import { FullPageLoading } from "@/features/auth";

type UserRole = "job_seeker" | "mentor" | "employer";

// Skill suggestions for different roles
const JOB_SEEKER_SKILLS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "HTML/CSS", "SQL", "Git", "Communication", "Problem Solving", "Teamwork",
];

const MENTOR_EXPERTISE = [
    "Software Development", "Data Science", "Product Management", "UX Design",
    "Career Coaching", "Interview Prep", "Leadership", "System Design",
    "Cloud Computing", "Machine Learning", "Entrepreneurship", "Marketing",
];

const EDUCATION_LEVELS = [
    { value: "high_school", label: "High School" },
    { value: "undergraduate", label: "Undergraduate" },
    { value: "graduate", label: "Graduate" },
    { value: "phd", label: "PhD" },
    { value: "bootcamp", label: "Bootcamp" },
    { value: "self_taught", label: "Self-Taught" },
];

export default function ProfileEssentialsContent() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get current user to determine role
    const user = useQuery(api.users.index.getCurrentUser, {});

    // Form state
    const [name, setName] = useState("");
    const [currentStatus, setCurrentStatus] = useState(""); // field for job seekers
    const [educationLevel, setEducationLevel] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [customSkill, setCustomSkill] = useState("");
    const [bio, setBio] = useState("");
    const [organizationName, setOrganizationName] = useState("");

    // Mutation to save profile
    const saveOnboardingProfile = useMutation(api.users.index.saveOnboardingProfile);

    // Pre-fill name from user data
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    const role = user?.role as UserRole | undefined;

    // Add skill
    const addSkill = (skill: string) => {
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
        setCustomSkill("");
    };

    // Remove skill
    const removeSkill = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    // Validate form based on role
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (role === "job_seeker") {
            if (!currentStatus.trim()) {
                newErrors.currentStatus = "Please describe your current status";
            }
            if (!educationLevel) {
                newErrors.educationLevel = "Please select your education level";
            }
            if (skills.length === 0) {
                newErrors.skills = "Please add at least one skill";
            }
        }

        if (role === "mentor") {
            if (skills.length === 0) {
                newErrors.skills = "Please add at least one area of expertise";
            }
            if (!bio.trim()) {
                newErrors.bio = "Please add a short bio";
            }
        }

        if (role === "employer") {
            if (!organizationName.trim()) {
                newErrors.organizationName = "Organization name is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = async () => {
        if (!validate() || isSaving) return;

        setIsSaving(true);
        try {
            // Build the profile data based on role
            const profileData: {
                name?: string;
                currentStatus?: string;
                educationLevel?: "high_school" | "undergraduate" | "graduate" | "phd" | "bootcamp" | "self_taught";
                skills?: string[];
                bio?: string;
                organizationName?: string;
            } = {
                name: name.trim(),
            };

            if (role === "job_seeker") {
                profileData.currentStatus = currentStatus.trim();
                profileData.educationLevel = educationLevel as typeof profileData.educationLevel;
                profileData.skills = skills;
            }

            if (role === "mentor") {
                profileData.skills = skills; // expertise
                profileData.bio = bio.trim();
            }

            if (role === "employer") {
                profileData.organizationName = organizationName.trim();
            }

            await saveOnboardingProfile(profileData);

            // Redirect to goals step
            router.push("/onboarding/goals");
        } catch (error) {
            console.error("Failed to save profile:", error);
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        router.push("/onboarding/role");
    };

    // Show loading while fetching user
    if (user === undefined) {
        return <FullPageLoading />;
    }

    // Get skill suggestions based on role
    const skillSuggestions = role === "mentor" ? MENTOR_EXPERTISE : JOB_SEEKER_SKILLS;
    const skillLabel = role === "mentor" ? "Areas of Expertise" : "Skills";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {role === "employer"
                            ? "Tell us about your organization"
                            : "Tell us about yourself"}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {role === "job_seeker" && "Help us match you with the right opportunities."}
                        {role === "mentor" && "Share your expertise to help others grow."}
                        {role === "employer" && "Help candidates learn about your company."}
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-green-600" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                    <div className="h-2 w-16 rounded-full bg-gray-300" />
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
                    {/* Name - All roles */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Job Seeker: Current Status (Field) */}
                    {role === "job_seeker" && (
                        <div className="space-y-2">
                            <Label htmlFor="currentStatus">Current Status</Label>
                            <Input
                                id="currentStatus"
                                value={currentStatus}
                                onChange={(e) => setCurrentStatus(e.target.value)}
                                placeholder="e.g., Fresh CS Graduate, 3rd Year Engineering Student"
                                className={errors.currentStatus ? "border-red-500" : ""}
                            />
                            {errors.currentStatus && (
                                <p className="text-sm text-red-500">{errors.currentStatus}</p>
                            )}
                        </div>
                    )}

                    {/* Job Seeker: Education Level */}
                    {role === "job_seeker" && (
                        <div className="space-y-2">
                            <Label htmlFor="educationLevel">Education Level</Label>
                            <Select value={educationLevel} onValueChange={setEducationLevel}>
                                <SelectTrigger className={errors.educationLevel ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select your education level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EDUCATION_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.educationLevel && (
                                <p className="text-sm text-red-500">{errors.educationLevel}</p>
                            )}
                        </div>
                    )}

                    {/* Employer: Organization Name */}
                    {role === "employer" && (
                        <div className="space-y-2">
                            <Label htmlFor="organizationName">
                                Organization Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="organizationName"
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                                placeholder="Enter your company or organization name"
                                className={errors.organizationName ? "border-red-500" : ""}
                            />
                            {errors.organizationName && (
                                <p className="text-sm text-red-500">{errors.organizationName}</p>
                            )}
                        </div>
                    )}

                    {/* Mentor: Bio */}
                    {role === "mentor" && (
                        <div className="space-y-2">
                            <Label htmlFor="bio">Short Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell mentees about your background and what you can help with..."
                                rows={4}
                                className={errors.bio ? "border-red-500" : ""}
                            />
                            {errors.bio && (
                                <p className="text-sm text-red-500">{errors.bio}</p>
                            )}
                        </div>
                    )}

                    {/* Skills/Expertise - Job Seeker & Mentor */}
                    {(role === "job_seeker" || role === "mentor") && (
                        <div className="space-y-2">
                            <Label>{skillLabel}</Label>

                            {/* Selected skills */}
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => removeSkill(skill)}
                                                className="ml-2 hover:text-green-900"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Add custom skill */}
                            <div className="flex gap-2">
                                <Input
                                    value={customSkill}
                                    onChange={(e) => setCustomSkill(e.target.value)}
                                    placeholder={`Add a ${role === "mentor" ? "expertise area" : "skill"}...`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addSkill(customSkill);
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => addSkill(customSkill)}
                                    disabled={!customSkill.trim()}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Skill suggestions */}
                            <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {skillSuggestions
                                        .filter((s) => !skills.includes(s))
                                        .slice(0, 8)
                                        .map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="outline"
                                                className="cursor-pointer hover:bg-gray-100"
                                                onClick={() => addSkill(skill)}
                                            >
                                                + {skill}
                                            </Badge>
                                        ))}
                                </div>
                            </div>

                            {errors.skills && (
                                <p className="text-sm text-red-500 mt-2">{errors.skills}</p>
                            )}
                        </div>
                    )}
                </div>

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
                        onClick={handleContinue}
                        disabled={isSaving}
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
            </div>
        </div>
    );
}
