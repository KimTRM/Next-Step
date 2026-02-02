"use client";

/**
 * Step 4: Review and Submit
 * Summary of all application data with final submission
 */

import Image from "next/image";
import {
    FileText,
    DollarSign,
    Briefcase,
    GraduationCap,
    Award,
    Lightbulb,
    Check,
    AlertCircle,
    Building2,
    MapPin,
    User,
    Mail,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import {
    SALARY_RANGES,
    APPLICATION_STEPS,
    type SalaryRange,
    type ExperienceEntry,
    type EducationEntry,
    type CertificationEntry
} from "../../../types/apply-flow";

// Helper to format date
const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
};

export function ReviewStep() {
    const { state, setConfirmation, goToStep } = useApplicationFlow();
    const { job, applicant, formData, validation } = state;
    const { documents, questions, profile, review } = formData;

    // Get validation for review step
    const reviewValidation = validation[4];

    // Format salary display
    const getSalaryDisplay = () => {
        const range = SALARY_RANGES.find((r: SalaryRange) => r.value === questions.expectedSalary);
        return range?.label || questions.expectedSalary || "Not specified";
    };

    // Check if required fields are complete
    const isDocumentsComplete = !!documents.resume;
    const isQuestionsComplete = !!questions.expectedSalary;

    // Handle edit section clicks
    const handleEditDocuments = () => goToStep(APPLICATION_STEPS.DOCUMENTS);
    const handleEditQuestions = () => goToStep(APPLICATION_STEPS.QUESTIONS);
    const handleEditProfile = () => goToStep(APPLICATION_STEPS.PROFILE);

    return (
        <div className="space-y-6">
            {/* Review Header */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Review Your Application
                    </CardTitle>
                    <CardDescription>
                        Please review your application details before submitting.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Job Applied For */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">Position Applied For</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-foreground">
                                {job?.title || "Job Title"}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="w-4 h-4" />
                                {job?.company || "Company Name"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {job?.location || "Location"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents Summary */}
            <Card className={cn(!isDocumentsComplete && "border-destructive")}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Documents</CardTitle>
                            {isDocumentsComplete ? (
                                <Badge variant="default" className="bg-green-500">
                                    <Check className="w-3 h-3 mr-1" />
                                    Complete
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Required
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleEditDocuments}>
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Resume */}
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Resume</p>
                            {documents.resume ? (
                                <p className="text-sm text-muted-foreground">
                                    {documents.resume.name}
                                </p>
                            ) : (
                                <p className="text-sm text-destructive">No resume selected</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Cover Letter */}
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">Cover Letter</p>
                            {documents.coverLetter?.option === "skip" ? (
                                <p className="text-sm text-muted-foreground">Skipped</p>
                            ) : documents.coverLetter?.option === "write" ? (
                                <p className="text-sm text-muted-foreground">
                                    Written ({documents.coverLetter.content?.length || 0} characters)
                                </p>
                            ) : documents.coverLetter?.name ? (
                                <p className="text-sm text-muted-foreground">
                                    {documents.coverLetter.name}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not provided</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Salary Expectation */}
            <Card className={cn(!isQuestionsComplete && "border-destructive")}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Salary Expectation</CardTitle>
                            {isQuestionsComplete ? (
                                <Badge variant="default" className="bg-green-500">
                                    <Check className="w-3 h-3 mr-1" />
                                    Complete
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Required
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleEditQuestions}>
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Expected Monthly Salary</p>
                            <p className="text-sm text-muted-foreground">
                                {getSalaryDisplay()} (PHP)
                            </p>
                        </div>
                    </div>
                    {questions.additionalNotes && (
                        <>
                            <Separator className="my-3" />
                            <div>
                                <p className="text-sm font-medium mb-1">Additional Notes</p>
                                <p className="text-sm text-muted-foreground">
                                    {questions.additionalNotes}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleEditProfile}>
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Applicant Info */}
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {applicant?.avatarUrl ? (
                                <Image
                                    src={applicant.avatarUrl}
                                    alt={applicant.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium">{applicant?.name || "Your Name"}</p>
                            <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {applicant?.email || "email@example.com"}
                                </span>
                                {applicant?.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {applicant.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Experience */}
                    {profile.experience.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-primary" />
                                <p className="text-sm font-medium">Experience ({profile.experience.length})</p>
                            </div>
                            <div className="space-y-2 pl-6">
                                {profile.experience.slice(0, 2).map((exp: ExperienceEntry) => (
                                    <div key={exp.id} className="text-sm">
                                        <p className="font-medium">{exp.title}</p>
                                        <p className="text-muted-foreground">
                                            {exp.company} • {formatDate(exp.startDate)} -{" "}
                                            {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                                        </p>
                                    </div>
                                ))}
                                {profile.experience.length > 2 && (
                                    <p className="text-sm text-muted-foreground">
                                        +{profile.experience.length - 2} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {profile.education.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                <p className="text-sm font-medium">Education ({profile.education.length})</p>
                            </div>
                            <div className="space-y-2 pl-6">
                                {profile.education.slice(0, 2).map((edu: EducationEntry) => (
                                    <div key={edu.id} className="text-sm">
                                        <p className="font-medium">{edu.degree}</p>
                                        <p className="text-muted-foreground">{edu.institution}</p>
                                    </div>
                                ))}
                                {profile.education.length > 2 && (
                                    <p className="text-sm text-muted-foreground">
                                        +{profile.education.length - 2} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {profile.certifications.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4 text-amber-500" />
                                <p className="text-sm font-medium">
                                    Certifications ({profile.certifications.length})
                                </p>
                            </div>
                            <div className="space-y-1 pl-6">
                                {profile.certifications.slice(0, 2).map((cert: CertificationEntry) => (
                                    <p key={cert.id} className="text-sm text-muted-foreground">
                                        {cert.name} - {cert.issuingOrganization}
                                    </p>
                                ))}
                                {profile.certifications.length > 2 && (
                                    <p className="text-sm text-muted-foreground">
                                        +{profile.certifications.length - 2} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-green-500" />
                                <p className="text-sm font-medium">Skills ({profile.skills.length})</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-6">
                                {profile.skills.slice(0, 8).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                                {profile.skills.length > 8 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{profile.skills.length - 8} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation */}
            <Card className={cn(!review.isConfirmed && reviewValidation.errors.length > 0 && "border-destructive")}>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="confirm-application"
                            checked={review.isConfirmed}
                            onCheckedChange={(checked) => setConfirmation(!!checked)}
                        />
                        <div className="space-y-1">
                            <Label
                                htmlFor="confirm-application"
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                I confirm that all information provided is accurate
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                By submitting this application, you agree that the information provided is
                                true and accurate. Your profile data will be shared with the employer.
                            </p>
                        </div>
                    </div>
                    {!review.isConfirmed && reviewValidation.errors.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
                            <AlertCircle className="w-4 h-4" />
                            <span>Please confirm your application details</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
