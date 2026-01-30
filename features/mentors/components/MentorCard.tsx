import { MessageSquare, Briefcase, MapPin, Star, UserCheck, Calendar, Award, DollarSign } from 'lucide-react';
import type { MentorWithUser } from '@/shared/lib/types/index';
import Link from 'next/link';
import Image from 'next/image';

interface MentorCardProps {
    mentor: MentorWithUser;
    onConnect: (mentor: MentorWithUser) => void;
}

export function MentorCard({ mentor, onConnect }: MentorCardProps) {
    return (
        <div className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6 group">
            {/* Mentor Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0">
                    {mentor.avatarUrl ? (
                        <Image
                            src={mentor.avatarUrl}
                            alt={mentor.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-8 w-8 text-primary" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="mb-1 flex items-center gap-2 truncate">
                                {mentor.name}
                                {mentor.isVerified && (
                                    <Award className="h-4 w-4 text-primary shrink-0" aria-label="Verified Mentor" />
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">{mentor.role}</p>
                            {mentor.tagline && (
                                <p className="text-xs text-primary font-medium mt-1 line-clamp-1">
                                    {mentor.tagline}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-sm ml-2 shrink-0">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 shrink-0" />
                            <span className="truncate">{mentor.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">{mentor.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mentor.bio}</p>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {(mentor.expertise || []).slice(0, 4).map((exp, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                        {exp}
                    </span>
                ))}
                {(mentor.expertise || []).length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{(mentor.expertise || []).length - 4} more
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {mentor.yearsOfExperience && (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{mentor.yearsOfExperience} years</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4 shrink-0" />
                    <span>{mentor.mentees} mentees</span>
                </div>
                {mentor.hourlyRate && (
                    <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <span>
                            {mentor.currency === 'PHP' ? '₱' : '$'}
                            {mentor.hourlyRate}/hr
                        </span>
                    </div>
                )}
            </div>

            {/* Availability */}
            <div className="text-sm text-muted-foreground mb-4 flex items-start gap-1">
                <span className="font-medium shrink-0">Availability:</span>
                <span className="line-clamp-1">{mentor.availability}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onConnect(mentor)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    disabled={!mentor.isAvailableForNewMentees}
                >
                    <MessageSquare className="h-4 w-4" />
                    Connect
                </button>
                <Link
                    href={`/mentors/${mentor._id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
                >
                    View Profile
                </Link>
            </div>

            {!mentor.isAvailableForNewMentees && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Currently at capacity
                </p>
            )}
        </div>
    );
}
