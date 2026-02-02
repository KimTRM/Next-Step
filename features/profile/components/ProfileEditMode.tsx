"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "../types";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../api";
import { useDebounce } from "../hooks/useDebounce";
import { useProfileCompletion } from "../hooks/useProfileCompletion";
import { SkillsSelector } from "@/shared/components/ui/SkillsSelector";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { EDUCATION_LEVELS, SKILL_SUGGESTIONS, INTEREST_SUGGESTIONS } from "../constants";
import { Loader2, Plus, Trash2, GripVertical, Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { EducationEntry, ExperienceEntry } from "../types";
import { toast } from "sonner";

interface ProfileEditModeProps {
    user: User;
    onSave?: () => void;
    onCancel?: () => void;
}

export function ProfileEditMode({ user, onSave, onCancel }: ProfileEditModeProps) {
    const updateProfile = useUpdateProfile();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showRetryDialog, setShowRetryDialog] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
    const hasInitializedRef = useRef(false);
    const isManualSaveRef = useRef(false);

    const {
        formData,
        isDirty,
        isSubmitting,
        setName,
        setLocation,
        setBio,
        setEducationLevel,
        setCareerGoals,
        setSkills,
        setInterests,
        setLinkedInUrl,
        setGithubUrl,
        setPortfolioUrl,
        educationManager,
        experienceManager,
        errors,
        validate,
        submit,
        reset,
    } = useProfileForm({
        user,
        onSubmit: async (data) => {
            try {
                setSaveError(null);

                // Transform data for Convex mutation
                await updateProfile({
                    bio: data.bio || undefined,
                    location: data.location || undefined,
                    skills: data.skills.length > 0 ? data.skills : undefined,
                    interests: data.interests.length > 0 ? data.interests : undefined,
                    careerGoals: data.careerGoals || undefined,
                    educationLevel: data.educationLevel || undefined,
                    linkedInUrl: data.linkedInUrl || undefined,
                    githubUrl: data.githubUrl || undefined,
                    portfolioUrl: data.portfolioUrl || undefined,
                    // Include education and experience arrays
                    education: data.education.length > 0 ? data.education : undefined,
                    experience: data.experience.length > 0 ? data.experience : undefined,
                });

                toast.success("Profile updated successfully!");
                onSave?.();
            } catch (error) {
                console.error("Failed to save profile:", error);
                setSaveError(
                    error instanceof Error ? error.message : "Failed to save profile"
                );
                setShowRetryDialog(true);
            }
        },
    });

    const [activeSection, setActiveSection] = useState<string>("basic");

    // Calculate profile completion in real-time
    const profileCompletion = useProfileCompletion(user, formData, true);

    // Debounce form data for auto-save (2 second delay)
    const debouncedFormData = useDebounce(formData, 2000);

    // Mark as initialized after first render to prevent auto-save on mount
    useEffect(() => {
        hasInitializedRef.current = true;
    }, []);

    // Auto-save when form data changes (after debounce)
    useEffect(() => {
        const performAutoSave = async () => {
            // Don't auto-save if:
            // - Not initialized yet (first mount)
            // - No changes made
            // - Currently doing manual save
            // - Already auto-saving
            // - Form has validation errors
            if (
                !hasInitializedRef.current ||
                !isDirty ||
                isManualSaveRef.current ||
                isAutoSaving ||
                isSubmitting
            ) {
                return;
            }

            // Validate before auto-saving
            const isValid = validate();
            if (!isValid) {
                return;
            }

            try {
                setIsAutoSaving(true);

                await updateProfile({
                    bio: formData.bio || undefined,
                    location: formData.location || undefined,
                    skills: formData.skills.length > 0 ? formData.skills : undefined,
                    interests: formData.interests.length > 0 ? formData.interests : undefined,
                    careerGoals: formData.careerGoals || undefined,
                    educationLevel: formData.educationLevel || undefined,
                    linkedInUrl: formData.linkedInUrl || undefined,
                    githubUrl: formData.githubUrl || undefined,
                    portfolioUrl: formData.portfolioUrl || undefined,
                });

                setLastAutoSaveTime(new Date());

                // Show subtle success message
                toast.success("Auto-saved", {
                    duration: 2000,
                    position: "bottom-right",
                });
            } catch (error) {
                console.error("Auto-save failed:", error);
                // Don't show error dialog for auto-save failures
                // User can still manually save
            } finally {
                setIsAutoSaving(false);
            }
        };

        performAutoSave();
    }, [debouncedFormData]); // eslint-disable-line react-hooks/exhaustive-deps

    // Navigation guard - warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Helper functions to get errors from flat array
    const getBasicError = (field: string) => {
        return errors.find((e) => e.field === field)?.message;
    };

    const getSocialLinksError = (field: string) => {
        return errors.find((e) => e.field === field)?.message;
    };

    const handleSave = async () => {
        const isValid = validate();
        if (isValid) {
            isManualSaveRef.current = true;
            await submit();
            isManualSaveRef.current = false;
        } else {
            toast.error("Please fix validation errors before saving");
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowCancelDialog(true);
        } else {
            onCancel?.();
        }
    };

    const confirmCancel = () => {
        reset();
        setShowCancelDialog(false);
        onCancel?.();
    };

    const retrySubmit = async () => {
        setShowRetryDialog(false);
        await handleSave();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-0">
            {/* Header with Save/Cancel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-10 gap-4 sm:gap-0 transition-all">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h2>
                        {/* Real-time Profile Completion Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                            <CheckCircle2 className={`w-4 h-4 transition-colors ${profileCompletion.percentage === 100 ? 'text-emerald-600' : 'text-emerald-500'
                                }`} />
                            <span className={`text-sm font-semibold transition-colors ${profileCompletion.percentage === 100 ? 'text-emerald-700' : 'text-emerald-600'
                                }`}>
                                {profileCompletion.percentage}%
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                        {isDirty && !isAutoSaving && !lastAutoSaveTime && (
                            <p className="text-xs sm:text-sm text-amber-600 transition-opacity">You have unsaved changes</p>
                        )}
                        {isAutoSaving && (
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 animate-in fade-in">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Auto-saving...
                            </p>
                        )}
                        {lastAutoSaveTime && !isAutoSaving && (
                            <p className="text-xs sm:text-sm text-emerald-600 animate-in fade-in">
                                Auto-saved at {lastAutoSaveTime.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none"
                    >
                        <X className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Cancel</span>
                        <span className="sm:hidden">Cancel</span>
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !isDirty}
                        className="flex-1 sm:flex-none"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-xl shadow-sm px-4 sm:px-6 py-3">
                <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                    {[
                        { id: "basic", label: "Basic Info" },
                        { id: "education", label: "Education" },
                        { id: "experience", label: "Experience" },
                        { id: "skills", label: "Skills & Interests" },
                        { id: "goals", label: "Goals" },
                        { id: "links", label: "Social Links" },
                    ].map((section) => (
                        <Button
                            key={section.id}
                            variant={activeSection === section.id ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveSection(section.id)}
                            className="whitespace-nowrap"
                        >
                            {section.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Basic Info Section */}
            {activeSection === "basic" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                                {getBasicError("name") && (
                                    <p className="text-sm text-red-600">{getBasicError("name")}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="educationLevel">Education Level</Label>
                                <Select
                                    value={formData.educationLevel}
                                    onValueChange={setEducationLevel}
                                >
                                    <SelectTrigger id="educationLevel">
                                        <SelectValue placeholder="Select your education level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EDUCATION_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getBasicError("educationLevel") && (
                                    <p className="text-sm text-red-600">
                                        {getBasicError("educationLevel")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows={4}
                                className="resize-none"
                            />
                            {getBasicError("bio") && (
                                <p className="text-sm text-red-600">{getBasicError("bio")}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="educationLevel">Education Level</Label>
                                <Select
                                    value={formData.educationLevel}
                                    onValueChange={setEducationLevel}
                                >
                                    <SelectTrigger id="educationLevel">
                                        <SelectValue placeholder="Select your education level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EDUCATION_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {getBasicError("educationLevel") && (
                                    <p className="text-sm text-red-600">
                                        {getBasicError("educationLevel")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location || ""}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Education Section */}
            {activeSection === "education" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Education History</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => educationManager.addEntry({
                                institution: "",
                                degree: "",
                                field: "",
                                startDate: Date.now(),
                                isCurrent: false,
                            })}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {educationManager.entries.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                No education entries yet. Click &quot;Add Education&quot; to get started.
                            </p>
                        ) : (
                            educationManager.entries.map((entry) => (
                                <EducationEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    errors={educationManager.errors.get(entry.id!) || []}
                                    onUpdate={(updated) =>
                                        educationManager.updateEntry(entry.id!, updated)
                                    }
                                    onRemove={() => educationManager.removeEntry(entry.id!)}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Experience Section */}
            {activeSection === "experience" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Work Experience</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => experienceManager.addEntry({
                                title: "",
                                company: "",
                                startDate: Date.now(),
                                isCurrent: false,
                            })}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {experienceManager.entries.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                No experience entries yet. Click &quot;Add Experience&quot; to get started.
                            </p>
                        ) : (
                            experienceManager.entries.map((entry) => (
                                <ExperienceEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    errors={experienceManager.errors.get(entry.id!) || []}
                                    onUpdate={(updated) =>
                                        experienceManager.updateEntry(entry.id!, updated)
                                    }
                                    onRemove={() => experienceManager.removeEntry(entry.id!)}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Skills & Interests Section */}
            {activeSection === "skills" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader>
                        <CardTitle>Skills & Interests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <SkillsSelector
                            label="Skills"
                            value={formData.skills}
                            onChange={setSkills}
                            suggestions={SKILL_SUGGESTIONS}
                            placeholder="Add your skills..."
                        />

                        <SkillsSelector
                            label="Interests"
                            value={formData.interests}
                            onChange={setInterests}
                            suggestions={INTEREST_SUGGESTIONS}
                            placeholder="Add your interests..."
                        />
                    </CardContent>
                </Card>
            )}

            {/* Goals Section */}
            {activeSection === "goals" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader>
                        <CardTitle>Career & Learning Goals</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="careerGoals">Career Goals</Label>
                            <Textarea
                                id="careerGoals"
                                value={formData.careerGoals}
                                onChange={(e) => setCareerGoals(e.target.value)}
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
                                value={formData.interests.join(", ")}
                                placeholder="Your goals are reflected in your interests"
                                rows={4}
                                disabled
                                className="resize-none"
                            />
                            <p className="text-sm text-gray-500">Edit your interests in the Skills & Interests section</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Social Links Section */}
            {activeSection === "links" && (
                <Card className="animate-in fade-in duration-200">
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                                <Input
                                    id="linkedin"
                                    type="url"
                                    value={formData.linkedInUrl}
                                    onChange={(e) => setLinkedInUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="truncate"
                                />
                                {getSocialLinksError("linkedInUrl") && (
                                    <p className="text-sm text-red-600">
                                        {getSocialLinksError("linkedInUrl")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub Profile</Label>
                                <Input
                                    id="github"
                                    type="url"
                                    value={formData.githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/yourusername"
                                    className="truncate"
                                />
                                {getSocialLinksError("githubUrl") && (
                                    <p className="text-sm text-red-600">
                                        {getSocialLinksError("githubUrl")}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="portfolio">Portfolio Website</Label>
                            <Input
                                id="portfolio"
                                type="url"
                                value={formData.portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                placeholder="https://yourwebsite.com"
                            />
                            {getSocialLinksError("portfolioUrl") && (
                                <p className="text-sm text-red-600">
                                    {getSocialLinksError("portfolioUrl")}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to cancel? All changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Retry Save Dialog */}
            <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Failed to Save Profile
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {saveError || "An error occurred while saving your profile. Please try again."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSaveError(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={retrySubmit}>
                            <Loader2 className={`w-4 h-4 mr-2 ${isSubmitting ? "animate-spin" : "hidden"}`} />
                            Retry
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Education Entry Card Component
interface EducationEntryCardProps {
    entry: EducationEntry;
    errors: Array<{ field: string; message: string }>;
    onUpdate: (entry: EducationEntry) => void;
    onRemove: () => void;
}

function EducationEntryCard({
    entry,
    errors,
    onUpdate,
    onRemove,
}: EducationEntryCardProps) {
    const getError = (field: string) =>
        errors.find((e) => e.field === field)?.message;

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <h4 className="font-semibold text-gray-900">Education Entry</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`institution-${entry.id}`}>
                        Institution <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`institution-${entry.id}`}
                        value={entry.institution}
                        onChange={(e) =>
                            onUpdate({ ...entry, institution: e.target.value })
                        }
                        placeholder="University name"
                    />
                    {getError("institution") && (
                        <p className="text-sm text-red-600">{getError("institution")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`degree-${entry.id}`}>
                        Degree <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`degree-${entry.id}`}
                        value={entry.degree}
                        onChange={(e) => onUpdate({ ...entry, degree: e.target.value })}
                        placeholder="e.g., Bachelor of Science"
                    />
                    {getError("degree") && (
                        <p className="text-sm text-red-600">{getError("degree")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`field-${entry.id}`}>Field of Study</Label>
                    <Input
                        id={`field-${entry.id}`}
                        value={entry.field}
                        onChange={(e) =>
                            onUpdate({ ...entry, field: e.target.value })
                        }
                        placeholder="e.g., Computer Science"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`start-${entry.id}`}>
                        Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`start-${entry.id}`}
                        type="date"
                        value={new Date(entry.startDate).toISOString().split('T')[0]}
                        onChange={(e) => onUpdate({ ...entry, startDate: new Date(e.target.value).getTime() })}
                    />
                    {getError("startDate") && (
                        <p className="text-sm text-red-600">{getError("startDate")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`end-${entry.id}`}>End Date</Label>
                    <Input
                        id={`end-${entry.id}`}
                        type="date"
                        value={entry.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => onUpdate({ ...entry, endDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                        disabled={entry.isCurrent}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`current-${entry.id}`}
                            checked={entry.isCurrent}
                            onChange={(e) =>
                                onUpdate({ ...entry, isCurrent: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor={`current-${entry.id}`} className="font-normal">
                            Currently studying here
                        </Label>
                    </div>
                    {getError("endDate") && (
                        <p className="text-sm text-red-600">{getError("endDate")}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`description-${entry.id}`}>Description</Label>
                <Textarea
                    id={`description-${entry.id}`}
                    value={entry.description || ""}
                    onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
                    placeholder="Achievements, activities, relevant coursework..."
                    rows={3}
                />
            </div>
        </div>
    );
}

// Experience Entry Card Component
interface ExperienceEntryCardProps {
    entry: ExperienceEntry;
    errors: Array<{ field: string; message: string }>;
    onUpdate: (entry: ExperienceEntry) => void;
    onRemove: () => void;
}

function ExperienceEntryCard({
    entry,
    errors,
    onUpdate,
    onRemove,
}: ExperienceEntryCardProps) {
    const getError = (field: string) =>
        errors.find((e) => e.field === field)?.message;

    return (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <h4 className="font-semibold text-gray-900">Experience Entry</h4>
                </div>
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`company-${entry.id}`}>
                        Company <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`company-${entry.id}`}
                        value={entry.company}
                        onChange={(e) => onUpdate({ ...entry, company: e.target.value })}
                        placeholder="Company name"
                    />
                    {getError("company") && (
                        <p className="text-sm text-red-600">{getError("company")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`position-${entry.id}`}>
                        Position <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`position-${entry.id}`}
                        value={entry.title}
                        onChange={(e) => onUpdate({ ...entry, title: e.target.value })}
                        placeholder="Job title"
                    />
                    {getError("title") && (
                        <p className="text-sm text-red-600">{getError("title")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`location-${entry.id}`}>Location</Label>
                    <Input
                        id={`location-${entry.id}`}
                        value={entry.location || ""}
                        onChange={(e) => onUpdate({ ...entry, location: e.target.value })}
                        placeholder="City, Country"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`start-${entry.id}`}>
                        Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id={`start-${entry.id}`}
                        type="date"
                        value={new Date(entry.startDate).toISOString().split('T')[0]}
                        onChange={(e) => onUpdate({ ...entry, startDate: new Date(e.target.value).getTime() })}
                    />
                    {getError("startDate") && (
                        <p className="text-sm text-red-600">{getError("startDate")}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`end-${entry.id}`}>End Date</Label>
                    <Input
                        id={`end-${entry.id}`}
                        type="date"
                        value={entry.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => onUpdate({ ...entry, endDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                        disabled={entry.isCurrent}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`current-${entry.id}`}
                            checked={entry.isCurrent}
                            onChange={(e) =>
                                onUpdate({ ...entry, isCurrent: e.target.checked })
                            }
                            className="rounded"
                        />
                        <Label htmlFor={`current-${entry.id}`} className="font-normal">
                            Currently working here
                        </Label>
                    </div>
                    {getError("endDate") && (
                        <p className="text-sm text-red-600">{getError("endDate")}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor={`description-${entry.id}`}>Description</Label>
                <Textarea
                    id={`description-${entry.id}`}
                    value={entry.description || ""}
                    onChange={(e) => onUpdate({ ...entry, description: e.target.value })}
                    placeholder="Key responsibilities and achievements..."
                    rows={3}
                />
            </div>
        </div>
    );
}
