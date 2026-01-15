/**
 * MessageInput Component
 * 
 * Message composition area with:
 * - Text input field
 * - Send button
 * - Enter key support
 * - Loading/disabled states
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!messageText.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(messageText.trim());
            setMessageText('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isSendDisabled = disabled || !messageText.trim() || isSending;

    return (
        <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled || isSending}
                    className="flex-1"
                    aria-label="Message input"
                />
                <Button
                    onClick={handleSend}
                    disabled={isSendDisabled}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Press Enter to send
            </p>
        </div>
    );
}
