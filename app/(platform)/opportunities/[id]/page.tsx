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
    User,
    CheckCircle,
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
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

    const opportunityId = resolvedParams.id as Id<'opportunities'>;
    const opportunity = useQuery(api.opportunities.getOpportunityById, { id: opportunityId });
    const createApplication = useMutation(api.applications.createApplication);
    const userApplications = useQuery(api.applications.getUserApplications);

    // Check if user already applied
    const hasApplied = userApplications?.some(
        (app) => app.opportunityId === opportunityId
    );

    const handleApply = async () => {
        if (!coverLetter.trim()) {
            toast.error('Please write a cover letter');
            return;
        }

        setIsApplying(true);
        try {
            await createApplication({
                opportunityId,
                coverLetter,
            });
            toast.success('Application submitted successfully!');
            setCoverLetter('');
            router.push('/applications');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
            setIsApplying(false);
        }
    };

    if (opportunity === undefined) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-600">Loading opportunity...</p>
                </div>
            </div>
        );
    }

    if (opportunity === null) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64 flex-col gap-4">
                    <p className="text-lg text-gray-600">Opportunity not found</p>
                    <Button onClick={() => router.push('/opportunities')}>
                        Back to Opportunities
                    </Button>
                </div>
            </div>
        );
    }

    const daysLeft = opportunity.deadline
        ? Math.ceil((opportunity.deadline - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
    const typeColor =
        opportunity.type === 'job'
            ? 'blue'
            : opportunity.type === 'internship'
                ? 'green'
                : 'purple';

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.push('/opportunities')}
                className="mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Opportunities
            </Button>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Opportunity Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={
                                                typeColor === 'blue'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                    : typeColor === 'green'
                                                        ? 'bg-green-100 text-green-800 border-green-200'
                                                        : 'bg-purple-100 text-purple-800 border-purple-200'
                                            }
                                        >
                                            {opportunity.type.toUpperCase()}
                                        </Badge>
                                        {daysLeft !== null && daysLeft > 0 && (
                                            <Badge variant="secondary">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {daysLeft} days left
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-3xl">{opportunity.title}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Meta Information */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                {opportunity.company && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        <span>{opportunity.company}</span>
                                    </div>
                                )}
                                {opportunity.mentor && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{opportunity.mentor}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {opportunity.location}
                                        {opportunity.isRemote && ' (Remote)'}
                                    </span>
                                </div>
                                {opportunity.salary && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{opportunity.salary}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="pt-4 border-t">
                                <h3 className="text-lg font-semibold mb-3">Description</h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {opportunity.description}
                                </p>
                            </div>

                            {/* Required Skills */}
                            {opportunity.skills && opportunity.skills.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.skills.map((skill) => (
                                            <Badge key={skill} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Posted Date */}
                            <div className="pt-4 border-t text-sm text-gray-500">
                                Posted on {new Date(opportunity.postedDate).toLocaleDateString('en-US', {
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
                                {hasApplied ? 'Application Submitted' : 'Apply Now'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {hasApplied ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">
                                        You have already applied to this opportunity
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
                                        <label
                                            htmlFor="coverLetter"
                                            className="text-sm font-medium"
                                        >
                                            Cover Letter
                                        </label>
                                        <Textarea
                                            id="coverLetter"
                                            placeholder="Tell us why you're a great fit for this opportunity..."
                                            value={coverLetter}
                                            onChange={(e) => setCoverLetter(e.target.value)}
                                            rows={8}
                                            className="resize-none"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Explain your interest and relevant experience
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleApply}
                                        disabled={isApplying || !coverLetter.trim()}
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
