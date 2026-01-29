/**
 * Auth Feature - Type Definitions
 */

// Login form data
export type LoginFormData = {
    identifier: string; // email or username
    password: string;
};

// Sign up form data
export type SignUpFormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

// Auth error types
export type AuthError = {
    code: string;
    message: string;
    field?: string;
};

// Login state
export type LoginState = {
    isLoading: boolean;
    error: AuthError | null;
};

// Sign up state
export type SignUpState = {
    isLoading: boolean;
    error: AuthError | null;
    pendingVerification: boolean;
};

// OAuth provider types
export type OAuthProvider = "oauth_google" | "oauth_apple" | "oauth_facebook";
