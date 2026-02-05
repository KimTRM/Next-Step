// ⚠️ CRITICAL FILE
// Do not rewrite or refactor.
// Only minimal, scoped edits allowed.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes - accessible without authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/jobs(.*)",
    "/mentors(.*)",
    "/api(.*)",
]);

// Auth routes - redirect authenticated users away from these
const isAuthRoute = createRouteMatcher([
    "/auth(.*)",
    "/login(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
]);

// Onboarding route - special handling for new users
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Allow public routes without any checks
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (userId && isAuthRoute(req)) {
        // Check for redirect_url parameter and use it if available
        const redirectUrl = req.nextUrl.searchParams.get("redirect_url");
        const targetUrl = new URL(redirectUrl || "/dashboard", req.url);
        return NextResponse.redirect(targetUrl);
    }

    // Allow auth routes for unauthenticated users
    if (isAuthRoute(req)) {
        return NextResponse.next();
    }

    // Special handling for onboarding route
    // Allow access even if session is still being established (race condition after sign-up)
    if (isOnboardingRoute(req)) {
        // If authenticated, allow access
        if (userId) {
            return NextResponse.next();
        }
        // If not authenticated, check if there's a pending session (Clerk cookie exists but not yet validated)
        // Give a small grace period for session establishment by allowing the request
        // The client-side will handle redirect if truly unauthenticated
        const hasClerkCookie =
            req.cookies.has("__client_uat") || req.cookies.has("__session");
        if (hasClerkCookie) {
            // Session cookie exists, allow request - client will handle auth check
            return NextResponse.next();
        }
        // No session at all, redirect to auth
        const loginUrl = new URL("/auth", req.url);
        loginUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // All other routes require authentication
    if (!userId) {
        // Preserve the intended destination for redirect after login
        const loginUrl = new URL("/auth", req.url);
        loginUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Allow authenticated requests to proceed
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip static files and Next internals
        "/((?!_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
    ],
};
