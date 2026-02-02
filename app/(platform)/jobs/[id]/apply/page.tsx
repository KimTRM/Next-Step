/**
 * Job Apply Page
 * Route: /jobs/[id]/apply
 * 
 * Server component that renders the job application flow
 */

import { JobApplyPageContent } from "@/features/applications/components/JobApplyPageContent";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function JobApplyPage({ params }: PageProps) {
    const { id } = await params;

    return <JobApplyPageContent jobId={id} />;
}
