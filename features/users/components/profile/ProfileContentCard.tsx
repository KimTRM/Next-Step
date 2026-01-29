'use client';

import { FileText, Target, Award, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { User } from '../../types';

type ProfileContentCardProps = {
    user: User;
    onEdit?: () => void;
};

export function ProfileBioCard({ user, onEdit }: ProfileContentCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    About Me
                </CardTitle>
            </CardHeader>
            <CardContent>
                {user.bio ? (
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
                        {user.bio}
                    </p>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No bio added yet.</p>
                        {onEdit && (
                            <Button
                                variant="link"
                                className="text-sm mt-1 h-auto p-0"
                                onClick={onEdit}
                            >
                                Add a bio
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ProfileCareerGoalsCard({ user, onEdit }: ProfileContentCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Career Goals
                </CardTitle>
            </CardHeader>
            <CardContent>
                {user.careerGoals ? (
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed break-words">
                        {user.careerGoals}
                    </p>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No career goals added yet.</p>
                        {onEdit && (
                            <Button
                                variant="link"
                                className="text-sm mt-1 h-auto p-0"
                                onClick={onEdit}
                            >
                                Add your career goals
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ProfileSkillsCard({ user, onEdit }: ProfileContentCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skills
                </CardTitle>
            </CardHeader>
            <CardContent>
                {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="px-3 py-1"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No skills added yet.</p>
                        {onEdit && (
                            <Button
                                variant="link"
                                className="text-sm mt-1 h-auto p-0"
                                onClick={onEdit}
                            >
                                Add your skills
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ProfileInterestsCard({ user, onEdit }: ProfileContentCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Interests
                </CardTitle>
            </CardHeader>
            <CardContent>
                {user.interests && user.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {user.interests.map((interest) => (
                            <Badge
                                key={interest}
                                variant="outline"
                                className="px-3 py-1"
                            >
                                {interest}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No interests added yet.</p>
                        {onEdit && (
                            <Button
                                variant="link"
                                className="text-sm mt-1 h-auto p-0"
                                onClick={onEdit}
                            >
                                Add your interests
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function ProfileGoalsCard({ user }: { user: User }) {
    if (!user.goals || user.goals.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Goals
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {user.goals.map((goal) => (
                        <Badge
                            key={goal}
                            variant="outline"
                            className="px-3 py-1 bg-primary/5"
                        >
                            {goal}
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
