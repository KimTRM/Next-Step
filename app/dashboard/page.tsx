/**
 * ============================================================================
 * FRONTEND - Dashboard Page
 * ============================================================================
 * 
 * Main dashboard showing overview of user activity.
 * 
 * ARCHITECTURE:
 * - This is a server component that fetches data on the server side
 * - Imports mock data from /server/data for now
 * - In production: Replace with API calls or database queries
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace direct data imports with API calls (fetch('/api/...'))
 * 2. Implement user authentication to get current user
 * 3. Add loading states and error handling
 * 4. Implement data caching with React Query or SWR
 * 5. Add real-time updates for messages and applications
 */

import Link from 'next/link';
import Card, { CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// BACKEND DATA: These imports pull from server-side mock data
// In production: Replace with API calls or database queries
import { opportunities } from '@/server/data/opportunities';
import { applications } from '@/server/data/applications';
import { messages } from '@/server/data/messages';
import { users } from '@/server/data/users';

export default async function DashboardPage() {
    // Mock current user (student with ID 1)
    const currentUserId = '1';
    const currentUser = users.find(u => u.id === currentUserId);

    // Get user's applications
    const userApplications = applications.filter(app => app.userId === currentUserId);

    // Get user's unread messages
    const unreadMessages = messages.filter(
        msg => msg.receiverId === currentUserId && !msg.read
    );

    // Get recent opportunities
    const recentOpportunities = opportunities.slice(0, 3);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your NextStep journey
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Applications</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {userApplications.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📝</span>
                            </div>
                        </div>
                        <Link href="/applications" className="text-sm text-green-700 hover:underline mt-2 block">
                            View all →
                        </Link>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unread Messages</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {unreadMessages.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💬</span>
                            </div>
                        </div>
                        <Link href="/messages" className="text-sm text-green-700 hover:underline mt-2 block">
                            Read messages →
                        </Link>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">New Opportunities</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {opportunities.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💼</span>
                            </div>
                        </div>
                        <Link href="/opportunities" className="text-sm text-green-700 hover:underline mt-2 block">
                            Explore →
                        </Link>
                    </CardBody>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Opportunities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Opportunities</CardTitle>
                        <CardDescription>Latest jobs, internships, and mentorships</CardDescription>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {recentOpportunities.map((opp) => (
                                <div key={opp.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {opp.company || opp.mentor}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500">
                                            {opp.type.toUpperCase()}
                                        </span>
                                        <Link href={`/opportunities/${opp.id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/opportunities">
                            <Button variant="ghost" className="w-full mt-4">
                                View All Opportunities
                            </Button>
                        </Link>
                    </CardBody>
                </Card>

                {/* Quick Actions & Application Status */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                <Link href="/opportunities">
                                    <Button variant="primary" className="w-full">
                                        🔍 Browse Opportunities
                                    </Button>
                                </Link>
                                <Link href="/profile">
                                    <Button variant="outline" className="w-full">
                                        ✏️ Update Profile
                                    </Button>
                                </Link>
                                <Link href="/messages">
                                    <Button variant="outline" className="w-full">
                                        💬 Check Messages
                                    </Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Application Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Status</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="font-semibold">
                                        {userApplications.filter(a => a.status === 'pending').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Accepted</span>
                                    <span className="font-semibold text-green-600">
                                        {userApplications.filter(a => a.status === 'accepted').length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="font-semibold text-red-600">
                                        {userApplications.filter(a => a.status === 'rejected').length}
                                    </span>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
