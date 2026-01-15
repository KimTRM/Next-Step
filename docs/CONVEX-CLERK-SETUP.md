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

#### 1.1 Sign Up and Create Application

1. Go to https://clerk.com and sign up for a free account
2. After logging in, click **"+ Create application"**
3. Choose a name: **"NextStep"** or **"NextStep Dev"**
4. Select authentication methods you want to enable:
    - ✅ **Email** (recommended for development)
    - ✅ **Google** (optional, for social auth)
    - ✅ **GitHub** (optional, for social auth)
5. Click **"Create application"**

#### 1.2 Get Your API Keys

1. In the Clerk Dashboard, you'll see your new application
2. Click on your application name to open it
3. In the left sidebar, go to **"API Keys"**
4. You'll see two keys:
    - **Publishable key**: Starts with `pk_test_` (for client-side)
    - **Secret key**: Starts with `sk_test_` (for server-side)
5. Click the **copy icon** next to each key

#### 1.3 Add Keys to Environment Variables

1. Open your `.env.local` file in the project root
2. Add or update these lines:

```bash
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

⚠️ **Important**:

- Replace `pk_test_your_actual_key_here` with your actual publishable key
- Replace `sk_test_your_actual_key_here` with your actual secret key
- **NEVER commit** `.env.local` to version control (it's in `.gitignore`)

### Step 1.5: Configure JWT Template for Convex (REQUIRED)

**This step is critical** - without it, you'll see 404 errors when Clerk tries to generate tokens.

1. In Clerk Dashboard, go to **JWT Templates** (in the left sidebar)
2. Click **New Template**
3. Select **Convex** from the template list
4. Name it `convex` (lowercase, must match exactly)
5. The template should have this claim:
    ```json
    {
        "aud": "convex"
    }
    ```
6. Click **Save**

This allows Clerk to generate authentication tokens that Convex can verify.

### Step 1.6: Update Convex Auth Configuration (REQUIRED)

Update `convex/auth.config.js` with your Clerk instance domain:

1. Find your Clerk domain from the Dashboard URL (e.g., `crisp-hyena-26.clerk.accounts.dev`)
2. Open `convex/auth.config.js`
3. Replace the domain with your actual Clerk domain:
    ```javascript
    export default {
        providers: [
            {
                domain: "https://YOUR-INSTANCE.clerk.accounts.dev",
                applicationID: "convex",
            },
        ],
    };
    ```
4. Save the file - Convex will auto-reload with the new config

Without this, you'll see "No auth provider found matching the given token" errors.

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

### Step 4: Configure Social Authentication (Optional)

If you want users to sign in with Google or GitHub:

#### 4.1 Enable Google OAuth

1. In Clerk Dashboard, go to **"User & Authentication" → "Social Connections"**
2. Find **"Google"** and click **"Configure"**
3. Toggle **"Enable"** to ON
4. Choose configuration method:
    - **Option A (Recommended for Testing)**: Use Clerk's development keys
        - Just toggle "Enable" - no additional setup needed
        - Limited to development domains only
    - **Option B (Production)**: Use your own Google OAuth credentials
        - Go to [Google Cloud Console](https://console.cloud.google.com/)
        - Create a new project or select existing one
        - Enable Google+ API
        - Create OAuth 2.0 credentials
        - Add authorized redirect URI: `https://YOUR-CLERK-DOMAIN/v1/oauth_callback`
        - Copy Client ID and Client Secret to Clerk
5. Click **"Save"**

#### 4.2 Enable GitHub OAuth

1. In Clerk Dashboard, go to **"User & Authentication" → "Social Connections"**
2. Find **"GitHub"** and click **"Configure"**
3. Toggle **"Enable"** to ON
4. Choose configuration method:
    - **Option A (Recommended for Testing)**: Use Clerk's development keys
        - Just toggle "Enable" - no additional setup needed
    - **Option B (Production)**: Use your own GitHub OAuth app
        - Go to [GitHub Developer Settings](https://github.com/settings/developers)
        - Click **"New OAuth App"**
        - Fill in:
            - Application name: "NextStep"
            - Homepage URL: `http://localhost:3000` (for dev)
            - Authorization callback URL: `https://YOUR-CLERK-DOMAIN/v1/oauth_callback`
        - Copy Client ID and Client Secret to Clerk
5. Click **"Save"**

#### 4.3 Configure Email Settings

1. In Clerk Dashboard, go to **"User & Authentication" → "Email, Phone, Username"**
2. Configure email settings:
    - ✅ Enable **"Email address"** as a sign-up method
    - ✅ Enable **"Require email verification"** (recommended)
    - ✅ Enable **"Email verification link"** (easiest for users)
3. Customize email templates (optional):
    - Go to **"Customization" → "Emails"**
    - Edit verification email, welcome email, etc.
4. Click **"Save"**

### Step 5: Set Up Clerk Webhook (Optional but Recommended)

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

### Step 6: Verify Environment Configuration

Before running the application, verify all environment variables are set correctly:

```bash
# Check environment variables
node scripts/check-env.js
```

This will validate:

- ✅ All required variables are present
- ✅ Variables have correct format
- ✅ Provides setup instructions for any missing variables

### Step 7: Run the Application

1. **Terminal 1** - Start Convex (if using local):

    ```bash
    npx convex dev
    ```

2. **Terminal 2** - Start Next.js:

    ```bash
    npm run dev
    ```

3. Open http://localhost:3000

### Step 8: Test the Authentication Flows

Follow the comprehensive testing guide:

```bash
# Review the testing guide
docs/CLERK-TESTING-GUIDE.md
```

Test these flows:

- ✅ Sign up with email verification
- ✅ Sign in with email/password
- ✅ Sign in with Google (if enabled)
- ✅ Sign in with GitHub (if enabled)
- ✅ Session persistence
- ✅ Sign out

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
