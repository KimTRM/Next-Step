'use client';

import { Mail, MapPin, GraduationCap, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import type { User } from '../../types';
import { EDUCATION_LEVEL_LABELS } from './types';

type ProfileBasicInfoCardProps = {
    user: User;
};

export function ProfileBasicInfoCard({ user }: ProfileBasicInfoCardProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage
                            src={user.avatarUrl}
                            alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                            {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                    <Badge variant="secondary" className="capitalize mb-4">
                        {user.role.replace('_', ' ')}
                    </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{user.email}</span>
                    </div>

                    {user.location && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span>{user.location}</span>
                        </div>
                    )}

                    {user.educationLevel && (
                        <div className="flex items-center gap-3 text-sm">
                            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                            <span>{EDUCATION_LEVEL_LABELS[user.educationLevel]}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>
                            Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                            })}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
