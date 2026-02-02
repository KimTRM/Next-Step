"use client";

import { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, Users, Calendar, Check } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'temporary';

interface JobCardProps {
    job: {
        _id: Id<'jobs'>;
        title: string;
        company: string;
        location: string;
        employmentType?: JobType;
        jobCategory?: string;
        minSalary?: number;
        maxSalary?: number;
        salaryCurrency?: string;
        salaryPeriod?: string;
        description: string;
        postedDate: number;
        views?: number;
        applicants?: number;
    };
    onOpenPanel?: (jobId: string) => void;
}

export function JobCard({ job, onOpenPanel }: JobCardProps) {
    const [saved, setSaved] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Get current Convex user (has _id which is Id<"users">)
    const currentUser = useQuery(api.users.index.getCurrentUser, {});

    // Real database mutations
    const createApplication = useMutation(api.applications.createApplication);
    const deleteApplication = useMutation(api.applications.deleteApplication);
    const checkUserApplied = useQuery(api.applications.checkUserApplied, {
        jobId: job._id,
        userId: currentUser?._id || ("" as Id<"users">),
    });

    const hasApplied = checkUserApplied ?? false;
    const applicantCount = job.applicants || 0;

    const handleSave = () => {
        setSaved((prev) => {
            const next = !prev;
            toast.success(next ? 'Job saved' : 'Removed from saved');
            return next;
        });
    };

    const handleViewDetails = () => {
        if (onOpenPanel) {
            onOpenPanel(job._id);
        }
    };

    const handleApply = async () => {
        console.log('Apply button clicked', { currentUser, hasApplied, isApplying });

        if (!currentUser) {
            toast.error('Please login to apply for jobs');
            return;
        }

        // Prevent multiple applications
        if (hasApplied) {
            toast.error('You have already applied for this position');
            return;
        }

        // Prevent spam clicking
        if (isApplying) {
            return;
        }

        setIsApplying(true);

        try {
            // Create real application in database
            await createApplication({
                jobId: job._id,
                userId: currentUser._id,
                coverLetter: "Application submitted via job listing",
                resumeUrl: "",
                status: "pending"
            });

            toast.success('Application submitted successfully!');
            console.log('Application submitted successfully');
        } catch (error) {
            console.error('Application error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleUnapply = async () => {
        if (!currentUser) {
            toast.error('Please login to unapply from jobs');
            return;
        }

        if (!hasApplied) {
            toast.error('You have not applied to this position');
            return;
        }

        if (isApplying) {
            return;
        }

        setIsApplying(true);

        try {
            // Delete application from database
            await deleteApplication({
                jobId: job._id,
                userId: currentUser._id,
            });

            toast.success('Application withdrawn successfully!');
            console.log('Application withdrawn successfully');
        } catch (error) {
            console.error('Unapply error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to withdraw application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const getTypeColor = (type?: JobType) => {
        if (!type) return 'bg-gray-100 text-gray-700';
        switch (type) {
            case 'full-time':
                return 'bg-green-100 text-green-700';
            case 'part-time':
                return 'bg-blue-100 text-blue-700';
            case 'internship':
                return 'bg-purple-100 text-purple-700';
            case 'contract':
                return 'bg-orange-100 text-orange-700';
            case 'temporary':
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    const formatSalary = () => {
        if (job.minSalary && job.maxSalary) {
            return `${job.salaryCurrency || '₱'}${job.minSalary.toLocaleString()} - ${job.salaryCurrency || '₱'}${job.maxSalary.toLocaleString()}`;
        } else if (job.minSalary) {
            return `From ${job.salaryCurrency || '₱'}${job.minSalary.toLocaleString()}`;
        }
        return 'Salary not specified';
    };

    const formatLabel = (str: string | undefined) => {
        if (!str) return '';
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:border-[#11A773]/30">
            {/* Job Header */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-3 bg-green-50 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Briefcase className="h-6 w-6 text-[#11A773]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Description */}
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                {job.description.substring(0, 200)}...
            </p>

            {/* Salary Range */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4 text-sm sm:text-base text-gray-700">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{formatSalary()}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.employmentType)}`}>
                    {formatLabel(job.employmentType)}
                </span>
                {job.jobCategory && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {formatLabel(job.jobCategory)}
                    </span>
                )}
            </div>

            {/* Bottom Info Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {formatDate(job.postedDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{applicantCount} applicants</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3">
                {hasApplied ? (
                    <button
                        onClick={handleUnapply}
                        disabled={isApplying}
                        className={`flex-1 min-h-[44px] rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation ${isApplying
                            ? 'bg-gray-300 text-gray-600 cursor-wait'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        {isApplying ? (
                            'Withdrawing...'
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                Applied - Click to Unapply
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 min-h-[44px] rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base bg-[#11A773] text-white hover:bg-[#0F9563] hover:scale-105 active:scale-95 touch-manipulation shadow-sm hover:shadow-md"
                    >
                        Apply Now
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSave}
                    aria-pressed={saved}
                    className={`flex-1 min-h-[44px] rounded-xl transition-all duration-200 font-semibold border text-sm sm:text-base touch-manipulation hover:scale-105 active:scale-95 ${saved
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
                        }`}
                >
                    {saved ? 'Saved' : 'Save For Later'}
                </button>
            </div>
        </div>
    );
}
