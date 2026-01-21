/**
 * Convex-Clerk Authentication Configuration
 *
 * This file configures Convex to use Clerk for authentication
 */

const authConfig = {
    providers: [
        {
            domain: "https://crisp-hyena-26.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};

export default authConfig;
