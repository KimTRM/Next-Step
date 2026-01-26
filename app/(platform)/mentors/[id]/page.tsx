/**
 * Mentor Detail Page - NextStep Platform
 */

'use client';
import { use } from 'react';
import { MentorDetailPageContent } from '@/features/mentors/components';
import type { Id } from '@/convex/_generated/dataModel';

interface MentorDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function MentorDetailPage({ params }: MentorDetailPageProps) {
    const resolvedParams = use(params);
    return <MentorDetailPageContent mentorId={resolvedParams.id as Id<'mentors'>} />;
}
