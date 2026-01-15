/**
 * EmptyMessageState Component
 * 
 * Placeholder shown when no conversation is selected
 */

'use client';

export function EmptyMessageState() {
    return (
        <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Select a conversation to start messaging</p>
            </div>
        </div>
    );
}
