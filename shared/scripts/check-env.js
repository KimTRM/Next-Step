/**
 * Environment Variables Validation Utility
 *
 * Run this script to validate all required environment variables are set correctly.
 * Usage: node scripts/check-env.js
 */

// Check if we're running in Node.js
const isNode =
    typeof process !== "undefined" && process.versions && process.versions.node;

if (!isNode) {
    console.error("This script must be run with Node.js");
    process.exit(1);
}

// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const checks = {
    errors: [],
    warnings: [],
    success: [],
};

// Required variables for core functionality
const required = [
    {
        name: "NEXT_PUBLIC_CONVEX_URL",
        description: "Convex database URL",
        pattern: /^https?:\/\/.+\.convex\.(cloud|site)$/,
        example: "https://your-deployment.convex.cloud",
        setupDocs: "Run `npx convex dev` to get your URL",
    },
    {
        name: "CONVEX_DEPLOYMENT",
        description: "Convex deployment identifier",
        pattern: /^(dev:|prod:)?[\w-]+$/,
        example: "dev:hidden-skunk-152",
        setupDocs: "Set by `npx convex dev` automatically",
    },
    {
        name: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
        description: "Clerk publishable key (client-side)",
        pattern: /^pk_(test|live)_[\w]+$/,
        example: "pk_test_...",
        setupDocs: "Get from https://dashboard.clerk.com → API Keys",
    },
    {
        name: "CLERK_SECRET_KEY",
        description: "Clerk secret key (server-side)",
        pattern: /^sk_(test|live)_[\w]+$/,
        example: "sk_test_...",
        setupDocs: "Get from https://dashboard.clerk.com → API Keys",
    },
];

// Optional but recommended
const optional = [
    {
        name: "CLERK_WEBHOOK_SECRET",
        description: "Clerk webhook signing secret",
        pattern: /^whsec_[\w]+$/,
        example: "whsec_...",
        setupDocs: "Get from Clerk Dashboard → Webhooks → Add Endpoint",
        required: false,
    },
];

console.log("\n🔍 Checking Environment Variables...\n");
console.log("=".repeat(60));

// Check required variables
for (const variable of required) {
    const value = process.env[variable.name];

    if (!value) {
        checks.errors.push({
            variable: variable.name,
            message: `Missing required variable`,
            fix: variable.setupDocs,
            example: variable.example,
        });
        console.log(`❌ ${variable.name}`);
        console.log(`   ${variable.description}`);
        console.log(`   Fix: ${variable.setupDocs}`);
        console.log(`   Example: ${variable.example}\n`);
    } else if (!variable.pattern.test(value)) {
        checks.errors.push({
            variable: variable.name,
            message: `Invalid format`,
            fix: `Expected format: ${variable.example}`,
            current: value.substring(0, 20) + "...",
        });
        console.log(`❌ ${variable.name}`);
        console.log(`   Invalid format. Expected: ${variable.example}`);
        console.log(`   Current: ${value.substring(0, 20)}...`);
        console.log(`   Fix: ${variable.setupDocs}\n`);
    } else {
        checks.success.push(variable.name);
        console.log(`✅ ${variable.name}`);
        console.log(`   ${variable.description}: OK\n`);
    }
}

// Check optional variables
console.log("=".repeat(60));
console.log("\n📋 Optional Variables:\n");

for (const variable of optional) {
    const value = process.env[variable.name];

    if (!value) {
        checks.warnings.push({
            variable: variable.name,
            message: `Optional variable not set`,
            impact: "Webhook auto-sync disabled (manual sync still works)",
            fix: variable.setupDocs,
        });
        console.log(`⚠️  ${variable.name}`);
        console.log(`   ${variable.description}: Not set`);
        console.log(`   Impact: Webhook auto-sync disabled`);
        console.log(`   Fix: ${variable.setupDocs}\n`);
    } else if (variable.pattern && !variable.pattern.test(value)) {
        checks.warnings.push({
            variable: variable.name,
            message: `Invalid format`,
            fix: `Expected format: ${variable.example}`,
        });
        console.log(`⚠️  ${variable.name}`);
        console.log(`   Invalid format. Expected: ${variable.example}\n`);
    } else {
        checks.success.push(variable.name);
        console.log(`✅ ${variable.name}`);
        console.log(`   ${variable.description}: OK\n`);
    }
}

// Summary
console.log("=".repeat(60));
console.log("\n📊 Summary:\n");
console.log(`✅ Valid: ${checks.success.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);
console.log(`❌ Errors: ${checks.errors.length}\n`);

if (checks.errors.length === 0 && checks.warnings.length === 0) {
    console.log("🎉 All environment variables are configured correctly!\n");
    console.log("Next steps:");
    console.log("  1. Run `npx convex dev` (if not already running)");
    console.log("  2. Run `npm run dev`");
    console.log("  3. Test authentication flows\n");
    process.exit(0);
} else if (checks.errors.length === 0) {
    console.log("✅ Core configuration complete!\n");
    console.log("⚠️  Some optional features are not configured.");
    console.log("   Review warnings above for details.\n");
    console.log("You can proceed with:");
    console.log("  1. Run `npx convex dev`");
    console.log("  2. Run `npm run dev`");
    console.log("  3. Configure optional features later\n");
    process.exit(0);
} else {
    console.log("❌ Configuration incomplete!\n");
    console.log(
        "Please fix the errors above before running the application.\n"
    );
    console.log("Resources:");
    console.log("  📖 Setup Guide: docs/CONVEX-CLERK-SETUP.md");
    console.log("  🧪 Testing Guide: docs/CLERK-TESTING-GUIDE.md");
    console.log("  🔗 Clerk Dashboard: https://dashboard.clerk.com");
    console.log("  🔗 Convex Dashboard: https://dashboard.convex.dev\n");
    process.exit(1);
}
