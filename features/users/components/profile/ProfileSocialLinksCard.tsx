'use client';

import { Linkedin, Github, Globe, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import type { User } from '../../types';

type ProfileSocialLinksCardProps = {
    user: User;
    onEdit?: () => void;
};

export function ProfileSocialLinksCard({ user, onEdit }: ProfileSocialLinksCardProps) {
    const hasLinks = user.linkedInUrl || user.githubUrl || user.portfolioUrl;

    if (!hasLinks) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No social links added yet.</p>
                        {onEdit && (
                            <Button
                                variant="link"
                                className="text-sm mt-1 h-auto p-0"
                                onClick={onEdit}
                            >
                                Add your links
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Connect
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {user.linkedInUrl && (
                    <a
                        href={user.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Linkedin className="h-4 w-4" />
                        <span className="flex-1">LinkedIn</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
                {user.githubUrl && (
                    <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Github className="h-4 w-4" />
                        <span className="flex-1">GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
                {user.portfolioUrl && (
                    <a
                        href={user.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Globe className="h-4 w-4" />
                        <span className="flex-1">Portfolio</span>
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
