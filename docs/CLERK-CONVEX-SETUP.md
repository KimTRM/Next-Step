# Clerk + Convex Setup Guide for NextStep

This guide walks you through setting up Clerk authentication and Convex backend for the NextStep application, both for local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Convex Setup](#convex-setup)
3. [Clerk Setup](#clerk-setup)
4. [Connect Clerk to Convex](#connect-clerk-to-convex)
5. [Local Development](#local-development)
6. [Production Deployment (Vercel)](#production-deployment-vercel)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- A Vercel account (for production deployment)
- Git repository set up

---

## Convex Setup

### Step 1: Create a Convex Account

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign up with GitHub or Google
3. Create a new project (e.g., "nextstep")

### Step 2: Install Convex CLI

```bash
npm install convex
```

### Step 3: Initialize Convex in Your Project

```bash
npx convex dev
```

This will:
- Prompt you to log in (if not already)
- Create/select a Convex project
- Generate the `convex/_generated` folder
- Start the Convex development server

### Step 4: Get Your Convex URL

After running `npx convex dev`, you'll see output like:

```
✔ Connected to https://hidden-skunk-152.convex.cloud
```

Copy this URL - you'll need it for your `.env.local` file.

### Step 5: Configure Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

---

## Clerk Setup

### Step 1: Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up with GitHub, Google, or email
3. Create a new application (e.g., "NextStep")

### Step 2: Configure Authentication Methods

In Clerk Dashboard, go to **User & Authentication > Email, Phone, Username**:

1. **Email settings**:
   - Enable "Email address"
   - Set "Require email address" to ON
   - Enable "Email verification" (required for email/password sign-up)

2. **Username settings** (optional but recommended):
   - Enable "Username"
   - Set "Require username" based on your preference

3. **Password settings**:
   - Enable "Password" if you want email/password authentication
   - Set minimum password length (8 characters recommended)

### Step 3: Configure OAuth Providers

Go to **User & Authentication > Social Connections**:

#### Google OAuth
1. Click "Google"
2. Enable it
3. For development, Clerk provides test credentials
4. For production:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://clerk.your-domain.com/v1/oauth_callback`
   - Copy Client ID and Secret to Clerk

#### Apple OAuth (optional)
1. Click "Apple"
2. Follow Apple's developer setup process
3. Requires Apple Developer account ($99/year)

#### Facebook OAuth (optional)
1. Click "Facebook"
2. Create app at [Facebook Developers](https://developers.facebook.com)
3. Add Facebook Login product
4. Copy App ID and Secret to Clerk

### Step 4: Get API Keys

Go to **API Keys** in Clerk Dashboard:

1. Copy **Publishable Key** (starts with `pk_test_` or `pk_live_`)
2. Copy **Secret Key** (starts with `sk_test_` or `sk_live_`)

Add to your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
CLERK_SECRET_KEY=sk_test_your-key-here
```

### Step 5: Configure Redirect URLs

Go to **Paths** in Clerk Dashboard:

| Setting | Value |
|---------|-------|
| Sign-in URL | `/auth` |
| Sign-up URL | `/sign-up` |
| After sign-in URL | `/dashboard` |
| After sign-up URL | `/onboarding` |

### Step 6: Configure Allowed Origins (IMPORTANT for Production)

Go to **Domains** in Clerk Dashboard:

1. Add your development URL: `http://localhost:3000`
2. Add your production URL: `https://nextstep-test.vercel.app`
3. Add any preview deployment URLs: `https://*.vercel.app`

---

## Connect Clerk to Convex

Clerk and Convex need to be connected so that Convex can verify Clerk JWTs.

### Step 1: Get Clerk JWT Issuer URL

In Clerk Dashboard, go to **API Keys** and find your **Frontend API URL**:
- It looks like: `https://your-clerk-instance.clerk.accounts.dev`

### Step 2: Configure Convex Auth

Create or update `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: "https://your-clerk-instance.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
```

### Step 3: Deploy Auth Config

```bash
npx convex deploy
```

### Step 4: Set Up Clerk Webhook (for user sync)

User data needs to sync from Clerk to Convex. This is done via webhooks.

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set the URL to your Convex HTTP endpoint:
   ```
   https://your-deployment.convex.site/clerk-webhook
   ```
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Click **Create**
6. Copy the **Signing Secret** (starts with `whsec_`)

Add to your `.env.local`:

```env
CLERK_WEBHOOK_SECRET=whsec_your-secret-here
```

### Step 5: Add Webhook Secret to Convex

The webhook secret needs to be in Convex environment:

```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_your-secret-here
```

---

## Local Development

### Complete .env.local Setup

Your `.env.local` should have all these variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk Redirect URLs (optional - has defaults)
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Start Development Servers

You need two terminals:

**Terminal 1 - Convex:**
```bash
npx convex dev
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

### Test Authentication Flow

1. Open `http://localhost:3000`
2. Click "Sign Up" or navigate to `/sign-up`
3. Fill in the form and submit
4. Check your email for verification code
5. Enter the code
6. You should be redirected to `/onboarding`

### Test OAuth Flow

1. Go to `/auth` or `/sign-up`
2. Click "Continue with Google"
3. Complete Google sign-in
4. You should be redirected appropriately

---

## Production Deployment (Vercel)

### Step 1: Deploy Convex to Production

```bash
npx convex deploy --prod
```

This creates a production Convex deployment. Note the production URL.

### Step 2: Set Convex Production Environment Variables

```bash
npx convex env set CLERK_WEBHOOK_SECRET whsec_your-production-secret --prod
```

### Step 3: Create Production Clerk Instance (Recommended)

For production, create a separate Clerk application:

1. In Clerk Dashboard, create a new app for production
2. Use `pk_live_` and `sk_live_` keys
3. Configure all the same settings as development

### Step 4: Configure Vercel Environment Variables

In Vercel Dashboard > Your Project > Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://prod-deployment.convex.cloud` | Production |
| `CONVEX_DEPLOYMENT` | `prod:your-deployment` | Production |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `CLERK_SECRET_KEY` | `sk_live_...` | Production |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Production |

### Step 5: Update Clerk Production Settings

In Clerk Dashboard for your production app:

1. **Domains**: Add your production domain
   - `https://nextstep-test.vercel.app`
   - `https://your-custom-domain.com` (if applicable)

2. **Webhooks**: Create production webhook
   - URL: `https://prod-deployment.convex.site/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`

3. **OAuth Providers**: Update redirect URIs
   - Google: Add production callback URL
   - Apple: Add production callback URL
   - Facebook: Add production callback URL

### Step 6: Deploy to Vercel

```bash
git push origin main
```

Or trigger deployment from Vercel Dashboard.

### Step 7: Verify Production Setup

1. Visit your production URL
2. Test sign-up with email/password
3. Test sign-in with email/password
4. Test OAuth sign-in (Google, etc.)
5. Verify user appears in Convex dashboard

---

## Troubleshooting

### "User not found" after sign-up

**Cause**: Webhook not syncing users to Convex

**Solutions**:
1. Check webhook is configured in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` matches in both Clerk and Convex
3. Check Convex logs for webhook errors: `npx convex logs`
4. The AuthSyncProvider acts as a fallback - ensure it's in your provider tree

### OAuth not redirecting correctly

**Cause**: Missing or incorrect redirect URLs

**Solutions**:
1. Check Clerk Dashboard > Domains - ensure your domain is listed
2. Verify OAuth callback URL is `https://your-domain.com/sso-callback`
3. Check browser console for CORS errors

### Session not persisting after page reload

**Cause**: Clerk session cookies not being set correctly

**Solutions**:
1. Ensure `ClerkProvider` wraps your entire app in `providers.tsx`
2. Check that middleware isn't blocking session cookies
3. Verify environment variables are set correctly (especially in production)
4. Check browser cookies - should see `__clerk_db_jwt` and `__session`

### "Invalid API key" errors

**Cause**: Mismatched or missing API keys

**Solutions**:
1. Verify keys start with correct prefix (`pk_test_` for dev, `pk_live_` for prod)
2. Ensure keys are from the correct Clerk application
3. Check for accidental whitespace in environment variables

### Middleware not protecting routes

**Cause**: Middleware configuration issue

**Solutions**:
1. Verify `proxy.ts` exists at project root
2. Check route matchers in `proxy.ts` include your routes
3. Run `npm run build` and check for "ƒ Proxy (Middleware)" in output

### Webhook signature verification failed

**Cause**: Incorrect webhook secret or clock skew

**Solutions**:
1. Regenerate webhook secret in Clerk Dashboard
2. Update secret in both `.env.local` and Convex environment
3. Ensure server time is accurate (NTP sync)

### OAuth redirect loop

**Cause**: Conflicting redirect configurations

**Solutions**:
1. Check middleware isn't redirecting OAuth callback page
2. Ensure `/sso-callback` is in `isAuthRoute` matcher in `proxy.ts`
3. Verify OAuth redirect URLs in Clerk Dashboard match your app

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | Yes | Convex deployment identifier |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public API key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret API key (server only) |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook signing secret |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Sign-in page path (default: `/auth`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Sign-up page path (default: `/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No | Redirect after sign-in (default: `/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | No | Redirect after sign-up (default: `/onboarding`) |

---

## Quick Reference Commands

```bash
# Start Convex development server
npx convex dev

# Deploy Convex functions
npx convex deploy

# Deploy to production
npx convex deploy --prod

# View Convex logs
npx convex logs

# Set Convex environment variable
npx convex env set VARIABLE_NAME value

# Set production environment variable
npx convex env set VARIABLE_NAME value --prod

# List Convex environment variables
npx convex env list
```

---

## Support Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk + Convex Integration Guide](https://docs.convex.dev/auth/clerk)
