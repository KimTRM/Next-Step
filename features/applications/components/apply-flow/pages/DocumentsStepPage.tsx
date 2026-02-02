"use client";

/**
 * Documents Step Page - Step 1
 * Upload resume and supporting documents
 */

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/components/ui/utils";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import type { ResumeDocument, CoverLetterDocument } from "../../../types/apply-flow";

export function DocumentsStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, updateDocuments, isStepValid } = useApplicationFlow();
    const { formData } = state;

    const [isDragActive, setIsDragActive] = useState(false);

    // Simulated saved resumes (in production, fetch from user's documents)
    const savedResumes: ResumeDocument[] = [
        {
            id: "resume-1",
            name: "Software_Engineer_Resume.pdf",
            source: "existing",
            uploadedAt: Date.parse("2024-01-15"),
            url: "/documents/resume-1"
        },
        {
            id: "resume-2",
            name: "Full_Stack_Developer_CV.pdf",
            source: "existing",
            uploadedAt: Date.parse("2024-02-01"),
            url: "/documents/resume-2"
        },
    ];

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            const resumeDoc: ResumeDocument = {
                id: `upload-${Date.now()}`,
                name: file.name,
                file: file,
                source: "upload",
                uploadedAt: Date.now(),
                url: URL.createObjectURL(file),
            };
            updateDocuments({ resume: resumeDoc });
        }
    }, [updateDocuments]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const resumeDoc: ResumeDocument = {
                id: `upload-${Date.now()}`,
                name: file.name,
                file: file,
                source: "upload",
                uploadedAt: Date.now(),
                url: URL.createObjectURL(file),
            };
            updateDocuments({ resume: resumeDoc });
        }
    }, [updateDocuments]);

    const handleSelectSavedResume = useCallback((resume: ResumeDocument) => {
        updateDocuments({ resume });
    }, [updateDocuments]);

    const handleCoverLetterUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const coverLetterDoc: CoverLetterDocument = {
                id: `cover-${Date.now()}`,
                name: file.name,
                file: file,
                option: "upload",
                uploadedAt: Date.now(),
                url: URL.createObjectURL(file),
            };
            updateDocuments({ coverLetter: coverLetterDoc });
        }
    }, [updateDocuments]);

    const handleContinue = () => {
        if (isStepValid(1)) {
            router.push(`/jobs/${jobId}/apply/questions`);
        }
    };

    const canContinue = isStepValid(1);
    const hasResume = formData.documents.resume !== null;

    // Format date for display
    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Upload Your Resume</h2>
                <p className="text-muted-foreground">
                    Start by uploading your resume or selecting a previously uploaded one.
                </p>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30",
                    hasResume && "border-primary/50 bg-primary/5"
                )}
            >
                {hasResume && formData.documents.resume ? (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-12 h-12 text-primary mb-4" />
                        <p className="font-medium">{formData.documents.resume.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formData.documents.resume.source === "upload"
                                ? "Just uploaded"
                                : `Uploaded ${formatDate(formData.documents.resume.uploadedAt)}`}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => updateDocuments({ resume: null })}
                        >
                            Change Resume
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-medium mb-1">
                            Drag and drop your resume here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                            or click to browse files
                        </p>
                        <Label htmlFor="resume-upload" className="cursor-pointer">
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Button type="button" variant="outline" asChild>
                                <span>Browse Files</span>
                            </Button>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-4">
                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Saved Resumes */}
            {!hasResume && savedResumes.length > 0 && (
                <div>
                    <Label className="text-base font-medium">Or select a saved resume</Label>
                    <div className="grid gap-3 mt-3">
                        {savedResumes.map((resume) => (
                            <Card
                                key={resume.id}
                                className="cursor-pointer transition-colors hover:border-primary/50"
                                onClick={() => handleSelectSavedResume(resume)}
                            >
                                <CardContent className="flex items-center gap-3 p-4">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">{resume.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Uploaded {formatDate(resume.uploadedAt)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Cover Letter (Optional) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Cover Letter (Optional)</CardTitle>
                    <CardDescription>
                        Add a cover letter to make your application stand out
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {formData.documents.coverLetter ? (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <span className="flex-1 font-medium text-sm">
                                {formData.documents.coverLetter.name}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => updateDocuments({ coverLetter: null })}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Label htmlFor="cover-letter-upload" className="cursor-pointer">
                            <input
                                id="cover-letter-upload"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleCoverLetterUpload}
                            />
                            <Button type="button" variant="outline" size="sm" asChild>
                                <span>Upload Cover Letter</span>
                            </Button>
                        </Label>
                    )}
                </CardContent>
            </Card>

            {/* Validation Message */}
            {!canContinue && (
                <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Please upload or select a resume to continue</span>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleContinue} disabled={!canContinue}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
