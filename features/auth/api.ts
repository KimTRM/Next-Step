"use client";

/**
 * Auth Feature - API Layer
 * Wraps Clerk hooks for authentication and Convex user operations
 */

import {
    useSignIn,
    useSignUp,
    useClerk,
    useAuth as useClerkAuth,
} from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { LoginFormData, AuthError, OAuthProvider } from "./types";

// ============================================
// CONVEX DATA HOOKS (for internal use in auth feature)
// ============================================

/** Get current authenticated user from Convex */
export function useCurrentUser() {
    const { isLoaded, isSignedIn } = useClerkAuth();
    return useQuery(
        api.users.index.getCurrentUser,
        isLoaded && isSignedIn ? {} : "skip",
    );
}

/** Mutation to upsert user data */
export function useUpsertUser() {
    return useMutation(api.users.index.upsertUser);
}

/** Type export for user document */
export type { Doc };

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
 * Supports 2FA via email code
 */
export function useLoginForm() {
    const { signIn, isLoaded, setActive } = useSignIn();
    const { isSignedIn } = useClerkAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);
    const [pendingTwoFactor, setPendingTwoFactor] = useState(false);

    // Ref to prevent multiple simultaneous login attempts
    const loginInProgressRef = useRef(false);

    const login = useCallback(
        async (data: LoginFormData) => {
            // Prevent multiple simultaneous submissions
            if (loginInProgressRef.current || isLoading) {
                console.log("[Login] Already in progress, ignoring...");
                return { success: false, error: null };
            }

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

            // Mark login as in progress immediately
            loginInProgressRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                // Step 1: Create the sign-in attempt with identifier
                console.log("[Login] Creating sign-in attempt...");
                let result = await signIn.create({
                    identifier: data.identifier,
                });

                // Step 2: If needs first factor, attempt password verification
                if (result.status === "needs_first_factor") {
                    console.log("[Login] Attempting password verification...");
                    result = await signIn.attemptFirstFactor({
                        strategy: "password",
                        password: data.password,
                    });
                }

                // Step 3: Handle the result
                if (result.status === "complete") {
                    console.log(
                        "[Login] Sign-in complete! Session ID:",
                        result.createdSessionId,
                    );

                    console.log("[Login] Setting active session...");

                    const redirectUrl =
                        searchParams.get("redirect_url") || "/dashboard";

                    // Set the session active and navigate
                    // Using beforeEmit ensures navigation happens after session is fully established
                    await setActive({
                        session: result.createdSessionId,
                        beforeEmit: async () => {
                            console.log(
                                "[Login] Session established. Navigating to:",
                                redirectUrl,
                            );
                            router.replace(redirectUrl);
                        },
                    });

                    // Keep loginInProgressRef true to prevent any further attempts
                    // Don't reset isLoading - we're navigating away

                    return { success: true, error: null };
                } else if (result.status === "needs_second_factor") {
                    // Check what second factors are available
                    const secondFactors = result.supportedSecondFactors;
                    console.log(
                        "[Login] Second factors available:",
                        secondFactors,
                    );

                    // Try to prepare email code verification
                    const emailFactor = secondFactors?.find(
                        (factor: { strategy: string }) =>
                            factor.strategy === "email_code",
                    );

                    if (emailFactor) {
                        console.log("[Login] Preparing email code 2FA...");
                        await signIn.prepareSecondFactor({
                            strategy: "email_code",
                        });
                        setPendingTwoFactor(true);
                        // Reset ref - user needs to enter 2FA code
                        loginInProgressRef.current = false;
                        return {
                            success: true,
                            error: null,
                            pendingTwoFactor: true,
                        };
                    } else {
                        // Check for other 2FA methods (TOTP, SMS, etc.)
                        const availableMethods =
                            secondFactors
                                ?.map((f: { strategy: string }) => f.strategy)
                                .join(", ") || "unknown";
                        const authError: AuthError = {
                            code: "needs_second_factor",
                            message: `Two-factor authentication required. Available methods: ${availableMethods}`,
                        };
                        setError(authError);
                        loginInProgressRef.current = false;
                        return { success: false, error: authError };
                    }
                } else {
                    // Handle other statuses
                    console.warn("[Login] Unexpected status:", result.status);
                    const authError: AuthError = {
                        code: result.status || "unknown",
                        message: `Login incomplete. Status: ${result.status}`,
                    };
                    setError(authError);
                    loginInProgressRef.current = false;
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
                    message?: string;
                };

                // Check for "already signed in" error
                const first = clerkError.errors?.[0];
                const errString = String(err).toLowerCase();
                const rawErrorMessage = (
                    first?.message ||
                    first?.longMessage ||
                    clerkError.message ||
                    ""
                ).toLowerCase();

                const isAlreadySignedIn =
                    first?.code === "user_already_signed_in" ||
                    rawErrorMessage.includes("already signed in") ||
                    errString.includes("already signed in");

                if (isAlreadySignedIn) {
                    console.log(
                        "[Login] Server says already signed in - redirecting to dashboard...",
                    );
                    // The user has a valid session on the server side
                    // Just redirect them to where they wanted to go
                    const redirectUrl =
                        searchParams.get("redirect_url") || "/dashboard";
                    router.replace(redirectUrl);
                    return { success: true, error: null };
                }

                let errorMessage = "An error occurred during login";
                let errorCode = "unknown_error";

                if (clerkError.errors?.[0]) {
                    const error = clerkError.errors[0];
                    errorCode = error.code;
                    errorMessage = error.longMessage || error.message;

                    // Handle verification strategy error
                    if (
                        error.code === "verification_strategy_not_valid" ||
                        errorMessage.includes(
                            "verification strategy is not valid",
                        )
                    ) {
                        errorMessage =
                            "This account requires a different verification method. Please try signing in with OAuth or contact support.";
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
                        // Auto-redirect after a short delay using router
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
                // Reset the ref so user can try again after an error
                loginInProgressRef.current = false;
                return { success: false, error: authError };
            } finally {
                setIsLoading(false);
            }
        },
        [
            isLoaded,
            signIn,
            setActive,
            router,
            searchParams,
            isSignedIn,
            isLoading,
        ],
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const verifyTwoFactor = useCallback(
        async (code: string) => {
            if (!isLoaded || !signIn) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
                };
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log("[Login] Verifying 2FA code...");
                const result = await signIn.attemptSecondFactor({
                    strategy: "email_code",
                    code,
                });

                console.log(
                    "[Login] 2FA result:",
                    JSON.stringify({
                        status: result.status,
                        sessionId: result.createdSessionId,
                    }),
                );

                if (result.status === "complete") {
                    console.log(
                        "[Login] 2FA complete! Session ID:",
                        result.createdSessionId,
                    );

                    setPendingTwoFactor(false);

                    console.log(
                        "[Login] Authentication successful, preparing redirect...",
                    );

                    const redirectUrl =
                        searchParams.get("redirect_url") || "/dashboard";

                    // Set the session active and navigate
                    // Using beforeEmit ensures navigation happens after session is fully established
                    await setActive({
                        session: result.createdSessionId,
                        beforeEmit: async () => {
                            console.log(
                                "[Login] Session established. Navigating to:",
                                redirectUrl,
                            );
                            router.replace(redirectUrl);
                        },
                    });

                    return { success: true, error: null };
                } else {
                    setIsLoading(false);
                    console.log(
                        "[Login] Unexpected status after 2FA:",
                        result.status,
                    );
                    const authError: AuthError = {
                        code: "verification_incomplete",
                        message: `Verification incomplete. Status: ${result.status}`,
                    };
                    setError(authError);
                    return { success: false, error: authError };
                }
            } catch (err: unknown) {
                setIsLoading(false);
                console.error("[Login] 2FA verification error:", err);

                // Parse the error
                const clerkError = err as {
                    errors?: Array<{
                        code: string;
                        message: string;
                        longMessage?: string;
                    }>;
                };

                let errorMessage = "Invalid verification code";
                let errorCode = "verification_failed";

                if (clerkError.errors?.[0]) {
                    const error = clerkError.errors[0];
                    errorCode = error.code;
                    errorMessage = error.longMessage || error.message;

                    if (error.code === "form_code_incorrect") {
                        errorMessage =
                            "Incorrect code. Please check your email and try again.";
                    }
                }

                const authError: AuthError = {
                    code: errorCode,
                    message: errorMessage,
                };
                setError(authError);
                return { success: false, error: authError };
            }
        },
        [isLoaded, signIn, setActive, searchParams, router],
    );

    const resendTwoFactorCode = useCallback(async () => {
        if (!isLoaded || !signIn) {
            return {
                success: false,
                error: { code: "not_ready", message: "Auth not loaded" },
            };
        }

        try {
            console.log("[Login] Resending 2FA code...");
            await signIn.prepareSecondFactor({ strategy: "email_code" });
            return { success: true, error: null };
        } catch (err: unknown) {
            console.error("[Login] Resend 2FA code error:", err);
            return {
                success: false,
                error: {
                    code: "resend_failed",
                    message: "Failed to resend code",
                },
            };
        }
    }, [isLoaded, signIn]);

    return {
        login,
        verifyTwoFactor,
        resendTwoFactorCode,
        isLoading,
        isReady: isLoaded,
        error,
        clearError,
        pendingTwoFactor,
    };
}

// ============================================
// SIGN UP HOOK
// ============================================

/**
 * Hook for handling sign up with email/password
 * Collects firstName, lastName, username, email, and password (required by Clerk)
 * Organization is collected during onboarding
 * @param onUserCreated - Optional callback to sync user to Convex after successful verification
 */
export function useSignUpForm(
    onUserCreated?: (userData: {
        clerkId: string;
        email: string;
        name: string;
        avatarUrl?: string;
    }) => Promise<void>,
) {
    const { signUp, isLoaded, setActive } = useSignUp();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AuthError | null>(null);
    const [pendingVerification, setPendingVerification] = useState(false);

    // Guards against duplicate submissions
    const isSubmittingRef = useRef(false);
    const isVerifyingRef = useRef(false);

    const register = useCallback(
        async (data: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            username: string;
        }) => {
            if (!isLoaded || !signUp) {
                return {
                    success: false,
                    error: { code: "not_ready", message: "Auth not loaded" },
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
                    if (
                        error.code === "verification_strategy_not_valid" ||
                        errorMessage.includes(
                            "verification strategy is not valid",
                        )
                    ) {
                        errorMessage =
                            "Email verification is not available for this account. Please try signing up with OAuth or contact support.";
                    }
                    // Handle email already exists
                    else if (error.code === "form_identifier_exists") {
                        errorMessage =
                            "An account with this email already exists. Please sign in instead.";
                    }
                    // Handle username already exists
                    else if (error.code === "form_username_exists") {
                        errorMessage =
                            "This username is already taken. Please choose another one.";
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
                    setIsLoading(true);
                    console.log(
                        "[SignUp] Session already complete, activating session...",
                    );
                    await setActive({
                        session: signUp.createdSessionId,
                        beforeEmit: async () => {
                            console.log(
                                "[SignUp] Session activated. Navigating to /onboarding...",
                            );
                            router.replace("/onboarding");
                        },
                    });
                    return { success: true, error: null };
                } catch (sessionError) {
                    setIsLoading(false);
                    console.error(
                        "Failed to activate completed session:",
                        sessionError,
                    );
                    setError({
                        code: "session_activation_failed",
                        message:
                            "Account created but session failed. Please sign in.",
                    });
                    return {
                        success: false,
                        error: {
                            code: "session_activation_failed",
                            message:
                                "Account created but session failed. Please sign in.",
                        },
                    };
                }
            }

            // Check if email is already verified
            if (signUp.verifications?.emailAddress?.status === "verified") {
                // If session exists, complete sign-up
                if (signUp.createdSessionId) {
                    try {
                        setIsLoading(true);
                        console.log(
                            "[SignUp] Email already verified, activating session...",
                        );
                        await setActive({
                            session: signUp.createdSessionId,
                            beforeEmit: async () => {
                                console.log(
                                    "[SignUp] Session activated. Navigating to /onboarding...",
                                );
                                router.replace("/onboarding");
                            },
                        });
                        return { success: true, error: null };
                    } catch (sessionError) {
                        setIsLoading(false);
                        console.error(
                            "Failed to set active session for already verified email:",
                            sessionError,
                        );
                        setError({
                            code: "session_activation_failed",
                            message:
                                "Session failed. Please sign in to continue.",
                        });
                        return {
                            success: false,
                            error: {
                                code: "session_activation_failed",
                                message:
                                    "Session failed. Please sign in to continue.",
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
                // Auto-redirect to login after a short delay with redirect back to onboarding
                setTimeout(
                    () => router.replace("/auth?redirect_url=/onboarding"),
                    2000,
                );
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

                console.log("[SignUp] Verification result:", {
                    status: result.status,
                    createdSessionId: result.createdSessionId,
                });

                if (result.status === "complete") {
                    console.log("[SignUp] Setting active session...");

                    // Create user in Convex BEFORE redirect
                    if (
                        onUserCreated &&
                        signUp.firstName &&
                        signUp.emailAddress
                    ) {
                        try {
                            console.log("[SignUp] Creating user in Convex...");
                            await onUserCreated({
                                clerkId:
                                    result.createdUserId || signUp.id || "",
                                email: signUp.emailAddress,
                                name:
                                    [signUp.firstName, signUp.lastName]
                                        .filter(Boolean)
                                        .join(" ") ||
                                    signUp.emailAddress.split("@")[0],
                                avatarUrl: undefined,
                            });
                            console.log("[SignUp] User created in Convex");
                        } catch (convexError) {
                            console.error(
                                "[SignUp] Failed to create user in Convex:",
                                convexError,
                            );
                            // Continue anyway - AuthSyncProvider will handle it
                        }
                    }

                    // Activate session and navigate using Next.js router
                    // Using beforeEmit ensures navigation happens after session is fully established
                    console.log("[SignUp] Activating session...");
                    await setActive({
                        session: result.createdSessionId,
                        beforeEmit: async () => {
                            console.log(
                                "[SignUp] Session established. Navigating to /onboarding...",
                            );
                            router.replace("/onboarding");
                        },
                    });

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
                    if (
                        error.code === "verification_strategy_not_valid" ||
                        errorMessage.includes(
                            "verification strategy is not valid",
                        )
                    ) {
                        errorMessage =
                            "Email verification is not available for this account. Please try signing in with OAuth or contact support.";
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
                        // Auto-redirect to login after a short delay with redirect back to onboarding
                        setTimeout(
                            () =>
                                router.replace(
                                    "/auth?redirect_url=/onboarding",
                                ),
                            2000,
                        );
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
                // Reset loading and verifying state on error
                setIsLoading(false);
                isVerifyingRef.current = false;
                return { success: false, error: authError };
            }
            // Note: No finally block - success path keeps isLoading true until redirect
        },
        [isLoaded, signUp, setActive, onUserCreated, router],
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
                if (
                    error.code === "verification_strategy_not_valid" ||
                    errorMessage.includes("verification strategy is not valid")
                ) {
                    errorMessage =
                        "Email verification is not available for this account. Please try signing in with OAuth or contact support.";
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
