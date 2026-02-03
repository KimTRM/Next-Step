// ⚠️ CRITICAL FILE
// Do not rewrite or refactor.
// Only minimal, scoped edits allowed.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Auth routes - redirect authenticated users away from these
const isAuthRoute = createRouteMatcher([
    "/auth(.*)",
    "/login(.*)",
    "/sign-up(.*)",
]);

// Protected routes - require authentication
const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/welcome",
    "/onboarding(.*)",
    "/applications(.*)",
    "/jobs(.*)",
    "/mentors(.*)",
    "/messages(.*)",
    "/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from auth pages
    if (userId && isAuthRoute(req)) {
        // Check for redirect_url parameter and use it if available
        const redirectUrl = req.nextUrl.searchParams.get("redirect_url");
        const targetUrl = new URL(redirectUrl || "/dashboard", req.url);
        return NextResponse.redirect(targetUrl);
    }

    // Protect routes that require authentication
    if (!userId && isProtectedRoute(req)) {
        // Preserve the intended destination for redirect after login
        const loginUrl = new URL("/auth", req.url);
        loginUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Allow public routes and authenticated requests to proceed
    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip static files and Next internals
        "/((?!_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
    ],
};
