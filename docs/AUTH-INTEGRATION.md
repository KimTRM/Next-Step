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

### Local Development (`.env.local`)

```env
# Convex (from dashboard.convex.dev)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name

# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Production (Vercel Environment Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Yes | Convex deployment identifier |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (`pk_live_*` for production) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (`sk_live_*` for production) |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook signing secret |

### Optional Redirect URLs

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

> **Note**: See `.env.example` for a complete template with all variables.

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

The middleware is defined in `proxy.ts` and handles all route protection.

### Public Routes (No Auth Required)

```typescript
const isPublicRoute = createRouteMatcher([
  "/",           // Home page
  "/jobs(.*)",   // Job listings (public browsing)
  "/mentors(.*)",// Mentor listings (public browsing)
  "/api(.*)",    // API routes (webhooks, etc.)
  "/welcome",    // Welcome page
]);
```

### Auth Routes (Redirect If Authenticated)

Authenticated users are automatically redirected to `/dashboard`:

```typescript
const isAuthRoute = createRouteMatcher([
  "/auth(.*)",       // Login page
  "/login(.*)",      // Legacy login
  "/sign-up(.*)",    // Sign-up page
  "/sso-callback(.*)", // OAuth callback
]);
```

### Protected Routes (Auth Required)

All routes not matching public or auth patterns require authentication:
- `/dashboard(.*)`
- `/onboarding(.*)`
- `/applications(.*)`
- `/messages(.*)`
- `/profile(.*)`
- Any other route not explicitly public

### Session Establishment Grace Period

The middleware includes a **cookie-based grace period** to handle the race condition after login/signup:

```typescript
// If user has Clerk cookies but session isn't validated yet,
// allow the request through - client-side will handle auth
const hasClerkCookie = req.cookies.has("__client_uat") || req.cookies.has("__session");
if (hasClerkCookie) {
  return NextResponse.next();
}
```

This prevents redirect loops during the brief window after authentication when cookies are set but the session hasn't fully propagated.

### Adding New Protected Routes

1. Routes under `app/(platform)/` are automatically protected
2. For public routes, add to `isPublicRoute` in `proxy.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  // ... existing routes
  "/new-public-route(.*)",
]);
```

## Clerk Webhook Setup

Webhooks sync user data from Clerk to Convex. The webhook handler is implemented in Convex.

### 1. Create Webhook in Clerk Dashboard

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks**
4. Click **Add Endpoint**
5. Set URL to: `https://<your-convex-deployment>.convex.site/clerk-webhook`
   - Example: `https://hidden-skunk-152.convex.site/clerk-webhook`
6. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Copy the **Signing Secret** (starts with `whsec_`)

### 2. Configure Convex Environment

Set the webhook secret in Convex:

```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_your-secret-here
```

### 3. Webhook Handler

Located at `convex/http.ts`. Handles:

- `user.created`: Creates user in Convex via `upsertUserInternal`
- `user.updated`: Updates user in Convex via `upsertUserInternal`
- `user.deleted`: Deletes user from Convex via `deleteUserInternal`

### 4. Fallback: AuthSyncProvider

If webhooks fail, `AuthSyncProvider` in `app/providers.tsx` acts as a fallback to sync users client-side.

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

## Session Hydration Flow

Understanding how sessions are established is critical for debugging auth issues.

### The Session Establishment Process

```
1. User completes authentication (login/signup/OAuth)
2. Clerk's setActive() is called with the new session ID
3. Clerk sets session cookies (__session, __client_uat)
4. 100ms delay ensures cookies are fully propagated
5. router.replace() navigates to the target page
6. Middleware checks cookies and allows request through
7. Client-side Clerk hooks hydrate with the session
```

### Why the 100ms Delay?

After `setActive()` completes, the session cookies are set, but there's a brief window where:
- The browser has the cookies
- But the middleware hasn't seen them yet

The 100ms delay ensures cookies are fully propagated before navigation.

### The Cookie-Based Grace Period

The middleware includes a grace period check:

```typescript
if (!userId) {
  // Check if session cookies exist (session being established)
  const hasClerkCookie = req.cookies.has("__client_uat") || req.cookies.has("__session");
  if (hasClerkCookie) {
    // Allow request - client will verify auth
    return NextResponse.next();
  }
  // No cookies = truly unauthenticated, redirect to login
  return NextResponse.redirect(loginUrl);
}
```

This prevents the "redirect to login after successful auth" issue.

### Code Pattern for Session Activation

**Correct pattern (used in this codebase):**

```typescript
// 1. Activate the session
await setActive({ session: result.createdSessionId });

// 2. Wait for cookie propagation
await new Promise((resolve) => setTimeout(resolve, 100));

// 3. Navigate to destination
router.replace("/dashboard");
```

**Incorrect pattern (causes race conditions):**

```typescript
// DON'T DO THIS - navigation happens before cookies propagate
await setActive({
  session: result.createdSessionId,
  beforeEmit: () => router.replace("/dashboard"), // Too early!
});
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
| `convex/http.ts` | Clerk webhook handler (Convex HTTP action) |
| `convex/auth.ts` | Convex auth utilities |
| `app/providers.tsx` | Clerk + Convex + AuthSync providers |

### Documentation Files

| File | Description |
|------|-------------|
| `docs/AUTH-INTEGRATION.md` | This file - auth system documentation |
| `docs/CLERK-CONVEX-SETUP.md` | Step-by-step setup guide |
| `docs/DEPLOYMENT-CHECKLIST.md` | Production deployment checklist |
| `.env.example` | Environment variables template |

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
2. Verify `CLERK_WEBHOOK_SECRET` is set in Convex environment:
   ```bash
   npx convex env list
   ```
3. Check Convex logs for webhook errors:
   ```bash
   npx convex logs
   ```
4. AuthSyncProvider should create user as fallback

### OAuth not working

1. Verify OAuth providers are enabled in Clerk dashboard
2. Check redirect URLs are configured correctly
3. Verify `sso-callback` page exists at `/app/(auth)/sso-callback/page.tsx`
4. Ensure your domain is in Clerk's "Domains" list

### Infinite redirect loops

1. Check `OnboardingGuard` excludes `/onboarding` path (it does by default)
2. Verify `proxy.ts` route matchers are correct
3. Check for circular redirects in auth flow
4. Clear browser cookies and try again

### Session not persisting

1. Ensure `ClerkProvider` wraps app in `providers.tsx`
2. Check `ConvexProviderWithClerk` is configured with `useAuth`
3. Verify environment variables are set correctly
4. Check browser cookies for `__session` and `__client_uat`

### Onboarding not saving

1. Check Convex logs for mutation errors
2. Verify user exists in Convex (webhook or AuthSyncProvider)
3. Check network tab for failed requests

### Production-Specific Issues

#### Signup works but doesn't auto-login

**Symptoms:** User signs up, verifies email, but is redirected to login instead of onboarding.

**Causes & Solutions:**
1. **Missing cookie delay**: Ensure 100ms delay after `setActive()` before navigation
2. **Middleware race condition**: Verify middleware has cookie-based grace period
3. **Domain mismatch**: Check Clerk domain matches your Vercel deployment

#### Email/password login fails but OAuth works

**Symptoms:** Google OAuth works fine, but email/password returns errors.

**Causes & Solutions:**
1. **Email verification required**: Check Clerk settings for email verification
2. **Password requirements**: Ensure password meets Clerk's requirements
3. **2FA enabled**: User might have 2FA enabled, check for `needs_second_factor` status

#### Session lost after page reload

**Symptoms:** User is logged in, but refreshing the page logs them out.

**Causes & Solutions:**
1. **Cookie domain mismatch**: Verify Clerk domain in dashboard matches deployment
2. **HTTPS required**: Clerk cookies require HTTPS in production
3. **Third-party cookie blocking**: Check browser settings

#### "Invalid API key" in production

**Symptoms:** Auth fails with API key errors in production only.

**Causes & Solutions:**
1. **Wrong key type**: Use `pk_live_*` and `sk_live_*` for production
2. **Key not set**: Verify all environment variables are set in Vercel
3. **Key copied incorrectly**: Check for whitespace or truncation

### Debug Tools

**Browser Console:**
```javascript
// Check Clerk session
window.Clerk.session
// Check cookies
document.cookie
```

**Convex Logs:**
```bash
npx convex logs --follow
```

**Check Environment:**
```bash
npx convex env list
```
