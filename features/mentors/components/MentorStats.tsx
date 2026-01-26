import { UserCheck, Award, MessageSquare, Star } from 'lucide-react';

interface MentorStatsProps {
    mentors: Array<{
        mentees: number;
        isVerified: boolean;
        rating: number;
    }>;
}

export function MentorStats({ mentors }: MentorStatsProps) {
    const totalMentees = mentors.reduce((acc, mentor) => acc + mentor.mentees, 0);
    const verifiedCount = mentors.filter((mentor) => mentor.isVerified).length;
    const averageRating = (
        mentors.reduce((acc, mentor) => acc + mentor.rating, 0) / mentors.length
    ).toFixed(1);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{mentors.length}</div>
                        <div className="text-sm text-muted-foreground">Available Mentors</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <Award className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{verifiedCount}</div>
                        <div className="text-sm text-muted-foreground">Verified</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{totalMentees}</div>
                        <div className="text-sm text-muted-foreground">Active Mentorships</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <Star className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{averageRating}</div>
                        <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
