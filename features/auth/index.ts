/**
 * Auth Feature - Public API
 */

// API hooks
export {
    useClerkAuthState,
    useLoginForm,
    useSignUpForm,
    useOAuthLogin,
    useOAuthSignUp,
    useSignOut,
} from "./api";

// Types
export type {
    LoginFormData,
    SignUpFormData,
    AuthError,
    LoginState,
    SignUpState,
    OAuthProvider,
} from "./types";

// Components
export {
    LoginForm,
    SignUpForm,
    EmailVerification,
    OAuthButtons,
    AuthPageContent,
    SignUpPageContent,
    AuthErrorDisplay,
    getAuthErrorMessage,
    AuthLoading,
    AuthLoadingSkeleton,
    FullPageLoading,
    AuthGuard,
    useAuthReady,
    SignOutButton,
    UserMenu,
    AuthSyncProvider,
    useConvexAuth,
} from "./components";
