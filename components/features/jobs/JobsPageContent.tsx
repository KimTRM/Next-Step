'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { JobCard } from '@/components/features/jobs/JobCard';
import { JobStats } from '@/components/features/jobs/JobStats';
import { JobFilters } from '@/components/features/jobs/JobFilters';
import type { JobType } from '@/lib/constants/jobs';

export function JobsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | JobType>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch jobs from Convex
  const allJobs = useQuery(api.jobs.searchJobs, {
    searchTerm,
    type: selectedType === 'all' ? undefined : selectedType,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const loading = allJobs === undefined;
  const jobs = allJobs || [];

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
      </div>
    </div>
  );
}
