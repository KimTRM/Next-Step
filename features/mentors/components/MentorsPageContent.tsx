'use client';

import { useEffect, useState } from 'react';
import type { MentorWithUser } from '@/shared/lib/types/index';
import { MentorCard, MentorStats, MentorFilters, ConnectModal, EmptyMentorState } from '@/features/mentors/components';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/shared/components/ui/pagination';
import { useSearchMentors } from '@/features/mentors/api';

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

    // Fetch mentors via feature API
    const mentorsData = useSearchMentors(
        debouncedSearchTerm.trim() || '',
        selectedExpertise !== 'all' ? selectedExpertise : undefined
    );

    const mentors = (mentorsData as MentorWithUser[] | undefined) || [];
    const loading = mentorsData === undefined;
    const total = mentors.length;

    return (
        <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">Find a Mentor</h1>
                    <p className="text-base sm:text-lg text-muted-foreground">
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
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold">Available Mentors ({mentors.length})</h2>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading mentors...</p>
                    </div>
                ) : mentors.length === 0 ? (
                    <EmptyMentorState />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    <div className="mt-6 sm:mt-8">
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
