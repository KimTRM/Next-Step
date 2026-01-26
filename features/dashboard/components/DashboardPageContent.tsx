'use client';

import Link from 'next/link';
import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useCurrentUser, useUserApplications, useUserMessages } from '@/features/dashboard/api';
import { FileText, MessageCircle, Briefcase, Search, Edit, CheckCircle, XCircle, Clock, PartyPopper } from 'lucide-react';

function DashboardContent({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
    const resolvedSearchParams = use(searchParams);
    const justCompletedOnboarding = resolvedSearchParams.welcome === 'true';

    // Fetch data from feature API
    const currentUser = useCurrentUser();
    const userApplications = useUserApplications();
    const userMessages = useUserMessages();

    // For now, no opportunities feature yet
    const opportunities = [] as any[];

    // Show skeleton loading while data loads
    const isLoading = currentUser === undefined || opportunities === undefined;

    // Calculate stats
    const unreadMessages = userMessages?.filter((msg: any) =>
        !msg.read && msg.receiverId === currentUser?._id
    ).length || 0;

    const recentOpportunities = opportunities?.slice(0, 3) || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Alert for New Users */}
            {justCompletedOnboarding && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <PartyPopper className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                                Welcome to NextStep!
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p>Your profile is now complete! You can start exploring opportunities and connect with mentors.</p>
                                <div className="mt-3">
                                    <Link href="/mentors">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                            Explore Mentors
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back,{" "}
                    {currentUser?.name?.split(" ")[0] || 'User'}
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your NextStep journey
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Applications</p>
                                <div className="text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        userApplications?.length || 0
                                    )}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <Link href="/applications" className="text-sm text-green-700 hover:underline mt-2 block">
                            View all →
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Unread Messages</p>
                                <div className="text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        unreadMessages
                                    )}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <Link href="/messages" className="text-sm text-green-700 hover:underline mt-2 block">
                            Read messages →
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">New Opportunities</p>
                                <div className="text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        opportunities.length
                                    )}
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <Link href="/mentors" className="text-sm text-green-700 hover:underline mt-2 block">
                            Explore →
                        </Link>
                    </CardContent>
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
                    <CardContent>
                        <div className="space-y-4">
                            {recentOpportunities.map((opp: any) => (
                                <div key={opp._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <h4 className="font-semibold text-gray-900">{opp.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {opp.company || opp.mentor}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-gray-500">
                                            {opp.type.toUpperCase()}
                                        </span>
                                        <Link href={`/opportunities/${opp._id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/mentors">
                            <Button variant="ghost" className="w-full mt-4">
                                View All Opportunities
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Actions & Application Status */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Link href="/mentors">
                                    <Button variant="default" className="w-full">
                                        <Search className="w-4 h-4 mr-2" />
                                        Browse Mentors
                                    </Button>
                                </Link>
                                <Link href="/profile">
                                    <Button variant="outline" className="w-full">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Update Profile
                                    </Button>
                                </Link>
                                <Link href="/messages">
                                    <Button variant="outline" className="w-full">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Check Messages
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Application Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="font-semibold">
                                        {userApplications?.filter((a: any) => a.status === 'pending').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Accepted</span>
                                    <span className="font-semibold text-green-600">
                                        {userApplications?.filter((a: any) => a.status === 'accepted').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="font-semibold text-red-600">
                                        {userApplications?.filter((a: any) => a.status === 'rejected').length || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default DashboardContent;
