/**
 * OpportunityCard Component - NextStep Platform
 * 
 * Card component to display job/internship/mentorship opportunities
 * 
 * HACKATHON TODO:
 * - Add bookmark/save functionality
 * - Add share functionality
 * - Add apply button with modal
 * - Add tags for skills with colors
 * - Add company logo display
 */

'use client';

import Link from 'next/link';
import Card, { CardBody, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Opportunity } from '@/lib/types';
import { formatDate, daysUntilDeadline, truncateText, getOpportunityColor } from '@/lib/utils';

interface OpportunityCardProps {
    opportunity: Opportunity;
    onApply?: (id: string) => void;
}

export default function OpportunityCard({ opportunity, onApply }: OpportunityCardProps) {
    const typeColor = getOpportunityColor(opportunity.type);
    const daysLeft = opportunity.deadline ? daysUntilDeadline(opportunity.deadline) : null;

    const handleApply = () => {
        if (onApply) {
            onApply(opportunity.id);
        } else {
            // Default behavior - navigate to detail page
            window.location.href = `/opportunities/${opportunity.id}`;
        }
    };

    return (
        <Card hoverable className="h-full flex flex-col">
            <CardBody className="flex-1">
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-3">
                    <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${typeColor === 'blue'
                                ? 'bg-blue-100 text-blue-800'
                                : typeColor === 'green'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-purple-100 text-purple-800'
                            }`}
                    >
                        {opportunity.type.toUpperCase()}
                    </span>
                    {daysLeft !== null && daysLeft > 0 && (
                        <span className="text-xs text-gray-500">
                            {daysLeft} days left
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {opportunity.title}
                </h3>

                {/* Company/Mentor */}
                <p className="text-sm text-gray-600 mb-3">
                    {opportunity.company || opportunity.mentor || 'Organization'}
                    {' • '}
                    <span className={opportunity.isRemote ? 'text-green-600' : 'text-gray-600'}>
                        {opportunity.isRemote ? '🌐 Remote' : `📍 ${opportunity.location}`}
                    </span>
                </p>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4">
                    {truncateText(opportunity.description, 150)}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {opportunity.skills.slice(0, 4).map((skill) => (
                        <span
                            key={skill}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                            {skill}
                        </span>
                    ))}
                    {opportunity.skills.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                            +{opportunity.skills.length - 4} more
                        </span>
                    )}
                </div>

                {/* Salary/Compensation */}
                {opportunity.salary && (
                    <p className="text-sm font-medium text-green-600">
                        💰 {opportunity.salary}
                    </p>
                )}
            </CardBody>

            <CardFooter className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    Posted {formatDate(opportunity.postedDate)}
                </span>
                <div className="flex space-x-2">
                    <Link href={`/opportunities/${opportunity.id}`}>
                        <Button variant="outline" size="sm">
                            View Details
                        </Button>
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApply}
                    >
                        Apply Now
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

/**
 * OpportunityList Component - Displays a grid of opportunities
 */
interface OpportunityListProps {
    opportunities: Opportunity[];
    onApply?: (id: string) => void;
}

export function OpportunityList({ opportunities, onApply }: OpportunityListProps) {
    if (opportunities.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No opportunities found</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new listings</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
                <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onApply={onApply}
                />
            ))}
        </div>
    );
}
