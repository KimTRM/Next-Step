"use client";

/**
 * LoginForm Component
 * Custom login form using Clerk hooks
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "../api";
import Link from "next/link";
import { VerificationStrategyError } from "./VerificationStrategyError";

type LoginFormProps = {
    onForgotPassword?: () => void;
};

export function LoginForm({ onForgotPassword }: LoginFormProps) {
    const { login, isLoading, isReady, error, clearError } = useLoginForm();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    const [showVerificationError, setShowVerificationError] = useState(false);

    const validateForm = (): boolean => {
        const errors: {[key: string]: string} = {};
        
        if (!identifier.trim()) {
            errors.identifier = "Email or username is required";
        } else if (identifier.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                errors.identifier = "Please enter a valid email address";
            }
        }
        
        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 1) {
            errors.password = "Password cannot be empty";
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) {
            return;
        }

        await login({ identifier, password });
    };

    const isSubmitDisabled = isLoading || !isReady || !identifier || !password;
    
    // Check if error is related to verification strategy
    const isVerificationStrategyError = error?.code === "verification_strategy_not_valid" || 
        error?.message?.includes("verification strategy is not valid");

    return (
        <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            {/* Verification Strategy Error */}
            {isVerificationStrategyError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <VerificationStrategyError 
                        message={error?.message}
                        onDismiss={() => setShowVerificationError(false)}
                    />
                </motion.div>
            )}

            {/* General Error Display */}
            {error && !isVerificationStrategyError && (
                <motion.div 
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {error.message}
                </motion.div>
            )}

            {/* Email/Username Input */}
            <motion.div 
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
            >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
                <motion.input
                    type="text"
                    placeholder="Email or Username"
                    value={identifier}
                    onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (fieldErrors.identifier) {
                            setFieldErrors(prev => ({ ...prev, identifier: '' }));
                        }
                    }}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 ${
                        fieldErrors.identifier 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-300 focus:border-green-500 hover:border-gray-400'
                    }`}
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.identifier}
                    aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", duration: 0.2 }}
                />
                {fieldErrors.identifier && (
                    <motion.p 
                        id="identifier-error" 
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="text-xs">●</span>
                        {fieldErrors.identifier}
                    </motion.p>
                )}
            </motion.div>

            {/* Password Input */}
            <motion.div 
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200" />
                <motion.input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                            setFieldErrors(prev => ({ ...prev, password: '' }));
                        }
                    }}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 ${
                        fieldErrors.password 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-300 focus:border-green-500 hover:border-gray-400'
                    }`}
                    autoComplete="current-password"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", duration: 0.2 }}
                />
                <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", duration: 0.1 }}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </motion.button>
                {fieldErrors.password && (
                    <motion.p 
                        id="password-error" 
                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="text-xs">●</span>
                        {fieldErrors.password}
                    </motion.p>
                )}
            </motion.div>

            {/* Forgot Password Link */}
            {onForgotPassword && (
                <motion.div 
                    className="text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.35 }}
                >
                    <motion.button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-green-500 underline text-sm hover:text-green-600 transition-all duration-200 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.2 }}
                    >
                        Forgot your Password?
                    </motion.button>
                </motion.div>
            )}

            {/* Sign Up Link */}
            <motion.div 
                className="text-center pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.4 }}
            >
                <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
                <motion.div
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.2 }}
                >
                    <Link 
                        href="/sign-up" 
                        className="text-green-600 font-semibold text-sm hover:text-green-700 hover:underline transition-all duration-200 inline-flex items-center gap-1"
                    >
                        Sign Up
                        <motion.svg 
                            className="w-3 h-3" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            initial={{ x: 0 }}
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", duration: 0.2 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                whileHover={{ scale: isSubmitDisabled ? 1 : 1.02, y: isSubmitDisabled ? 0 : -2 }}
                whileTap={{ scale: isSubmitDisabled ? 1 : 0.98 }}
            >
                {isLoading ? (
                    <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Logging in...
                    </motion.div>
                ) : (
                    <span className="flex items-center gap-2">
                        Log In
                        <motion.svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            initial={{ x: 0 }}
                            whileHover={{ x: 3 }}
                            transition={{ type: "spring", duration: 0.2 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </motion.svg>
                    </span>
                )}
            </motion.button>
        </motion.form>
    );
}
