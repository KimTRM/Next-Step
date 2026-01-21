'use client';

import { useEffect, useState } from 'react';
import type { Id } from '@/convex/_generated/dataModel';
import { MentorCard } from '@/components/features/mentors/MentorCard';
import { MentorStats } from '@/components/features/mentors/MentorStats';
import { MentorFilters } from '@/components/features/mentors/MentorFilters';
import { ConnectModal } from '@/components/features/mentors/ConnectModal';
import { EmptyMentorState } from '@/components/features/mentors/EmptyMentorState';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';

// Extended Mentor type from Convex queries (enriched with user data)
type MentorWithUser = {
  _id: Id<'mentors'>;
  _creationTime: number;
  userId: Id<'users'>;
  role: string;
  company: string;
  location: string;
  expertise: string[];
  yearsOfExperience?: number;
  rating: number;
  mentees: number;
  bio: string;
  tagline?: string;
  availability: string;
  isVerified: boolean;
  hourlyRate?: number;
  currency?: string;
  offersFreeSession?: boolean;
  totalReviews?: number;
  sessionsCompleted?: number;
  specializations?: string[];
  isAvailableForNewMentees?: boolean;
  // Enriched user data from queries
  name: string;
  email?: string;
  avatarUrl?: string;
};

export function MentorsPageContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null);
  const [mentors, setMentors] = useState<MentorWithUser[]>([]);
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

  // Fetch mentors via API with query and expertise filters
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (debouncedSearchTerm.trim()) params.set('query', debouncedSearchTerm.trim());
    if (selectedExpertise !== 'all') params.set('expertise', selectedExpertise);
    params.set('page', String(page));
    params.set('limit', String(pageSize));
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/mentors?${params.toString()}`, { signal: controller.signal });
        const json = await res.json();
        if (res.ok && json.success) {
          setMentors((json.data || []) as MentorWithUser[]);
          setTotal(typeof json.meta?.total === 'number' ? json.meta.total : (json.data || []).length);
        } else {
          setMentors([]);
          setTotal(0);
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error('Failed to load mentors:', e);
        }
        setMentors([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [debouncedSearchTerm, selectedExpertise, page]);

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
