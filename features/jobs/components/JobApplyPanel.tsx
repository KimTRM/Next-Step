"use client";

import { useEffect, useState } from 'react';
import { X, MapPin, Clock, Users, Bookmark, Globe, Calendar, Briefcase, Building2, DollarSign, CheckCircle, User, ArrowLeft, Eye, FileText, Award, TrendingUp } from 'lucide-react';
import type { JobWithPoster } from '../types';

interface JobApplyPanelProps {
    isOpen: boolean;
    onClose: () => void;
    job?: JobWithPoster | null;
}

export function JobApplyPanel({ isOpen, onClose, job }: JobApplyPanelProps) {
    const [isSaved, setIsSaved] = useState(false);
    
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

    // Handle save job
    const handleSaveJob = () => {
        setIsSaved(!isSaved);
    };

    // Prevent body scroll when panel is open
    useEffect(() => {
        let originalScrollY = 0;
        
        if (isOpen) {
            // Save current scroll position
            originalScrollY = window.scrollY;
            
            // Store scroll position in a data attribute
            document.body.dataset.scrollY = originalScrollY.toString();
            
            // Prevent body scroll
            document.body.style.position = 'fixed';
            document.body.style.top = `-${originalScrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll
            const savedScrollY = document.body.dataset.scrollY;
            
            // First restore body styles
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            
            // Then restore scroll position
            if (savedScrollY) {
                const scrollValue = parseInt(savedScrollY, 10);
                requestAnimationFrame(() => {
                    window.scrollTo(0, scrollValue);
                });
            }
            
            // Clean up data attribute
            delete document.body.dataset.scrollY;
        }

        return () => {
            // Cleanup on unmount
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            delete document.body.dataset.scrollY;
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
                className={`fixed inset-0 bg-black/20 transition-all duration-500 ease-in-out z-40 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
                aria-hidden="true"
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
            />

            {/* Slide-in Panel */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[95%] md:w-[85%] lg:w-[60%] xl:w-[45%] 2xl:w-[40%] bg-white
                           flex flex-col transition-all duration-500 ease-in-out ${
                               isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isOpen}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Panel Content - Scrollable */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
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
                        <div className="space-y-0">
                            {/* Header Section with Cover Banner */}
                            <div className="relative">
                                {/* Cover Banner with enhanced design */}
                                <div className="h-52 bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-800 relative overflow-hidden">
                                    {/* Animated geometric pattern overlay */}
                                    <div className="absolute inset-0">
                                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                                        <div className="absolute top-16 right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-75"></div>
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-150"></div>
                                        <div className="absolute bottom-12 left-16 w-36 h-36 bg-white/5 rounded-full blur-2xl animate-pulse delay-300"></div>
                                    </div>
                                    {/* Subtle grid pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="h-full w-full" style={{
                                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                            backgroundSize: '25px 25px'
                                        }}></div>
                                    </div>
                                    {/* Gradient overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                </div>
                                
                                {/* Company Avatar - Overlapping */}
                                <div className="absolute -bottom-12 left-6">
                                    <div className="w-28 h-28 rounded-full border-4 border-white flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                                        {job.companyLogo ? (
                                            <img src={job.companyLogo} alt={job.company} className="w-24 h-24 rounded-full object-cover" />
                                        ) : (
                                            <User className="h-14 w-14 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Job Title and Status */}
                            <div className="px-6 pt-16 pb-6 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                    <div className="flex items-center gap-1 px-2 py-1 text-green-700 rounded-full text-sm font-medium">
                                        Verified
                                    </div>
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-1">{job.company}</p>
                                <p className="text-gray-600 text-sm mb-4">
                                    Join our team and make an impact in this exciting role.
                                </p>

                                {/* Meta Information */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{formatDate(job.postedDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>{job.views || 0} views</span>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="px-6 py-6 bg-white border-t border-gray-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Location</p>
                                        <p className="text-sm font-semibold text-gray-900">{job.location}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Posted</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatDate(job.postedDate)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Views</p>
                                        <p className="text-sm font-semibold text-gray-900">{job.views || 0}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Type</p>
                                        <p className="text-sm font-semibold text-gray-900">{formatLabel(job.employmentType) || 'Full-time'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Information Sections */}
                            <div className="px-6 py-6 space-y-6">
                                {/* Top Section - Languages with Expertise and Specialization on right */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Languages - Left side */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">English</span>
                                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">Filipino</span>
                                        </div>
                                    </div>

                                    {/* Right side container */}
                                    <div className="lg:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Expertise - Left */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Expertise</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
                                                        {formatLabel(job.employmentType) || 'Full Time'}
                                                    </span>
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
                                                        {formatLabel(job.locationType) || 'Hybrid'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Specialization - Right */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Specialization</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">
                                                        {job.jobCategory || 'Technology'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Stats */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Performance Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-2xl font-bold text-gray-900 mb-1">1</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Applicants</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-2xl font-bold text-gray-900 mb-1">{job.views || 23}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Views / Days</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Job Description</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                            {job.description || 'Looking for fresh graduates with strong programming fundamentals and eagerness to learn.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Required Skills */}
                                {job.requiredSkills && job.requiredSkills.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Required Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requiredSkills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm border border-green-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Footer */}
                            <div className="border-t border-gray-200 px-6 py-6 bg-white">
                                <div className="flex gap-4">
                                    <button
                                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                    >

                                        Quick Apply
                                    </button>
                                    <button
                                        onClick={handleSaveJob}
                                        className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center gap-3 ${
                                            isSaved
                                                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-2 border-green-300'
                                                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
