/**
 * Authentication Error Handler
 */

import { NextStepError, createAuthError, createForbiddenError } from "./errors";
import { logError } from "./logger";
import { showError, showWarning } from "./toast";

export interface AuthErrorContext {
    action?: string;
    resource?: string;
    userId?: string;
}

/**
 * Handle authentication errors with appropriate user actions
 */
export function handleAuthError(
    error: any,
    context?: AuthErrorContext,
): NextStepError {
    const action = context?.action || "access resource";
    const resource = context?.resource || "this feature";

    let nextStepError: NextStepError;

    // Check error type and create appropriate error
    if (error?.message?.includes("unauthorized") || error?.status === 401) {
        nextStepError = createAuthError(`Please sign in to ${action}`, {
            component: "auth-handler",
            action: action,
            additionalData: { resource, ...context },
        });
    } else if (error?.message?.includes("forbidden") || error?.status === 403) {
        nextStepError = createForbiddenError({
            component: "auth-handler",
            action: action,
            additionalData: { resource, ...context },
        });
    } else {
        nextStepError = createAuthError(
            error?.message || "Authentication required",
            {
                component: "auth-handler",
                action: action,
                additionalData: { resource, ...context },
            },
        );
    }

    // Log the error
    logError(nextStepError, {
        component: "auth-handler",
        action: "handle-auth-error",
        additionalData: context,
    });

    return nextStepError;
}

/**
 * Show appropriate toast and redirect for auth errors
 * @param navigate - Optional navigation function (e.g., router.push from useRouter)
 */
export function handleAuthErrorWithRedirect(
    error: any,
    context?: AuthErrorContext,
    options?: {
        signInPath?: string;
        signUpPath?: string;
        currentPath?: string;
        navigate?: (path: string) => void;
    },
): void {
    const nextStepError = handleAuthError(error, context);
    const {
        signInPath = "/auth/sign-in",
        signUpPath = "/auth/sign-up",
        currentPath = typeof window !== "undefined" ?
            window.location.pathname
        :   "/",
        navigate,
    } = options || {};

    // Use provided navigate function or fallback to window.location
    const navigateTo =
        navigate ||
        ((path: string) => {
            if (typeof window !== "undefined") {
                window.location.href = path;
            }
        });

    // Show appropriate toast
    if (nextStepError.code === "FORBIDDEN") {
        showWarning(nextStepError.userMessage);
    } else {
        showError("Authentication required", nextStepError, {
            action: {
                label: "Sign In",
                onClick: () => {
                    // Store the intended destination for redirect after sign in
                    if (
                        currentPath !== signInPath &&
                        currentPath !== signUpPath
                    ) {
                        sessionStorage.setItem(
                            "redirectAfterAuth",
                            currentPath,
                        );
                    }
                    navigateTo(signInPath);
                },
            },
        });
    }
}

/**
 * Check if user is authenticated and handle redirect if needed
 * @param navigate - Optional navigation function (e.g., router.push from useRouter)
 */
export function requireAuth(
    isAuthenticated: boolean,
    options?: {
        signInPath?: string;
        currentPath?: string;
        message?: string;
        navigate?: (path: string) => void;
    },
): boolean {
    if (!isAuthenticated) {
        const {
            signInPath = "/auth/sign-in",
            currentPath = typeof window !== "undefined" ?
                window.location.pathname
            :   "/",
            message = "Please sign in to continue",
            navigate,
        } = options || {};

        // Use provided navigate function or fallback to window.location
        const navigateTo =
            navigate ||
            ((path: string) => {
                if (typeof window !== "undefined") {
                    window.location.href = path;
                }
            });

        // Store the intended destination
        if (currentPath !== signInPath) {
            sessionStorage.setItem("redirectAfterAuth", currentPath);
        }

        showError(message, undefined, {
            action: {
                label: "Sign In",
                onClick: () => {
                    navigateTo(signInPath);
                },
            },
        });

        return false;
    }

    return true;
}

/**
 * Check if user has required permissions
 * @param navigate - Optional navigation function (e.g., router.push from useRouter)
 */
export function requirePermission(
    hasPermission: boolean,
    permission: string,
    options?: {
        showMessage?: boolean;
        fallbackPath?: string;
        navigate?: (path: string) => void;
    },
): boolean {
    if (!hasPermission) {
        const {
            showMessage = true,
            fallbackPath = "/",
            navigate,
        } = options || {};

        // Use provided navigate function or fallback to window.location
        const navigateTo =
            navigate ||
            ((path: string) => {
                if (typeof window !== "undefined") {
                    window.location.href = path;
                }
            });

        if (showMessage) {
            showWarning(
                `You need ${permission} permission to access this feature`,
                {
                    action:
                        fallbackPath ?
                            {
                                label: "Go Back",
                                onClick: () => {
                                    navigateTo(fallbackPath);
                                },
                            }
                        :   undefined,
                },
            );
        }

        return false;
    }

    return true;
}

/**
 * Handle token expiration
 */
export function handleTokenExpiration(
    error: any,
    options?: {
        onRefresh?: () => Promise<boolean>;
        onSignOut?: () => void;
    },
): void {
    const { onRefresh, onSignOut } = options || {};

    // Check if it's a token expiration error
    if (
        error?.message?.includes("token") &&
        error?.message?.includes("expired")
    ) {
        if (onRefresh) {
            // Try to refresh the token
            onRefresh()
                .then((success) => {
                    if (!success && onSignOut) {
                        onSignOut();
                    }
                })
                .catch(() => {
                    if (onSignOut) {
                        onSignOut();
                    }
                });
        } else if (onSignOut) {
            // No refresh function, just sign out
            onSignOut();
        }
    }
}

/**
 * Create auth-aware fetch wrapper
 */
export function createAuthFetch(
    getAuthToken: () => Promise<string | null>,
    onAuthError?: (error: any) => void,
) {
    return async (
        url: string,
        options: RequestInit = {},
    ): Promise<Response> => {
        try {
            const token = await getAuthToken();

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            // Handle auth errors
            if (response.status === 401 || response.status === 403) {
                const errorData = await response.json().catch(() => ({}));

                if (onAuthError) {
                    onAuthError({
                        status: response.status,
                        message: errorData.message || response.statusText,
                        ...errorData,
                    });
                }
            }

            return response;
        } catch (error) {
            if (onAuthError) {
                onAuthError(error);
            }
            throw error;
        }
    };
}

/**
 * Get redirect path after authentication
 */
export function getRedirectAfterAuth(): string {
    const redirectPath = sessionStorage.getItem("redirectAfterAuth");
    sessionStorage.removeItem("redirectAfterAuth");
    return redirectPath || "/dashboard";
}

/**
 * Auth state management helper
 */
export class AuthManager {
    private listeners: Array<(isAuthenticated: boolean) => void> = [];
    private _isAuthenticated: boolean = false;

    constructor(initialAuthState: boolean = false) {
        this._isAuthenticated = initialAuthState;
    }

    get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    setAuthenticated(isAuthenticated: boolean): void {
        if (this._isAuthenticated !== isAuthenticated) {
            this._isAuthenticated = isAuthenticated;
            this.notifyListeners();
        }
    }

    subscribe(listener: (isAuthenticated: boolean) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this._isAuthenticated));
    }

    /**
     * Check authentication and throw error if not authenticated
     */
    requireAuth(context?: AuthErrorContext): void {
        if (!this._isAuthenticated) {
            throw handleAuthError(
                { message: "User not authenticated", status: 401 },
                context,
            );
        }
    }

    /**
     * Check permission and throw error if not authorized
     */
    requirePermission(
        hasPermission: boolean,
        permission: string,
        context?: AuthErrorContext,
    ): void {
        if (!hasPermission) {
            throw createForbiddenError({
                component: "auth-manager",
                action: "permission-check",
                additionalData: { permission, ...context },
            });
        }
    }
}

// Create global auth manager instance
export const authManager = new AuthManager();
