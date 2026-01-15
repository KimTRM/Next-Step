'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Building2,
    Users,
    CheckCircle,
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface JobDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [notes, setNotes] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const router = useRouter();

    // Resolve params promise
    if (!resolvedParams) {
        params.then(setResolvedParams);
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const jobId = resolvedParams.id as Id<'jobs'>;
    const job = useQuery(api.jobs.getJobById, { jobId });
    const createJobApplication = useMutation(api.jobApplications.createJobApplication);
    const userJobApplications = useQuery(api.jobApplications.getUserJobApplications);

    // Check if user already applied
    const hasApplied = userJobApplications?.some((app) => app.jobId === jobId);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            await createJobApplication({
                jobId,
                notes: notes.trim() || undefined,
            });
            toast.success('Application submitted successfully!');
            setNotes('');
            router.push('/applications');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
            setIsApplying(false);
        }
    };

    if (job === undefined) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-600">Loading job details...</p>
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

    const typeColors = {
        'full-time': 'bg-blue-100 text-blue-800 border-blue-200',
        'part-time': 'bg-green-100 text-green-800 border-green-200',
        internship: 'bg-purple-100 text-purple-800 border-purple-200',
        contract: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.push('/jobs')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
            </Button>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Job Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={typeColors[job.type]}
                                        >
                                            {job.type.toUpperCase().replace('-', ' ')}
                                        </Badge>
                                        <Badge variant="secondary">{job.category}</Badge>
                                    </div>
                                    <CardTitle className="text-3xl">{job.title}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Meta Information */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    <span>{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {job.applicants}{' '}
                                        {job.applicants === 1 ? 'applicant' : 'applicants'}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {job.description}
                                </p>
                            </div>

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
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>
                                {hasApplied ? 'Application Submitted' : 'Apply for this Job'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasApplied ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
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
                                    <div className="space-y-2">
                                        <label htmlFor="notes" className="text-sm font-medium">
                                            Application Notes (Optional)
                                        </label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Add any additional notes or information..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={6}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Include any relevant details or questions
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleApply}
                                        disabled={isApplying}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isApplying ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
