"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, MapPin, DollarSign, Eye, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

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
        views: number;
    };
}

export function JobCard({ job }: JobCardProps) {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved((prev) => {
            const next = !prev;
            toast.success(next ? 'Job saved' : 'Removed from saved');
            return next;
        });
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
            return `${job.salaryCurrency || '$'}${job.minSalary.toLocaleString()} - ${job.salaryCurrency || '$'}${job.maxSalary.toLocaleString()}`;
        } else if (job.minSalary) {
            return `From ${job.salaryCurrency || '$'}${job.minSalary.toLocaleString()}`;
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
        <div className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-4 sm:p-6">
            <div className="flex flex-col gap-4">
                {/* Job Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{job.company}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{formatSalary()}</span>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3">{job.description.substring(0, 150)}...</p>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs ${getTypeColor(job.employmentType)}`}>
                                    {formatLabel(job.employmentType)}
                                </span>
                                {job.jobCategory && (
                                    <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                        {formatLabel(job.jobCategory)}
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground">Posted {formatDate(job.postedDate)}</span>
                                <span className="text-xs text-muted-foreground">{job.views} views</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Link 
                        href={`/jobs/${job._id}`} 
                        className="flex-1 px-4 py-3 sm:px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">View Details</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleSave}
                        aria-pressed={saved}
                        className={`px-4 py-3 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 min-h-[44px] ${saved ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {saved ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                        <span className="text-sm font-medium">{saved ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
