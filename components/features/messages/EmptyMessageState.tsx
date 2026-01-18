/**
 * EmptyMessageState Component
 * 
 * Placeholder shown when no conversation is selected
 */

'use client';

export function EmptyMessageState() {
    return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-50/20">
            <div className="text-center px-6 py-12">
                <div className="text-7xl mb-6">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversation Selected</h3>
                <p className="text-base text-gray-600">Choose a conversation from the left to start messaging</p>
            </div>
        </div>
    );
}
