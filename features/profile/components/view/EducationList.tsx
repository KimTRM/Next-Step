"use client";

import type { EducationEntry } from "../../types";

interface EducationListProps {
    education: EducationEntry[];
}

export function EducationList({ education }: EducationListProps) {
    if (!education || education.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic">No education added yet. Click Edit Profile to add your educational background.</p>
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
            {education.map((edu, index) => (
                <div key={edu.id || `edu-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 text-sm">{edu.degree}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{edu.institution}</p>
                    <p className="text-xs text-gray-400 mt-1">{getDuration(edu.startDate, edu.endDate, edu.isCurrent)}</p>
                    {edu.description && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">{edu.description}</p>
                    )}
                </div>
            ))}
        </div>
    );
}
