'use client';

import { useEffect, useState } from 'react';
import type { JobWithPoster } from '@/shared/lib/types/index';
import type { JobType } from '@/shared/lib/constants/jobs';
import { JobCard } from './JobCard';
import { JobStats } from './JobStats';
import { JobFilters } from './JobFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/shared/components/ui/pagination';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useJobsList } from '../api';

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
        <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="display-font text-5xl mb-4">Job Opportunities</h1>
                    <p className="text-lg text-muted-foreground">
                        Discover entry-level positions and internships perfect for fresh graduates and first-time
                        jobseekers in Naga City.
                    </p>
                </div>

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

                {/* Jobs List */}
                <div className="mb-6 flex items-center justify-between">
                    <h2>Available Positions ({jobs.length})</h2>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-border p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="h-12 w-12 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-5 w-1/3" />
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/5" />
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                                        <Skeleton className="h-10 w-full lg:w-32" />
                                        <Skeleton className="h-10 w-full lg:w-28" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-border">
                        <p className="text-muted-foreground">No jobs found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && total > pageSize && (
                    <Pagination className="mt-8">
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
                )}
            </div>
        </div>
    );
}
