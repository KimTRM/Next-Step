"use client";

/**
 * LoginForm Component
 * Custom login form using Clerk hooks
 */

import { useState } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useLoginForm } from "../api";

type LoginFormProps = {
    onForgotPassword?: () => void;
};

export function LoginForm({ onForgotPassword }: LoginFormProps) {
    const { login, isLoading, isReady, error, clearError } = useLoginForm();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!identifier || !password) {
            return;
        }

        await login({ identifier, password });
    };

    const isSubmitDisabled = isLoading || !isReady || !identifier || !password;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error.message}
                </div>
            )}

            {/* Email/Username Input */}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="email"
                />
            </div>

            {/* Password Input */}
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="current-password"
                />
            </div>

            {/* Forgot Password Link */}
            {onForgotPassword && (
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-green-500 underline text-sm hover:text-green-600"
                >
                    Forgot your Password?
                </button>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    "Log In"
                )}
            </button>
        </form>
    );
}
