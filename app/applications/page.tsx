/**
 * ============================================================================
 * FRONTEND - Applications Page
 * ============================================================================
 * 
 * View all user's job/internship/mentorship applications.
 * 
 * ARCHITECTURE:
 * - This is a server component that fetches data on the server side
 * - Imports mock data from /server/data for now
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace direct data imports with API calls
 * 2. Add filtering and sorting UI
 * 3. Implement pagination for large application lists
 * 4. Add application status updates
 * 5. Add ability to withdraw applications
 */

import Link from 'next/link';
// BACKEND DATA: These imports pull from server-side mock data
import { applications } from '@/server/data/applications';
import { opportunities } from '@/server/data/opportunities';
import { users } from '@/server/data/users';
// FRONTEND COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// SHARED UTILITIES
import { formatDate, getStatusColor } from '@/lib/utils';

export default function ApplicationsPage() {
    // Mock current user (student with ID 1)
    const currentUserId = '1';
    const currentUser = users.find(u => u.id === currentUserId);

    // Get user's applications with full opportunity details
    const userApplications = applications
        .filter(app => app.userId === currentUserId)
        .map(app => ({
            ...app,
            opportunity: opportunities.find(o => o.id === app.opportunityId),
        }))
        .sort((a, b) =>
            new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );

    const pendingCount = userApplications.filter(a => a.status === 'pending').length;
    const acceptedCount = userApplications.filter(a => a.status === 'accepted').length;
    const rejectedCount = userApplications.filter(a => a.status === 'rejected').length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 mt-2">
                    Track all your job, internship, and mentorship applications
                </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {userApplications.length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-sm text-gray-600">Accepted</p>
                        <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-sm text-gray-600">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-green-700 border-b-2 border-green-700">
                    All
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Pending
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Accepted
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Rejected
                </button>
            </div>

            {/* Applications List */}
            {userApplications.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-500 text-lg">No applications yet</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Start applying to opportunities to see them here
                        </p>
                        <Link href="/opportunities">
                            <Button variant="default" className="mt-4">
                                Browse Opportunities
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {userApplications.map((app) => (
                        <Card key={app.id}>
                            <CardContent>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {app.opportunity?.title}
                                            </h3>
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : app.status === 'accepted'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {app.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {app.opportunity?.company || app.opportunity?.mentor}
                                            {' • '}
                                            {app.opportunity?.type}
                                            {' • '}
                                            {app.opportunity?.location}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Applied on {formatDate(app.appliedDate)}
                                        </p>
                                        {app.coverLetter && (
                                            <details className="mt-3">
                                                <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                                                    View cover letter
                                                </summary>
                                                <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded">
                                                    {app.coverLetter}
                                                </p>
                                            </details>
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-2 ml-4">
                                        <Link href={`/opportunities/${app.opportunityId}`}>
                                            <Button variant="outline" size="sm">
                                                View Listing
                                            </Button>
                                        </Link>
                                        {app.status === 'pending' && (
                                            <Button variant="ghost" size="sm">
                                                Withdraw
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


