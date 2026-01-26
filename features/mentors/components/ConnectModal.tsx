"use client";

import { Send } from 'lucide-react';
import { useState } from 'react';
import type { MentorWithUser } from '@/shared/lib/types/index';
import { useSendConnectionRequest } from '@/features/mentors/api';

interface ConnectModalProps {
    mentor: MentorWithUser;
    onClose: () => void;
}

export function ConnectModal({ mentor, onClose }: ConnectModalProps) {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const sendConnectionRequest = useSendConnectionRequest();

    const handleSubmit = async () => {
        const trimmed = message.trim();
        if (!trimmed) {
            setError('Please add a short message.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await sendConnectionRequest({
                mentorId: mentor._id,
                message: trimmed,
            });
            setSent(true);
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to send request';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="mb-2">Connect with {mentor.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Send a message to introduce yourself and explain what kind of guidance you&apos;re looking for.
                </p>
                <textarea
                    placeholder="Hi, I'm a fresh graduate interested in..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting || sent}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-3 h-32 resize-none disabled:opacity-60"
                />
                {error && (
                    <p className="text-sm text-destructive mb-3">{error}</p>
                )}
                {sent && (
                    <p className="text-sm text-emerald-600 mb-3">Request sent!</p>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || sent}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Send className="h-4 w-4" />
                        {submitting ? 'Sending…' : sent ? 'Sent' : 'Send Request'}
                    </button>
                </div>
            </div>
        </div>
    );
}
