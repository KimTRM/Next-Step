import { UserCheck } from 'lucide-react';

export function EmptyMentorState() {
    return (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
                Try adjusting your search or filters to find the right mentor for you.
            </p>
        </div>
    );
}
