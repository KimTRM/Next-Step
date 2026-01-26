'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MentorWithUser } from '@/lib/types/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    Star,
    Calendar,
    MessageSquare,
    Users,
    CheckCircle,
    Globe,
    Linkedin,
    Github,
    Twitter,
} from 'lucide-react';

interface MentorDetailClientProps {
    mentor: MentorWithUser;
    similarMentors?: MentorWithUser[];
}

export function MentorDetailClient({
    mentor,
    similarMentors = [],
}: MentorDetailClientProps) {
    const router = useRouter();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatPrice = (price?: number) => {
        if (!price) return 'Contact for pricing';
        return `$${price}/hr`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Mentors
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mentor Profile Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={mentor.profileImageUrl} alt={mentor.name} />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(mentor.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h1 className="text-3xl font-bold">{mentor.name}</h1>
                                        <p className="text-xl text-muted-foreground mt-1">
                                            {mentor.role}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex flex-wrap gap-4">
                                        {mentor.rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                        {mentor.company && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{mentor.company}</span>
                                            </div>
                                        )}
                                        {mentor.location && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>{mentor.location}</span>
                                            </div>
                                        )}
                                        {mentor.sessionsCompleted !== undefined && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>{mentor.sessionsCompleted} sessions</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About Section */}
                    {mentor.bio && (
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {mentor.bio}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Expertise */}
                    {mentor.expertise && mentor.expertise.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Expertise</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.expertise.map((skill: string, index: number) => (
                                        <Badge key={index} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Specializations */}
                    {mentor.specializations && mentor.specializations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Specializations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.specializations.map((spec: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Professional Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mentor.yearsOfExperience && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Experience</span>
                                    <span className="font-medium">
                                        {mentor.yearsOfExperience} years
                                    </span>
                                </div>
                            )}
                            {mentor.languages && mentor.languages.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Languages</span>
                                    <span className="font-medium">
                                        {mentor.languages.join(', ')}
                                    </span>
                                </div>
                            )}
                            {mentor.timezone && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Timezone</span>
                                    <span className="font-medium">{mentor.timezone}</span>
                                </div>
                            )}
                            {mentor.responseTime && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Response Time</span>
                                    <span className="font-medium">{mentor.responseTime}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Similar Mentors */}
                    {similarMentors.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Similar Mentors</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {similarMentors.map((similarMentor) => (
                                    <Card
                                        key={similarMentor._id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => router.push(`/mentors/${similarMentor._id}`)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage
                                                        src={similarMentor.profileImageUrl}
                                                        alt={similarMentor.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(similarMentor.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {similarMentor.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {similarMentor.role}
                                                    </p>
                                                    {similarMentor.rating && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-sm">
                                                                {similarMentor.rating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {formatPrice(mentor.hourlyRate)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Availability */}
                    {mentor.availableDays && mentor.availableDays.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Availability</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {mentor.availableDays.map((day, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="capitalize">{day}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <Card>
                        <CardContent className="pt-6 space-y-3">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => setIsBookingModalOpen(true)}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Book Session
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                size="lg"
                                onClick={() => setIsConnectModalOpen(true)}
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Mentor Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentor Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mentor.mentees !== undefined && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>Active Mentees</span>
                                    </div>
                                    <span className="font-medium">{mentor.mentees}</span>
                                </div>
                            )}
                            {mentor.sessionsCompleted !== undefined && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Sessions Completed</span>
                                    </div>
                                    <span className="font-medium">{mentor.sessionsCompleted}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    {(mentor.linkedInUrl ||
                        mentor.githubUrl ||
                        mentor.portfolioUrl ||
                        mentor.twitterUrl) && (
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
                                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            <span>LinkedIn</span>
                                        </a>
                                    )}
                                    {mentor.githubUrl && (
                                        <a
                                            href={mentor.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                        >
                                            <Github className="h-4 w-4" />
                                            <span>GitHub</span>
                                        </a>
                                    )}
                                    {mentor.portfolioUrl && (
                                        <a
                                            href={mentor.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                        >
                                            <Globe className="h-4 w-4" />
                                            <span>Portfolio</span>
                                        </a>
                                    )}
                                    {mentor.twitterUrl && (
                                        <a
                                            href={mentor.twitterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                                        >
                                            <Twitter className="h-4 w-4" />
                                            <span>Twitter</span>
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                </div>
            </div>

            {/* Modals - Placeholder for now */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Book a Session</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Booking functionality will be implemented here.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsBookingModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={() => setIsBookingModalOpen(false)}>
                                    Confirm
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isConnectModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Send Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Messaging functionality will be implemented here.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsConnectModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={() => setIsConnectModalOpen(false)}>
                                    Send
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
