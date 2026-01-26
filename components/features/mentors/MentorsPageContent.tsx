'use client';

import { useEffect, useState } from 'react';
import type { MentorWithUser } from '@/lib/types/index';
import { MentorCard } from '@/components/features/mentors/MentorCard';
import { MentorStats } from '@/components/features/mentors/MentorStats';
import { MentorFilters } from '@/components/features/mentors/MentorFilters';
import { ConnectModal } from '@/components/features/mentors/ConnectModal';
import { EmptyMentorState } from '@/components/features/mentors/EmptyMentorState';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function MentorsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null);
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

  // Fetch mentors directly from Convex
  const mentorsData = useQuery(api.functions.mentors.searchMentors, {
    searchTerm: debouncedSearchTerm.trim() || '',
    expertise: selectedExpertise !== 'all' ? selectedExpertise : undefined,
  });

  const mentors = (mentorsData as MentorWithUser[] | undefined) || [];
  const loading = mentorsData === undefined;
  const total = mentors.length;

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="display-font text-5xl mb-4">Find a Mentor</h1>
          <p className="text-lg text-muted-foreground">
            Connect with experienced professionals who can guide you through your career journey.
          </p>
        </div>

        {/* Search and Filter */}
        <MentorFilters
          searchTerm={searchTerm}
          selectedExpertise={selectedExpertise}
          onSearchChange={setSearchTerm}
          onExpertiseChange={setSelectedExpertise}
        />

        {/* Stats */}
        <MentorStats mentors={mentors} />

        {/* Mentors List */}
        <div className="mb-6">
          <h2>Available Mentors ({mentors.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <EmptyMentorState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id}
                mentor={mentor as MentorWithUser}
                onConnect={setSelectedMentor}
              />
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

        {/* Connection Modal */}
        {selectedMentor && (
          <ConnectModal
            mentor={selectedMentor as MentorWithUser}
            onClose={() => setSelectedMentor(null)}
          />
        )}
      </div>
    </div>
  );
}
