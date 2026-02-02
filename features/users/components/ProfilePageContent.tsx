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
    RefreshCw,
    Phone,
    Building2,
    Camera,
    MoreVertical,
    ChevronDown,
    FileDown,
    Eye,
    Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser, useUpsertUser, useUpdateUserProfile } from '../api';
import type { User as UserType, EducationLevel } from '../types';

// URL validation regex pattern
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

function isValidUrl(url: string): boolean {
    if (!url) return true;
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

const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python',
    'HTML/CSS', 'SQL', 'Git', 'Communication', 'Problem Solving', 'Teamwork',
];

const INTEREST_SUGGESTIONS = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'Data Science', 'DevOps',
    'UI/UX Design', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'Gaming',
];

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

const AUTO_SAVE_DELAY = 2000;

// Hardcoded data for sections not yet in the user model
const HARDCODED_SKILLS = ['Python', 'Django', 'React'];
const HARDCODED_INTERESTS = ['Web Development', 'AI/ML', 'Mobile Apps'];
const HARDCODED_EXPERIENCES = [
    {
        id: 1,
        title: 'App Development Intern',
        company: 'Bapple Technologies, Inc',
        duration: 'Apr 2025 – Jun 2025 (3 months)',
        description: 'Developed backend APIs using Python and Django to support user and service...',
    },
    {
        id: 2,
        title: 'App Development Intern',
        company: 'Bapple Technologies, Inc',
        duration: 'Apr 2025 – Jun 2025 (3 months)',
        description: 'Developed backend APIs using Python and Django to support user and service...',
    },
];
const HARDCODED_CAREER_GOALS = [
    'Land a developer job',
    'Do a flip',
    'Connect with 3 mentors in the Tech Industry',
];
const HARDCODED_CONNECTIONS = [
    { id: 1, name: 'John David Laureles', subtitle: 'Bachelor of Science in Computer Science' },
    { id: 2, name: 'John David Laureles', subtitle: 'Bachelor of Science in Computer Science' },
    { id: 3, name: 'John David Laureles', subtitle: 'Bachelor of Science in Computer Science' },
];
const HARDCODED_DOCUMENTS = [
    { id: 1, name: 'Resume.pdf', updatedAt: 'Jan. 30, 2026' },
];
const PROFILE_STRENGTH_ITEMS = [
    { label: 'Basic Information added', done: true },
    { label: 'Skills Listed', done: true },
    { label: 'Experience Listed', done: true },
    { label: 'Upload Resume (Recommended)', done: false },
];

export function ProfilePageContent() {
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const currentUser = useCurrentUser();
    const upsertUser = useUpsertUser();
    const updateProfile = useUpdateUserProfile();
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingAutoSaveRef = useRef<ProfileFormData | null>(null);

    const [newSkill, setNewSkill] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [expandedExperience, setExpandedExperience] = useState<number | null>(null);

    const form = useForm<ProfileFormData>({
        defaultValues: getDefaultFormValues(currentUser ?? null),
        mode: 'onBlur',
    });

    const { register, handleSubmit, watch, setValue, reset, setError, clearErrors, formState: { errors, isDirty } } = form;

    const watchedSkills = watch('skills');
    const watchedInterests = watch('interests');
    const watchedEducationLevel = watch('educationLevel');
    const watchedFormValues = watch();

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

    const profileCompletion = useMemo(() => {
        if (isEditing) {
            return calculateFormCompletion(watchedFormValues);
        }
        return calculateProfileCompletion(currentUser ?? null);
    }, [isEditing, watchedFormValues, currentUser, calculateFormCompletion]);

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

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (currentUser) {
            reset(getDefaultFormValues(currentUser));
        }
    }, [currentUser, reset]);

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

    const performAutoSave = useCallback(async (data: ProfileFormData) => {
        if (!data.name.trim() || !data.educationLevel) return;
        if (
            (data.linkedInUrl && !isValidUrl(data.linkedInUrl)) ||
            (data.githubUrl && !isValidUrl(data.githubUrl)) ||
            (data.portfolioUrl && !isValidUrl(data.portfolioUrl))
        ) return;

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

    const handleRetryAutoSave = useCallback(() => {
        if (pendingAutoSaveRef.current) performAutoSave(pendingAutoSaveRef.current);
    }, [performAutoSave]);

    useEffect(() => {
        if (!isEditing) return;
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(() => {
            performAutoSave(watchedFormValues);
        }, AUTO_SAVE_DELAY);
        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        };
    }, [watchedFormValues, isEditing, performAutoSave]);

    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        };
    }, []);

    const handleEditClick = () => {
        reset(getDefaultFormValues(currentUser ?? null));
        setLastSaved(null);
        setAutoSaveError(null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        reset(getDefaultFormValues(currentUser ?? null));
        setNewSkill('');
        setNewInterest('');
        setLastSaved(null);
        setAutoSaveError(null);
        setIsEditing(false);
    };

    const handleEducationLevelChange = (value: string) => {
        setValue('educationLevel', value as EducationLevel);
        if (value) clearErrors('educationLevel');
    };

    const validateForm = (data: ProfileFormData): boolean => {
        let isValid = true;
        if (!data.name.trim()) {
            setError('name', { type: 'required', message: 'Name is required' });
            isValid = false;
        }
        if (!data.educationLevel) {
            setError('educationLevel', { type: 'required', message: 'Education level is required' });
            isValid = false;
        }
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

    const onSubmit = async (data: ProfileFormData) => {
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
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

    const handleAddSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !watchedSkills.includes(trimmed)) setValue('skills', [...watchedSkills, trimmed]);
        setNewSkill('');
    };

    const handleRemoveSkill = (skill: string) => {
        setValue('skills', watchedSkills.filter(s => s !== skill));
    };

    const handleAddInterest = (interest: string) => {
        const trimmed = interest.trim();
        if (trimmed && !watchedInterests.includes(trimmed)) setValue('interests', [...watchedInterests, trimmed]);
        setNewInterest('');
    };

    const handleRemoveInterest = (interest: string) => {
        setValue('interests', watchedInterests.filter(i => i !== interest));
    };

    // ─── LOADING STATES ─────────────────────────────────────────────
    if (!mounted || !clerkLoaded || currentUser === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                    <p className="text-lg text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center flex-col gap-4">
                <p className="text-lg text-gray-600">Please sign in to view your profile</p>
                <Button asChild><a href="/auth">Sign In</a></Button>
            </div>
        );
    }

    if (currentUser === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center flex-col gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                <p className="text-lg text-gray-600">Setting up your profile...</p>
                <p className="text-sm text-gray-500">Signed in as {clerkUser.emailAddresses[0]?.emailAddress}</p>
                <p className="text-xs text-gray-400">If this persists, try refreshing the page</p>
            </div>
        );
    }

    // ─── EDIT MODE ──────────────────────────────────────────────────
    if (isEditing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Edit Profile</h1>
                            <p className="text-base lg:text-lg text-gray-600">Update your professional information.</p>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                                {isAutoSaving && (
                                    <span className="text-gray-600 flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                                    </span>
                                )}
                                {!isAutoSaving && lastSaved && !autoSaveError && (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Saved {lastSaved.toLocaleTimeString()}
                                    </span>
                                )}
                                {autoSaveError && (
                                    <button type="button" onClick={handleRetryAutoSave} className="text-red-600 flex items-center gap-1 hover:underline">
                                        <RefreshCw className="h-3 w-3" /> {autoSaveError}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleCancel} disabled={isSaving || isAutoSaving}>
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || isAutoSaving}>
                                <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-emerald-600" /> Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name <span className="text-red-600">*</span></Label>
                                        <Input id="name" {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })} placeholder="Enter your full name" className={errors.name ? 'border-red-600' : ''} aria-invalid={!!errors.name} />
                                        {errors.name && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" {...register('location')} placeholder="e.g., San Francisco, CA" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-emerald-600" /> Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel">Education Level <span className="text-red-600">*</span></Label>
                                    <Select value={watchedEducationLevel} onValueChange={handleEducationLevelChange}>
                                        <SelectTrigger className={errors.educationLevel ? 'border-red-600' : ''} aria-invalid={!!errors.educationLevel}>
                                            <SelectValue placeholder="Select your education level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EDUCATION_LEVELS.map((level) => (
                                                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.educationLevel && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.educationLevel.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bio */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" /> About Me
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea id="bio" {...register('bio', { maxLength: { value: 500, message: 'Bio must be 500 characters or less' } })} placeholder="Tell us about yourself..." className={`min-h-[120px] ${errors.bio ? 'border-red-600' : ''}`} aria-invalid={!!errors.bio} />
                                    <div className="flex justify-between text-sm">
                                        {errors.bio ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.bio.message}</span> : <span className="text-gray-500">&nbsp;</span>}
                                        <span className={`${(watch('bio')?.length || 0) > 500 ? 'text-red-600' : 'text-gray-500'}`}>{watch('bio')?.length || 0}/500</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-emerald-600" /> Skills
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {watchedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {watchedSkills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(newSkill); } }} />
                                    <Button type="button" variant="outline" onClick={() => handleAddSkill(newSkill)} disabled={!newSkill.trim()}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SKILL_SUGGESTIONS.filter(s => !watchedSkills.includes(s)).slice(0, 8).map((skill) => (
                                            <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleAddSkill(skill)}>+ {skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interests */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-emerald-600" /> Interests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {watchedInterests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {watchedInterests.map((interest) => (
                                            <Badge key={interest} variant="outline" className="px-3 py-1">
                                                {interest}
                                                <button type="button" onClick={() => handleRemoveInterest(interest)} className="ml-2 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add an interest..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(newInterest); } }} />
                                    <Button type="button" variant="outline" onClick={() => handleAddInterest(newInterest)} disabled={!newInterest.trim()}><Plus className="h-4 w-4" /></Button>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_SUGGESTIONS.filter(i => !watchedInterests.includes(i)).slice(0, 8).map((interest) => (
                                            <Badge key={interest} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => handleAddInterest(interest)}>+ {interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Career Goals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="h-5 w-5 text-emerald-600" /> Career Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="careerGoals">What are your career aspirations?</Label>
                                    <Textarea id="careerGoals" {...register('careerGoals', { maxLength: { value: 1000, message: 'Career goals must be 1000 characters or less' } })} placeholder="Describe your short-term and long-term career goals..." className={`min-h-[120px] ${errors.careerGoals ? 'border-red-600' : ''}`} aria-invalid={!!errors.careerGoals} />
                                    <div className="flex justify-between text-sm">
                                        {errors.careerGoals ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.careerGoals.message}</span> : <span className="text-gray-500">&nbsp;</span>}
                                        <span className={`${(watch('careerGoals')?.length || 0) > 1000 ? 'text-red-600' : 'text-gray-500'}`}>{watch('careerGoals')?.length || 0}/1000</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social Links */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <LinkIcon className="h-5 w-5 text-emerald-600" /> Social Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedInUrl" className="flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
                                    <Input id="linkedInUrl" {...register('linkedInUrl', { validate: (value) => !value || isValidUrl(value) || 'Please enter a valid LinkedIn URL' })} placeholder="https://linkedin.com/in/yourprofile" type="url" className={errors.linkedInUrl ? 'border-red-600' : ''} aria-invalid={!!errors.linkedInUrl} />
                                    {errors.linkedInUrl && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.linkedInUrl.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="githubUrl" className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</Label>
                                    <Input id="githubUrl" {...register('githubUrl', { validate: (value) => !value || isValidUrl(value) || 'Please enter a valid GitHub URL' })} placeholder="https://github.com/yourusername" type="url" className={errors.githubUrl ? 'border-red-600' : ''} aria-invalid={!!errors.githubUrl} />
                                    {errors.githubUrl && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.githubUrl.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="portfolioUrl" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Portfolio</Label>
                                    <Input id="portfolioUrl" {...register('portfolioUrl', { validate: (value) => !value || isValidUrl(value) || 'Please enter a valid URL' })} placeholder="https://yourportfolio.com" type="url" className={errors.portfolioUrl ? 'border-red-600' : ''} aria-invalid={!!errors.portfolioUrl} />
                                    {errors.portfolioUrl && <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.portfolioUrl.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}><X className="h-4 w-4" /> Cancel</Button>
                            <Button type="submit" disabled={isSaving}><Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* ── Cover Banner ── */}
                <div className="relative rounded-t-xl overflow-hidden h-48 bg-gradient-to-br from-green-400 via-green-300 to-emerald-200">
                    {/* Camera icon top right */}
                    <button className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors">
                        <Camera className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* ── Profile Header (overlapping) ── */}
                <div className="bg-white rounded-b-xl shadow-sm px-6 pb-5 pt-0 relative">
                    {/* Avatar row */}
                    <div className="flex items-end gap-4 -mt-12">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-white shadow-md shrink-0 bg-emerald-50">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback className="bg-emerald-50 text-emerald-700 text-3xl">
                                <User className="h-12 w-12 text-emerald-600" />
                            </AvatarFallback>
                        </Avatar>

                        {/* Name + badge + subtitle */}
                        <div className="pb-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                                <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 uppercase tracking-wide">
                                    {currentUser.role?.replace('_', ' ') || 'Job Seeker'}
                                </Badge>
                                <button onClick={handleEditClick} className="text-gray-400 hover:text-emerald-600 transition-colors">
                                    <Edit3 className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">Bachelor of Science in Computer Science</p>
                        </div>
                    </div>
                </div>

                {/* ── Main two-column grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

                    {/* ═══ LEFT SIDEBAR ═══ */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-4">Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                                    <p className="text-sm text-gray-700 mt-0.5 break-all">{currentUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact number</p>
                                    <p className="text-sm text-gray-700 mt-0.5">+63 912 345 6789</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                                    <p className="text-sm text-gray-700 mt-0.5">Naga City, Camarines Sur</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</p>
                                    <p className="text-sm text-gray-700 mt-0.5">University of Nueva Caceres</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Strength Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Profile Strength</h3>
                            {/* Progress bar */}
                            <div className="mb-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-emerald-500 h-2.5 rounded-full w-3/4 transition-all duration-500"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">75% complete</p>
                            {/* Checklist */}
                            <div className="space-y-2">
                                {PROFILE_STRENGTH_ITEMS.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                            {item.done ? (
                                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                                            ) : (
                                                <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                            )}
                                        </div>
                                        <span className={`text-xs ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connect with Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Connect with</h3>
                            <div className="space-y-3">
                                {HARDCODED_CONNECTIONS.map((conn) => (
                                    <div key={conn.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                        <Avatar className="h-9 w-9 shrink-0">
                                            <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{conn.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{conn.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══ RIGHT CONTENT ═══ */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                        {/* About me */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">About me</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {currentUser.bio || 'Fresh graduate passionate about technology and eager to start my career in software development. Strong foundation in programming and problem-solving.'}
                            </p>
                        </div>

                        <Separator />

                        {/* Skills */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(currentUser.skills && currentUser.skills.length > 0 ? currentUser.skills : HARDCODED_SKILLS).map((skill) => (
                                    <div key={skill} className="bg-gray-100 rounded-md px-4 py-1.5 text-sm text-gray-600 border border-gray-200">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Experience */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Experience</h3>
                            <div className="space-y-3">
                                {HARDCODED_EXPERIENCES.map((exp, idx) => (
                                    <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative">
                                        {/* More button */}
                                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                        <h4 className="font-semibold text-gray-900 text-sm pr-6">{exp.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{exp.company}</p>
                                        <p className="text-xs text-gray-400 mt-1">{exp.duration}</p>
                                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                                            {expandedExperience === idx ? exp.description : exp.description}
                                        </p>
                                        <button
                                            onClick={() => setExpandedExperience(expandedExperience === idx ? null : idx)}
                                            className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center gap-0.5 transition-colors"
                                        >
                                            More <ChevronDown className={`h-3 w-3 transition-transform ${expandedExperience === idx ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Career Goals */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Career Goals</h3>
                            <div className="space-y-2">
                                {HARDCODED_CAREER_GOALS.map((goal, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Target className="h-2.5 w-2.5 text-emerald-600" />
                                        </div>
                                        <p className="text-sm text-gray-700">{goal}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Area of Interest */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Area of Interest</h3>
                            <div className="flex flex-wrap gap-2">
                                {(currentUser.interests && currentUser.interests.length > 0 ? currentUser.interests : HARDCODED_INTERESTS).map((interest) => (
                                    <div key={interest} className="bg-gray-100 rounded-md px-4 py-1.5 text-sm text-gray-600 border border-gray-200">
                                        {interest}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Documents & Attachments */}
                        <div>
                            <h3 className="font-semibold text-gray-900 text-base mb-3">Documents &amp; Attachments</h3>
                            <div className="space-y-2">
                                {HARDCODED_DOCUMENTS.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-50 rounded-md p-1.5">
                                                <FileDown className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                                                <p className="text-xs text-gray-400">Updated {doc.updatedAt}</p>
                                            </div>
                                        </div>
                                        <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium transition-colors">
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Upload button */}
                            <button className="w-full mt-4 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload a Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}