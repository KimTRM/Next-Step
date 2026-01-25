'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

export default function OpportunitiesPage() {
    const opportunities = useQuery(api.opportunities.getAllOpportunities, {});

    if (opportunities === undefined) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-lg text-gray-600">Loading opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Opportunities</h1>
                <p className="text-lg text-gray-600">
                    Explore internships, job openings, and other career opportunities
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Opportunities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">
                            {opportunities.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
                {opportunities.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-600">No opportunities found</p>
                        </CardContent>
                    </Card>
                ) : (
                    opportunities.map((opp: any) => (
                        <Card key={opp._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <Link href={`/opportunities/${opp._id}`}>
                                            <h3 className="text-xl font-semibold text-gray-900 hover:text-green-700 transition-colors mb-2">
                                                {opp.title}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-600 mb-4">{opp.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" />
                                                {opp.type}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {opp.location}
                                            </div>
                                            {opp.salary && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {opp.salary}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {new Date(opp.postedDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/opportunities/${opp._id}`}>
                                        <Button className="whitespace-nowrap">View Details</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
