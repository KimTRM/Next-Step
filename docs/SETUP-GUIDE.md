# 🚀 NextStep Setup Guide

**Last Updated:** January 18, 2026

Complete setup guide for NextStep platform with Clerk authentication and Convex database.

---

## ⚡ Quick Setup (10 Minutes)

### Prerequisites

- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)

---

## 📋 Step 1: Clone & Install

```bash
git clone https://github.com/KimTRM/Next-Step.git
cd Next-Step
npm install
```

---

## 🔑 Step 2: Clerk Authentication Setup

### 2.1 Create Clerk Account

1. Go to [clerk.com](https://clerk.com) → Sign Up
2. Create application: "NextStep"
3. Dashboard → **API Keys** → Copy both keys

### 2.2 Configure JWT Template (Critical)

1. Clerk Dashboard → **JWT Templates**
2. Click **New Template** → Select **Convex**
3. Name: `convex` (must be lowercase)
4. Save

### 2.3 Add to Environment Variables

Create `.env.local` in project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex Database (will be set in next step)
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
```

---

## 💾 Step 3: Convex Database Setup

### 3.1 Create Convex Account

1. Go to [convex.dev](https://convex.dev) → Sign Up
2. Install CLI (if needed): `npm install -g convex`

### 3.2 Deploy to Convex

```bash
# Login to Convex
npx convex login

# Deploy and follow prompts
npx convex dev
```

This will:

- Create a new Convex project
- Update your `.env.local` with Convex URLs
- Start watching for schema changes

### 3.3 Update Convex Auth Config

1. Find your Clerk domain in Clerk Dashboard URL  
   Example: `crisp-hyena-26.clerk.accounts.dev`

2. Open `convex/auth.config.js` and update:

```javascript
export default {
    providers: [
        {
            domain: "https://YOUR-CLERK-DOMAIN.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
```

### 3.4 Seed Database

```bash
npx convex run seed:seedAll
```

This populates your database with sample data.

---

## ✅ Step 4: Verify Setup

```bash
# Check environment variables
node scripts/check-env.js
```

Expected output:

```
✅ All required environment variables are configured correctly
```

---

## 🚀 Step 5: Run Application

Open two terminals:

**Terminal 1 - Convex:**

```bash
npx convex dev
```

**Terminal 2 - Next.js:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Authentication

### Basic Flow Test

1. **Sign Up**
    - Click "Sign Up" button
    - Enter email and password
    - Check email for verification link
    - Click link to verify

2. **Sign In**
    - Click "Sign In"
    - Enter credentials
    - Should redirect to dashboard

3. **Verify Data Sync**
    - Go to [Convex Dashboard](https://dashboard.convex.dev)
    - Check "users" table for your account
    - Profile page should show your data

### Social Authentication (Optional)

**Enable Google:**

1. Clerk Dashboard → **Social Connections** → **Google**
2. Toggle Enable (uses dev keys automatically)
3. Test with "Continue with Google"

**Enable GitHub:**

1. Clerk Dashboard → **Social Connections** → **GitHub**
2. Toggle Enable (uses dev keys automatically)
3. Test with "Continue with GitHub"

---

## 🐛 Troubleshooting

### Common Issues

| Problem                     | Solution                                                 |
| --------------------------- | -------------------------------------------------------- |
| `Clerk has not been loaded` | Restart `npm run dev` after adding keys                  |
| `No auth provider found`    | Update `convex/auth.config.js` with correct Clerk domain |
| `JWT template not found`    | Create "convex" template in Clerk Dashboard              |
| `Cannot connect to Convex`  | Ensure `npx convex dev` is running                       |
| `Email not arriving`        | Check spam folder, verify email settings in Clerk        |
| `Hydration mismatch`        | Clear browser cache or use incognito mode                |

### Verification Checklist

```bash
# Check all environment variables
node scripts/check-env.js

# Verify Convex connection
npx convex dashboard

# Check build works
npm run build
```

### View Logs

- **Convex logs**: Terminal running `npx convex dev`
- **Next.js logs**: Terminal running `npm run dev`
- **Clerk logs**: [Clerk Dashboard](https://dashboard.clerk.com) → Activity

---

## 🔧 Optional Configuration

### Webhooks (Production Recommended)

Automatically sync Clerk users to Convex:

1. **Local Testing with ngrok:**

    ```bash
    # Install ngrok
    npm install -g ngrok

    # Start tunnel
    ngrok http 3000
    ```

2. **Configure Webhook:**
    - Clerk Dashboard → **Webhooks** → **Add Endpoint**
    - URL: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
    - Events: `user.created`, `user.updated`, `user.deleted`
    - Copy **Signing Secret**

3. **Add to `.env.local`:**

    ```bash
    CLERK_WEBHOOK_SECRET=whsec_...
    ```

4. **Restart dev server**

### Email Customization

1. Clerk Dashboard → **Customization** → **Emails**
2. Edit templates for verification, welcome, etc.
3. Add your branding and styling

---

## 📁 Project Structure

```
next-step/
├── app/
│   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   ├── (platform)/          # Protected platform pages
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── messages/
│   ├── api/
│   │   └── webhooks/clerk/  # Clerk webhook handler
│   ├── providers.tsx        # Clerk + Convex providers
│   └── layout.tsx
│
├── convex/
│   ├── schema.ts            # Database schema
│   ├── auth.config.js       # Clerk configuration
│   ├── users.ts             # User queries
│   ├── jobs.ts              # Job queries
│   ├── applications.ts      # Application queries
│   └── messages.ts          # Message queries
│
├── components/
│   ├── features/            # Feature-specific components
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
│
├── lib/
│   ├── dal/                 # Data Access Layer
│   └── types.ts             # TypeScript types
│
└── docs/                    # Documentation
```

---

## 🎯 What's Included

### Features Ready to Use

- ✅ **Authentication** - Email/password and social login
- ✅ **Jobs Board** - Browse and view job opportunities
- ✅ **Applications** - Track application status
- ✅ **Messages** - Real-time messaging
- ✅ **Dashboard** - Overview of activities
- ✅ **Profile** - User profile management

### Database Collections

Your Convex database includes:

- **users** - User profiles and authentication
- **jobs** - Job postings and opportunities
- **jobApplications** - Application tracking
- **messages** - Real-time messages
- **mentors** - Mentor profiles (partial)
- **opportunities** - General opportunities (partial)

---

## 📚 Next Steps

After setup is complete:

1. **Explore the codebase:**
    - Review DAL pattern in `lib/dal/`
    - Check API routes in `app/api/`
    - See component examples in `components/features/`

2. **Read documentation:**
    - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
    - [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Development patterns
    - [TODO.md](TODO.md) - Roadmap and features

3. **Start developing:**
    - Follow DAL pattern for new features
    - Use existing features as examples
    - Check TODO.md for upcoming work

---

## 🆘 Getting Help

### Documentation

- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Developer Guide**: [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)
- **Documentation Index**: [INDEX.md](INDEX.md)

### External Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js App Router](https://nextjs.org/docs/app)

### Support

- Check GitHub issues
- Review documentation in `docs/`
- Clerk Dashboard Activity logs
- Convex Dashboard logs

---

## 🎉 You're All Set!

Your NextStep platform is ready for development. The application includes:

- Modern Next.js 16 architecture
- Real-time Convex database
- Secure Clerk authentication
- Complete DAL pattern implementation
- Blue gradient design system
- Sample data for testing

Start building features following the patterns in the Developer Guide!

---

**Setup Time:** ~10 minutes  
**Last Updated:** January 18, 2026  
**Questions?** Check [INDEX.md](INDEX.md) for more documentation
