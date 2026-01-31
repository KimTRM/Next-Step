"use client";

import { useState } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, Users, Calendar } from 'lucide-react';
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
        views?: number;
        applicants?: number;
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

    const handleApply = () => {
        toast.success('Application submitted successfully!');
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

    const applicantCount = job.applicants || Math.floor(Math.random() * 50) + 5;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Job Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-xl flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
            <p className="text-gray-600 mb-4 line-clamp-3">
                {job.description.substring(0, 200)}...
            </p>

            {/* Salary Range */}
            <div className="flex items-center gap-2 mb-4 text-gray-700">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{formatSalary()}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
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
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
            <div className="flex gap-3">
                <button
                    onClick={handleApply}
                    className="flex-1 h-11 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                >
                    Apply Now
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    aria-pressed={saved}
                    className={`flex-1 h-11 rounded-xl transition-colors font-semibold border ${
                        saved 
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
