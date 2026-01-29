"use client";

/**
 * Auth Feature - API Layer
 * Wraps Clerk hooks for authentication
 */

import {
    useSignIn,
    useSignUp,
    useClerk,
    useAuth as useClerkAuth,
} from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef } from "react";
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
    const { isSignedIn } = useClerkAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);

    const login = useCallback(
        async (data: LoginFormData) => {
            if (!isLoaded || !signIn) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
            }

            // Check if user is already signed in
            if (isSignedIn) {
                // Redirect to intended destination or dashboard
                const redirectUrl =
                    searchParams.get("redirect_url") || "/dashboard";
                // Use replace to prevent back navigation to auth page
                router.replace(redirectUrl);
                return { success: true, error: null };
            }

            setIsLoading(true);
            setError(null);

            try {
                // Attempt to create the sign-in session
                const attemptSignIn = async () =>
                    signIn.create({
                        identifier: data.identifier,
                        password: data.password,
                    });

                let result;

                try {
                    result = await attemptSignIn();
                } catch (err: unknown) {
                    // If Clerk reports 'already signed in', handle session desync
                    const clerkError = err as {
                        errors?: Array<{
                            code: string;
                            message: string;
                            longMessage?: string;
                        }>;
                        message?: string;
                    };

                    // Build error string from all possible sources
                    const first = clerkError.errors?.[0];
                    const errString = String(err).toLowerCase();
                    const errorMessage = (first?.message || first?.longMessage || clerkError.message || "").toLowerCase();

                    // Check for "already signed in" in multiple places
                    const isAlreadySignedIn =
                        first?.code === "user_already_signed_in" ||
                        errorMessage.includes("already signed in") ||
                        errString.includes("already signed in");

                    if (isAlreadySignedIn) {
                        console.warn(
                            "Login: detected already-signed-in server state. Triggering page reload to sync session.",
                        );
                        // User is already signed in on server but client is desynced
                        // Force a full page reload to let ClerkProvider reinitialize
                        if (typeof window !== "undefined") {
                            const redirectUrl =
                                searchParams.get("redirect_url") || "/dashboard";
                            window.location.href = redirectUrl;
                        }
                        return { success: true, error: null };
                    } else {
                        // Re-throw to be handled in outer catch
                        throw err;
                    }
                }

                if (result.status === "complete") {
                    await setActive({ session: result.createdSessionId });

                    // Redirect to intended destination or dashboard
                    const redirectUrl =
                        searchParams.get("redirect_url") || "/dashboard";
                    // Use replace to prevent back navigation to auth page
                    router.replace(redirectUrl);

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
                console.error("Login error:", err);
                const clerkError = err as {
                    errors?: Array<{
                        code: string;
                        message: string;
                        longMessage?: string;
                        meta?: { paramName?: string };
                    }>;
                };

                let errorMessage = "An error occurred during login";
                let errorCode = "unknown_error";

                if (clerkError.errors?.[0]) {
                    const error = clerkError.errors[0];
                    errorCode = error.code;
                    errorMessage = error.longMessage || error.message;

                    // Handle verification strategy error
                    if (error.code === "verification_strategy_not_valid" || 
                        errorMessage.includes("verification strategy is not valid")) {
                        errorMessage = "This account requires a different verification method. Please try signing in with OAuth or contact support.";
                    }
                    // Provide more specific messages for common errors
                    else if (error.code === "form_identifier_not_found") {
                        errorMessage =
                            "No account found with this email address. Please sign up first.";
                    } else if (error.code === "form_password_incorrect") {
                        errorMessage = "Incorrect password. Please try again.";
                    } else if (error.code === "too_many_attempts") {
                        errorMessage =
                            "Too many login attempts. Please wait before trying again.";
                    } else if (
                        error.message?.includes("already signed in") ||
                        error.code === "user_already_signed_in"
                    ) {
                        errorMessage =
                            "You are already signed in. Redirecting to dashboard...";
                        // Auto-redirect after a short delay
                        setTimeout(() => {
                            const redirectUrl =
                                searchParams.get("redirect_url") ||
                                "/dashboard";
                            router.replace(redirectUrl);
                        }, 1500);
                    }
                }

                const authError: AuthError = {
                    code: errorCode,
                    message: errorMessage,
                    field: clerkError.errors?.[0]?.meta?.paramName,
                };
                setError(authError);
                return { success: false, error: authError };
            } finally {
                setIsLoading(false);
            }
        },
        [isLoaded, signIn, setActive, router, searchParams, isSignedIn],
    );

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
 * Includes organization creation after verification
 */
export function useSignUpForm() {
    const { signUp, isLoaded, setActive } = useSignUp();
    const clerk = useClerk();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);
    const [pendingVerification, setPendingVerification] = useState(false);

    // Guards against duplicate submissions
    const isSubmittingRef = useRef(false);
    const isVerifyingRef = useRef(false);

    // Store organization name for creation after verification
    const organizationNameRef = useRef<string>("");

    const register = useCallback(
        async (data: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            username: string;
            organizationName: string;
        }) => {
            if (!isLoaded || !signUp) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
            }

            // Validate organization name
            if (!data.organizationName?.trim()) {
                return {
                    success: false,
                    error: {
                        code: "missing_organization",
                        message: "Organization name is required",
                        field: "organizationName",
                    },
                };
            }

            // Prevent double submission
            if (isSubmittingRef.current) {
                return {
                    success: false,
                    error: {
                        code: "in_progress",
                        message: "Registration in progress",
                    },
                };
            }
            isSubmittingRef.current = true;

            setIsLoading(true);
            setError(null);

            try {
                // Store organization name for later creation
                organizationNameRef.current = data.organizationName.trim();

                await signUp.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    emailAddress: data.email,
                    password: data.password,
                });

                // Send email verification code
                await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                });

                setPendingVerification(true);

                return { success: true, error: null };
            } catch (err: unknown) {
                const clerkError = err as {
                    errors?: Array<{
                        code: string;
                        message: string;
                        longMessage?: string;
                        meta?: { paramName?: string };
                    }>;
                };
                
                let errorMessage = "An error occurred during sign up";
                let errorCode = "unknown_error";
                
                if (clerkError.errors?.[0]) {
                    const error = clerkError.errors[0];
                    errorCode = error.code;
                    errorMessage = error.longMessage || error.message;
                    
                    // Handle verification strategy error
                    if (error.code === "verification_strategy_not_valid" || 
                        errorMessage.includes("verification strategy is not valid")) {
                        errorMessage = "Email verification is not available for this account. Please try signing up with OAuth or contact support.";
                    }
                    // Handle email already exists
                    else if (error.code === "form_identifier_exists") {
                        errorMessage = "An account with this email already exists. Please sign in instead.";
                    }
                    // Handle username already exists
                    else if (error.code === "form_username_exists") {
                        errorMessage = "This username is already taken. Please choose another one.";
                    }
                }
                
                const authError: AuthError = {
                    code: errorCode,
                    message: errorMessage,
                    field: clerkError.errors?.[0]?.meta?.paramName,
                };
                setError(authError);
                return { success: false, error: authError };
            } finally {
                setIsLoading(false);
                isSubmittingRef.current = false;
            }
        },
        [isLoaded, signUp],
    );

    /**
     * Creates organization after user is authenticated
     * Called internally after successful verification
     */
    const createOrganization = useCallback(async (): Promise<{ success: boolean; error: AuthError | null }> => {
        const orgName = organizationNameRef.current;

        if (!orgName) {
            return { success: true, error: null }; // No org to create
        }

        try {
            await clerk.createOrganization({ name: orgName });
            organizationNameRef.current = ""; // Clear after successful creation
            return { success: true, error: null };
        } catch (err: unknown) {
            console.error("Failed to create organization:", err);
            const clerkError = err as {
                errors?: Array<{ code: string; message: string }>;
            };
            // Don't fail sign-up if org creation fails - user can create later
            // Just log the error and continue
            return {
                success: false,
                error: {
                    code: clerkError.errors?.[0]?.code || "org_creation_failed",
                    message: clerkError.errors?.[0]?.message || "Failed to create organization",
                },
            };
        }
    }, [clerk]);

    const verifyEmail = useCallback(
        async (code: string) => {
            if (!isLoaded || !signUp) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
            }

            // Validate code format
            if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
                return {
                    success: false,
                    error: {
                        code: "invalid_code_format",
                        message: "Verification code must be 6 digits",
                    },
                };
            }

            // Check if sign-up is already complete
            if (signUp.status === "complete" && signUp.createdSessionId) {
                try {
                    await setActive({ session: signUp.createdSessionId });
                    router.replace("/onboarding");
                    return { success: true, error: null };
                } catch (sessionError) {
                    console.error("Failed to activate completed session:", sessionError);
                    // Session activation failed - redirect to sign in
                    setError({
                        code: "session_activation_failed",
                        message: "Account created but session failed. Please sign in.",
                    });
                    // Auto-redirect to login after delay
                    setTimeout(() => router.replace("/auth"), 2000);
                    return {
                        success: false,
                        error: {
                            code: "session_activation_failed",
                            message: "Account created but session failed. Please sign in.",
                        },
                    };
                }
            }

            // Check if email is already verified
            if (signUp.verifications?.emailAddress?.status === "verified") {
                // If session exists, complete sign-up
                if (signUp.createdSessionId) {
                    try {
                        await setActive({ session: signUp.createdSessionId });
                        router.replace("/onboarding");
                        return { success: true, error: null };
                    } catch (sessionError) {
                        console.error(
                            "Failed to set active session for already verified email:",
                            sessionError,
                        );
                        // Session activation failed - redirect to sign in
                        setError({
                            code: "session_activation_failed",
                            message: "Session failed. Redirecting to sign in...",
                        });
                        setTimeout(() => router.replace("/auth"), 2000);
                        return {
                            success: false,
                            error: {
                                code: "session_activation_failed",
                                message: "Session failed. Redirecting to sign in...",
                            },
                        };
                    }
                }
                // No session available, prompt user to sign in
                setError({
                    code: "already_verified",
                    message:
                        "Email already verified. Redirecting to sign in...",
                });
                // Auto-redirect to login after a short delay
                setTimeout(() => router.replace("/auth"), 2000);
                return {
                    success: false,
                    error: {
                        code: "already_verified",
                        message:
                            "Email already verified. Redirecting to sign in...",
                    },
                };
            }

            // Prevent duplicate verification attempts
            if (isVerifyingRef.current) {
                return {
                    success: false,
                    error: {
                        code: "in_progress",
                        message: "Verification in progress",
                    },
                };
            }
            isVerifyingRef.current = true;

            setIsLoading(true);
            setError(null);

            try {
                const result = await signUp.attemptEmailAddressVerification({
                    code,
                });

                if (result.status === "complete") {
                    await setActive({ session: result.createdSessionId });

                    // Create organization after session is active
                    const orgResult = await createOrganization();
                    if (!orgResult.success) {
                        // Log but don't fail - user can create org later in onboarding
                        console.warn("Organization creation failed:", orgResult.error);
                    }

                    // Redirect to onboarding after successful sign up
                    router.replace("/onboarding");
                    return { success: true, error: null };
                } else {
                    console.warn("Verification result status:", result.status);
                    const authError: AuthError = {
                        code: result.status || "unknown",
                        message: `Verification status: ${result.status}. Please check your email for the correct code.`,
                    };
                    setError(authError);
                    return { success: false, error: authError };
                }
            } catch (err: unknown) {
                console.error("Email verification error:", err);
                const clerkError = err as {
                    errors?: Array<{
                        code: string;
                        message: string;
                        longMessage?: string;
                    }>;
                };

                let errorMessage = "Invalid verification code";
                let errorCode = "verification_error";

                if (clerkError.errors?.[0]) {
                    const error = clerkError.errors[0];
                    errorCode = error.code;
                    errorMessage = error.longMessage || error.message;
                    
                    // Handle verification strategy error
                    if (error.code === "verification_strategy_not_valid" || 
                        errorMessage.includes("verification strategy is not valid")) {
                        errorMessage = "Email verification is not available for this account. Please try signing in with OAuth or contact support.";
                    }
                    // Handle case where verification is already completed
                    else if (
                        error.message?.includes("already been verified") ||
                        error.longMessage?.includes("already been verified")
                    ) {
                        // Try to complete the sign-up since verification is already done
                        if (signUp.createdSessionId) {
                            try {
                                await setActive({
                                    session: signUp.createdSessionId,
                                });
                                router.replace("/onboarding");
                                return { success: true, error: null };
                            } catch (sessionError) {
                                console.error(
                                    "Failed to set active session:",
                                    sessionError,
                                );
                            }
                        }
                        // If we can't set the session, redirect to sign in
                        errorMessage =
                            "Email already verified. Redirecting to sign in...";
                        errorCode = "already_verified";
                        setError({ code: errorCode, message: errorMessage });
                        // Auto-redirect to login after a short delay
                        setTimeout(() => router.replace("/auth"), 2000);
                        return {
                            success: false,
                            error: { code: errorCode, message: errorMessage },
                        };
                    }
                    // Provide more specific messages for common errors
                    else if (error.code === "verification_code_expired") {
                        errorMessage =
                            "Verification code has expired. Please request a new code.";
                    } else if (error.code === "verification_code_invalid") {
                        errorMessage =
                            "Invalid verification code. Please check the code and try again.";
                    } else if (error.code === "too_many_attempts") {
                        errorMessage =
                            "Too many verification attempts. Please wait before trying again.";
                    }
                }

                const authError: AuthError = {
                    code: errorCode,
                    message: errorMessage,
                };
                setError(authError);
                return { success: false, error: authError };
            } finally {
                setIsLoading(false);
                isVerifyingRef.current = false;
            }
        },
        [isLoaded, signUp, setActive, router, createOrganization],
    );

    const resendCode = useCallback(async () => {
        if (!isLoaded || !signUp) {
            return {
                success: false,
                error: { code: "not_ready", message: "Auth not loaded" },
            };
        }

        setIsLoading(true);
        setError(null);

        try {
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });
            return { success: true, error: null };
        } catch (err: unknown) {
            const clerkError = err as {
                errors?: Array<{ 
                    code: string; 
                    message: string; 
                    longMessage?: string;
                }>;
            };
            
            let errorMessage = "Failed to resend verification code";
            let errorCode = "resend_error";
            
            if (clerkError.errors?.[0]) {
                const error = clerkError.errors[0];
                errorCode = error.code;
                errorMessage = error.longMessage || error.message;
                
                // Handle verification strategy error
                if (error.code === "verification_strategy_not_valid" || 
                    errorMessage.includes("verification strategy is not valid")) {
                    errorMessage = "Email verification is not available for this account. Please try signing in with OAuth or contact support.";
                }
            }
            
            const authError: AuthError = {
                code: errorCode,
                message: errorMessage,
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

    const signUpWithOAuth = useCallback(
        async (provider: OAuthProvider) => {
            if (!isLoaded || !signUp) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
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
                const clerkError = err as {
                    errors?: Array<{ code: string; message: string }>;
                };
                const authError: AuthError = {
                    code: clerkError.errors?.[0]?.code || "oauth_error",
                    message:
                        clerkError.errors?.[0]?.message ||
                        "OAuth sign up failed",
                };
                setError(authError);
                setIsLoading(false);
                return { success: false, error: authError };
            }
        },
        [isLoaded, signUp],
    );

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

    const loginWithOAuth = useCallback(
        async (provider: OAuthProvider) => {
            if (!isLoaded || !signIn) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
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
                const clerkError = err as {
                    errors?: Array<{ code: string; message: string }>;
                };
                const authError: AuthError = {
                    code: clerkError.errors?.[0]?.code || "oauth_error",
                    message:
                        clerkError.errors?.[0]?.message || "OAuth login failed",
                };
                setError(authError);
                setIsLoading(false);
                return { success: false, error: authError };
            }
        },
        [isLoaded, signIn],
    );

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
