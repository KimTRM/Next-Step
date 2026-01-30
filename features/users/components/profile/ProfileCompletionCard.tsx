'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import type { ProfileCompletionResult } from './types';

type ProfileCompletionCardProps = {
    completion: ProfileCompletionResult;
};

export function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
    return (
        <Card className="mb-8">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Profile Completion</span>
                            <span className="text-sm font-semibold text-primary">
                                {completion.percentage}%
                            </span>
                        </div>
                        <Progress value={completion.percentage} className="h-2" />
                    </div>
                    {completion.incomplete.length > 0 && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>
                                Complete your {completion.incomplete.slice(0, 3).join(', ')}
                                {completion.incomplete.length > 3 && ` and ${completion.incomplete.length - 3} more`}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
