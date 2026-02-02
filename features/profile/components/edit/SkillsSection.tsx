"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { SkillsSelector } from "@/shared/components/ui/SkillsSelector";
import { SKILL_SUGGESTIONS, INTEREST_SUGGESTIONS } from "../../constants";

interface SkillsSectionProps {
    skills: string[];
    interests: string[];
    onSkillsChange: (skills: string[]) => void;
    onInterestsChange: (interests: string[]) => void;
}

export function SkillsSection({
    skills,
    interests,
    onSkillsChange,
    onInterestsChange,
}: SkillsSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <SkillsSelector
                    label="Skills"
                    placeholder="Add your technical and professional skills"
                    value={skills}
                    suggestions={SKILL_SUGGESTIONS}
                    onChange={onSkillsChange}
                />

                <SkillsSelector
                    label="Interests"
                    placeholder="Add your interests..."
                    value={interests}
                    suggestions={INTEREST_SUGGESTIONS}
                    onChange={onInterestsChange}
                />
            </CardContent>
        </Card>
    );
}
