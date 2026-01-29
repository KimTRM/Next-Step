"use client";

/**
 * SignUpForm Component
 * Custom sign-up form using Clerk hooks
 * Includes organization creation during sign-up
 */

import { useState } from "react";
import { Lock, Mail, UserRound, Building2, Loader2 } from "lucide-react";
import { useSignUpForm } from "../api";
import { EmailVerification } from "./EmailVerification";

export function SignUpForm() {
    const {
        register,
        verifyEmail,
        resendCode,
        isLoading,
        isReady,
        error,
        clearError,
        pendingVerification,
    } = useSignUpForm();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [organizationName, setOrganizationName] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateForm = (): boolean => {
        setValidationError(null);

        if (!firstName.trim()) {
            setValidationError("First name is required");
            return false;
        }

        if (!lastName.trim()) {
            setValidationError("Last name is required");
            return false;
        }

        if (!username.trim()) {
            setValidationError("Username is required");
            return false;
        }

        // Username validation - alphanumeric and underscores only, 3-20 characters
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            setValidationError("Username must be 3-20 characters and contain only letters, numbers, and underscores");
            return false;
        }

        if (!email.trim()) {
            setValidationError("Email is required");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError("Please enter a valid email address");
            return false;
        }

        if (password.length < 8) {
            setValidationError("Password must be at least 8 characters");
            return false;
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match");
            return false;
        }

        if (!organizationName.trim()) {
            setValidationError("Organization name is required");
            return false;
        }

        if (organizationName.trim().length < 2) {
            setValidationError("Organization name must be at least 2 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!validateForm()) {
            return;
        }

        await register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            username: username.trim(),
            organizationName: organizationName.trim(),
        });
    };

    // Show email verification form if pending
    if (pendingVerification) {
        return (
            <EmailVerification
                email={email}
                onVerifyAction={verifyEmail}
                onResendAction={resendCode}
                isLoading={isLoading}
                error={error}
            />
        );
    }

    const isSubmitDisabled =
        isLoading ||
        !isReady ||
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !username ||
        !organizationName;

    const displayError = validationError || error?.message;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {displayError}
                </div>
            )}

            {/* Name Input */}
            <div className="relative">
                <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="given-name"
                />
            </div>

            {/* Last Name Input */}
            <div className="relative">
                <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="family-name"
                />
            </div>

            {/* Username Input */}
            <div className="relative">
                <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="username"
                />
            </div>

            {/* Email Input */}
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    autoComplete="new-password"
                />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="new-password"
                />
            </div>

            {/* Organization Name Input */}
            <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Organization Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="organization"
                />
            </div>

            {/* Password Requirements Hint */}
            <p className="text-xs text-gray-500">
                Password must be at least 8 characters long
            </p>

            {/* Clerk CAPTCHA mount point */}
            <div id="clerk-captcha" />

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Sign Up"
                )}
            </button>
        </form>
    );
}
