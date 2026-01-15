# Convex + Clerk Setup Guide

This guide will help you complete the integration of Convex (database) and Clerk (authentication) into the NextStep platform.

## What's Already Done

✅ **Installed packages**: `convex`, `@clerk/nextjs`, `svix`  
✅ **Created Convex schema** with collections for users, opportunities, applications, messages, and mentorship sessions  
✅ **Set up authentication middleware** to protect routes  
✅ **Updated UI components** to use Convex queries and Clerk auth  
✅ **Created seed script** to populate database with initial data  
✅ **Added webhook handler** to sync Clerk users to Convex

## What You Need To Do

### Step 1: Create a Clerk Account and Application

1. Go to https://clerk.com and sign up for a free account
2. Create a new application (choose "NextStep" or similar name)
3. In the Clerk Dashboard:
    - Go to **API Keys**
    - Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - Copy your `CLERK_SECRET_KEY`
4. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Step 2: Configure Convex Deployment

You have two options:

#### Option A: Continue with Local Development (Current Setup)

Your Convex instance is already running locally. The environment variables are already set in `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
CONVEX_DEPLOYMENT=anonymous-next-step
```

**To keep using local Convex:**

- Just keep `npx convex dev` running in a separate terminal
- No additional setup needed!

#### Option B: Deploy to Convex Cloud (Recommended for Production)

1. Create a Convex account at https://convex.dev
2. Run `npx convex login` in your terminal
3. Run `npx convex dev` and select "Create a new project"
4. This will update your `.env.local` with production URLs

### Step 3: Seed the Database

Once you have Convex running (either locally or in the cloud):

```bash
npx convex run seed:seedAll
```

This will populate your database with the sample users, opportunities, applications, and messages from the mock data.

### Step 4: Set Up Clerk Webhook (Optional but Recommended)

To automatically sync new users from Clerk to Convex:

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
    - Local dev: Use ngrok or similar: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
    - Production: `https://yourdomain.com/api/webhooks/clerk`
4. Subscribe to these events:
    - `user.created`
    - `user.updated`
    - `user.deleted`
5. Copy the **Signing Secret**
6. Add it to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
```

### Step 5: Update Middleware for Clerk Routes

The middleware is already configured to protect routes. Make sure these routes match your needs:

**Public routes** (no auth required):

- `/` - Landing page
- `/opportunities` - Browse opportunities
- `/api/webhooks/*` - Webhook endpoints

**Protected routes** (auth required):

- `/dashboard`
- `/profile`
- `/messages`
- `/applications`
- Everything else

If you need to adjust, edit `middleware.ts`.

### Step 6: Run the Application

1. **Terminal 1** - Start Convex (if using local):

    ```bash
    npx convex dev
    ```

2. **Terminal 2** - Start Next.js:

    ```bash
    npm run dev
    ```

3. Open http://localhost:3000

### Step 7: Test the Integration

1. Click "Sign Up" in the header
2. Create a new account with Clerk
3. You should be redirected to `/dashboard`
4. Verify that:
    - Your user shows in the Convex dashboard
    - Dashboard loads with data
    - Navigation works
    - Sign out works

## Project Structure

```
convex/
├── schema.ts                 # Database schema
├── users.ts                  # User queries
├── userMutations.ts          # User mutations (create/update/delete)
├── opportunities.ts          # Opportunity queries and mutations
├── applications.ts           # Application queries and mutations
├── messages.ts               # Message queries and mutations
├── seed.ts                   # Database seeding script
└── auth.config.js           # Auth configuration for Clerk

app/
├── providers.tsx            # Clerk + Convex providers
├── layout.tsx               # Updated with providers
├── auth/page.tsx            # Clerk SignIn component
├── sign-up/page.tsx         # Clerk SignUp component
├── dashboard/page.tsx       # Updated to use Convex
├── opportunities/page.tsx   # Updated to use Convex
└── api/webhooks/clerk/      # Webhook handler

middleware.ts                # Route protection
```

## Development Scripts

```bash
# Start development server
npm run dev

# Start Convex in dev mode
npx convex dev

# Seed database
npx convex run seed:seedAll

# View Convex dashboard
npx convex dashboard

# Login to Convex
npx convex login
```

## Convex Dashboard

Access your Convex dashboard to view and manage data:

- **Local**: http://127.0.0.1:6790/?d=anonymous-next-step
- **Cloud**: https://dashboard.convex.dev

## Common Issues

### "Convex is not running"

- Make sure `npx convex dev` is running in a separate terminal
- Check that `NEXT_PUBLIC_CONVEX_URL` is set correctly in `.env.local`

### "Clerk keys not found"

- Verify `.env.local` has both Clerk keys
- Restart the Next.js dev server after adding keys

### "User not synced to Convex"

- Check webhook is configured correctly
- Try manually creating a user via Convex dashboard
- Verify webhook secret matches in `.env.local`

## Next Steps

1. **Customize user roles**: Add a role selection during sign-up (student/mentor/employer)
2. **Implement real-time features**: Use Convex's real-time subscriptions for live updates
3. **Add more queries**: Create filtered queries for opportunities by skill, location, etc.
4. **Profile management**: Build a profile editor using `updateUserProfile` mutation
5. **Application flow**: Implement the full application submission workflow
6. **Messaging system**: Build the real-time messaging interface

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex + Clerk Integration Guide](https://docs.convex.dev/auth/clerk)
- [NextStep Project Docs](./docs/README.md)

---

**Need help?** Check the [Developer Guide](./DEVELOPER-GUIDE.md) or review existing code comments.
