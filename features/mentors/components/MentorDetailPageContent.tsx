/**
 * Mentor Detail Page Content - NextStep Platform
 *
 * Comprehensive mentor profile with booking and connection features
 */

'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    Star,
    CheckCircle,
    Calendar,
    MessageSquare,
    Globe,
    Linkedin,
    Github,
    Twitter,
    ExternalLink,
} from 'lucide-react';
import { BookingModal, ConnectModal } from '@/features/mentors/components';
import { useMentorById, useSimilarMentors } from '@/features/mentors/api';
import type { Id } from '@/features/mentors/types';

interface MentorDetailPageContentProps {
    mentorId: Id<'mentors'>;
}

export function MentorDetailPageContent({ mentorId }: MentorDetailPageContentProps) {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const router = useRouter();

    // Fetch mentor and similar mentors using feature API
    const mentor = useMentorById(mentorId);
    const similarMentors = useSimilarMentors(mentorId, 3);

    // Show loading state while data is loading
    if (mentor === undefined) {
        return <MentorDetailSkeleton />;
    }

    if (!mentor) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Card className="p-12 text-center">
                    <h1 className="text-2xl font-bold mb-2">Mentor not found</h1>
                    <p className="text-muted-foreground mb-6">
                        The mentor you&apos;re looking for doesn&apos;t exist or has been removed.
                    </p>
                    <Button onClick={() => router.push('/mentors')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Mentors
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push('/mentors')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mentors
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mentor Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={mentor.profileImageUrl} alt={mentor.name} />
                                    <AvatarFallback>
                                        {String(mentor.name)
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 mb-1">
                                        {mentor.name}
                                        {mentor.isVerified && (
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                        )}
                                    </CardTitle>
                                    <p className="text-lg text-muted-foreground mb-2">{mentor.role}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Briefcase className="h-4 w-4" />
                                            <span>{mentor.company}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{mentor.location}</span>
                                        </div>
                                        {mentor.sessionsCompleted && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{mentor.sessionsCompleted} sessions</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(mentor.expertise as string[]).map((skill: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            {mentor.specializations && mentor.specializations.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Specializations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(mentor.specializations as string[]).map((spec: string, index: number) => (
                                            <Badge key={index} variant="outline">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Professional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {mentor.yearsOfExperience && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Experience</p>
                                    <p className="font-medium">{mentor.yearsOfExperience} years</p>
                                </div>
                            )}
                            {mentor.languages && mentor.languages.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Languages</p>
                                    <p className="font-medium">{mentor.languages.join(', ')}</p>
                                </div>
                            )}
                            {mentor.timezone && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Timezone</p>
                                    <p className="font-medium">{mentor.timezone}</p>
                                </div>
                            )}
                            {mentor.responseTime && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                                    <p className="font-medium capitalize">{mentor.responseTime}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Similar Mentors */}
                    {similarMentors && Array.isArray(similarMentors) && similarMentors.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Similar Mentors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {similarMentors.map((similar) => (
                                        <div
                                            key={similar._id}
                                            className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                            onClick={() => router.push(`/mentors/${similar._id}`)}
                                        >
                                            <Avatar>
                                                <AvatarImage src={similar.profileImageUrl} />
                                                <AvatarFallback>
                                                    {String(similar.name)
                                                        .split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate flex items-center gap-1">
                                                    {similar.name}
                                                    {similar.isVerified && (
                                                        <CheckCircle className="h-3 w-3 text-primary" />
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {similar.role}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                    <span>{similar.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <Card className="sticky top-24">
                        <CardHeader>
                            {mentor.hourlyRate ? (
                                <div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-3xl font-bold">
                                            {mentor.currency === 'PHP' ? '₱' : '$'}
                                            {mentor.hourlyRate}
                                        </span>
                                        <span className="text-muted-foreground">/hour</span>
                                    </div>
                                    {mentor.offersFreeSession && (
                                        <Badge variant="secondary" className="text-xs">
                                            First session free
                                        </Badge>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Contact for pricing
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Availability
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {mentor.availability}
                                </p>
                                {mentor.availableDays && mentor.availableDays.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {(mentor.availableDays as string[]).map((day: string, index: number) => (
                                            <Badge key={index} variant="outline" className="text-xs capitalize">
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={() => setShowBookingModal(true)}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Session
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowConnectModal(true)}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Send Message
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentor Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Active Mentees</span>
                                <span className="font-semibold">{mentor.mentees}</span>
                            </div>
                            {mentor.sessionsCompleted && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Sessions Completed
                                    </span>
                                    <span className="font-semibold">{mentor.sessionsCompleted}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    {(mentor.linkedInUrl || mentor.githubUrl || mentor.portfolioUrl || mentor.twitterUrl) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Connect</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {mentor.linkedInUrl && (
                                    <a
                                        href={mentor.linkedInUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </a>
                                )}
                                {mentor.githubUrl && (
                                    <a
                                        href={mentor.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Github className="h-4 w-4" />
                                        <span>GitHub</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </a>
                                )}
                                {mentor.portfolioUrl && (
                                    <a
                                        href={mentor.portfolioUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Globe className="h-4 w-4" />
                                        <span>Portfolio</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </a>
                                )}
                                {mentor.twitterUrl && (
                                    <a
                                        href={mentor.twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Twitter className="h-4 w-4" />
                                        <span>Twitter</span>
                                        <ExternalLink className="h-3 w-3 ml-auto" />
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showBookingModal && mentor && mentor.userId && (
                <BookingModal
                    mentor={{
                        _id: mentor._id,
                        userId: mentor.userId,
                        name: mentor.name,
                        role: mentor.role,
                        hourlyRate: mentor.hourlyRate,
                        currency: mentor.currency,
                        offersFreeSession: mentor.offersFreeSession,
                        availableDays: mentor.availableDays,
                        availableTimeSlots: mentor.availableTimeSlots,
                        timezone: mentor.timezone,
                    }}
                    onClose={() => setShowBookingModal(false)}
                />
            )}

            {showConnectModal && mentor && mentor.userId && (
                <ConnectModal
                    mentor={{
                        _id: mentor._id,
                        userId: mentor.userId,
                        name: mentor.name,
                        role: mentor.role,
                        company: mentor.company,
                        location: mentor.location,
                        expertise: mentor.expertise,
                        bio: mentor.bio,
                        availability: mentor.availability,
                        rating: mentor.rating,
                        mentees: mentor.mentees,
                        isVerified: mentor.isVerified,
                        _creationTime: mentor._creationTime || 0,
                    }}
                    onClose={() => setShowConnectModal(false)}
                />
            )}
        </div>
    );
}

function MentorDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-32 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-7 w-64" />
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-96" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-10 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
