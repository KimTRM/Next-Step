import { clerkMiddleware } from "@clerk/nextjs/server";

// Apply Clerk auth to all routes except static assets and Next internals.
export default clerkMiddleware();

export const config = {
    matcher: [
        // Skip static files and Next internals
        "/((?!_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
    ],
};
