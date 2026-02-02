"use client";

/**
 * Profile Step Page - Step 3
 * Review and update profile information
 */

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, User } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";

export function ProfileStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state } = useApplicationFlow();
    const { applicant, formData } = state;

    const handleBack = () => {
        router.push(`/jobs/${jobId}/apply/questions`);
    };

    const handleContinue = () => {
        router.push(`/jobs/${jobId}/apply/review`);
    };

    const handleEditProfile = () => {
        window.open("/profile", "_blank");
    };

    if (!applicant) {
        return null;
    }

    // Format date for display
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Review Your Profile</h2>
                    <p className="text-muted-foreground">
                        This information will be shared with the employer.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleEditProfile}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </div>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={applicant.avatarUrl || undefined} alt={applicant.name} />
                            <AvatarFallback>
                                <User className="w-8 h-8" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{applicant.name}</h3>
                            <p className="text-muted-foreground">{applicant.email}</p>
                            {applicant.location && (
                                <p className="text-sm text-muted-foreground">{applicant.location}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills */}
            {formData.profile.skills && formData.profile.skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {formData.profile.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Experience */}
            {formData.profile.experience && formData.profile.experience.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.profile.experience.map((exp, index) => (
                            <div key={index} className="border-l-2 border-primary/30 pl-4">
                                <h4 className="font-medium">{exp.title}</h4>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                                </p>
                                {exp.description && (
                                    <p className="text-sm mt-2">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Education */}
            {formData.profile.education && formData.profile.education.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Education</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.profile.education.map((edu, index) => (
                            <div key={index} className="border-l-2 border-primary/30 pl-4">
                                <h4 className="font-medium">{edu.degree}</h4>
                                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(edu.startDate)} - {edu.isCurrent ? "Present" : formatDate(edu.endDate)}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {(!formData.profile.skills || formData.profile.skills.length === 0) &&
                (!formData.profile.experience || formData.profile.experience.length === 0) &&
                (!formData.profile.education || formData.profile.education.length === 0) && (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                Your profile appears to be incomplete. A complete profile helps employers understand your qualifications.
                            </p>
                            <Button variant="outline" onClick={handleEditProfile}>
                                Complete Your Profile
                            </Button>
                        </CardContent>
                    </Card>
                )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button onClick={handleContinue}>
                    Continue to Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
