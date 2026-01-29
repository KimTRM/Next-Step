"use client";

/**
 * EmailVerification Component
 * Handles email verification code input
 */

import { useState } from "react";
import { Mail, Loader2, RefreshCw } from "lucide-react";
import type { AuthError } from "../types";

type EmailVerificationProps = {
    email: string;
    onVerifyAction: (code: string) => Promise<{ success: boolean; error: AuthError | null }>;
    onResendAction: () => Promise<{ success: boolean; error: AuthError | null }>;
    isLoading: boolean;
    error: AuthError | null;
};

export function EmailVerification({
    email,
    onVerifyAction,
    onResendAction,
    isLoading,
    error,
}: EmailVerificationProps) {
    const [code, setCode] = useState("");
    const [resendMessage, setResendMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResendMessage(null);

        if (!code.trim()) {
            return;
        }

        await onVerifyAction(code.trim());
    };

    const handleResend = async () => {
        setResendMessage(null);
        const result = await onResendAction();
        if (result.success) {
            setResendMessage("Verification code sent!");
            setCode("");
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Check your email
                </h2>
                <p className="text-gray-600 text-sm">
                    We sent a verification code to
                </p>
                <p className="text-green-600 font-medium">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error.message}
                    </div>
                )}

                {/* Success Message */}
                {resendMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {resendMessage}
                    </div>
                )}

                {/* Verification Code Input */}
                <div>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        autoComplete="one-time-code"
                        maxLength={6}
                    />
                </div>

                {/* Verify Button */}
                <button
                    type="submit"
                    disabled={isLoading || !code.trim()}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify Email"
                    )}
                </button>
            </form>

            {/* Resend Code */}
            <div className="text-center pt-4">
                <p className="text-gray-600 text-sm mb-2">
                    Didn&apos;t receive the code?
                </p>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-1 disabled:opacity-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Resend code
                </button>
            </div>
        </div>
    );
}
