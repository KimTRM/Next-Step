"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ExperienceEntry } from "../../types";

interface ExperienceListProps {
    experiences: ExperienceEntry[];
}

export function ExperienceList({ experiences }: ExperienceListProps) {
    const [expandedExperience, setExpandedExperience] = useState<string | null>(null);

    if (!experiences || experiences.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">No experience added yet. Click Edit Profile to add your work history.</p>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    const getDuration = (startDate: number, endDate?: number, isCurrent?: boolean) => {
        const start = formatDate(startDate);
        const end = isCurrent ? "Present" : endDate ? formatDate(endDate) : "Present";
        return `${start} – ${end}`;
    };

    return (
        <div className="space-y-3">
            {experiences.map((exp, index) => {
                const isExpanded = expandedExperience === exp.id;
                const shouldTruncate = exp.description && exp.description.length > 100;

                return (
                    <div key={exp.id || `exp-${index}`} className="border border-gray-200 rounded-lg p-4 relative">
                        <h4 className="font-semibold text-gray-900 text-sm pr-6">{exp.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{exp.company}</p>
                        {exp.location && <p className="text-xs text-gray-400 mt-0.5">{exp.location}</p>}
                        <p className="text-xs text-gray-400 mt-1">{getDuration(exp.startDate, exp.endDate, exp.isCurrent)}</p>
                        {exp.description && (
                            <>
                                <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                                    {isExpanded || !shouldTruncate
                                        ? exp.description
                                        : `${exp.description.substring(0, 100)}...`}
                                </p>
                                {shouldTruncate && (
                                    <button
                                        onClick={() => setExpandedExperience(isExpanded ? null : exp.id!)}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center gap-0.5 transition-colors"
                                    >
                                        {isExpanded ? "Less" : "More"}
                                        <ChevronDown
                                            className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
