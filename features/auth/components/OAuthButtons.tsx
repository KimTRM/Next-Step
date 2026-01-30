"use client";

/**
 * OAuthButtons Component
 * Social login/signup buttons using Clerk OAuth
 * Supports: Google, Apple, Facebook
 */

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useOAuthLogin, useOAuthSignUp } from "../api";

type OAuthButtonsProps = {
    mode?: "login" | "signup";
};

// Custom SVG icons for OAuth providers
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

function AppleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

// Error message mapping for user-friendly messages
function getOAuthErrorMessage(code: string, provider: string): string {
    const errorMessages: Record<string, string> = {
        "oauth_access_denied": "You cancelled the sign-in. Please try again.",
        "oauth_callback_error": `Something went wrong with ${provider}. Please try again.`,
        "identifier_already_signed_in": "You're already signed in with another account.",
        "account_exists_with_different_credential": "An account already exists with this email. Try signing in with a different method.",
        "oauth_email_mismatch": "The email from this provider doesn't match your account.",
        "external_account_not_found": "No account found with this provider. Please sign up first.",
        "external_account_exists": "This social account is already linked to another user.",
    };

    return errorMessages[code] || `Failed to sign in with ${provider}. Please try again.`;
}

export function OAuthButtons({ mode = "login" }: OAuthButtonsProps) {
    const loginHook = useOAuthLogin();
    const signUpHook = useOAuthSignUp();

    // Use the appropriate hook based on mode
    const {
        isLoading,
        isReady,
        error,
    } = mode === "signup" ? signUpHook : loginHook;

    const handleGoogle = mode === "signup"
        ? signUpHook.signUpWithGoogle
        : loginHook.loginWithGoogle;

    const handleApple = mode === "signup"
        ? signUpHook.signUpWithApple
        : loginHook.loginWithApple;

    const handleFacebook = mode === "signup"
        ? signUpHook.signUpWithFacebook
        : loginHook.loginWithFacebook;

    // Get user-friendly error message
    const errorMessage = error
        ? getOAuthErrorMessage(error.code, "this provider")
        : null;

    return (
        <motion.div 
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {errorMessage && (
                <motion.div 
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm max-w-xs text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {errorMessage}
                </motion.div>
            )}

            <motion.div 
                className="flex gap-4 mt-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {/* Google Button */}
                <motion.button
                    onClick={handleGoogle}
                    disabled={isLoading || !isReady}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    title="Continue with Google"
                    aria-label="Continue with Google"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.2 }}
                >
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </motion.div>
                    ) : (
                        <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", duration: 0.2 }}
                        >
                            <GoogleIcon className="w-5 h-5" />
                        </motion.div>
                    )}
                </motion.button>

                {/* Apple Button */}
                <motion.button
                    onClick={handleApple}
                    disabled={isLoading || !isReady}
                    className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    title="Continue with Apple"
                    aria-label="Continue with Apple"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.2, delay: 0.05 }}
                >
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </motion.div>
                    ) : (
                        <motion.div
                            whileHover={{ rotate: -15 }}
                            transition={{ type: "spring", duration: 0.2 }}
                        >
                            <AppleIcon className="w-5 h-5" />
                        </motion.div>
                    )}
                </motion.button>

                {/* Facebook Button */}
                <motion.button
                    onClick={handleFacebook}
                    disabled={isLoading || !isReady}
                    className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
                    title="Continue with Facebook"
                    aria-label="Continue with Facebook"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.2, delay: 0.1 }}
                >
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </motion.div>
                    ) : (
                        <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", duration: 0.2 }}
                        >
                            <FacebookIcon className="w-5 h-5 fill-white" />
                        </motion.div>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
