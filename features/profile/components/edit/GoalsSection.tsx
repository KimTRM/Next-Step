"use client";

import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface GoalsSectionProps {
    careerGoals: string;
    interests: string[];
    onCareerGoalsChange: (value: string) => void;
    getBasicError: (field: string) => string | undefined;
}

export function GoalsSection({
    careerGoals,
    interests,
    onCareerGoalsChange,
    getBasicError,
}: GoalsSectionProps) {
    return (
        <Card className="animate-in fade-in duration-200">
            <CardHeader>
                <CardTitle>Career & Learning Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="careerGoals">Career Goals</Label>
                    <Textarea
                        id="careerGoals"
                        value={careerGoals}
                        onChange={(e) => onCareerGoalsChange(e.target.value)}
                        placeholder="What are your career aspirations?"
                        rows={4}
                        className="resize-none"
                    />
                    {getBasicError("careerGoals") && (
                        <p className="text-sm text-red-600">
                            {getBasicError("careerGoals")}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="goals">Goals</Label>
                    <Textarea
                        id="goals"
                        value={interests.join(", ")}
                        placeholder="Your goals are reflected in your interests"
                        rows={4}
                        disabled
                        className="resize-none"
                    />
                    <p className="text-sm text-gray-500">
                        Edit your interests in the Skills & Interests section
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
