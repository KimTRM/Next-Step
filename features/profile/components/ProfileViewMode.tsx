"use client";

/**
 * ProfileViewMode Component
 * Read-only profile view with completion indicator and edit button
 */

import { Separator } from "@/shared/components/ui/separator";
import type { User as UserType, ProfileCompletion } from "../types";
import {
    ProfileHeader,
    ProfileDetails,
    ProfileStrength,
    ExperienceList,
    EducationList,
    SkillsInterests,
    SocialLinks,
} from "./view";

interface ProfileViewModeProps {
    user: UserType;
    profileCompletion: ProfileCompletion;
    onEditClick: () => void;
}

export function ProfileViewMode({ user, profileCompletion, onEditClick }: ProfileViewModeProps) {

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <ProfileHeader user={user} onEditClick={onEditClick} />

                {/* Main two-column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                    {/* LEFT SIDEBAR */}
                    <div className="lg:col-span-1 space-y-4">
                        <ProfileDetails user={user} />
                        <ProfileStrength profileCompletion={profileCompletion} />
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                        {/* About me */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">About me</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {user.bio ||
                                    "Click Edit Profile to add a bio and tell others about yourself."}
                            </p>
                        </div>

                        <Separator />

                        <SkillsInterests skills={user.skills} interests={user.interests} />

                        <Separator />

                        {/* Education */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Education</h3>
                            <EducationList education={user.education || []} />
                        </div>

                        <Separator />

                        {/* Experience */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Experience</h3>
                            <ExperienceList experiences={user.experience || []} />
                        </div>

                        <Separator />

                        {/* Career Goals */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Career Goals</h3>
                            {user.careerGoals ? (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{user.careerGoals}</p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No career goals added yet</p>
                            )}
                        </div>

                        <Separator />

                        <SocialLinks
                            linkedInUrl={user.linkedInUrl}
                            githubUrl={user.githubUrl}
                            portfolioUrl={user.portfolioUrl}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
