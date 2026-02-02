"use client";

/**
 * Step 1: Choose Documents
 * Resume and Cover Letter selection
 */

import { useState, useRef } from "react";
import Image from "next/image";
import {
    Upload,
    FileText,
    Edit3,
    X,
    ExternalLink,
    User,
    Mail,
    MapPin,
    Check,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import type { ResumeSource, CoverLetterOption, ResumeDocument, CoverLetterDocument } from "../../../types/apply-flow";

// Mock existing resumes (replace with actual API call)
const MOCK_EXISTING_RESUMES: ResumeDocument[] = [
    {
        id: "resume-1",
        name: "Software_Developer_Resume_2024.pdf",
        source: "existing",
        uploadedAt: Date.now() - 86400000 * 30,
    },
    {
        id: "resume-2",
        name: "Frontend_Developer_Resume.pdf",
        source: "existing",
        uploadedAt: Date.now() - 86400000 * 60,
    },
];

interface DocumentsStepProps {
    onViewDescription?: () => void;
    onEditProfile?: () => void;
}

export function DocumentsStep({ onViewDescription, onEditProfile }: DocumentsStepProps) {
    const { state, updateDocuments } = useApplicationFlow();
    const { job, applicant, formData } = state;
    const { documents } = formData;

    // Local state for tracking resume/cover letter options
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_resumeOption, setResumeOption] = useState<ResumeSource>(
        documents.resume?.source || null
    );
    const [coverLetterOption, setCoverLetterOption] = useState<CoverLetterOption>(
        documents.coverLetter?.option || null
    );
    const [coverLetterText, setCoverLetterText] = useState(
        documents.coverLetter?.content || ""
    );

    const resumeInputRef = useRef<HTMLInputElement>(null);
    const coverLetterInputRef = useRef<HTMLInputElement>(null);

    // Handle resume file upload
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const resume: ResumeDocument = {
                id: `upload-${Date.now()}`,
                name: file.name,
                file,
                source: "upload",
                uploadedAt: Date.now(),
            };
            updateDocuments({ resume });
            setResumeOption("upload");
        }
    };

    // Handle existing resume selection
    const handleSelectExistingResume = (resume: ResumeDocument) => {
        updateDocuments({ resume: { ...resume, source: "existing" } });
        setResumeOption("existing");
    };

    // Handle cover letter file upload
    const handleCoverLetterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const coverLetter: CoverLetterDocument = {
                id: `upload-${Date.now()}`,
                name: file.name,
                file,
                option: "upload",
                uploadedAt: Date.now(),
            };
            updateDocuments({ coverLetter });
            setCoverLetterOption("upload");
        }
    };

    // Handle cover letter text change
    const handleCoverLetterTextChange = (text: string) => {
        setCoverLetterText(text);
        const coverLetter: CoverLetterDocument = {
            id: `written-${Date.now()}`,
            content: text,
            option: "write",
        };
        updateDocuments({ coverLetter });
    };

    // Handle cover letter skip
    const handleSkipCoverLetter = () => {
        setCoverLetterOption("skip");
        updateDocuments({ coverLetter: { id: "skipped", option: "skip" } });
    };

    // Clear resume selection
    const handleClearResume = () => {
        updateDocuments({ resume: null });
        setResumeOption(null);
        if (resumeInputRef.current) {
            resumeInputRef.current.value = "";
        }
    };

    // Clear cover letter
    const handleClearCoverLetter = () => {
        updateDocuments({ coverLetter: null });
        setCoverLetterOption(null);
        setCoverLetterText("");
        if (coverLetterInputRef.current) {
            coverLetterInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            {/* Job Info Card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">{job?.title || "Job Title"}</CardTitle>
                            <p className="text-muted-foreground">{job?.company || "Company Name"}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onViewDescription}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Description
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Applicant Profile Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Your Profile</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onEditProfile}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {applicant?.avatarUrl ? (
                                <Image
                                    src={applicant.avatarUrl}
                                    alt={applicant.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                            <h4 className="font-medium text-foreground">
                                {applicant?.name || "Your Name"}
                            </h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    {applicant?.email || "email@example.com"}
                                </span>
                                {applicant?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {applicant.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resume Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            Resume <span className="text-destructive">*</span>
                        </CardTitle>
                        {documents.resume && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearResume}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selected Resume Display */}
                    {documents.resume && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="flex-1 text-sm font-medium truncate">
                                {documents.resume.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Selected
                            </Badge>
                        </div>
                    )}

                    {/* Resume Options */}
                    {!documents.resume && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {/* Upload Resume */}
                            <button
                                type="button"
                                onClick={() => resumeInputRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg transition-colors",
                                    "hover:border-primary/50 hover:bg-primary/5"
                                )}
                            >
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm font-medium">Upload Resume</span>
                                <span className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</span>
                            </button>
                            <input
                                ref={resumeInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                                className="hidden"
                                aria-label="Upload resume file"
                            />

                            {/* Select Existing */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-center mb-2">Or select existing</p>
                                <div className="space-y-2 max-h-35 overflow-y-auto">
                                    {MOCK_EXISTING_RESUMES.map((resume) => (
                                        <button
                                            key={resume.id}
                                            type="button"
                                            onClick={() => handleSelectExistingResume(resume)}
                                            className={cn(
                                                "flex items-center gap-2 w-full p-2 rounded-md border text-left transition-colors",
                                                "hover:border-primary/50 hover:bg-primary/5"
                                            )}
                                        >
                                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate">{resume.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cover Letter Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">Cover Letter</CardTitle>
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                        </div>
                        {coverLetterOption && coverLetterOption !== "skip" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearCoverLetter}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Uploaded Cover Letter Display */}
                    {coverLetterOption === "upload" && documents.coverLetter?.name && (
                        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="flex-1 text-sm font-medium truncate">
                                {documents.coverLetter.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Uploaded
                            </Badge>
                        </div>
                    )}

                    {/* Skipped Display */}
                    {coverLetterOption === "skip" && (
                        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                            Cover letter skipped
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleClearCoverLetter}
                                className="ml-2"
                            >
                                Add one instead
                            </Button>
                        </div>
                    )}

                    {/* Write Cover Letter */}
                    {coverLetterOption === "write" && (
                        <div className="space-y-2">
                            <Textarea
                                value={coverLetterText}
                                onChange={(e) => handleCoverLetterTextChange(e.target.value)}
                                placeholder="Write your cover letter here..."
                                className="min-h-50"
                                aria-label="Cover letter content"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {coverLetterText.length} characters
                            </p>
                        </div>
                    )}

                    {/* Cover Letter Options */}
                    {!coverLetterOption && (
                        <div className="grid gap-3 sm:grid-cols-3">
                            {/* Upload Cover Letter */}
                            <button
                                type="button"
                                onClick={() => coverLetterInputRef.current?.click()}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors",
                                    "hover:border-primary/50 hover:bg-primary/5"
                                )}
                            >
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-sm font-medium">Upload</span>
                            </button>
                            <input
                                ref={coverLetterInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleCoverLetterUpload}
                                className="hidden"
                                aria-label="Upload cover letter file"
                            />

                            {/* Write Cover Letter */}
                            <button
                                type="button"
                                onClick={() => setCoverLetterOption("write")}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors",
                                    "hover:border-primary/50 hover:bg-primary/5"
                                )}
                            >
                                <Edit3 className="w-6 h-6 text-muted-foreground" />
                                <span className="text-sm font-medium">Write</span>
                            </button>

                            {/* Skip */}
                            <button
                                type="button"
                                onClick={handleSkipCoverLetter}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-4 border rounded-lg transition-colors",
                                    "hover:bg-muted/50 text-muted-foreground"
                                )}
                            >
                                <X className="w-6 h-6" />
                                <span className="text-sm font-medium">Skip</span>
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
