'use client';

import Link from 'next/link';
import { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useCurrentUser, useUserApplications, useUserMessages } from '@/features/dashboard/api';
import { FileText, MessageCircle, Briefcase, Search, Edit, PartyPopper } from 'lucide-react';
import { LoadingBoundary } from '@/shared/components/loading/LoadingBoundary';
import { Skeleton } from '@/shared/components/ui/skeleton';

function DashboardContent({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
    const resolvedSearchParams = use(searchParams);
    const justCompletedOnboarding = resolvedSearchParams.welcome === 'true';

    // Fetch data from feature API
    const currentUser = useCurrentUser();
    const userApplications = useUserApplications();
    const userMessages = useUserMessages();

    // For now, no opportunities feature yet
    type Opportunity = {
        _id: string;
        title: string;
        company?: string;
        mentor?: string;
    };
    const opportunities: Opportunity[] = [];

    // Show skeleton loading while data loads
    const isLoading = currentUser === undefined || opportunities === undefined;

    // Calculate stats
    const unreadMessages = userMessages?.filter(
        (msg: { read?: boolean; receiverId: string }) =>
            !msg.read && msg.receiverId === currentUser?._id
    ).length || 0;

    const recentOpportunities = opportunities?.slice(0, 3) || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
            {/* Welcome Alert for New Users */}
            {justCompletedOnboarding ? (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-200 rounded-lg animate-pulse h-20"></div>
            ) : (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="shrink-0">
                            <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-green-800">
                                Welcome to NextStep!
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                                <p className="text-xs sm:text-sm">Your profile is now complete! You can start exploring opportunities and connect with mentors.</p>
                                <div className="mt-3">
                                    <Link href="/mentors">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
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
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    Welcome back, {isLoading ? <Skeleton className="h-6 w-24 inline-block" /> : currentUser?.name?.split(" ")[0] || 'User'}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                    {isLoading ? <Skeleton className="h-4 w-48 inline-block" /> : "Here's what's happening with your NextStep journey"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="p-4 sm:p-6">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Applications</p>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        userApplications?.length || 0
                                    )}
                                </div>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                            </div>
                        </div>
                        <Link href="/applications" className="text-xs sm:text-sm text-green-700 hover:underline mt-2 block">
                            View all →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="p-4 sm:p-6">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Unread Messages</p>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        unreadMessages
                                    )}
                                </div>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            </div>
                        </div>
                        <Link href="/messages" className="text-xs sm:text-sm text-green-700 hover:underline mt-2 block">
                            Read messages →
                        </Link>
                    </CardContent>
                </Card>

                <Card className="p-4 sm:p-6">
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">New Opportunities</p>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {isLoading ? (
                                        <div className="h-6 sm:h-8 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                                    ) : (
                                        opportunities.length
                                    )}
                                </div>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                            </div>
                        </div>
                        <Link href="/mentors" className="text-xs sm:text-sm text-green-700 hover:underline mt-2 block">
                            Explore →
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Opportunities */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl">Recent Opportunities</CardTitle>
                        <CardDescription className="text-sm sm:text-base">Latest jobs, internships, and mentorships</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))
                            ) : (
                                recentOpportunities.map((opp: Opportunity) => (
                                    <div key={opp._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{opp.title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                            {opp.company || opp.mentor}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/mentors">
                            <Button variant="ghost" className="w-full mt-4 text-sm sm:text-base">
                                View All Opportunities
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Quick Actions & Application Status */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Link href="/mentors">
                                    <Button variant="default" className="w-full min-h-11 text-sm sm:text-base">
                                        <Search className="w-4 h-4 mr-2" />
                                        Browse Mentors
                                    </Button>
                                </Link>
                                <Link href="/profile">
                                    <Button variant="outline" className="w-full min-h-11 text-sm sm:text-base">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Update Profile
                                    </Button>
                                </Link>
                                <Link href="/messages">
                                    <Button variant="outline" className="w-full min-h-11 text-sm sm:text-base">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Check Messages
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Application Status */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Application Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="font-semibold text-sm sm:text-base">
                                        {userApplications?.filter((a: { status: string }) => a.status === 'pending').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Accepted</span>
                                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                                        {userApplications?.filter((a: { status: string }) => a.status === 'accepted').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="font-semibold text-red-600 text-sm sm:text-base">
                                        {userApplications?.filter((a: { status: string }) => a.status === 'rejected').length || 0}
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

export default function DashboardPageContent({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
    return (
        <LoadingBoundary type="dashboard">
            <DashboardContent searchParams={searchParams} />
        </LoadingBoundary>
    );
}
