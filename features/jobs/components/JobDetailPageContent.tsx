'use client';

import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    MapPin,
    DollarSign,
    Building2,
    Users,
    CheckCircle,
    ArrowLeft,
    Bookmark,
    Share2,
    Calendar,
    GraduationCap,
    Briefcase,
    Globe,
    Tag,
    FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { useJobById, useRelatedJobs } from '../api';
import { useCreateApplication } from '@/features/applications/api';
import { JobApplicationModal } from '@/features/applications/components/apply-flow';
import type { ApplicationFormData, ApplicationJob } from '@/features/applications';
import type { Job } from '../types';

type JobDTO = {
    _id: Id<'jobs'>;
    _creationTime: number;
    title: string;
    company: string;
    location: string;
    employmentType: string;
    locationType: string;
    jobCategory: string;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: string;
    description: string;
    requiredSkills: string[];
    experienceLevel: string;
    education?: string;
    postedBy: Id<'users'>;
    postedDate: number;
    expiresDate?: number;
    views: number;
    industry?: string;
    tags?: string[];
    isActive: boolean;
    companyWebsite?: string;
    companyLogo?: string;
    applicationDeadline?: number;
    applicationUrl?: string;
    howToApply?: string;
    poster?: {
        _id: Id<'users'>;
        name: string;
        role: string;
        avatarUrl?: string;
    } | null;
};

interface JobDetailPageContentProps {
    jobId: Id<'jobs'>;
}

export function JobDetailPageContent({ jobId }: JobDetailPageContentProps) {
    const [notes, setNotes] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const router = useRouter();

    // Fetch job and related jobs using feature API
    const job = useJobById(jobId);
    const relatedJobs = useRelatedJobs(jobId, 4);
    const createApplication = useCreateApplication();

    // Fetch current user for the multi-step modal
    const currentUser = useQuery(api.users.index.getCurrentUser, {});

    const handleApply = async () => {
        if (!job) return;

        setIsApplying(true);
        try {
            await createApplication({
                jobId: job._id,
                notes: notes || undefined,
            });

            toast.success('Application submitted successfully!');
            setNotes('');
            setHasApplied(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';

            if (errorMessage.includes('already applied')) {
                toast.error('You have already applied to this job');
                setHasApplied(true);
            } else if (errorMessage.includes('authenticated') || errorMessage.includes('logged in')) {
                toast.error('You must be logged in to apply');
                router.push('/sign-in');
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsApplying(false);
        }
    };

    // Handle enhanced application flow submission
    const handleEnhancedApply = async (data: ApplicationFormData, jobData: ApplicationJob) => {
        try {
            await createApplication({
                jobId: jobData._id as Id<"jobs">,
                notes: data.questions.additionalNotes,
            });
            toast.success('Application submitted successfully!');
            setHasApplied(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
            toast.error(errorMessage);
            throw error;
        }
    };

    // Open enhanced application modal
    const handleOpenEnhancedModal = () => {
        if (!currentUser) {
            toast.error('Please sign in to apply');
            router.push('/sign-in');
            return;
        }
        setShowApplicationModal(true);
    };

    const handleSave = () => {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully!');
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Job URL copied to clipboard!');
        } catch {
            toast.error('Failed to copy URL');
        }
    };

    // Show loading state while data is loading
    if (job === undefined) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Skeleton className="h-10 w-64 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (job === null) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64 flex-col gap-4">
                    <p className="text-lg text-gray-600">Job not found</p>
                    <Button onClick={() => router.push('/jobs')}>Back to Jobs</Button>
                </div>
            </div>
        );
    }

    const typeColors: Record<string, string> = {
        'full-time': 'bg-blue-100 text-blue-800 border-blue-200',
        'part-time': 'bg-green-100 text-green-800 border-green-200',
        internship: 'bg-purple-100 text-purple-800 border-purple-200',
        contract: 'bg-orange-100 text-orange-800 border-orange-200',
        temporary: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4 overflow-x-auto">
                <button onClick={() => router.push('/')} className="hover:text-primary whitespace-nowrap">
                    Home
                </button>
                <span className="whitespace-nowrap">/</span>
                <button onClick={() => router.push('/jobs')} className="hover:text-primary whitespace-nowrap">
                    Jobs
                </button>
                <span className="whitespace-nowrap">/</span>
                <span className="text-gray-900 font-medium truncate">
                    {job.title}
                </span>
            </nav>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <Button variant="ghost" onClick={() => router.push('/jobs')} className="justify-start">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Jobs
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className={isSaved ? 'bg-primary/10 text-primary' : ''}
                    >
                        <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Job'}</span>
                        <span className="sm:hidden">{isSaved ? 'Saved' : 'Save'}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Share</span>
                        <span className="sm:hidden">Share</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Job Details */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={job.employmentType ? typeColors[job.employmentType] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800'}
                                    >
                                        {job.employmentType?.toUpperCase().replace('-', ' ') || 'NOT SPECIFIED'}
                                    </Badge>
                                    <Badge variant="secondary">{job.jobCategory || 'General'}</Badge>
                                </div>
                                <CardTitle className="text-2xl sm:text-3xl leading-tight">{job.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Meta Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{job.location} ({job.locationType || 'on-site'})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">
                                        {job.minSalary && job.maxSalary
                                            ? `${job.salaryCurrency || '$'}${job.minSalary.toLocaleString()} - ${job.salaryCurrency || '$'}${job.maxSalary.toLocaleString()}/${job.salaryPeriod || 'year'}`
                                            : job.minSalary
                                                ? `From ${job.salaryCurrency || '$'}${job.minSalary.toLocaleString()}/${job.salaryPeriod || 'year'}`
                                                : 'Salary not specified'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span>{job.views || 0} views</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {job.description}
                                </p>
                            </div>

                            {/* Required Skills */}
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requiredSkills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Requirements */}
                            <div className="pt-4 border-t space-y-3">
                                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                                {job.experienceLevel && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Briefcase className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">Experience Level:</span>
                                        <Badge variant="outline">
                                            {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                                        </Badge>
                                    </div>
                                )}
                                {job.education && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <GraduationCap className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">Education:</span>
                                        <span className="capitalize">
                                            {job.education.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Company Information */}
                            {(job.companyWebsite || job.industry) && (
                                <div className="pt-4 border-t space-y-3">
                                    <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                                    {job.companyWebsite && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Globe className="h-5 w-5 text-gray-500" />
                                            <a
                                                href={job.companyWebsite}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {job.companyWebsite}
                                            </a>
                                        </div>
                                    )}
                                    {job.industry && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Building2 className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium">Industry:</span>
                                            <span>{job.industry}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {job.tags && job.tags.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Application Deadline */}
                            {job.applicationDeadline && (
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="h-5 w-5 text-gray-500" />
                                        <span className="font-medium">Application Deadline:</span>
                                        <span>
                                            {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Posted Date */}
                            <div className="pt-4 border-t text-sm text-gray-500">
                                Posted on {new Date(job.postedDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Application */}
                <div className="xl:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Apply for this Job
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasApplied ? (
                                <div className="text-center py-6 sm:py-8">
                                    <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                                        You have already applied to this job
                                    </p>
                                    <Button
                                        onClick={() => router.push('/applications')}
                                        className="w-full"
                                    >
                                        View My Applications
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Enhanced Multi-Step Application */}
                                    <Button
                                        onClick={handleOpenEnhancedModal}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Apply Now
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Complete your application with resume, cover letter, and profile
                                    </p>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">
                                                or quick apply
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="notes" className="text-sm font-medium">
                                            Application Notes (Optional)
                                        </label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Add any additional notes or information..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            className="resize-none text-base"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Include any relevant details or questions
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push(`/jobs/${jobId}/apply`)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Quick Apply
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Related Jobs Section */}
            {relatedJobs && Array.isArray(relatedJobs) && relatedJobs.length > 0 && (
                <div className="mt-8 sm:mt-12">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Related Jobs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedJobs.map((relatedJob) => (
                            <Card
                                key={relatedJob._id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.push(`/jobs/${relatedJob._id}`)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base sm:text-lg leading-tight">{relatedJob.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">{relatedJob.company}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{relatedJob.location}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <Badge variant="secondary" className="text-xs">
                                                {relatedJob.employmentType}
                                            </Badge>
                                            {relatedJob.requiredSkills && relatedJob.requiredSkills.slice(0, 2).map((skill, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Profile Completeness Dialog */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Your Profile</DialogTitle>
                        <DialogDescription>
                            Please complete your profile before applying to jobs. Employers want to see:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium">Skills</p>
                                <p className="text-sm text-gray-600">Add your technical and professional skills</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium">Bio</p>
                                <p className="text-sm text-gray-600">Write a brief introduction about yourself</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium">Education</p>
                                <p className="text-sm text-gray-600">Add your education level</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => router.push('/profile')}>
                            Complete Profile
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Enhanced Multi-Step Application Modal */}
            {job && currentUser && (
                <JobApplicationModal
                    isOpen={showApplicationModal}
                    onClose={() => setShowApplicationModal(false)}
                    job={{
                        _id: job._id,
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        description: job.description,
                        employmentType: job.employmentType,
                        locationType: job.locationType,
                        minSalary: job.minSalary,
                        maxSalary: job.maxSalary,
                        salaryCurrency: job.salaryCurrency,
                        salaryPeriod: job.salaryPeriod,
                        requiredSkills: job.requiredSkills,
                        experienceLevel: job.experienceLevel,
                        postedDate: job.postedDate,
                    }}
                    applicant={{
                        _id: currentUser._id,
                        name: currentUser.name || "User",
                        email: currentUser.email || "",
                        avatarUrl: currentUser.avatarUrl,
                        location: currentUser.location,
                        experience: currentUser.experience,
                        education: currentUser.education,
                        skills: currentUser.skills,
                    }}
                    onSubmitAction={handleEnhancedApply}
                    onViewDescription={() => {
                        // Already on the job detail page
                        setShowApplicationModal(false);
                    }}
                    onEditProfile={() => {
                        window.open('/profile', '_blank');
                    }}
                />
            )}
        </div>
    );
}
