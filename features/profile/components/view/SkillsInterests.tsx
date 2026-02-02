"use client";

interface SkillsInterestsProps {
    skills?: string[];
    interests?: string[];
}

export function SkillsInterests({ skills, interests }: SkillsInterestsProps) {
    return (
        <>
            {/* Skills */}
            <div>
                <h3 className="font-semibold text-gray-900 text-base mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {skills && skills.length > 0 ? (
                        skills.map((skill) => (
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

            {/* Area of Interest */}
            <div>
                <h3 className="font-semibold text-gray-900 text-base mb-3">Area of Interest</h3>
                <div className="flex flex-wrap gap-2">
                    {interests && interests.length > 0 ? (
                        interests.map((interest) => (
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
        </>
    );
}
