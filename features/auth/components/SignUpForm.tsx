"use client";

/**
 * SignUpForm Component
 * Collects essential auth fields including firstName and lastName (required by Clerk)
 * Organization is collected during onboarding
 */

import { useState, useCallback } from "react";
import {
  Lock,
  Mail,
  UserRound,
  User,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSignUpForm } from "../api";
import { EmailVerification } from "./EmailVerification";
import Link from "next/link";
import { VerificationStrategyError } from "./VerificationStrategyError";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SignUpForm() {
  // Convex mutation to create user after sign-up
  const createUserIfMissing = useMutation(api.users.index.createUserIfMissing);

  // Callback to sync user to Convex
  const handleUserCreated = useCallback(async (userData: {
    clerkId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }) => {
    await createUserIfMissing({
      clerkId: userData.clerkId,
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
    });
  }, [createUserIfMissing]);

  const {
    register,
    verifyEmail,
    resendCode,
    isLoading,
    isReady,
    error,
    clearError,
    pendingVerification,
  } = useSignUpForm(handleUserCreated);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!username.trim()) {
      errors.username = "Username is required";
    } else {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        errors.username =
          "Username must be 3-20 characters and contain only letters, numbers, and underscores";
      }
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    setValidationError(null);
    return Object.keys(errors).length === 0;
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
    !username;

  const displayError = validationError || error?.message;

  // Check if error is related to verification strategy
  const isVerificationStrategyError =
    error?.code === "verification_strategy_not_valid" ||
    error?.message?.includes("verification strategy is not valid");

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Verification Strategy Error */}
      {isVerificationStrategyError && (
        <div>
          <VerificationStrategyError
            message={error?.message}
            onDismiss={() => clearError()}
          />
        </div>
      )}

      {/* General Error Display */}
      {displayError && !isVerificationStrategyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {displayError}
        </div>
      )}

      {/* Name Row - First Name and Last Name */}
      <div className="flex gap-3">
        {/* First Name Input */}
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearFieldError("firstName");
            }}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.firstName
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:border-green-500 hover:border-gray-400"
              }`}
            autoComplete="given-name"
            aria-invalid={!!fieldErrors.firstName}
            aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
          />
          {fieldErrors.firstName && (
            <p
              id="firstName-error"
              className="mt-1 text-sm text-red-600 flex items-center gap-1"
            >
              <span className="text-xs">●</span>
              {fieldErrors.firstName}
            </p>
          )}
        </div>

        {/* Last Name Input */}
        <div className="relative flex-1">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearFieldError("lastName");
            }}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.lastName
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:border-green-500 hover:border-gray-400"
              }`}
            autoComplete="family-name"
            aria-invalid={!!fieldErrors.lastName}
            aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
          />
          {fieldErrors.lastName && (
            <p
              id="lastName-error"
              className="mt-1 text-sm text-red-600 flex items-center gap-1"
            >
              <span className="text-xs">●</span>
              {fieldErrors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Username Input */}
      <div className="relative">
        <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearFieldError("username");
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.username
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="username"
          aria-invalid={!!fieldErrors.username}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
        />
        {fieldErrors.username && (
          <p
            id="username-error"
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="text-xs">●</span>
            {fieldErrors.username}
          </p>
        )}
      </div>

      {/* Email Input */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError("email");
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.email
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="text-xs">●</span>
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password Input */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-12 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.password
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
        {fieldErrors.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="text-xs">●</span>
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError("confirmPassword");
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-12 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.confirmPassword
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="new-password"
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={
            fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          tabIndex={-1}
        >
          {showConfirmPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
        {fieldErrors.confirmPassword && (
          <p
            id="confirmPassword-error"
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="text-xs">●</span>
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Password Requirements Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700 font-medium mb-1">
          Password Requirements:
        </p>
        <ul className="text-xs text-blue-600 space-y-1">
          <li className="flex items-center gap-1">
            <span
              className={
                password.length >= 8 ? "text-green-600" : "text-blue-600"
              }
            >
              ●
            </span>
            At least 8 characters
          </li>
          <li className="flex items-center gap-1">
            <span
              className={
                password !== confirmPassword && confirmPassword
                  ? "text-red-600"
                  : password === confirmPassword && confirmPassword
                    ? "text-green-600"
                    : "text-blue-600"
              }
            >
              ●
            </span>
            Passwords must match
          </li>
        </ul>
      </div>

      {/* Clerk CAPTCHA mount point */}
      <div id="clerk-captcha" />

      {/* Login Link */}
      {isMobile || isTablet ? (
        <div className="text-center pt-2">
          <span className="text-gray-600 text-sm">
            Already have an account?{" "}
          </span>
          <Link
            href="/auth"
            className="text-green-600 font-semibold text-sm hover:text-green-700 hover:underline transition-colors duration-200 inline-flex items-center gap-1"
          >
            Log In
            <svg
              className="w-3 h-3 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      ) : null}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </div>
        ) : (
          <span className="flex items-center gap-2">
            Sign Up
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
