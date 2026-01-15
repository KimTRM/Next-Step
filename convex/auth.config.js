/**
 * Convex-Clerk Authentication Configuration
 *
 * This file configures Convex to use Clerk for authentication
 */

export default {
    providers: [
        {
            domain: "https://clerk.convex.dev",
            applicationID: "convex",
        },
    ],
};
