# Clerk Setup Quick Reference

## ⚡ 5-Minute Setup

### 1. Get Clerk Keys (2 min)

```
1. Go to https://clerk.com → Sign Up
2. Create application: "NextStep"
3. Dashboard → API Keys → Copy both keys
```

### 2. Add to `.env.local` (1 min)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Create JWT Template (1 min)

```
1. Clerk Dashboard → JWT Templates
2. New Template → Select "Convex"
3. Name: "convex" → Save
```

### 4. Update Convex Config (1 min)

```javascript
// convex/auth.config.js
// Replace: https://clerk.convex.dev
// With: https://YOUR-INSTANCE.clerk.accounts.dev
```

## 🚀 Run Application

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev

# Open browser
http://localhost:3000
```

## ✅ Verify Setup

```bash
node scripts/check-env.js
```

## 🧪 Test Authentication

```
1. Click "Sign Up"
2. Create account with email
3. Verify email (check inbox)
4. Sign in with credentials
5. User appears in Convex dashboard
```

## 🆘 Quick Troubleshooting

| Error                          | Fix                                                      |
| ------------------------------ | -------------------------------------------------------- |
| `Clerk has not been loaded`    | Check keys in `.env.local`, restart `npm run dev`        |
| `No auth provider found`       | Update `convex/auth.config.js` with correct Clerk domain |
| `JWT template not found (404)` | Create "convex" JWT template in Clerk Dashboard          |
| `Email not arriving`           | Check spam folder, verify settings in Clerk Dashboard    |
| `Hydration mismatch`           | Try incognito mode or clear browser cache                |
| `WebSocket reconnecting`       | Restart Convex: `npx convex dev`                         |

## 📚 Documentation

- **Setup Guide**: `docs/CONVEX-CLERK-SETUP.md`
- **Testing Guide**: `docs/CLERK-TESTING-GUIDE.md`
- **Completion Summary**: `docs/CLERK-SETUP-COMPLETION.md`

## 🔗 Dashboard Links

- [Clerk Dashboard](https://dashboard.clerk.com) - Manage authentication
- [Convex Dashboard](https://dashboard.convex.dev) - View database
- [Localhost App](http://localhost:3000) - Your application

## 💡 Optional: Enable Social Auth

### Google OAuth

1. Clerk Dashboard → Social Connections → Google
2. Toggle Enable (development keys work automatically)

### GitHub OAuth

1. Clerk Dashboard → Social Connections → GitHub
2. Toggle Enable (development keys work automatically)

## 💻 Key Files

```
app/providers.tsx              # Environment validation
app/api/webhooks/clerk/        # User sync endpoint
convex/auth.config.js          # Clerk domain config
convex/userMutations.ts        # User creation logic
docs/CONVEX-CLERK-SETUP.md    # Full setup guide
```

## 🆘 Need Help?

1. **Check docs**: `docs/CLERK-TESTING-GUIDE.md` (common issues section)
2. **Run validator**: `node scripts/check-env.js`
3. **View logs**: Check terminal where `npm run dev` runs
4. **Official docs**:
    - [Clerk Docs](https://clerk.com/docs)
    - [Convex Docs](https://docs.convex.dev)

---

**First time setup?** Follow: `docs/CONVEX-CLERK-SETUP.md`  
**Testing authentication?** Follow: `docs/CLERK-TESTING-GUIDE.md`  
**Want details?** Read: `docs/CLERK-SETUP-COMPLETION.md`
