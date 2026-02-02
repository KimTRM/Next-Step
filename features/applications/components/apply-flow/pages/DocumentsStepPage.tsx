"use client";

/**
 * Documents Step Page - Step 1
 * Choose documents: Resume and Cover Letter
 * Design matches the NextStep application flow mockups exactly
 */

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Mail,
    MapPin,
    Phone,
    Pencil,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { useApplicationFlow } from "../../../contexts/ApplicationFlowContext";
import type { ResumeDocument, CoverLetterDocument } from "../../../types/apply-flow";

type ResumeOption = "upload" | "select";
type CoverLetterOption = "upload" | "write" | "skip";

export function DocumentsStepPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const { state, updateDocuments, isStepValid } = useApplicationFlow();
    const { formData, applicant } = state;

    const [resumeOption, setResumeOption] = useState<ResumeOption>(
        formData.documents.resume?.source === "existing" ? "select" : "upload"
    );
    const [coverLetterOption, setCoverLetterOption] = useState<CoverLetterOption>(
        formData.documents.coverLetter?.option === "write"
            ? "write"
            : formData.documents.coverLetter?.option === "upload"
                ? "upload"
                : "skip"
    );
    const [coverLetterText, setCoverLetterText] = useState(
        formData.documents.coverLetter?.content || ""
    );

    // Handle resume file upload
    const handleResumeUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
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
        },
        [updateDocuments]
    );

    // Handle cover letter file upload
    const handleCoverLetterUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
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
        },
        [updateDocuments]
    );

    // Handle cover letter text change
    const handleCoverLetterTextChange = (text: string) => {
        setCoverLetterText(text);
        if (coverLetterOption === "write") {
            const coverLetterDoc: CoverLetterDocument = {
                id: `written-${Date.now()}`,
                content: text,
                option: "write",
                uploadedAt: Date.now(),
            };
            updateDocuments({ coverLetter: coverLetterDoc });
        }
    };

    // Handle cover letter option change
    const handleCoverLetterOptionChange = (option: CoverLetterOption) => {
        setCoverLetterOption(option);
        if (option === "skip") {
            updateDocuments({ coverLetter: null });
        } else if (option === "write" && coverLetterText) {
            const coverLetterDoc: CoverLetterDocument = {
                id: `written-${Date.now()}`,
                content: coverLetterText,
                option: "write",
                uploadedAt: Date.now(),
            };
            updateDocuments({ coverLetter: coverLetterDoc });
        }
    };

    const handleContinue = () => {
        if (isStepValid(1)) {
            router.push(`/jobs/${jobId}/apply/questions`);
        }
    };

    const canContinue = isStepValid(1);

    return (
        <div className="space-y-8">
            {/* Profile Card with diagonal stripes */}
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
                {/* Green diagonal stripes background on right side */}
                <div
                    className="absolute top-0 right-0 w-2/5 h-full"
                    style={{
                        background: `repeating-linear-gradient(
                            -55deg,
                            transparent,
                            transparent 10px,
                            rgba(17, 167, 115, 0.12) 10px,
                            rgba(17, 167, 115, 0.12) 20px
                        )`,
                    }}
                />

                <div className="relative p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {applicant?.name || "John David Laureles"}
                    </h2>

                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{applicant?.email || "kimlabrador71@gmail.com"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{applicant?.location || "Naga City, Camarines Sur"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>+63 9602662884</span>
                        </div>
                    </div>

                    {/* Edit Button - Dark style matching design */}
                    <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-6 right-6 bg-gray-700 hover:bg-gray-800 text-white"
                        onClick={() => window.open("/profile", "_blank")}
                    >
                        <Pencil className="w-3 h-3 mr-1.5" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Resume Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Resumé</h3>
                <RadioGroup
                    value={resumeOption}
                    onValueChange={(v) => setResumeOption(v as ResumeOption)}
                    className="space-y-2"
                >
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="upload" id="resume-upload" className="border-gray-400" />
                        <Label htmlFor="resume-upload" className="font-normal text-gray-700 cursor-pointer">
                            Upload a resumé
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="select" id="resume-select" className="border-gray-400" />
                        <Label htmlFor="resume-select" className="font-normal text-gray-700 cursor-pointer">
                            Select a resumé
                        </Label>
                    </div>
                </RadioGroup>

                {/* Upload input for resume */}
                {resumeOption === "upload" && (
                    <div className="mt-3">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {formData.documents.resume && (
                            <p className="mt-2 text-sm text-primary">
                                Selected: {formData.documents.resume.name}
                            </p>
                        )}
                    </div>
                )}

                {/* Select existing resume */}
                {resumeOption === "select" && (
                    <div className="mt-3 p-4 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Your saved resumes will appear here. Upload a new one or select from your profile.
                        </p>
                    </div>
                )}
            </div>

            {/* Cover Letter Section */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Cover Letter</h3>
                <RadioGroup
                    value={coverLetterOption}
                    onValueChange={(v) =>
                        handleCoverLetterOptionChange(v as CoverLetterOption)
                    }
                    className="space-y-2"
                >
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="upload" id="cover-upload" className="border-gray-400" />
                        <Label htmlFor="cover-upload" className="font-normal text-gray-700 cursor-pointer">
                            Upload a cover letter
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="write" id="cover-write" className="border-gray-400" />
                        <Label htmlFor="cover-write" className="font-normal text-gray-700 cursor-pointer">
                            Write a cover letter
                        </Label>
                    </div>

                    {/* Write cover letter textarea - shown when write is selected */}
                    {coverLetterOption === "write" && (
                        <div className="mt-3 space-y-3 pl-6">
                            <p className="text-sm text-gray-500">
                                Introduce yourself and briefly explain why you are suitable for
                                this role. Consider your relevant skills, qualifications and
                                related experience.
                            </p>
                            <Textarea
                                placeholder="Enter your Cover Letter here..."
                                value={coverLetterText}
                                onChange={(e) => handleCoverLetterTextChange(e.target.value)}
                                rows={6}
                                className="resize-none bg-gray-50 border-gray-200"
                            />
                        </div>
                    )}

                    {/* Upload input for cover letter */}
                    {coverLetterOption === "upload" && (
                        <div className="mt-3 pl-6">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleCoverLetterUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {formData.documents.coverLetter?.option === "upload" && (
                                <p className="mt-2 text-sm text-primary">
                                    Selected: {formData.documents.coverLetter.name}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Don't include option */}
                    <div className="flex items-center space-x-3 pt-2">
                        <RadioGroupItem
                            value="skip"
                            id="cover-skip"
                            className="border-gray-400"
                        />
                        <Label htmlFor="cover-skip" className="font-normal text-gray-700 cursor-pointer">
                            Don&apos;t include a cover letter
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Navigation - Right aligned */}
            <div className="flex justify-end pt-6">
                <Button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
