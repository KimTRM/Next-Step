"use client";

import { Check } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { ProfileCompletion } from "../../types";

interface ProfileStrengthProps {
    profileCompletion: ProfileCompletion;
}

export function ProfileStrength({ profileCompletion }: ProfileStrengthProps) {
    const getProfileStrengthItems = () => {
        return [
            { label: "Basic Information added", done: profileCompletion.incomplete.indexOf("Name") === -1 && profileCompletion.incomplete.indexOf("Bio") === -1 },
            { label: "Skills Listed", done: profileCompletion.incomplete.indexOf("Skills") === -1 },
            { label: "Education Listed", done: profileCompletion.incomplete.indexOf("Education Details") === -1 },
            { label: "Experience Listed", done: profileCompletion.incomplete.indexOf("Work Experience") === -1 },
        ];
    };

    const items = getProfileStrengthItems();

    return (
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
                {items.map((item, i) => (
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
    );
}
