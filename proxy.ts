import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk Authentication Proxy
 *
 * Protects routes that require authentication
 *
 * Public routes (no auth required):
 * - Landing page (/)
 * - Opportunities browse page (/opportunities)
 * - Static assets
 *
 * Protected routes (auth required):
 * - Dashboard (/dashboard)
 * - Profile (/profile)
 * - Messages (/messages)
 * - Applications (/applications)
 * - All other /app routes
 */

const isPublicRoute = createRouteMatcher([
    "/",
    "/opportunities",
    "/api/webhooks(.*)",
    "/auth(.*)",
    "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
