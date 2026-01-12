/**
 * ============================================================================
 * FRONTEND - Opportunity Detail Page
 * ============================================================================
 * 
 * Detailed view of a single opportunity.
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Fetch opportunity from API instead of direct import
 * 2. Add apply button with application form
 * 3. Add bookmark/save functionality
 * 4. Show related opportunities
 * 5. Add application status if user has already applied
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
// BACKEND DATA: Import from server-side mock data
import { opportunities } from '@/server/data/opportunities';
import { users } from '@/server/data/users';
// FRONTEND COMPONENTS
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// SHARED UTILITIES
import { formatDate, daysUntilDeadline } from '@/lib/utils';

interface OpportunityDetailPageProps {
    params: { id: string };
}

export default function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
    const opportunity = opportunities.find(o => o.id === params.id);

    if (!opportunity) {
        notFound();
    }

    const poster = users.find(u => u.id === opportunity.postedBy);
    const daysLeft = opportunity.deadline ? daysUntilDeadline(opportunity.deadline) : null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Link href="/opportunities" className="text-green-700 hover:text-green-800 mb-6 inline-block">
                ← Back to Opportunities
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${opportunity.type === 'job'
                                        ? 'bg-blue-100 text-blue-800'
                                        : opportunity.type === 'internship'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800'
                                        }`}
                                >
                                    {opportunity.type.toUpperCase()}
                                </span>
                                {daysLeft !== null && daysLeft > 0 && (
                                    <span className="text-sm text-red-600 font-medium">
                                        ⏰ {daysLeft} days left to apply
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
                            <p className="text-gray-600 mt-2">
                                {opportunity.company || opportunity.mentor}
                                {' • '}
                                {opportunity.isRemote ? '🌐 Remote' : `📍 ${opportunity.location}`}
                            </p>
                            {opportunity.salary && (
                                <p className="text-green-600 font-medium mt-2">
                                    💰 {opportunity.salary}
                                </p>
                            )}
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {opportunity.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {opportunity.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">What You'll Do</h3>
                                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                                        <li>Work on exciting projects</li>
                                        <li>Collaborate with experienced team members</li>
                                        <li>Learn and grow your skills</li>
                                    </ul>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                About {opportunity.company || opportunity.mentor}
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <p className="text-gray-700">
                                {poster?.bio || 'No additional information available.'}
                            </p>
                        </CardBody>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Apply Card */}
                    <Card>
                        <CardBody>
                            <Button variant="primary" className="w-full mb-3">
                                Apply Now
                            </Button>
                            <Button variant="outline" className="w-full mb-3">
                                💾 Save for Later
                            </Button>
                            <Button variant="ghost" className="w-full">
                                🔗 Share
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Posted</p>
                                <p className="font-medium">{formatDate(opportunity.postedDate)}</p>
                            </div>
                            {opportunity.deadline && (
                                <div>
                                    <p className="text-sm text-gray-600">Deadline</p>
                                    <p className="font-medium">{formatDate(opportunity.deadline)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-medium">{opportunity.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Work Type</p>
                                <p className="font-medium">
                                    {opportunity.isRemote ? 'Remote' : 'On-site'}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contact Card */}
                    {poster && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        👤
                                    </div>
                                    <div>
                                        <p className="font-medium">{poster.name}</p>
                                        <p className="text-sm text-gray-600">{poster.role}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">
                                    Send Message
                                </Button>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
