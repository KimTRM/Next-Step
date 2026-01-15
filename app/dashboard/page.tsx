/**
 * ============================================================================
 * FRONTEND - Dashboard Page
 * ============================================================================
 * 
 * Main dashboard showing overview of user activity.
 * Now uses Convex for real-time data and Clerk for authentication.
 */

"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
    const { user } = useUser();

    // Fetch data from Convex
    const currentUser = useQuery(api.users.getCurrentUser);
    const opportunities = useQuery(api.opportunities.getAllOpportunities, {});
    const userApplications = useQuery(api.applications.getUserApplications);
    const userMessages = useQuery(api.messages.getUserMessages);

    // Loading state
    if (!user || currentUser === undefined || opportunities === undefined) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const unreadMessages = userMessages?.filter(msg =>
        !msg.read && msg.receiverId === currentUser?._id
    ).length || 0;

    const recentOpportunities = opportunities?.slice(0, 3) || [];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.firstName || currentUser?.name?.split(' ')[0]}! 👋
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
                                <p className="text-3xl font-bold text-gray-900">
                                    {userApplications?.length || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📝</span>
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
                                <p className="text-3xl font-bold text-gray-900">
                                    {unreadMessages}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💬</span>
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
                            {recentOpportunities.map((opp) => (
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
                        <Link href="/opportunities">
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
                                <Link href="/opportunities">
                                    <Button variant="default" className="w-full">
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
                                        {userApplications?.filter(a => a.status === 'pending').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Accepted</span>
                                    <span className="font-semibold text-green-600">
                                        {userApplications?.filter(a => a.status === 'accepted').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rejected</span>
                                    <span className="font-semibold text-red-600">
                                        {userApplications?.filter(a => a.status === 'rejected').length || 0}
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


