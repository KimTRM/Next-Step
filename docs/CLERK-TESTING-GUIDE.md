# Clerk Authentication Testing Guide

This guide will help you test all authentication flows and troubleshoot common issues.

## Prerequisites

Before testing, ensure you've completed:

- ✅ Clerk account created and application configured
- ✅ API keys added to `.env.local`
- ✅ JWT template configured for Convex
- ✅ `convex/auth.config.js` updated with your Clerk domain
- ✅ Convex dev server running (`npx convex dev`)
- ✅ Next.js dev server running (`npm run dev`)

## Testing Checklist

### 1. Test Sign-Up Flow with Email Verification

#### Steps to Test:

1. **Open the application** in your browser: http://localhost:3000
2. **Click "Sign Up"** button in the header
3. **Fill in the sign-up form:**
    - Email: Use a real email you have access to
    - Password: At least 8 characters
    - Name: Your full name (optional)
4. **Submit the form**
5. **Check your email** for verification link
6. **Click the verification link** in the email
7. **You should be redirected** back to the app, now signed in

#### Expected Results:

✅ **Success Indicators:**

- Sign-up form submits without errors
- Verification email arrives within 1-2 minutes
- Clicking link verifies email and signs you in
- You're redirected to `/dashboard` or `/profile`
- Your user data appears in the Convex database
- Profile page shows your name and email

❌ **Common Issues:**

**Issue**: Email not arriving

- **Solution**: Check spam/junk folder
- **Solution**: In Clerk Dashboard, go to "Emails" and verify settings
- **Solution**: Try with a different email provider (Gmail, Outlook, etc.)

**Issue**: "Invalid verification link"

- **Solution**: Link may have expired (valid for 24 hours)
- **Solution**: Request a new verification email
- **Solution**: Check that you're using the latest link

**Issue**: Signed in but user not in Convex

- **Solution**: Check if webhook is configured (optional for dev)
- **Solution**: Profile page has auto-create logic that triggers on first visit
- **Solution**: Check Convex dashboard to see if user was created

### 2. Test Sign-In Flow

#### Steps to Test:

1. **If signed in, sign out first** (click profile icon → Sign Out)
2. **Click "Sign In"** button
3. **Enter your credentials:**
    - Email: The email you signed up with
    - Password: Your password
4. **Click "Sign In"**

#### Expected Results:

✅ **Success Indicators:**

- Sign-in completes without errors
- You're redirected to the dashboard
- Your profile information is visible
- Navigation shows your avatar/name

❌ **Common Issues:**

**Issue**: "Invalid email or password"

- **Solution**: Verify email is correct (check for typos)
- **Solution**: Use "Forgot password?" link to reset
- **Solution**: Ensure email was verified

**Issue**: Stuck on sign-in page

- **Solution**: Check browser console for errors
- **Solution**: Clear browser cache and cookies
- **Solution**: Try in incognito/private browsing mode

### 3. Test Social Sign-In (Google)

#### Steps to Test:

1. **Ensure Google OAuth is enabled** in Clerk Dashboard
2. **Click "Sign In"** button
3. **Click "Continue with Google"** button
4. **Select your Google account**
5. **Grant permissions** when prompted
6. **You should be signed in** and redirected to dashboard

#### Expected Results:

✅ **Success Indicators:**

- Google OAuth popup opens
- After selecting account, returns to app
- User is signed in with Google account info
- Profile shows Google email and avatar

❌ **Common Issues:**

**Issue**: "Popup blocked"

- **Solution**: Allow popups for localhost in browser settings
- **Solution**: Try clicking the button again

**Issue**: "OAuth error" or "Unauthorized"

- **Solution**: Verify Google is enabled in Clerk Dashboard
- **Solution**: Check redirect URI is configured correctly
- **Solution**: For production, ensure you've set up Google Cloud Console

**Issue**: "This app hasn't been verified"

- **Solution**: Normal in development mode
- **Solution**: Click "Advanced" → "Go to NextStep (unsafe)" for testing
- **Solution**: For production, complete Google verification process

### 4. Test Social Sign-In (GitHub)

#### Steps to Test:

1. **Ensure GitHub OAuth is enabled** in Clerk Dashboard
2. **Click "Sign In"** button
3. **Click "Continue with GitHub"** button
4. **Authorize the application** when prompted
5. **You should be signed in** and redirected to dashboard

#### Expected Results:

✅ **Success Indicators:**

- GitHub authorization page opens
- After authorizing, returns to app
- User is signed in with GitHub account info
- Profile shows GitHub email and avatar

❌ **Common Issues:**

**Issue**: "Authorization callback failed"

- **Solution**: Verify GitHub is enabled in Clerk Dashboard
- **Solution**: Check callback URL matches in GitHub OAuth app settings
- **Solution**: For localhost testing, ensure callback includes localhost

**Issue**: "Email not verified on GitHub"

- **Solution**: Verify your email in GitHub settings first
- **Solution**: Or enable unverified emails in Clerk settings

### 5. Verify Webhook Integration

#### Testing Webhook Locally (Using ngrok):

1. **Install ngrok**: `npm install -g ngrok` or download from https://ngrok.com
2. **Start ngrok**: `ngrok http 3000`
3. **Copy the HTTPS URL**: e.g., `https://abc123.ngrok.io`
4. **In Clerk Dashboard** → **Webhooks** → **Add Endpoint**:
    - Endpoint URL: `https://abc123.ngrok.io/api/webhooks/clerk`
    - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
    - Copy the **Signing Secret**
5. **Add to `.env.local`**:
    ```bash
    CLERK_WEBHOOK_SECRET=whsec_your_secret_here
    ```
6. **Restart your dev server**

#### Testing Webhook:

1. **Sign up a new test user**
2. **Check terminal logs** - you should see:
    ```
    ✓ Synced user user_xxxx to Convex
    ```
3. **Check Convex Dashboard** → **Data** → **users** table
4. **New user should appear** with correct data

#### Expected Results:

✅ **Success Indicators:**

- Webhook endpoint receives POST requests
- User data syncs to Convex automatically on sign-up
- Updates to user profile sync from Clerk to Convex
- Console logs show successful sync messages

❌ **Common Issues:**

**Issue**: Webhook not receiving requests

- **Solution**: Verify ngrok is running and URL is correct
- **Solution**: Check webhook is enabled in Clerk Dashboard
- **Solution**: Ensure CLERK_WEBHOOK_SECRET is set

**Issue**: "Error: Verification failed"

- **Solution**: Verify CLERK_WEBHOOK_SECRET matches Clerk Dashboard
- **Solution**: Restart dev server after adding secret
- **Solution**: Check for extra spaces or quotes in .env.local

**Issue**: "Failed to sync user"

- **Solution**: Check Convex dev server is running
- **Solution**: Verify NEXT_PUBLIC_CONVEX_URL is correct
- **Solution**: Check Convex logs for detailed error

### 6. Test User Session Persistence

#### Steps to Test:

1. **Sign in to the application**
2. **Navigate to different pages** (dashboard, profile, opportunities)
3. **Refresh the page** (F5 or Ctrl+R)
4. **Close the browser tab**
5. **Open a new tab** and go to http://localhost:3000
6. **You should still be signed in**

#### Expected Results:

✅ **Success Indicators:**

- User stays signed in across page refreshes
- User stays signed in in new tabs
- Session persists until sign out
- Protected routes remain accessible

### 7. Test Sign-Out Flow

#### Steps to Test:

1. **While signed in, click your profile avatar** (top right)
2. **Click "Sign Out"**
3. **You should be signed out** and redirected to home page

#### Expected Results:

✅ **Success Indicators:**

- Sign out completes immediately
- Redirected to landing page
- Header shows "Sign In" button again
- Accessing protected routes redirects to sign-in

## Environment Variables Checklist

Ensure all required variables are set in `.env.local`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name

# Clerk (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook (Optional for development)
CLERK_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting Common Errors

### Error: "Clerk has not been loaded"

**Cause**: Clerk provider not wrapping application or keys missing

**Solution**:

1. Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
2. Restart dev server: `npm run dev`
3. Clear browser cache and reload

### Error: "Failed to authenticate: No auth provider found"

**Cause**: Convex doesn't recognize your Clerk instance

**Solution**:

1. Check `convex/auth.config.js` has correct Clerk domain
2. Domain should match your Clerk Dashboard URL
3. Restart Convex: `npx convex dev`

### Error: "JWT template not found (404)"

**Cause**: Convex JWT template not created in Clerk

**Solution**:

1. Go to Clerk Dashboard → JWT Templates
2. Create new template named "convex"
3. Select "Convex" from templates list
4. Save and test again

### Error: "Hydration mismatch"

**Cause**: Server/client rendering mismatch with auth state

**Solution**:

1. This is often caused by browser extensions
2. Try in incognito mode
3. If persists, check components use proper loading states

### Error: "WebSocket reconnecting repeatedly"

**Cause**: Authentication issues between Clerk and Convex

**Solution**:

1. Verify JWT template is created
2. Check `convex/auth.config.js` domain is correct
3. Restart both Convex and Next.js servers

## Testing Checklist Summary

Use this checklist to verify everything works:

- [ ] Sign up with email verification completes successfully
- [ ] Verification email arrives and link works
- [ ] Sign in with email/password works
- [ ] Sign in with Google works (if enabled)
- [ ] Sign in with GitHub works (if enabled)
- [ ] User data appears in Convex database
- [ ] Profile page shows correct user information
- [ ] Session persists across page refreshes
- [ ] Session persists in new browser tabs
- [ ] Sign out works and clears session
- [ ] Protected routes redirect when not signed in
- [ ] Webhook syncs users to Convex (if configured)

## Next Steps

Once all tests pass:

1. ✅ Authentication is fully functional
2. 📱 Test on mobile browsers
3. 🚀 Ready to deploy to production
4. 📝 Review production checklist in deployment docs

## Getting Help

If you encounter issues not covered here:

1. Check [Clerk Documentation](https://clerk.com/docs)
2. Check [Convex Documentation](https://docs.convex.dev)
3. Review the browser console for specific error messages
4. Check both Clerk and Convex dashboard logs
5. Verify all environment variables are set correctly

## Production Considerations

Before deploying to production:

- [ ] Switch to production Clerk keys (`pk_live_`, `sk_live_`)
- [ ] Deploy Convex to production (`npx convex deploy`)
- [ ] Configure production webhook URL
- [ ] Set up custom domain for Clerk (optional)
- [ ] Configure email branding and templates
- [ ] Set up Google/GitHub OAuth with production credentials
- [ ] Test with real user emails
- [ ] Enable rate limiting and security features
- [ ] Review Clerk pricing and limits
