'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import {
    User,
    GraduationCap,
    FileText,
    Award,
    Heart,
    Target,
    Link as LinkIcon,
    Linkedin,
    Github,
    Globe,
    Plus,
    X,
    AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
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
import type { EducationLevel } from '../../types';
import {
    ProfileFormData,
    EDUCATION_LEVELS,
    SKILL_SUGGESTIONS,
    INTEREST_SUGGESTIONS,
    isValidUrl
} from './types';

type FormSectionProps = {
    register: UseFormRegister<ProfileFormData>;
    watch: UseFormWatch<ProfileFormData>;
    setValue: UseFormSetValue<ProfileFormData>;
    errors: FieldErrors<ProfileFormData>;
    onEducationLevelChange: (value: string) => void;
};

export function BasicInfoSection({ register, errors }: Pick<FormSectionProps, 'register' | 'errors'>) {
    return (
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
    );
}

export function EducationSection({ watch, errors, onEducationLevelChange }: Pick<FormSectionProps, 'watch' | 'errors' | 'onEducationLevelChange'>) {
    const educationLevel = watch('educationLevel');

    return (
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
                        value={educationLevel}
                        onValueChange={onEducationLevelChange}
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
    );
}

export function BioSection({ register, watch, errors }: Pick<FormSectionProps, 'register' | 'watch' | 'errors'>) {
    const bioLength = watch('bio')?.length || 0;

    return (
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
                        className={`min-h-[120px] ${errors.bio ? 'border-destructive' : ''}`}
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
                        <span className={bioLength > 500 ? 'text-destructive' : 'text-muted-foreground'}>
                            {bioLength}/500
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SkillsSection({ watch, setValue }: Pick<FormSectionProps, 'watch' | 'setValue'>) {
    const [newSkill, setNewSkill] = useState('');
    const skills = watch('skills');

    const handleAddSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setValue('skills', [...skills, trimmed]);
        }
        setNewSkill('');
    };

    const handleRemoveSkill = (skill: string) => {
        setValue('skills', skills.filter(s => s !== skill));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1">
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

                <div>
                    <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                        {SKILL_SUGGESTIONS
                            .filter(s => !skills.includes(s))
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
    );
}

export function InterestsSection({ watch, setValue }: Pick<FormSectionProps, 'watch' | 'setValue'>) {
    const [newInterest, setNewInterest] = useState('');
    const interests = watch('interests');

    const handleAddInterest = (interest: string) => {
        const trimmed = interest.trim();
        if (trimmed && !interests.includes(trimmed)) {
            setValue('interests', [...interests, trimmed]);
        }
        setNewInterest('');
    };

    const handleRemoveInterest = (interest: string) => {
        setValue('interests', interests.filter(i => i !== interest));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Interests
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                            <Badge key={interest} variant="outline" className="px-3 py-1">
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

                <div>
                    <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                        {INTEREST_SUGGESTIONS
                            .filter(i => !interests.includes(i))
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
    );
}

export function CareerGoalsSection({ register, watch, errors }: Pick<FormSectionProps, 'register' | 'watch' | 'errors'>) {
    const goalsLength = watch('careerGoals')?.length || 0;

    return (
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
                        className={`min-h-[120px] ${errors.careerGoals ? 'border-destructive' : ''}`}
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
                        <span className={goalsLength > 1000 ? 'text-destructive' : 'text-muted-foreground'}>
                            {goalsLength}/1000
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function SocialLinksSection({ register, errors }: Pick<FormSectionProps, 'register' | 'errors'>) {
    return (
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
    );
}
