# ⚡ NextStep - Quick Start Guide

**Last Updated:** January 18, 2026

Get NextStep running in **10 minutes**!

---

## 🎯 Prerequisites

- **Node.js 18+** installed
- **npm** package manager
- **Git** installed
- **Clerk account** (free) → [clerk.com](https://clerk.com)
- **Convex account** (free) → [convex.dev](https://convex.dev)

---

## 🚀 Setup Steps

### 1. Clone & Install

```bash
git clone <repository-url>
cd next-step
npm install
```

### 2. Get Clerk Keys

1. Go to [clerk.com/dashboard](https://dashboard.clerk.com)
2. Create a new application (or use existing)
3. Go to **API Keys** section
4. Copy:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`

**Important:** Configure JWT Template named "convex"

- Go to **JWT Templates** in Clerk dashboard
- Click **New Template**
- Name it: `convex`
- Save

### 3. Get Convex Keys

```bash
# Run this command (will open browser)
npx convex dev
```

This will:

- Create a Convex project
- Generate `NEXT_PUBLIC_CONVEX_URL`
- Set up `convex/` directory

### 4. Configure Environment

Create `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

### 5. Configure Convex Auth

Update `convex/auth.config.js`:

```javascript
export default {
    providers: [
        {
            domain:
                process.env.CLERK_DOMAIN ||
                "https://your-domain.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
```

**Get your Clerk domain:**

- In Clerk Dashboard → Settings → General
- Copy the "Frontend API" URL

### 6. Start Development

**Terminal 1 - Convex:**

```bash
npm run convex:dev
```

**Terminal 2 - Next.js:**

```bash
npm run dev
```

### 7. Open Browser

Visit: **http://localhost:3000**

---

## ✅ Verify Setup

### Test Authentication

1. Click "Sign In" or "Sign Up"
2. Create an account
3. Should redirect to dashboard

### Test Jobs Feature

1. Navigate to `/jobs`
2. Should see job listings
3. Try search and filters

### Test Messages

1. Navigate to `/messages`
2. Should see messaging interface
3. Requires at least 2 users to test

---

## 🐛 Troubleshooting

### "Unauthorized" on API calls

**Problem:** Clerk JWT template not configured

**Solution:**

1. Go to Clerk Dashboard → JWT Templates
2. Create template named "convex"
3. Restart dev server

### Convex auth not working

**Problem:** Wrong domain in `auth.config.js`

**Solution:**

1. Check Clerk Dashboard → Settings → General
2. Copy exact "Frontend API" URL
3. Update `convex/auth.config.js`
4. Run `npx convex dev` again

### Build errors

**Problem:** TypeScript type errors

**Solution:**

```bash
npm run type-check
# Fix any errors shown
npm run build
```

### Module not found

**Problem:** Missing dependencies

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Project Structure

```
next-step/
├── app/                    # Pages & API routes
│   ├── (platform)/        # Protected pages
│   │   ├── jobs/          # ✅ Jobs feature
│   │   ├── applications/  # ✅ Applications
│   │   ├── messages/      # ✅ Messages
│   │   └── ...
│   └── api/               # API routes
│       ├── jobs/
│       ├── applications/
│       └── messages/
├── components/            # React components
│   ├── ui/               # shadcn/ui
│   ├── layout/           # Header, Sidebar
│   └── features/         # Feature components
├── convex/               # Backend (Convex)
│   ├── schema.ts
│   ├── jobs.ts
│   ├── messages.ts
│   └── ...
├── lib/                  # Utilities
│   └── dal/             # Data Access Layer
│       ├── types/
│       └── server/
└── proxy.ts             # Auth middleware
```

---

## 🎨 Features Available

### ✅ Complete

- **Jobs:** Search, filter, view details, apply
- **Applications:** Track status, update, view details
- **Messages:** Real-time chat, conversations
- **Auth:** Sign in/up, protected routes

### 🟡 Partial

- **Mentors:** Some functionality
- **Profile:** Basic features

### ⚪ Coming Soon

- **Opportunities:** Learning opportunities
- **Dashboard:** Analytics and insights

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start Next.js
npm run convex:dev       # Start Convex

# Building
npm run build            # Production build
npm run type-check       # Check types
npm run lint             # Lint code

# Convex
npx convex dev           # Interactive dev
npx convex deploy        # Deploy to production
npx convex dashboard     # Open Convex dashboard
```

---

## 📚 Next Steps

### Learn the Codebase

1. **Read** [ARCHITECTURE.md](ARCHITECTURE.md) - Understand system design
2. **Study** [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Learn patterns
3. **Explore** `app/(platform)/jobs/` - See complete feature

### Try Development

1. **Find** a small feature to add
2. **Follow** the DAL pattern (types → DAL → API → component)
3. **Test** your changes
4. **Submit** a pull request

### Explore Features

- Test job search and application
- Try messaging between users
- Check out application tracking
- Explore profile settings

---

## 🆘 Need Help?

### Documentation

- [README.md](README.md) - Main documentation index
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Development patterns

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.com/docs)

### Common Issues

- Check [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) for troubleshooting
- Search existing issues in repository
- Create new issue with details

---

## 🎉 You're Ready!

Your development environment is now set up. Start exploring the codebase and building features!

**Remember:**

- Keep both terminals running (Convex + Next.js)
- Changes auto-reload
- Check browser console for errors
- Have fun coding!

---

**Last Updated:** January 18, 2026
