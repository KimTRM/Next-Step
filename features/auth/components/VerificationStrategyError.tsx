"use client";

/**
 * VerificationStrategyError Component
 * 
 * Displays a helpful error message when verification strategy is not valid
 * Provides users with alternative options to complete authentication
 */

import { AlertCircle, Chrome, Github } from "lucide-react";
import { OAuthButtons } from "./OAuthButtons";

interface VerificationStrategyErrorProps {
    message?: string;
    onDismiss?: () => void;
}

export function VerificationStrategyError({ 
    message = "Email verification is not available for this account.", 
    onDismiss 
}: VerificationStrategyErrorProps) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-2">
                        Verification Method Not Available
                    </h3>
                    <p className="text-amber-700 text-sm mb-4">
                        {message} This can happen if your account was created using a different method 
                        or if email verification is disabled for your account type.
                    </p>
                    
                    <div className="space-y-3">
                        <div>
                            <p className="text-amber-700 font-medium text-sm mb-2">
                                Try these alternatives:
                            </p>
                            <ul className="text-amber-600 text-sm space-y-1 list-disc list-inside">
                                <li>Sign in with Google, GitHub, or other OAuth providers</li>
                                <li>Check if you received a magic link via email</li>
                                <li>Contact support if you continue to have issues</li>
                            </ul>
                        </div>
                        
                        <div className="pt-2">
                            <p className="text-amber-700 font-medium text-sm mb-3">
                                Quick sign in with:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <OAuthButtons />
                            </div>
                        </div>
                    </div>
                    
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="mt-4 text-amber-600 hover:text-amber-700 text-sm underline"
                        >
                            Dismiss message
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
