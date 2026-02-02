"use client";

import type { User } from "../../types";

interface ProfileDetailsProps {
    user: User;
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
    return (
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
    );
}
