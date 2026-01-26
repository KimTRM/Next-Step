/**
 * Mentors Client Wrapper - NextStep Platform
 * 
 * Client component wrapper for interactive mentor features
 */

'use client';

import { useState } from 'react';
import type { MentorWithUser } from '@/lib/types/index';
import { MentorCard } from '@/components/features/mentors/MentorCard';
import { MentorStats } from '@/components/features/mentors/MentorStats';
import { MentorFilters } from '@/components/features/mentors/MentorFilters';
import { ConnectModal } from '@/components/features/mentors/ConnectModal';
import { EmptyMentorState } from '@/components/features/mentors/EmptyMentorState';

interface MentorsClientWrapperProps {
    initialMentors: MentorWithUser[];
}

export function MentorsClientWrapper({ initialMentors }: MentorsClientWrapperProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState('all');
    const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null);

    // Filter mentors based on search and expertise
    const filteredMentors = initialMentors.filter(mentor => {
        const matchesSearch = searchTerm === '' ||
            mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesExpertise = selectedExpertise === 'all' ||
            mentor.expertise.includes(selectedExpertise);

        return matchesSearch && matchesExpertise;
    });

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
                <MentorStats mentors={filteredMentors} />

                {/* Mentors List */}
                <div className="mb-6">
                    <h2>Available Mentors ({filteredMentors.length})</h2>
                </div>

                {filteredMentors.length === 0 ? (
                    <EmptyMentorState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredMentors.map((mentor) => (
                            <MentorCard
                                key={mentor._id}
                                mentor={mentor}
                                onConnect={setSelectedMentor}
                            />
                        ))}
                    </div>
                )}

                {/* Connection Modal */}
                {selectedMentor && (
                    <ConnectModal
                        mentor={selectedMentor}
                        onClose={() => setSelectedMentor(null)}
                    />
                )}
            </div>
        </div>
    );
}
