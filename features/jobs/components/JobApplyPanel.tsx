"use client";

import { useEffect } from 'react';
import { X, Briefcase, Building2, MapPin, DollarSign, Calendar, Users, Clock, Award, Globe } from 'lucide-react';
import type { JobWithPoster } from '../types';

interface JobApplyPanelProps {
    isOpen: boolean;
    onClose: () => void;
    job?: JobWithPoster | null;
}

export function JobApplyPanel({ isOpen, onClose, job }: JobApplyPanelProps) {
    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Format helper functions
    const formatLabel = (str: string | undefined) => {
        if (!str) return '';
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const formatSalary = (job: JobWithPoster) => {
        if (job.minSalary && job.maxSalary) {
            return `${job.salaryCurrency || '₱'}${job.minSalary.toLocaleString()} - ${job.salaryCurrency || '₱'}${job.maxSalary.toLocaleString()}`;
        } else if (job.minSalary) {
            return `From ${job.salaryCurrency || '₱'}${job.minSalary.toLocaleString()}`;
        }
        return 'Salary not specified';
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

    const getTypeColor = (type?: string) => {
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
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slide-in Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[95%] md:w-[85%] lg:w-[60%] xl:w-[45%] 2xl:w-[40%] bg-white shadow-2xl
                           flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen}
            >
                {/* Panel Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Job Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                        aria-label="Close panel"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </button>
                </div>

                {/* Panel Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {!job && (
                        <div className="flex items-center justify-center h-full p-8 animate-in fade-in duration-300">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#11A773] mx-auto mb-4"></div>
                                <p className="text-gray-600 animate-pulse">Loading job details...</p>
                            </div>
                        </div>
                    )}
                    {!job ? (
                        <div className="flex items-center justify-center h-full p-6">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No job selected</h3>
                                <p className="text-gray-600">Click &ldquo;Apply Now&rdquo; on a job listing to view details</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            {/* Job Header */}
                            <div className="mb-6">
                                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                    <div className="p-3 sm:p-4 bg-[#11A773]/10 rounded-xl shrink-0">
                                        <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-[#11A773]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight break-words">{job.title}</h1>
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-4 text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-gray-500" />
                                                    <span className="font-semibold text-base">{job.company}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-5 w-5 text-gray-500" />
                                                    <span className="text-base">{job.location}</span>
                                                </div>
                                            </div>
                                            {job.industry && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Globe className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm">{job.industry}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2" role="list" aria-label="Job attributes">
                                    {job.employmentType && (
                                        <span
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTypeColor(job.employmentType)}`}
                                            role="listitem"
                                        >
                                            {formatLabel(job.employmentType)}
                                        </span>
                                    )}
                                    {job.jobCategory && (
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium" role="listitem">
                                            {formatLabel(job.jobCategory)}
                                        </span>
                                    )}
                                    {job.locationType && (
                                        <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium" role="listitem">
                                            {formatLabel(job.locationType)}
                                        </span>
                                    )}
                                    {job.experienceLevel && (
                                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium" role="listitem">
                                            {formatLabel(job.experienceLevel)} Level
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Salary & Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8" role="group" aria-label="Job statistics">
                                <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl transition-transform duration-200 hover:scale-105">
                                    <div className="flex items-center gap-2 text-gray-700 mb-1 sm:mb-2">
                                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#11A773]" />
                                        <span className="text-xs sm:text-sm font-semibold">Salary Range</span>
                                    </div>
                                    <p className="text-base sm:text-lg font-bold text-gray-900">{formatSalary(job)}</p>
                                    {job.salaryPeriod && (
                                        <p className="text-xs text-gray-600 mt-1">per {job.salaryPeriod}</p>
                                    )}
                                </div>
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl transition-transform duration-200 hover:scale-105">
                                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-semibold">Posted</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{formatDate(job.postedDate)}</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl transition-transform duration-200 hover:scale-105">
                                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <span className="text-sm font-semibold">Views</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{job.views || 0}</p>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[#11A773] rounded-full"></div>
                                    About this position
                                </h2>
                                <div className="prose prose-gray max-w-none">
                                    <div
                                        className="text-gray-700 leading-relaxed text-base whitespace-pre-line"
                                        style={{ lineHeight: '1.75' }}
                                    >
                                        {job.description}
                                    </div>
                                </div>
                            </div>

                            {/* Requirements Section */}
                            {job.requiredSkills && job.requiredSkills.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[#11A773] rounded-full"></div>
                                        Required Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requiredSkills.map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-[#11A773]/10 text-[#11A773] rounded-lg text-sm font-semibold border border-[#11A773]/20 hover:bg-[#11A773]/20 transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education Requirements */}
                            {job.education && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[#11A773] rounded-full"></div>
                                        Education
                                    </h2>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                        <Award className="h-5 w-5 text-[#11A773]" />
                                        <span className="text-gray-900 font-medium">{formatLabel(job.education)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Application Details */}
                            {(job.applicationDeadline || job.howToApply) && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-[#11A773] rounded-full"></div>
                                        Application Information
                                    </h2>
                                    <div className="space-y-3">
                                        {job.applicationDeadline && (
                                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <Clock className="h-5 w-5 text-amber-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Application Deadline</p>
                                                    <p className="text-base font-semibold text-gray-900">
                                                        {new Date(job.applicationDeadline).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {job.howToApply && (
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                <p className="text-sm text-gray-600 mb-2">How to Apply</p>
                                                <p className="text-base text-gray-900 whitespace-pre-line">{job.howToApply}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Company Website */}
                            {job.companyWebsite && (
                                <div className="mb-8">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2">Company Website</p>
                                        <a
                                            href={job.companyWebsite}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#11A773] hover:text-[#0F9563] font-medium flex items-center gap-2 transition-colors"
                                        >
                                            <Globe className="h-4 w-4" />
                                            {job.companyWebsite}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Apply Button - Sticky at bottom */}
                            <div className="sticky bottom-0 bg-white pt-4 sm:pt-6 pb-2 border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 shadow-lg">
                                <button
                                    className="w-full py-3 sm:py-4 bg-[#11A773] text-white rounded-xl font-bold text-base sm:text-lg hover:bg-[#0F9563] active:bg-[#0D7F51] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-manipulation"
                                    aria-label={`Apply for ${job.title} position at ${job.company}`}
                                >
                                    Apply for this position
                                </button>
                                <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                                    By applying, you agree to our terms and conditions
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
