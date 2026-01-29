"use client";

/**
 * Auth Feature - API Layer
 * Wraps Clerk hooks for authentication
 */

import { useSignIn, useSignUp, useClerk, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import type { LoginFormData, AuthError, OAuthProvider } from "./types";

// ============================================
// CLERK AUTH STATE HOOK
// ============================================

/**
 * Hook to check Clerk authentication state
 */
export function useClerkAuthState() {
    const { isLoaded, isSignedIn, userId } = useClerkAuth();

    return {
        isLoaded,
        isSignedIn: isSignedIn ?? false,
        userId,
    };
}

// ============================================
// LOGIN HOOK
// ============================================

/**
 * Hook for handling login with email/password
 */
export function useLoginForm() {
    const { signIn, isLoaded, setActive } = useSignIn();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const login = useCallback(async (data: LoginFormData) => {
        if (!isLoaded || !signIn) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });

                // Redirect to intended destination or dashboard
                const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
                router.push(redirectUrl);

                return { success: true, error: null };
            } else {
                // Handle other statuses (needs_identifier, needs_factor, etc.)
                const authError: AuthError = {
                    code: result.status || "unknown",
                    message: "Additional verification required",
                };
                setError(authError);
                return { success: false, error: authError };
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string; meta?: { paramName?: string } }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "unknown_error",
                message: clerkError.errors?.[0]?.message || "An error occurred during login",
                field: clerkError.errors?.[0]?.meta?.paramName,
            };
            setError(authError);
            return { success: false, error: authError };
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, signIn, setActive, router, searchParams]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        login,
        isLoading,
        isReady: isLoaded,
        error,
        clearError,
    };
}

// ============================================
// SIGN UP HOOK
// ============================================

/**
 * Hook for handling sign up with email/password
 */
export function useSignUpForm() {
    const { signUp, isLoaded, setActive } = useSignUp();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);
    const [pendingVerification, setPendingVerification] = useState(false);

    const register = useCallback(async (data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }) => {
        if (!isLoaded || !signUp) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signUp.create({
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.email,
                password: data.password,
            });

            // Send email verification code
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);

            return { success: true, error: null };
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string; meta?: { paramName?: string } }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "unknown_error",
                message: clerkError.errors?.[0]?.message || "An error occurred during sign up",
                field: clerkError.errors?.[0]?.meta?.paramName,
            };
            setError(authError);
            return { success: false, error: authError };
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, signUp]);

    const verifyEmail = useCallback(async (code: string) => {
        if (!isLoaded || !signUp) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({ code });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                // Redirect to onboarding after successful sign up
                router.push("/onboarding");
                return { success: true, error: null };
            } else {
                const authError: AuthError = {
                    code: result.status || "unknown",
                    message: "Verification incomplete",
                };
                setError(authError);
                return { success: false, error: authError };
            }
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "verification_error",
                message: clerkError.errors?.[0]?.message || "Invalid verification code",
            };
            setError(authError);
            return { success: false, error: authError };
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, signUp, setActive, router]);

    const resendCode = useCallback(async () => {
        if (!isLoaded || !signUp) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            return { success: true, error: null };
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "resend_error",
                message: clerkError.errors?.[0]?.message || "Failed to resend verification code",
            };
            setError(authError);
            return { success: false, error: authError };
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, signUp]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        register,
        verifyEmail,
        resendCode,
        isLoading,
        isReady: isLoaded,
        error,
        clearError,
        pendingVerification,
    };
}

// ============================================
// OAUTH SIGN UP HOOK
// ============================================

/**
 * Hook for handling OAuth sign up
 */
export function useOAuthSignUp() {
    const { signUp, isLoaded } = useSignUp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const signUpWithOAuth = useCallback(async (provider: OAuthProvider) => {
        if (!isLoaded || !signUp) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signUp.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/onboarding",
            });

            return { success: true, error: null };
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "oauth_error",
                message: clerkError.errors?.[0]?.message || "OAuth sign up failed",
            };
            setError(authError);
            setIsLoading(false);
            return { success: false, error: authError };
        }
    }, [isLoaded, signUp]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        signUpWithOAuth,
        signUpWithGoogle: () => signUpWithOAuth("oauth_google"),
        signUpWithApple: () => signUpWithOAuth("oauth_apple"),
        signUpWithFacebook: () => signUpWithOAuth("oauth_facebook"),
        isLoading,
        isReady: isLoaded,
        error,
        clearError,
    };
}

// ============================================
// OAUTH HOOK
// ============================================

/**
 * Hook for handling OAuth authentication
 */
export function useOAuthLogin() {
    const { signIn, isLoaded } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
        if (!isLoaded || !signIn) {
            return { success: false, error: { code: "not_ready", message: "Auth not loaded" } };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signIn.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });

            return { success: true, error: null };
        } catch (err: unknown) {
            const clerkError = err as { errors?: Array<{ code: string; message: string }> };
            const authError: AuthError = {
                code: clerkError.errors?.[0]?.code || "oauth_error",
                message: clerkError.errors?.[0]?.message || "OAuth login failed",
            };
            setError(authError);
            setIsLoading(false);
            return { success: false, error: authError };
        }
    }, [isLoaded, signIn]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loginWithOAuth,
        loginWithGoogle: () => loginWithOAuth("oauth_google"),
        loginWithApple: () => loginWithOAuth("oauth_apple"),
        loginWithFacebook: () => loginWithOAuth("oauth_facebook"),
        isLoading,
        isReady: isLoaded,
        error,
        clearError,
    };
}

// ============================================
// SIGN OUT HOOK
// ============================================

/**
 * Hook for handling sign out
 */
export function useSignOut() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await signOut();
            router.push("/");
        } catch (err) {
            console.error("Sign out error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [signOut, router]);

    return {
        signOut: handleSignOut,
        isLoading,
    };
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    LoginFormData,
    SignUpFormData,
    AuthError,
    LoginState,
    SignUpState,
    OAuthProvider,
} from "./types";
