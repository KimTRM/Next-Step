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
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

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
        <div className="border-t p-4 bg-linear-to-r from-blue-50/50 to-white">
            <div className="flex space-x-3">
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled || isSending}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Message input"
                />
                <Button
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 shadow-sm"
                >
                    {isSending ? (
                        <>
                            <span className="mr-2">⏳</span>
                            Sending...
                        </>
                    ) : (
                        <>
                            <span className="mr-2">📤</span>
                            Send
                        </>
                    )}
                </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                💡 Press Enter to send • Shift + Enter for new line
            </p>
        </div>
    );
}
