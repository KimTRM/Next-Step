/**
 * ============================================================================
 * FRONTEND - Dashboard Page
 * ============================================================================
 * 
 * Thin page wrapper that composes the Dashboard feature
 */

import { DashboardPageContent } from '@/features/dashboard/components';

export default function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
    return <DashboardPageContent searchParams={searchParams} />;
}
