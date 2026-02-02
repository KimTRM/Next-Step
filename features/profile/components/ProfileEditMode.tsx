"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "../types";
import { useProfileForm } from "../hooks/useProfileForm";
import { useUpdateProfile } from "../api";
import { useDebounce } from "../hooks/useDebounce";
import { useProfileCompletion } from "../hooks/useProfileCompletion";
import { Button } from "@/shared/components/ui/button";
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
import { Loader2, Save, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
    BasicInfoSection,
    EducationSection,
    ExperienceSection,
    SkillsSection,
    GoalsSection,
    SocialLinksSection,
} from "./edit";

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
        setSpecialization,
        setTechnology,
        setCoverPhotoUrl,
        setAvatarUrl,
        educationManager,
        experienceManager,
        socialLinksManager,
        errors,
        validate,
        submit,
        reset,
    } = useProfileForm({
        user,
        onSubmit: async (data) => {
            try {
                setSaveError(null);

                // Transform education entries - remove client-side IDs
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedEducation = data.education.map(({ id: _id, ...rest }) => rest);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedExperience = data.experience.map(({ id: _id, ...rest }) => rest);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedSocialLinks = data.socialLinks.map(({ id: _id, ...rest }) => rest);

                // Transform data for Convex mutation
                await updateProfile({
                    name: data.name || undefined,
                    bio: data.bio || undefined,
                    location: data.location || undefined,
                    skills: data.skills.length > 0 ? data.skills : undefined,
                    interests: data.interests.length > 0 ? data.interests : undefined,
                    careerGoals: data.careerGoals || undefined,
                    educationLevel: data.educationLevel || undefined,
                    linkedInUrl: data.linkedInUrl || undefined,
                    githubUrl: data.githubUrl || undefined,
                    portfolioUrl: data.portfolioUrl || undefined,
                    socialLinks: cleanedSocialLinks.length > 0 ? cleanedSocialLinks : undefined,
                    coverPhotoUrl: data.coverPhotoUrl || undefined,
                    avatarUrl: data.avatarUrl || undefined,
                    // Include education and experience arrays without client-side IDs
                    education: cleanedEducation.length > 0 ? cleanedEducation : undefined,
                    experience: cleanedExperience.length > 0 ? cleanedExperience : undefined,
                    specialization: data.specialization || undefined,
                    technology: data.technology.length > 0 ? data.technology : undefined,
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

    // Auto-save disabled - users must manually save changes
    /*
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

                // Transform education and experience - remove client-side IDs
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedEducation = formData.education.map(({ id: _id, ...rest }) => rest);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedExperience = formData.experience.map(({ id: _id, ...rest }) => rest);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const cleanedSocialLinks = formData.socialLinks.map(({ id: _id, ...rest }) => rest);

                await updateProfile({
                    name: formData.name || undefined,
                    bio: formData.bio || undefined,
                    location: formData.location || undefined,
                    skills: formData.skills.length > 0 ? formData.skills : undefined,
                    interests: formData.interests.length > 0 ? formData.interests : undefined,
                    careerGoals: formData.careerGoals || undefined,
                    educationLevel: formData.educationLevel || undefined,
                    linkedInUrl: formData.linkedInUrl || undefined,
                    githubUrl: formData.githubUrl || undefined,
                    portfolioUrl: formData.portfolioUrl || undefined,
                    socialLinks: cleanedSocialLinks.length > 0 ? cleanedSocialLinks : undefined,
                    coverPhotoUrl: formData.coverPhotoUrl || undefined,
                    avatarUrl: formData.avatarUrl || undefined,
                    education: cleanedEducation.length > 0 ? cleanedEducation : undefined,
                    experience: cleanedExperience.length > 0 ? cleanedExperience : undefined,
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
    */

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
                        {isDirty && (
                            <p className="text-xs sm:text-sm text-amber-600 transition-opacity">You have unsaved changes</p>
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
                <BasicInfoSection
                    formData={{
                        name: formData.name,
                        location: formData.location,
                        bio: formData.bio,
                        educationLevel: formData.educationLevel,
                        coverPhotoUrl: formData.coverPhotoUrl,
                        avatarUrl: formData.avatarUrl,
                        specialization: formData.specialization,
                        technology: formData.technology,
                    }}
                    setName={setName}
                    setLocation={setLocation}
                    setBio={setBio}
                    setEducationLevel={setEducationLevel}
                    setCoverPhotoUrl={setCoverPhotoUrl}
                    setAvatarUrl={setAvatarUrl}
                    setSpecialization={setSpecialization}
                    setTechnology={setTechnology}
                    getBasicError={getBasicError}
                />
            )}

            {/* Education Section */}
            {activeSection === "education" && (
                <EducationSection
                    entries={educationManager.entries}
                    errors={educationManager.errors}
                    onAddEntry={educationManager.addEntry}
                    onUpdateEntry={educationManager.updateEntry}
                    onRemoveEntry={educationManager.removeEntry}
                    onReorder={educationManager.reorderEntries}
                />
            )}

            {/* Experience Section */}
            {activeSection === "experience" && (
                <ExperienceSection
                    entries={experienceManager.entries}
                    errors={experienceManager.errors}
                    onAddEntry={experienceManager.addEntry}
                    onUpdateEntry={experienceManager.updateEntry}
                    onRemoveEntry={experienceManager.removeEntry}
                    onReorder={experienceManager.reorderEntries}
                />
            )}

            {/* Skills & Interests Section */}
            {activeSection === "skills" && (
                <SkillsSection
                    skills={formData.skills}
                    interests={formData.interests}
                    onSkillsChange={setSkills}
                    onInterestsChange={setInterests}
                />
            )}

            {/* Goals Section */}
            {activeSection === "goals" && (
                <GoalsSection
                    careerGoals={formData.careerGoals}
                    interests={formData.interests}
                    onCareerGoalsChange={setCareerGoals}
                    getBasicError={getBasicError}
                />
            )}

            {/* Social Links Section */}
            {activeSection === "links" && (
                <SocialLinksSection
                    entries={socialLinksManager.entries}
                    errors={socialLinksManager.errors}
                    onAddEntry={socialLinksManager.addEntry}
                    onUpdateEntry={socialLinksManager.updateEntry}
                    onRemoveEntry={socialLinksManager.removeEntry}
                    onReorder={socialLinksManager.reorderEntries}
                />
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
