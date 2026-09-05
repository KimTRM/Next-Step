# NextStep Deployment Verification Checklist

Use this checklist to verify authentication works correctly after deployment.

## Pre-Deployment

### 1. Verify Environment Variables in Vercel

Go to Vercel Dashboard > Your Project > Settings > Environment Variables

Ensure these are set for **Production**:

| Variable | Example Value | Set? |
|----------|---------------|------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://hidden-skunk-152.convex.cloud` | [ ] |
| `CONVEX_DEPLOYMENT` | `dev:hidden-skunk-152` | [ ] |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` or `pk_live_...` | [ ] |
| `CLERK_SECRET_KEY` | `sk_test_...` or `sk_live_...` | [ ] |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | [ ] |

### 2. Verify Clerk Dashboard Configuration

Go to [dashboard.clerk.com](https://dashboard.clerk.com)

**Domains & URLs:**
- [ ] Production domain added to "Domains" (e.g., `nextstep-test.vercel.app`)
- [ ] Vercel preview domains allowed: `*.vercel.app`

**Paths Configuration:**
- [ ] Sign-in URL: `/auth`
- [ ] Sign-up URL: `/sign-up`
- [ ] After sign-in URL: `/dashboard`
- [ ] After sign-up URL: `/onboarding`

**OAuth Providers (if using):**
- [ ] Google OAuth enabled and configured
- [ ] Apple OAuth enabled and configured (optional)
- [ ] Facebook OAuth enabled and configured (optional)

### 3. Verify Convex Webhook

**In Clerk Dashboard > Webhooks:**
- [ ] Webhook endpoint configured: `https://<your-convex>.convex.site/clerk-webhook`
- [ ] Events selected: `user.created`, `user.updated`, `user.deleted`
- [ ] Webhook secret matches `CLERK_WEBHOOK_SECRET` in Convex environment

**Set Convex environment variable:**
```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_your-secret-here
```

---

## Deployment Steps

### 1. Commit Changes

```bash
git add -A
git commit -m "Fix auth session hydration and add deployment docs"
git push origin feature/develop
```

### 2. Deploy to Vercel

Either:
- Push to main branch to trigger auto-deploy, OR
- Manually deploy from Vercel Dashboard

### 3. Deploy Convex (if needed)

```bash
npx convex deploy
```

---

## Post-Deployment Verification

### Test 1: Email/Password Sign-Up Flow

1. [ ] Go to `https://your-domain.com/sign-up`
2. [ ] Fill in all fields (first name, last name, username, email, password)
3. [ ] Submit form
4. [ ] Receive verification email
5. [ ] Enter verification code
6. [ ] **VERIFY**: Automatically redirected to `/onboarding`
7. [ ] **VERIFY**: User is logged in (check header for user info)
8. [ ] **VERIFY**: User appears in Convex dashboard

### Test 2: Email/Password Login Flow

1. [ ] Go to `https://your-domain.com/auth`
2. [ ] Enter email and password
3. [ ] Submit form
4. [ ] **VERIFY**: Redirected to `/dashboard`
5. [ ] **VERIFY**: Session persists after page reload
6. [ ] **VERIFY**: Can navigate to protected routes

### Test 3: Google OAuth Flow

1. [ ] Go to `https://your-domain.com/auth`
2. [ ] Click "Continue with Google"
3. [ ] Complete Google sign-in
4. [ ] **VERIFY**: Redirected to `/dashboard` (existing user) or `/onboarding` (new user)
5. [ ] **VERIFY**: Session persists after page reload

### Test 4: Session Persistence

1. [ ] Log in using any method
2. [ ] Close browser tab
3. [ ] Open new tab and go to `https://your-domain.com/dashboard`
4. [ ] **VERIFY**: Still logged in (not redirected to login)

### Test 5: Protected Route Access

1. [ ] While logged out, go to `https://your-domain.com/dashboard`
2. [ ] **VERIFY**: Redirected to `/auth?redirect_url=/dashboard`
3. [ ] Log in
4. [ ] **VERIFY**: Redirected back to `/dashboard`

### Test 6: Sign Out Flow

1. [ ] While logged in, click sign out
2. [ ] **VERIFY**: Redirected to home page `/`
3. [ ] **VERIFY**: Cannot access `/dashboard` without logging in again

---

## Troubleshooting

### Issue: Redirect loop after login

**Symptoms:**
- Page keeps redirecting between `/auth` and `/dashboard`
- Browser shows "too many redirects" error

**Solutions:**
1. Clear browser cookies for your domain
2. Check that Clerk domain is properly configured
3. Verify middleware cookie check is working (check `proxy.ts`)

### Issue: User not logged in after signup

**Symptoms:**
- Signup completes but redirected to login
- Session not established

**Solutions:**
1. Check browser console for errors
2. Verify the 100ms delay in `features/auth/api.ts`
3. Check Clerk Dashboard for session errors

### Issue: OAuth redirects to wrong URL

**Symptoms:**
- After Google login, redirects to localhost or wrong domain

**Solutions:**
1. Check Clerk Dashboard > Domains
2. Verify OAuth callback URL in Google Cloud Console
3. Ensure `sso-callback` route is in `isAuthRoute` matcher

### Issue: User not synced to Convex

**Symptoms:**
- Login works but user data missing in dashboard
- "User not found" errors

**Solutions:**
1. Check Convex logs: `npx convex logs`
2. Verify webhook is configured in Clerk
3. Check `CLERK_WEBHOOK_SECRET` matches in both Clerk and Convex
4. AuthSyncProvider should create user as fallback

### Issue: 2FA code not working

**Symptoms:**
- Verification code entered but rejected

**Solutions:**
1. Check if 2FA is enabled in Clerk Dashboard
2. Ensure email delivery is working (check spam folder)
3. Verify code hasn't expired (codes expire after 10 minutes)

---

## Quick Verification Commands

```bash
# Check Convex deployment status
npx convex dashboard

# View Convex logs
npx convex logs

# Check environment variables
npx convex env list

# Redeploy Convex functions
npx convex deploy
```

---

## Success Criteria

All tests should pass for the deployment to be considered successful:

- [ ] Email/password signup works and auto-logs in
- [ ] Email/password login works
- [ ] Google OAuth works (both login and signup)
- [ ] Session persists across page reloads
- [ ] Protected routes redirect to login when not authenticated
- [ ] Login redirects to intended destination
- [ ] Sign out works correctly
- [ ] User data syncs to Convex

---

## Files Changed in This Update

| File | Changes |
|------|---------|
| `proxy.ts` | Added `/welcome` to public routes, added cookie check for all protected routes |
| `features/auth/api.ts` | Fixed session hydration by removing `beforeEmit` navigation |
| `docs/CLERK-CONVEX-SETUP.md` | Added comprehensive setup guide |
| `docs/DEPLOYMENT-CHECKLIST.md` | This file |
| `.env.example` | Added environment variable template |
