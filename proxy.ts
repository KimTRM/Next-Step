import { clerkMiddleware } from "@clerk/nextjs/server";
// import { createRouteMatcher } from "@clerk/nextjs/server";

// const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

// export default clerkMiddleware(async (auth, req) => {
//     if (!isPublicRoute(req)) {
//         await auth.protect();
//     }
// });

// Apply Clerk auth to all routes except static assets and Next internals.
export default clerkMiddleware();

export const config = {
    matcher: [
        // Skip static files and Next internals
        "/((?!_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
    ],
};
