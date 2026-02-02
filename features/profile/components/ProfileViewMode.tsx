"use client";

/**
 * ProfileViewMode Component
 * Read-only profile view with completion indicator and edit button
 */

import {
    User,
    Edit3,
    Target,
    Linkedin,
    Github,
    Globe,
    ExternalLink,
    Camera,
    MoreVertical,
    ChevronDown,
    FileDown,
    Upload,
    Check,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import type { User as UserType, ProfileCompletion } from "../types";
import { useState } from "react";

interface ProfileViewModeProps {
    user: UserType;
    profileCompletion: ProfileCompletion;
    onEditClick: () => void;
}

// Hardcoded data for sections not yet in the user model
const HARDCODED_EXPERIENCES = [
    {
        id: 1,
        title: "App Development Intern",
        company: "Bapple Technologies, Inc",
        duration: "Apr 2025 – Jun 2025 (3 months)",
        description:
            "Developed backend APIs using Python and Django to support user and service management. Collaborated with the team to deliver features on schedule.",
    },
    {
        id: 2,
        title: "Software Engineering Intern",
        company: "Tech Solutions Corp",
        duration: "Jan 2025 – Mar 2025 (3 months)",
        description:
            "Built responsive frontend components using React. Participated in code reviews and agile development practices.",
    },
];

const HARDCODED_CAREER_GOALS = [
    "Land a developer job",
    "Build expertise in full-stack development",
    "Connect with 3 mentors in the Tech Industry",
];

const HARDCODED_CONNECTIONS = [
    { id: 1, name: "John David Laureles", subtitle: "Bachelor of Science in Computer Science" },
    { id: 2, name: "Sarah Chen", subtitle: "Software Engineer at Google" },
    { id: 3, name: "Michael Torres", subtitle: "Product Manager" },
];

const HARDCODED_DOCUMENTS = [{ id: 1, name: "Resume.pdf", updatedAt: "Jan. 30, 2026" }];

const PROFILE_STRENGTH_ITEMS = [
    { label: "Basic Information added", done: true },
    { label: "Skills Listed", done: true },
    { label: "Experience Listed", done: true },
    { label: "Upload Resume (Recommended)", done: false },
];

export function ProfileViewMode({ user, profileCompletion, onEditClick }: ProfileViewModeProps) {
    const [expandedExperience, setExpandedExperience] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Cover Banner */}
                <div className="relative rounded-t-xl overflow-hidden h-48 bg-gradient-to-br from-green-400 via-green-300 to-emerald-200">
                    <button className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors">
                        <Camera className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Profile Header (overlapping) */}
                <div className="bg-white rounded-b-xl shadow-sm px-6 pb-5 pt-0 relative">
                    <div className="flex items-end gap-4 -mt-12">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-white shadow-md shrink-0 bg-emerald-50">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-emerald-50 text-emerald-700 text-3xl">
                                <User className="h-12 w-12 text-emerald-600" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Name + badge + subtitle */}
                        <div className="pb-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 uppercase tracking-wide">
                                    {user.role?.replace("_", " ") || "Job Seeker"}
                                </Badge>
                                <button
                                    onClick={onEditClick}
                                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                                >
                                    <Edit3 className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {user.currentStatus || "Bachelor of Science in Computer Science"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-4">Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Email
                                    </p>
                                    <p className="text-sm text-gray-700 mt-0.5 break-all">{user.email}</p>
                                </div>
                                {user.location && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Location
                                        </p>
                                        <p className="text-sm text-gray-700 mt-0.5">{user.location}</p>
                                    </div>
                                )}
                                {user.educationLevel && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Education Level
                                        </p>
                                        <p className="text-sm text-gray-700 mt-0.5">
                                            {user.educationLevel.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Strength Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Profile Strength</h3>
                            <div className="mb-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${profileCompletion.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">{profileCompletion.percentage}% complete</p>
                            <div className="space-y-2">
                                {PROFILE_STRENGTH_ITEMS.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div
                                            className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? "bg-emerald-100" : "bg-gray-100"
                                                }`}
                                        >
                                            {item.done ? (
                                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                            )}
                                        </div>
                                        <span className={`text-xs ${item.done ? "text-gray-700" : "text-gray-400"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {profileCompletion.incomplete.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Complete your profile:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {profileCompletion.incomplete.map((field) => (
                                            <Badge key={field} variant="outline" className="text-xs">
                                                {field}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Connect with Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Connect with</h3>
                            <div className="space-y-3">
                                {HARDCODED_CONNECTIONS.map((conn) => (
                                    <div
                                        key={conn.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{conn.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{conn.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        {/* About me */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">About me</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {user.bio ||
                                    "Fresh graduate passionate about technology and eager to start my career in software development. Strong foundation in programming and problem-solving."}
                            </p>
                        </div>

                        <Separator />

                        {/* Skills */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map((skill) => (
                                        <div
                                            key={skill}
                                            className="bg-gray-100 rounded-md px-4 py-1.5 text-sm text-gray-600 border border-gray-200"
                                        >
                                            {skill}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No skills added yet</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Experience */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Experience</h3>
                            <div className="space-y-3">
                                {HARDCODED_EXPERIENCES.map((exp, idx) => (
                                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative">
                                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                        <h4 className="font-semibold text-gray-900 text-sm pr-6">{exp.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{exp.company}</p>
                                        <p className="text-xs text-gray-400 mt-1">{exp.duration}</p>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            {expandedExperience === idx
                                                ? exp.description
                                                : `${exp.description.substring(0, 100)}...`}
                                        </p>
                                        <button
                                            onClick={() =>
                                                setExpandedExperience(expandedExperience === idx ? null : idx)
                                            }
                                            className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center gap-0.5 transition-colors"
                                        >
                                            {expandedExperience === idx ? "Less" : "More"}
                                            <ChevronDown
                                                className={`h-3 w-3 transition-transform ${expandedExperience === idx ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Career Goals */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Career Goals</h3>
                            {user.careerGoals ? (
                                <p className="text-sm text-gray-600 leading-relaxed">{user.careerGoals}</p>
                            ) : (
                                <div className="space-y-2">
                                    {HARDCODED_CAREER_GOALS.map((goal, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                <Target className="h-2.5 w-2.5 text-emerald-600" />
                                            </div>
                                            <p className="text-sm text-gray-700">{goal}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Area of Interest */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Area of Interest</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.interests && user.interests.length > 0 ? (
                                    user.interests.map((interest) => (
                                        <div
                                            key={interest}
                                            className="bg-gray-100 rounded-md px-4 py-1.5 text-sm text-gray-600 border border-gray-200"
                                        >
                                            {interest}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No interests added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        {(user.linkedInUrl || user.githubUrl || user.portfolioUrl) && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-base mb-3">Social Links</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {user.linkedInUrl && (
                                            <a
                                                href={user.linkedInUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                <Linkedin className="h-4 w-4" />
                                                LinkedIn
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {user.githubUrl && (
                                            <a
                                                href={user.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline"
                                            >
                                                <Github className="h-4 w-4" />
                                                GitHub
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        {user.portfolioUrl && (
                                            <a
                                                href={user.portfolioUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                                            >
                                                <Globe className="h-4 w-4" />
                                                Portfolio
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Documents & Attachments */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Documents &amp; Attachments</h3>
                            <div className="space-y-2">
                                {HARDCODED_DOCUMENTS.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between py-2 border-b border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-50 rounded-md p-1.5">
                                                <FileDown className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                                                <p className="text-xs text-gray-400">Updated {doc.updatedAt}</p>
                                            </div>
                                        </div>
                                        <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium transition-colors">
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload a Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
