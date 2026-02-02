'use client';

import { Id } from '@/convex/_generated/dataModel';
import { useEffect, useState } from 'react';
import { JobDetailPageContent } from '@/features/jobs/components';

interface JobDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    // Resolve params promise
    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) {
        return null;
    }

    return <JobDetailPageContent jobId={resolvedParams.id as Id<'jobs'>} />;
}
