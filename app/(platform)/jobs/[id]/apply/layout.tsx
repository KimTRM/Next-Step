/**
 * Job Apply Layout
 * Shared layout for the multi-step application flow
 */

import { ApplicationFlowLayout } from "@/features/applications/components/apply-flow";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        id: string;
    }>;
}

export default async function ApplyLayout({ children, params }: LayoutProps) {
    const { id } = await params;

    return (
        <ApplicationFlowLayout jobId={id}>
            {children}
        </ApplicationFlowLayout>
    );
}
