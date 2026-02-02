/**
 * Jobs Page - NextStep Platform
 * 
 * Browse and search job opportunities
 */

import { JobsPageContent } from '@/features/jobs/components';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';

export default function JobsPage() {
    return (
        <AuthProvider>
            <JobsPageContent />
        </AuthProvider>
    );
}
