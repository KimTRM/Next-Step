"use client";

/**
 * LoginForm Component
 * Custom login form using Clerk hooks with 2FA support
 */

import { useState } from "react";
import { Lock, Mail, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useLoginForm } from "../api";
import Link from "next/link";
import { VerificationStrategyError } from "./VerificationStrategyError";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";

type LoginFormProps = {
  onForgotPassword?: () => void;
};

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const {
    login,
    verifyTwoFactor,
    resendTwoFactorCode,
    isLoading,
    isReady,
    error,
    clearError,
    pendingTwoFactor
  } = useLoginForm();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [showVerificationError, setShowVerificationError] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!identifier.trim()) {
      errors.identifier = "Email or username is required";
    } else if (identifier.includes("@")) {
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

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setResendStatus(null);

    if (!twoFactorCode.trim()) {
      setFieldErrors({ twoFactorCode: "Verification code is required" });
      return;
    }

    await verifyTwoFactor(twoFactorCode);
  };

  const handleResendCode = async () => {
    setResendStatus(null);
    const result = await resendTwoFactorCode();
    if (result.success) {
      setResendStatus("Code sent! Check your email.");
    } else {
      setResendStatus("Failed to resend code. Try again.");
    }
  };

  const isSubmitDisabled = isLoading || !isReady || !identifier || !password;
  const isTwoFactorSubmitDisabled = isLoading || !isReady || !twoFactorCode;

  // Check if error is related to verification strategy
  const isVerificationStrategyError =
    error?.code === "verification_strategy_not_valid" ||
    error?.message?.includes("verification strategy is not valid");

  // If pending 2FA, show the verification code form
  if (pendingTwoFactor) {
    return (
      <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
        {/* Debug button */}
        <button
          type="button"
          onClick={() => {
            console.log("=== DEBUG AUTH STATE ===");
            console.log("isReady:", isReady);
            console.log("isLoading:", isLoading);
            console.log("pendingTwoFactor:", pendingTwoFactor);
            console.log("error:", error);
            console.log("cookies:", document.cookie);
            alert("Check browser console for debug info");
          }}
          className="text-xs text-gray-400 underline"
        >
          [Debug: Show Auth State]
        </button>

        {/* Info message */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-medium">Verification code sent!</p>
          <p className="mt-1">We&apos;ve sent a verification code to your email. Please enter it below.</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error.message}
          </div>
        )}

        {/* Resend Status */}
        {resendStatus && (
          <div className={`px-4 py-3 rounded-lg text-sm ${resendStatus.includes("sent")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-yellow-50 border border-yellow-200 text-yellow-700"
            }`}>
            {resendStatus}
          </div>
        )}

        {/* Verification Code Input */}
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
          <input
            type="text"
            placeholder="Verification Code"
            value={twoFactorCode}
            onChange={(e) => {
              setTwoFactorCode(e.target.value);
              if (fieldErrors.twoFactorCode) {
                setFieldErrors((prev) => ({ ...prev, twoFactorCode: "" }));
              }
            }}
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 text-center tracking-widest text-lg ${fieldErrors.twoFactorCode
              ? "border-red-300 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:border-green-500 hover:border-gray-400"
              }`}
            autoComplete="one-time-code"
            autoFocus
          />
          {fieldErrors.twoFactorCode && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="text-xs">●</span>
              {fieldErrors.twoFactorCode}
            </p>
          )}
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="text-green-500 underline text-sm hover:text-green-600 transition-colors duration-200 disabled:opacity-50"
          >
            Didn&apos;t receive the code? Resend
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTwoFactorSubmitDisabled}
          className="w-1/2 mx-auto bg-[#FAFAFA] hover:bg-green-600 hover:text-[#FAFAFA] text-[#198754] font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-1 border-[#DFEBE1] focus:ring-inset-2 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </div>
          ) : (
            <span className="flex items-center gap-2">
              Verify
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Verification Strategy Error */}
      {isVerificationStrategyError && (
        <div>
          <VerificationStrategyError
            message={error?.message}
            onDismiss={() => setShowVerificationError(false)}
          />
        </div>
      )}

      {/* General Error Display */}
      {error && !isVerificationStrategyError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error.message}
        </div>
      )}

      {/* Email/Username Input */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282] transition-colors duration-200" />
        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (fieldErrors.identifier) {
              setFieldErrors((prev) => ({ ...prev, identifier: "" }));
            }
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-4 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.identifier
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="email"
          aria-invalid={!!fieldErrors.identifier}
          aria-describedby={
            fieldErrors.identifier ? "identifier-error" : undefined
          }
        />
        {fieldErrors.identifier && (
          <p
            id="identifier-error"
            className="mt-1 text-sm text-red-600 flex items-center gap-1"
          >
            <span className="text-xs">●</span>
            {fieldErrors.identifier}
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
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: "" }));
            }
          }}
          disabled={isLoading}
          className={`w-full pl-10 pr-12 py-3 rounded-lg disabled:bg-gray-100 bg-[#EAEAEA] text-[#828282] disabled:cursor-not-allowed transition-colors duration-200 ${fieldErrors.password
            ? "border-red-300 focus:ring-red-500 bg-red-50"
            : "border-gray-300 focus:border-green-500 hover:border-gray-400"
            }`}
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5 text-[#828282]" />
          ) : (
            <Eye className="w-5 h-5 text-[#828282]" />
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

      {/* Forgot Password Link */}
      {onForgotPassword && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-green-500 underline text-sm hover:text-green-600 transition-colors duration-200"
          >
            Forgot your Password?
          </button>
        </div>
      )}

      {/* Sign Up Link */}
      {isMobile || isTablet ? (
        <div className="text-center pt-2">
          <span className="text-gray-600 text-sm">
            Don&apos;t have an account?{" "}
          </span>
          <Link
            href="/sign-up"
            className="text-green-600 font-semibold text-sm hover:text-green-700 hover:underline transition-colors duration-200 inline-flex items-center gap-1"
          >
            Sign Up
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
        className="w-1/2 mx-auto bg-[#FAFAFA] hover:bg-green-600 hover:text-[#FAFAFA] text-[#198754] font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-1 border-[#DFEBE1] focus:ring-inset-2 shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Logging in...
          </div>
        ) : (
          <span className="flex items-center gap-2">
            Log In
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
