# Authentication Integration Guide

This document describes the authentication system implemented in the NextStep platform using Clerk for authentication and Convex for data persistence.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Side                          │
├─────────────────────────────────────────────────────────────┤
│  features/auth/                                             │
│  ├── api.ts           → Clerk hook wrappers                 │
│  ├── types.ts         → TypeScript types                    │
│  ├── components/      → UI components                       │
│  └── index.ts         → Public exports                      │
├─────────────────────────────────────────────────────────────┤
│  features/onboarding/                                       │
│  ├── api.ts           → Convex hooks for onboarding         │
│  ├── components/      → Onboarding UI                       │
│  └── index.ts         → Public exports                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Server Side                          │
├─────────────────────────────────────────────────────────────┤
│  proxy.ts             → Clerk middleware (route protection) │
│  app/api/webhooks/    → Clerk webhook handler               │
│  convex/users/        → User mutations & queries            │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

Add these to your `.env.local`:

```env
# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Convex (from dashboard.convex.dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=...
```

## Auth Feature Exports

### Hooks

```typescript
import {
  useLoginForm,
  useSignUpForm,
  useOAuthLogin,
  useOAuthSignUp,
  useSignOut,
  useClerkAuthState,
  useConvexAuth,
  useAuthReady,
} from "@/features/auth";
```

#### `useLoginForm()`

Handles email/password login.

```typescript
const { login, isLoading, isReady, error, clearError } = useLoginForm();

// Usage
await login({ identifier: "email@example.com", password: "password" });
```

#### `useSignUpForm()`

Handles email/password sign-up with email verification.

```typescript
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

// Step 1: Register
await register({
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "password123",
});

// Step 2: Verify email (when pendingVerification is true)
await verifyEmail("123456");
```

#### `useOAuthLogin()`

Handles OAuth login (existing users).

```typescript
const {
  loginWithGoogle,
  loginWithApple,
  loginWithFacebook,
  isLoading,
  error,
} = useOAuthLogin();

// Usage
await loginWithGoogle();
```

#### `useOAuthSignUp()`

Handles OAuth sign-up (new users).

```typescript
const {
  signUpWithGoogle,
  signUpWithApple,
  signUpWithFacebook,
  isLoading,
  error,
} = useOAuthSignUp();

// Usage
await signUpWithGoogle();
```

#### `useSignOut()`

Handles sign-out.

```typescript
const { signOut, isLoading } = useSignOut();

// Usage
await signOut();
```

#### `useClerkAuthState()`

Gets current Clerk auth state.

```typescript
const { isLoaded, isSignedIn, userId } = useClerkAuthState();
```

#### `useConvexAuth()`

Combined Clerk + Convex auth state with role helpers.

```typescript
const {
  isLoading,
  isAuthenticated,
  needsOnboarding,
  clerkUserId,
  clerkUser,
  user,        // Convex user
  session,     // Convex session
  isStudent,
  isMentor,
  isEmployer,
} = useConvexAuth();
```

### Components

```typescript
import {
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
  SignOutButton,
  UserMenu,
  AuthSyncProvider,
} from "@/features/auth";
```

#### `<LoginForm />`

Complete login form with email/password inputs.

#### `<SignUpForm />`

Complete sign-up form with validation and email verification.

#### `<OAuthButtons mode="login" | "signup" />`

OAuth provider buttons (Google, Apple, Facebook).

```tsx
<OAuthButtons mode="login" />
<OAuthButtons mode="signup" />
```

#### `<AuthGuard requireAuth redirectTo="/auth">`

Protects content from unauthenticated users.

```tsx
<AuthGuard requireAuth redirectTo="/auth">
  <ProtectedContent />
</AuthGuard>
```

#### `<SignOutButton variant="default" | "menu" | "icon" />`

Sign-out button with three visual variants.

```tsx
<SignOutButton variant="default" label="Sign Out" />
<SignOutButton variant="menu" />
<SignOutButton variant="icon" />
```

#### `<UserMenu />`

Dropdown menu with user info and sign-out.

#### `<AuthSyncProvider>`

Ensures user is synced to Convex (fallback for webhooks). Already integrated in `app/providers.tsx`.

## Onboarding Feature

### Exports

```typescript
import {
  OnboardingPageContent,
  OnboardingGuard,
  useOnboardingStatus,
  useUserByClerkId,
  useUpdateUser,
  useCompleteOnboarding,
} from "@/features/onboarding";
```

### `<OnboardingGuard>`

Redirects users who haven't completed onboarding.

```tsx
<OnboardingGuard allowIncomplete={false} redirectTo="/onboarding">
  <DashboardContent />
</OnboardingGuard>
```

### `useOnboardingStatus()`

```typescript
const {
  isLoading,
  isComplete,
  needsOnboarding,
  currentStep,
  user,
} = useOnboardingStatus();
```

## Route Protection

### Protected Routes

Defined in `proxy.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/applications(.*)",
  "/jobs(.*)",
  "/mentors(.*)",
  "/messages(.*)",
  "/profile(.*)",
]);
```

### Auth Routes

Authenticated users are redirected away from:

```typescript
const isAuthRoute = createRouteMatcher([
  "/auth(.*)",
  "/login(.*)",
  "/sign-up(.*)",
]);
```

### Adding New Protected Routes

1. Add the route pattern to `proxy.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  // ... existing routes
  "/new-protected-route(.*)",
]);
```

2. Create the page under `app/(platform)/`:

```
app/(platform)/new-protected-route/page.tsx
```

The `(platform)` route group automatically wraps content with `OnboardingGuard`.

## Clerk Webhook Setup

### 1. Create Webhook in Clerk Dashboard

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks**
4. Click **Add Endpoint**
5. Set URL to: `https://your-domain.com/api/webhooks/clerk`
6. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the **Signing Secret** to `CLERK_WEBHOOK_SECRET`

### 2. Webhook Handler

Located at `app/api/webhooks/clerk/route.ts`. Handles:

- `user.created`: Creates user in Convex
- `user.updated`: Updates user in Convex
- `user.deleted`: Deletes user from Convex

## Auth Flow

### Sign Up Flow

```
1. User enters email/password on /sign-up
2. Clerk creates user, sends verification email
3. User enters verification code
4. On success:
   - Clerk session activated
   - Webhook creates user in Convex (or AuthSyncProvider as fallback)
   - Redirect to /onboarding
5. User completes onboarding form
6. Redirect to /dashboard
```

### Login Flow

```
1. User enters email/password on /auth
2. Clerk authenticates user
3. On success:
   - Session activated
   - Redirect to ?redirect_url or /dashboard
4. OnboardingGuard checks if onboarding complete
5. If incomplete, redirect to /onboarding
```

### OAuth Flow

```
1. User clicks OAuth button
2. Redirect to provider (Google/Apple/Facebook)
3. Provider authenticates, redirects to /sso-callback
4. AuthenticateWithRedirectCallback processes response
5. Redirect based on mode:
   - Login: /dashboard
   - Sign Up: /onboarding
```

## Convex User Schema

```typescript
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.string(),
  role: v.union(v.literal("student"), v.literal("mentor"), v.literal("employer")),
  avatarUrl: v.optional(v.string()),
  onboardingCompleted: v.optional(v.boolean()),
  onboardingStep: v.optional(v.number()),
  // ... additional profile fields
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_email", ["email"])
```

## Available Convex Auth Functions

### Queries

#### `getCurrentUser`

Returns the full user document for the authenticated user.

```typescript
const user = useQuery(api.users.index.getCurrentUser);
// Returns: User | null | undefined
```

#### `getCurrentSession`

Returns simplified session data.

```typescript
const session = useQuery(api.users.index.getCurrentSession);
// Returns: { id, email, name, role, avatarUrl, userId } | null | undefined
```

#### `getUserByClerkId`

Get user by Clerk ID (useful in server-side code).

```typescript
const user = useQuery(api.users.index.getUserByClerkId, { clerkId: "user_123" });
```

### Mutations

#### `upsertUser`

Create or update user (called from Clerk webhooks or AuthSyncProvider).

```typescript
await convex.mutation(api.users.index.upsertUser, {
  clerkId: "user_123",
  name: "John Doe",
  email: "john@example.com",
  avatarUrl: "https://...",
});
```

#### `updateUser`

Update user with onboarding data.

```typescript
await convex.mutation(api.users.index.updateUser, {
  clerkId: "user_123",
  onboardingCompleted: true,
  skills: ["JavaScript", "React"],
  // ... other onboarding fields
});
```

## Files Reference

### Auth Feature (`features/auth/`)

| File | Description |
|------|-------------|
| `index.ts` | Public exports |
| `types.ts` | TypeScript types |
| `api.ts` | Clerk hook wrappers |
| `components/LoginForm.tsx` | Email/password login form |
| `components/SignUpForm.tsx` | Sign-up form with validation |
| `components/EmailVerification.tsx` | Verification code input |
| `components/OAuthButtons.tsx` | Google/Apple/Facebook buttons |
| `components/AuthPageContent.tsx` | Full login page |
| `components/SignUpPageContent.tsx` | Full sign-up page |
| `components/AuthError.tsx` | Error display component |
| `components/AuthLoading.tsx` | Loading states |
| `components/AuthGuard.tsx` | Auth protection wrapper |
| `components/SignOutButton.tsx` | Sign-out button |
| `components/UserMenu.tsx` | User dropdown menu |
| `components/AuthSyncProvider.tsx` | Convex sync provider |

### Onboarding Feature (`features/onboarding/`)

| File | Description |
|------|-------------|
| `index.ts` | Public exports |
| `api.ts` | Convex hooks |
| `components/OnboardingPageContent.tsx` | 4-step onboarding form |
| `components/OnboardingGuard.tsx` | Onboarding check wrapper |

### App Routes

| Route | File | Description |
|-------|------|-------------|
| `/auth` | `app/(auth)/auth/page.tsx` | Login page |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | Sign-up page |
| `/sso-callback` | `app/(auth)/sso-callback/page.tsx` | OAuth callback |
| `/onboarding` | `app/(platform)/onboarding/page.tsx` | Onboarding flow |
| `/dashboard` | `app/(platform)/dashboard/page.tsx` | Main dashboard |

### Server Files

| File | Description |
|------|-------------|
| `proxy.ts` | Clerk middleware for route protection |
| `app/api/webhooks/clerk/route.ts` | Clerk webhook handler |
| `app/providers.tsx` | Clerk + Convex + AuthSync providers |

## Error Handling

### Auth Error Codes

The `getAuthErrorMessage()` function maps Clerk error codes to user-friendly messages:

```typescript
import { getAuthErrorMessage } from "@/features/auth";

const message = getAuthErrorMessage("form_password_incorrect");
// Returns: "Incorrect password. Please try again."
```

### Error Boundaries

Error boundaries are set up at multiple levels:

- `app/error.tsx` - Root error boundary
- `app/global-error.tsx` - Global error boundary
- `app/(auth)/error.tsx` - Auth routes error boundary
- `app/(platform)/error.tsx` - Platform routes error boundary

## Troubleshooting

### "User not found" errors

1. Check webhook is configured correctly in Clerk dashboard
2. Verify `CLERK_WEBHOOK_SECRET` is set in environment
3. Check Convex logs for webhook errors
4. AuthSyncProvider should create user as fallback

### OAuth not working

1. Verify OAuth providers are enabled in Clerk dashboard
2. Check redirect URLs are configured correctly
3. Verify `sso-callback` page exists at `/app/(auth)/sso-callback/page.tsx`

### Infinite redirect loops

1. Check `OnboardingGuard` excludes `/onboarding` path (it does by default)
2. Verify `proxy.ts` route matchers are correct
3. Check for circular redirects in auth flow

### Session not persisting

1. Ensure `ClerkProvider` wraps app in `providers.tsx`
2. Check `ConvexProviderWithClerk` is configured with `useAuth`
3. Verify environment variables are set correctly

### Onboarding not saving

1. Check Convex logs for mutation errors
2. Verify user exists in Convex (webhook or AuthSyncProvider)
3. Check network tab for failed requests
