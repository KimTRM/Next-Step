'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import {
    User,
    Mail,
    MapPin,
    Award,
    FileText,
    Edit3,
    Save,
    X,
    GraduationCap,
    Target,
    Heart,
    Linkedin,
    Github,
    Globe,
    ExternalLink,
    Calendar,
    AlertCircle,
    Plus,
    Link as LinkIcon,
    AlertTriangle,
    Loader2,
    Check,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser, useUpsertUser, useUpdateUserProfile } from '../api';
import type { User as UserType, EducationLevel } from '../types';

// URL validation regex pattern
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Validation helper for URLs
function isValidUrl(url: string): boolean {
    if (!url) return true; // Empty is valid (optional field)
    return URL_PATTERN.test(url);
}

// shadcn/ui components
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

// Education level display labels
const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
    high_school: 'High School',
    undergraduate: 'Undergraduate',
    graduate: 'Graduate',
    phd: 'PhD',
    bootcamp: 'Bootcamp',
    self_taught: 'Self-Taught',
};

const EDUCATION_LEVELS = [
    { value: 'high_school', label: 'High School' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'phd', label: 'PhD' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'self_taught', label: 'Self-Taught' },
] as const;

// Skill suggestions
const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'HTML/CSS', 'SQL', 'Git', 'Communication', 'Problem Solving', 'Teamwork',
];

// Interest suggestions
const INTEREST_SUGGESTIONS = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science', 'DevOps',
    'UI/UX Design', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'Gaming',
];

// Profile fields for completion calculation
type ProfileField = {
    key: string;
    label: string;
    weight: number;
    isArray?: boolean;
};

const PROFILE_FIELDS: ProfileField[] = [
    { key: 'name', label: 'Name', weight: 15 },
    { key: 'educationLevel', label: 'Education Level', weight: 15 },
    { key: 'bio', label: 'Bio', weight: 15 },
    { key: 'skills', label: 'Skills', weight: 15, isArray: true },
    { key: 'interests', label: 'Interests', weight: 10, isArray: true },
    { key: 'goals', label: 'Goals', weight: 10, isArray: true },
    { key: 'careerGoals', label: 'Career Goals', weight: 10 },
    { key: 'linkedInUrl', label: 'LinkedIn', weight: 5 },
    { key: 'githubUrl', label: 'GitHub', weight: 3 },
    { key: 'portfolioUrl', label: 'Portfolio', weight: 2 },
];

// Form data type
type ProfileFormData = {
    name: string;
    location: string;
    educationLevel: EducationLevel | '';
    bio: string;
    careerGoals: string;
    skills: string[];
    interests: string[];
    linkedInUrl: string;
    githubUrl: string;
    portfolioUrl: string;
};

// Calculate profile completion percentage
function calculateProfileCompletion(user: UserType | null): { percentage: number; incomplete: string[] } {
    if (!user) return { percentage: 0, incomplete: [] };

    let totalWeight = 0;
    let completedWeight = 0;
    const incomplete: string[] = [];

    for (const field of PROFILE_FIELDS) {
        totalWeight += field.weight;
        const value = user[field.key as keyof UserType];

        if (field.isArray) {
            if (Array.isArray(value) && value.length > 0) {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        } else {
            if (value && String(value).trim() !== '') {
                completedWeight += field.weight;
            } else {
                incomplete.push(field.label);
            }
        }
    }

    return {
        percentage: Math.round((completedWeight / totalWeight) * 100),
        incomplete,
    };
}

// Get default form values from user data
function getDefaultFormValues(user: UserType | null): ProfileFormData {
    return {
        name: user?.name || '',
        location: user?.location || '',
        educationLevel: user?.educationLevel || '',
        bio: user?.bio || '',
        careerGoals: user?.careerGoals || '',
        skills: user?.skills || [],
        interests: user?.interests || [],
        linkedInUrl: user?.linkedInUrl || '',
        githubUrl: user?.githubUrl || '',
        portfolioUrl: user?.portfolioUrl || '',
    };
}

// Auto-save debounce delay in milliseconds
const AUTO_SAVE_DELAY = 2000;

export function ProfilePageContent() {
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const currentUser = useCurrentUser();
    const upsertUser = useUpsertUser();
    const updateProfile = useUpdateUserProfile();
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-save state
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingAutoSaveRef = useRef<ProfileFormData | null>(null);

    // Skill/Interest input states
    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');

    // React Hook Form setup with validation mode
    const form = useForm<ProfileFormData>({
        defaultValues: getDefaultFormValues(currentUser ?? null),
        mode: 'onBlur', // Validate on blur for better UX
    });

    const { register, handleSubmit, watch, setValue, reset, setError, clearErrors, formState: { errors, isDirty } } = form;

    // Watch form values for skills and interests
    const watchedSkills = watch('skills');
    const watchedInterests = watch('interests');
    const watchedEducationLevel = watch('educationLevel');

    // Watch all form values for real-time profile completion
    const watchedFormValues = watch();

    // Calculate profile completion from form data (for edit mode real-time updates)
    const calculateFormCompletion = useCallback((data: ProfileFormData): { percentage: number; incomplete: string[] } => {
        const fields = [
            { key: 'name', value: data.name, label: 'Name', weight: 15 },
            { key: 'educationLevel', value: data.educationLevel, label: 'Education Level', weight: 15 },
            { key: 'bio', value: data.bio, label: 'Bio', weight: 15 },
            { key: 'skills', value: data.skills, label: 'Skills', weight: 15, isArray: true },
            { key: 'interests', value: data.interests, label: 'Interests', weight: 10, isArray: true },
            { key: 'careerGoals', value: data.careerGoals, label: 'Career Goals', weight: 10 },
            { key: 'linkedInUrl', value: data.linkedInUrl, label: 'LinkedIn', weight: 5 },
            { key: 'githubUrl', value: data.githubUrl, label: 'GitHub', weight: 3 },
            { key: 'portfolioUrl', value: data.portfolioUrl, label: 'Portfolio', weight: 2 },
        ];

        let totalWeight = 0;
        let completedWeight = 0;
        const incomplete: string[] = [];

        for (const field of fields) {
            totalWeight += field.weight;
            if (field.isArray) {
                if (Array.isArray(field.value) && field.value.length > 0) {
                    completedWeight += field.weight;
                } else {
                    incomplete.push(field.label);
                }
            } else {
                if (field.value && String(field.value).trim() !== '') {
                    completedWeight += field.weight;
                } else {
                    incomplete.push(field.label);
                }
            }
        }

        return {
            percentage: Math.round((completedWeight / totalWeight) * 100),
            incomplete,
        };
    }, []);

    // Calculate profile completion (view mode uses user data, edit mode uses form data)
    const profileCompletion = useMemo(() => {
        if (isEditing) {
            return calculateFormCompletion(watchedFormValues);
        }
        return calculateProfileCompletion(currentUser ?? null);
    }, [isEditing, watchedFormValues, currentUser, calculateFormCompletion]);

    // Warn user before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isEditing && isDirty && !lastSaved) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isEditing, isDirty, lastSaved]);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset form when user data loads or changes
    useEffect(() => {
        if (currentUser) {
            reset(getDefaultFormValues(currentUser));
        }
    }, [currentUser, reset]);

    // Auto-create user in Convex if signed in with Clerk but no Convex record
    useEffect(() => {
        const createUser = async () => {
            if (clerkUser && currentUser === null && !isCreatingUser) {
                setIsCreatingUser(true);
                try {
                    await upsertUser({
                        clerkId: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress || '',
                        name: clerkUser.fullName || clerkUser.firstName || 'User',
                        avatarUrl: clerkUser.imageUrl,
                    });
                } catch (error) {
                    console.error('Failed to create user:', error);
                    toast.error('Failed to set up profile');
                } finally {
                    setIsCreatingUser(false);
                }
            }
        };
        createUser();
    }, [clerkUser, currentUser, upsertUser, isCreatingUser]);

    // Auto-save function (non-blocking)
    const performAutoSave = useCallback(async (data: ProfileFormData) => {
        // Skip if required fields are missing
        if (!data.name.trim() || !data.educationLevel) {
            return;
        }

        // Validate URLs before auto-saving
        if (
            (data.linkedInUrl && !isValidUrl(data.linkedInUrl)) ||
            (data.githubUrl && !isValidUrl(data.githubUrl)) ||
            (data.portfolioUrl && !isValidUrl(data.portfolioUrl))
        ) {
            return;
        }

        setIsAutoSaving(true);
        setAutoSaveError(null);

        try {
            await updateProfile({
                bio: data.bio.trim() || undefined,
                location: data.location.trim() || undefined,
                educationLevel: data.educationLevel || undefined,
                careerGoals: data.careerGoals.trim() || undefined,
                skills: data.skills.length > 0 ? data.skills : undefined,
                interests: data.interests.length > 0 ? data.interests : undefined,
                linkedInUrl: data.linkedInUrl.trim() || undefined,
                githubUrl: data.githubUrl.trim() || undefined,
                portfolioUrl: data.portfolioUrl.trim() || undefined,
            });
            setLastSaved(new Date());
            setAutoSaveError(null);
        } catch (error) {
            console.error('Auto-save failed:', error);
            setAutoSaveError('Auto-save failed. Click to retry.');
            pendingAutoSaveRef.current = data;
        } finally {
            setIsAutoSaving(false);
        }
    }, [updateProfile]);

    // Retry auto-save
    const handleRetryAutoSave = useCallback(() => {
        if (pendingAutoSaveRef.current) {
            performAutoSave(pendingAutoSaveRef.current);
        }
    }, [performAutoSave]);

    // Debounced auto-save on form changes
    useEffect(() => {
        if (!isEditing) return;

        // Clear any pending auto-save timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout for auto-save
        autoSaveTimeoutRef.current = setTimeout(() => {
            performAutoSave(watchedFormValues);
        }, AUTO_SAVE_DELAY);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [watchedFormValues, isEditing, performAutoSave]);

    // Cleanup auto-save timeout on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    // Handle entering edit mode
    const handleEditClick = () => {
        reset(getDefaultFormValues(currentUser ?? null));
        setLastSaved(null);
        setAutoSaveError(null);
        setIsEditing(true);
    };

    // Handle cancel - discard changes and exit edit mode
    const handleCancel = () => {
        // Clear any pending auto-save
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }
        reset(getDefaultFormValues(currentUser ?? null));
        setNewSkill('');
        setNewInterest('');
        setLastSaved(null);
        setAutoSaveError(null);
        setIsEditing(false);
    };

    // Validate education level when it changes
    const handleEducationLevelChange = (value: string) => {
        setValue('educationLevel', value as EducationLevel);
        if (value) {
            clearErrors('educationLevel');
        }
    };

    // Custom validation before submit
    const validateForm = (data: ProfileFormData): boolean => {
        let isValid = true;

        // Validate required name
        if (!data.name.trim()) {
            setError('name', { type: 'required', message: 'Name is required' });
            isValid = false;
        }

        // Validate required education level
        if (!data.educationLevel) {
            setError('educationLevel', { type: 'required', message: 'Education level is required' });
            isValid = false;
        }

        // Validate URL formats
        if (data.linkedInUrl && !isValidUrl(data.linkedInUrl)) {
            setError('linkedInUrl', { type: 'pattern', message: 'Please enter a valid URL' });
            isValid = false;
        }

        if (data.githubUrl && !isValidUrl(data.githubUrl)) {
            setError('githubUrl', { type: 'pattern', message: 'Please enter a valid URL' });
            isValid = false;
        }

        if (data.portfolioUrl && !isValidUrl(data.portfolioUrl)) {
            setError('portfolioUrl', { type: 'pattern', message: 'Please enter a valid URL' });
            isValid = false;
        }

        return isValid;
    };

    // Handle form submission (manual save)
    const onSubmit = async (data: ProfileFormData) => {
        // Clear any pending auto-save
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Run custom validation
        if (!validateForm(data)) {
            toast.error('Please fix the validation errors');
            return;
        }

        setIsSaving(true);
        setAutoSaveError(null);

        try {
            await updateProfile({
                bio: data.bio.trim() || undefined,
                location: data.location.trim() || undefined,
                educationLevel: data.educationLevel || undefined,
                careerGoals: data.careerGoals.trim() || undefined,
                skills: data.skills.length > 0 ? data.skills : undefined,
                interests: data.interests.length > 0 ? data.interests : undefined,
                linkedInUrl: data.linkedInUrl.trim() || undefined,
                githubUrl: data.githubUrl.trim() || undefined,
                portfolioUrl: data.portfolioUrl.trim() || undefined,
            });
            setLastSaved(new Date());
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile. Please try again.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Add skill
    const handleAddSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !watchedSkills.includes(trimmed)) {
            setValue('skills', [...watchedSkills, trimmed]);
        }
        setNewSkill('');
    };

    // Remove skill
    const handleRemoveSkill = (skill: string) => {
        setValue('skills', watchedSkills.filter(s => s !== skill));
    };

    // Add interest
    const handleAddInterest = (interest: string) => {
        const trimmed = interest.trim();
        if (trimmed && !watchedInterests.includes(trimmed)) {
            setValue('interests', [...watchedInterests, trimmed]);
        }
        setNewInterest('');
    };

    // Remove interest
    const handleRemoveInterest = (interest: string) => {
        setValue('interests', watchedInterests.filter(i => i !== interest));
    };

    // Show loading while mounting or while Clerk and Convex are initializing
    if (!mounted || !clerkLoaded || currentUser === undefined) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-lg text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Not signed in with Clerk
    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center flex-col gap-4">
                <p className="text-lg text-muted-foreground">Please sign in to view your profile</p>
                <Button asChild>
                    <a href="/auth">Sign In</a>
                </Button>
            </div>
        );
    }

    // Signed in but no Convex user record yet
    if (currentUser === null) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center flex-col gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-lg text-muted-foreground">Setting up your profile...</p>
                <p className="text-sm text-muted-foreground">Signed in as {clerkUser.emailAddresses[0]?.emailAddress}</p>
                <p className="text-xs text-muted-foreground">If this persists, try refreshing the page</p>
            </div>
        );
    }

    // EDIT MODE
    if (isEditing) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Page Header */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl mb-2">Edit Profile</h1>
                            <p className="text-base lg:text-lg text-muted-foreground">
                                Update your professional information.
                            </p>
                            {/* Auto-save indicator */}
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                {isAutoSaving && (
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Saving...
                                    </span>
                                )}
                                {!isAutoSaving && lastSaved && !autoSaveError && (
                                    <span className="text-green-600 flex items-center gap-1">
                                        <Check className="h-3 w-3" />
                                        Saved {lastSaved.toLocaleTimeString()}
                                    </span>
                                )}
                                {autoSaveError && (
                                    <button
                                        type="button"
                                        onClick={handleRetryAutoSave}
                                        className="text-destructive flex items-center gap-1 hover:underline"
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                        {autoSaveError}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving || isAutoSaving}
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSaving || isAutoSaving}
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Info Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            {...register('name', {
                                                required: 'Name is required',
                                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                            })}
                                            placeholder="Enter your full name"
                                            className={errors.name ? 'border-destructive' : ''}
                                            aria-invalid={!!errors.name}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            {...register('location')}
                                            placeholder="e.g., San Francisco, CA"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel">
                                        Education Level <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={watchedEducationLevel}
                                        onValueChange={handleEducationLevelChange}
                                    >
                                        <SelectTrigger
                                            className={errors.educationLevel ? 'border-destructive' : ''}
                                            aria-invalid={!!errors.educationLevel}
                                        >
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
                                    {errors.educationLevel && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.educationLevel.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bio Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    About Me
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        {...register('bio', {
                                            maxLength: { value: 500, message: 'Bio must be 500 characters or less' }
                                        })}
                                        placeholder="Tell us about yourself, your background, and what you're passionate about..."
                                        className={`min-h-30 ${errors.bio ? 'border-destructive' : ''}`}
                                        aria-invalid={!!errors.bio}
                                    />
                                    <div className="flex justify-between text-sm">
                                        {errors.bio ? (
                                            <span className="text-destructive flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {errors.bio.message}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">&nbsp;</span>
                                        )}
                                        <span className={`${(watch('bio')?.length || 0) > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            {watch('bio')?.length || 0}/500
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Selected skills */}
                                {watchedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {watchedSkills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="px-3 py-1"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-2 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add skill input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add a skill..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSkill(newSkill);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddSkill(newSkill)}
                                        disabled={!newSkill.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Skill suggestions */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SKILL_SUGGESTIONS
                                            .filter(s => !watchedSkills.includes(s))
                                            .slice(0, 8)
                                            .map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleAddSkill(skill)}
                                                >
                                                    + {skill}
                                                </Badge>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interests Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-primary" />
                                    Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Selected interests */}
                                {watchedInterests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {watchedInterests.map((interest) => (
                                            <Badge
                                                key={interest}
                                                variant="outline"
                                                className="px-3 py-1"
                                            >
                                                {interest}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInterest(interest)}
                                                    className="ml-2 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Add interest input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        placeholder="Add an interest..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddInterest(newInterest);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleAddInterest(newInterest)}
                                        disabled={!newInterest.trim()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Interest suggestions */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_SUGGESTIONS
                                            .filter(i => !watchedInterests.includes(i))
                                            .slice(0, 8)
                                            .map((interest) => (
                                                <Badge
                                                    key={interest}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-accent"
                                                    onClick={() => handleAddInterest(interest)}
                                                >
                                                    + {interest}
                                                </Badge>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Goals Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Career Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="careerGoals">What are your career aspirations?</Label>
                                    <Textarea
                                        id="careerGoals"
                                        {...register('careerGoals', {
                                            maxLength: { value: 1000, message: 'Career goals must be 1000 characters or less' }
                                        })}
                                        placeholder="Describe your short-term and long-term career goals..."
                                        className={`min-h-30rors.careerGoals ? 'border-destructive' : ''}`}
                                        aria-invalid={!!errors.careerGoals}
                                    />
                                    <div className="flex justify-between text-sm">
                                        {errors.careerGoals ? (
                                            <span className="text-destructive flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {errors.careerGoals.message}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">&nbsp;</span>
                                        )}
                                        <span className={`${(watch('careerGoals')?.length || 0) > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            {watch('careerGoals')?.length || 0}/1000
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5 text-primary" />
                                    Social Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedInUrl" className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </Label>
                                    <Input
                                        id="linkedInUrl"
                                        {...register('linkedInUrl', {
                                            validate: (value) => !value || isValidUrl(value) || 'Please enter a valid LinkedIn URL'
                                        })}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        type="url"
                                        className={errors.linkedInUrl ? 'border-destructive' : ''}
                                        aria-invalid={!!errors.linkedInUrl}
                                    />
                                    {errors.linkedInUrl && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.linkedInUrl.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="githubUrl" className="flex items-center gap-2">
                                        <Github className="h-4 w-4" />
                                        GitHub
                                    </Label>
                                    <Input
                                        id="githubUrl"
                                        {...register('githubUrl', {
                                            validate: (value) => !value || isValidUrl(value) || 'Please enter a valid GitHub URL'
                                        })}
                                        placeholder="https://github.com/yourusername"
                                        type="url"
                                        className={errors.githubUrl ? 'border-destructive' : ''}
                                        aria-invalid={!!errors.githubUrl}
                                    />
                                    {errors.githubUrl && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.githubUrl.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolioUrl" className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Portfolio
                                    </Label>
                                    <Input
                                        id="portfolioUrl"
                                        {...register('portfolioUrl', {
                                            validate: (value) => !value || isValidUrl(value) || 'Please enter a valid URL'
                                        })}
                                        placeholder="https://yourportfolio.com"
                                        type="url"
                                        className={errors.portfolioUrl ? 'border-destructive' : ''}
                                        aria-invalid={!!errors.portfolioUrl}
                                    />
                                    {errors.portfolioUrl && (
                                        <p className="text-sm text-destructive flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            {errors.portfolioUrl.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bottom Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // VIEW MODE
    return (
        <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Page Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl mb-2">My Profile</h1>
                        <p className="text-base lg:text-lg text-muted-foreground">
                            Manage your professional profile and showcase your skills.
                        </p>
                    </div>
                    <Button
                        onClick={handleEditClick}
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        <Edit3 className="h-5 w-5" />
                        Edit Profile
                    </Button>
                </div>

                {/* Profile Completion Card */}
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Profile Completion</span>
                                    <span className="text-sm font-semibold text-primary">
                                        {profileCompletion.percentage}%
                                    </span>
                                </div>
                                <Progress value={profileCompletion.percentage} className="h-2" />
                            </div>
                            {profileCompletion.incomplete.length > 0 && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>
                                        Complete your {profileCompletion.incomplete.slice(0, 3).join(', ')}
                                        {profileCompletion.incomplete.length > 3 && ` and ${profileCompletion.incomplete.length - 3} more`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-24 w-24 mb-4">
                                        <AvatarImage
                                            src={currentUser.avatarUrl}
                                            alt={currentUser.name}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                            {currentUser.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-semibold mb-2">{currentUser.name}</h2>
                                    <Badge variant="secondary" className="capitalize mb-4">
                                        {currentUser.role.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-primary shrink-0" />
                                        <span className="truncate">{currentUser.email}</span>
                                    </div>

                                    {currentUser.location && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                                            <span>{currentUser.location}</span>
                                        </div>
                                    )}

                                    {currentUser.educationLevel && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                                            <span>{EDUCATION_LEVEL_LABELS[currentUser.educationLevel]}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 shrink-0" />
                                        <span>
                                            Member since {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links Card */}
                        {(currentUser.linkedInUrl || currentUser.githubUrl || currentUser.portfolioUrl) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-primary" />
                                        Connect
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {currentUser.linkedInUrl && (
                                        <a
                                            href={currentUser.linkedInUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            <span className="flex-1">LinkedIn</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                    {currentUser.githubUrl && (
                                        <a
                                            href={currentUser.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Github className="h-4 w-4" />
                                            <span className="flex-1">GitHub</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                    {currentUser.portfolioUrl && (
                                        <a
                                            href={currentUser.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span className="flex-1">Portfolio</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* No Social Links Prompt */}
                        {!currentUser.linkedInUrl && !currentUser.githubUrl && !currentUser.portfolioUrl && (
                            <Card className="border-dashed">
                                <CardContent className="pt-6">
                                    <div className="text-center text-muted-foreground">
                                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No social links added yet.</p>
                                        <Button
                                            variant="link"
                                            className="text-sm mt-1 h-auto p-0"
                                            onClick={handleEditClick}
                                        >
                                            Add your links
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    About Me
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentUser.bio ? (
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {currentUser.bio}
                                    </p>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No bio added yet.</p>
                                        <Button
                                            variant="link"
                                            className="text-sm mt-1 h-auto p-0"
                                            onClick={handleEditClick}
                                        >
                                            Add a bio
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Career Goals Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Career Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentUser.careerGoals ? (
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {currentUser.careerGoals}
                                    </p>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No career goals added yet.</p>
                                        <Button
                                            variant="link"
                                            className="text-sm mt-1 h-auto p-0"
                                            onClick={handleEditClick}
                                        >
                                            Add your career goals
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-primary" />
                                    Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentUser.skills && currentUser.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.skills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant="secondary"
                                                className="px-3 py-1"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No skills added yet.</p>
                                        <Button
                                            variant="link"
                                            className="text-sm mt-1 h-auto p-0"
                                            onClick={handleEditClick}
                                        >
                                            Add your skills
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Interests Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-primary" />
                                    Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {currentUser.interests && currentUser.interests.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.interests.map((interest) => (
                                            <Badge
                                                key={interest}
                                                variant="outline"
                                                className="px-3 py-1"
                                            >
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No interests added yet.</p>
                                        <Button
                                            variant="link"
                                            className="text-sm mt-1 h-auto p-0"
                                            onClick={handleEditClick}
                                        >
                                            Add your interests
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Goals Section */}
                        {currentUser.goals && currentUser.goals.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        Goals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.goals.map((goal) => (
                                            <Badge
                                                key={goal}
                                                variant="outline"
                                                className="px-3 py-1 bg-primary/5"
                                            >
                                                {goal}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
