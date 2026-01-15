import { MessageSquare, Briefcase, MapPin, Star, UserCheck, Calendar, Award } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type MentorWithUser = {
    _id: Id<'mentors'>;
    _creationTime: number;
    userId: Id<'users'>;
    role: string;
    company: string;
    location: string;
    expertise: string[];
    experience: string;
    rating: number;
    mentees: number;
    bio: string;
    availability: string;
    isVerified: boolean;
    user?: {
        _id: Id<'users'>;
        name: string;
        email: string;
        profileImage?: string;
    };
};

interface MentorCardProps {
    mentor: MentorWithUser;
    onConnect: (mentor: MentorWithUser) => void;
}

export function MentorCard({ mentor, onConnect }: MentorCardProps) {
    return (
        <div className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6">
            {/* Mentor Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="mb-1 flex items-center gap-2">
                                {mentor.user?.name || 'Unknown Mentor'}
                                {mentor.isVerified && (
                                    <Award className="h-4 w-4 text-primary" aria-label="Verified Mentor" />
                                )}
                            </h3>
                            <p className="text-sm text-muted-foreground">{mentor.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{mentor.rating}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{mentor.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{mentor.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertise.map((exp, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize"
                    >
                        {exp.replace('-', ' ')}
                    </span>
                ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{mentor.experience} experience</span>
                </div>
                <div className="flex items-center gap-1">
                    <UserCheck className="h-4 w-4" />
                    <span>{mentor.mentees} mentees</span>
                </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Availability:</span> {mentor.availability}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onConnect(mentor)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                    <MessageSquare className="h-4 w-4" />
                    Connect
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                    View Profile
                </button>
            </div>
        </div>
    );
}
