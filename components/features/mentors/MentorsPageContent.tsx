'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { MentorCard } from '@/components/features/mentors/MentorCard';
import { MentorStats } from '@/components/features/mentors/MentorStats';
import { MentorFilters } from '@/components/features/mentors/MentorFilters';
import { ConnectModal } from '@/components/features/mentors/ConnectModal';
import { EmptyMentorState } from '@/components/features/mentors/EmptyMentorState';

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
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null);

  // Fetch mentors from Convex
  const allMentors = useQuery(api.mentors.searchMentors, {
    searchTerm,
    expertise: selectedExpertise === 'all' ? undefined : selectedExpertise,
  });

  const loading = allMentors === undefined;
  const mentors = allMentors || [];

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
