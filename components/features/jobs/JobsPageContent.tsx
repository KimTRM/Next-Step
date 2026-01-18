'use client';

import { useEffect, useState } from 'react';
import { JobCard } from '@/components/features/jobs/JobCard';
import { JobStats } from '@/components/features/jobs/JobStats';
import { JobFilters } from '@/components/features/jobs/JobFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import type { JobType } from '@/lib/constants/jobs';
import type { Id } from '@/convex/_generated/dataModel';

type JobWithPoster = {
  _id: Id<'jobs'>;
  _creationTime: number;
  title: string;
  company: string;
  location: string;
  employmentType: JobType;
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
  poster?: {
    _id: Id<'users'>;
    name: string;
    role: string;
    avatarUrl?: string;
  } | null;
};

export function JobsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | JobType>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobs, setJobs] = useState<JobWithPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [total, setTotal] = useState(0);

  // Debounce search term
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Fetch jobs via API with filters
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (debouncedSearchTerm.trim()) params.set('query', debouncedSearchTerm.trim());
    if (selectedType !== 'all') params.set('employmentType', selectedType);
    if (selectedCategory !== 'all') params.set('jobCategory', selectedCategory);
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/jobs?${params.toString()}`, { signal: controller.signal });
        const json = await res.json();
        if (res.ok && json.success) {
          setJobs((json.data || []) as JobWithPoster[]);
          setTotal(typeof json.meta?.total === 'number' ? json.meta.total : (json.data || []).length);
        } else {
          setJobs([]);
          setTotal(0);
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Failed to load jobs:', e);
        }
        setJobs([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [debouncedSearchTerm, selectedType, selectedCategory, page]);

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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
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
