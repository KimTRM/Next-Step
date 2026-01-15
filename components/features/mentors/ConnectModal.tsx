import { Send } from 'lucide-react';
import { useState } from 'react';
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

interface ConnectModalProps {
    mentor: MentorWithUser;
    onClose: () => void;
}

export function ConnectModal({ mentor, onClose }: ConnectModalProps) {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        // TODO: Implement sending connection request
        console.log('Sending connection request to', mentor.user?.name, 'with message:', message);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="mb-4">Connect with {mentor.user?.name || 'Mentor'}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Send a message to introduce yourself and explain what kind of guidance you're looking for.
                </p>
                <textarea
                    placeholder="Hi, I'm a fresh graduate interested in..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 h-32 resize-none"
                />
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
}
