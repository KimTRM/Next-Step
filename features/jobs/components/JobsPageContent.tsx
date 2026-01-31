'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { Briefcase } from 'lucide-react';
import type { JobWithPoster } from '@/shared/lib/types/index';
import type { JobType } from '@/shared/lib/constants/jobs';
import { JobCard } from './JobCard';
import { JobStats } from './JobStats';
import { JobFilters } from './JobFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/shared/components/ui/pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useJobsList } from '../api';
import { LoadingBoundary } from '@/shared/components/loading/LoadingBoundary';

export function JobsPageContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | JobType>('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const pageSize = 12;

    // Debounce search term
    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    // Fetch jobs via feature API
    const jobsData = useJobsList({
        searchTerm: debouncedSearchTerm.trim() || undefined,
        employmentType: selectedType !== 'all' ? selectedType : undefined,
        jobCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
        limit: pageSize,
    });

    const jobs = (jobsData as JobWithPoster[] | undefined) || [];
    const loading = jobsData === undefined;
    const total = jobs.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-50">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Search and Filters */}
                <JobFilters
                    searchTerm={searchTerm}
                    selectedType={selectedType}
                    selectedCategory={selectedCategory}
                    onSearchChange={setSearchTerm}
                    onTypeChange={setSelectedType}
                    onCategoryChange={setSelectedCategory}
                />

                {/* Stats */}
                <JobStats jobs={jobs} />

                {/* Jobs List - Two Column Grid */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Positions ({jobs.length})</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="flex-1 space-y-3">
                                            <Skeleton className="h-6 w-3/4" />
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Skeleton className="h-4 w-28" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-20 rounded-full" />
                                                <Skeleton className="h-6 w-24 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Skeleton className="h-11 flex-1 rounded-xl" />
                                        <Skeleton className="h-11 flex-1 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria or browse all available positions.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && total > pageSize && (
                    <div className="mt-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                                        aria-disabled={page === 1}
                                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const maxPage = Math.ceil(total / pageSize) || 1;
                                            setPage((p) => Math.min(maxPage, p + 1));
                                        }}
                                        aria-disabled={page * pageSize >= total}
                                        className={page * pageSize >= total ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
}

function JobsPageContentWrapper() {
    return (
        <LoadingBoundary type="jobs">
            <JobsPageContent />
        </LoadingBoundary>
    );
}

export default JobsPageContentWrapper;
