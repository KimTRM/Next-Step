/**
 * Convex HTTP Actions
 * Handles HTTP endpoints including Clerk webhooks
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Clerk Webhook Handler
 * Syncs user data from Clerk to Convex
 *
 * Configure in Clerk Dashboard:
 * Webhook URL: https://<your-convex-deployment>.convex.site/clerk-webhook
 * Events: user.created, user.updated, user.deleted
 */
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Get webhook secret from environment
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
            return new Response("Webhook secret not configured", {
                status: 500,
            });
        }

        // Get Svix headers for verification
        const svixId = request.headers.get("svix-id");
        const svixTimestamp = request.headers.get("svix-timestamp");
        const svixSignature = request.headers.get("svix-signature");

        if (!svixId || !svixTimestamp || !svixSignature) {
            console.error("Missing Svix headers");
            return new Response("Missing svix headers", { status: 400 });
        }

        // Get the raw body
        const payload = await request.text();

        // Verify the webhook signature using Svix
        // We'll do manual verification since we can't use the svix package in Convex
        const isValid = await verifyWebhookSignature(
            payload,
            svixId,
            svixTimestamp,
            svixSignature,
            webhookSecret,
        );

        if (!isValid) {
            console.error("Invalid webhook signature");
            return new Response("Invalid signature", { status: 400 });
        }

        // Parse the payload
        let event;
        try {
            event = JSON.parse(payload);
        } catch (err) {
            console.error("Failed to parse webhook payload:", err);
            return new Response("Invalid payload", { status: 400 });
        }

        const eventType = event.type;
        const eventData = event.data;

        console.log(`[Clerk Webhook] Received event: ${eventType}`);

        try {
            if (eventType === "user.created" || eventType === "user.updated") {
                const {
                    id,
                    email_addresses,
                    first_name,
                    last_name,
                    image_url,
                    username,
                } = eventData;

                const email = email_addresses?.[0]?.email_address;
                const name =
                    [first_name, last_name].filter(Boolean).join(" ") ||
                    username ||
                    email?.split("@")[0] ||
                    "User";

                if (!email) {
                    console.error("No email found for user:", id);
                    return new Response("No email found", { status: 400 });
                }

                // Call internal mutation to upsert user
                await ctx.runMutation(
                    internal.users.mutations.upsertUserInternal,
                    {
                        clerkId: id,
                        email,
                        name,
                        avatarUrl: image_url || undefined,
                    },
                );

                console.log(
                    `[Clerk Webhook] User ${eventType === "user.created" ? "created" : "updated"}: ${id}`,
                );
            }

            if (eventType === "user.deleted") {
                const { id } = eventData;

                if (id) {
                    // Call internal mutation to delete user
                    await ctx.runMutation(
                        internal.users.mutations.deleteUserInternal,
                        {
                            clerkId: id,
                        },
                    );

                    console.log(`[Clerk Webhook] User deleted: ${id}`);
                }
            }

            return new Response("Webhook processed", { status: 200 });
        } catch (error) {
            console.error("[Clerk Webhook] Error processing webhook:", error);
            return new Response("Error processing webhook", { status: 500 });
        }
    }),
});

/**
 * Verify Svix webhook signature
 * Based on Svix signature verification algorithm
 */
async function verifyWebhookSignature(
    payload: string,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    secret: string,
): Promise<boolean> {
    try {
        // Check timestamp to prevent replay attacks (5 minute tolerance)
        const timestamp = parseInt(svixTimestamp, 10);
        const now = Math.floor(Date.now() / 1000);

        if (Math.abs(now - timestamp) > 300) {
            console.error("Webhook timestamp too old or in future");
            return false;
        }

        // The secret from Clerk starts with "whsec_"
        // We need to base64 decode the part after the prefix
        const secretBytes =
            secret.startsWith("whsec_") ?
                base64ToUint8Array(secret.slice(6))
            :   base64ToUint8Array(secret);

        // Create the signed payload
        const signedPayload = `${svixId}.${svixTimestamp}.${payload}`;

        // Import the key for HMAC
        const key = await crypto.subtle.importKey(
            "raw",
            secretBytes.buffer as ArrayBuffer,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"],
        );

        // Sign the payload
        const signatureBytes = await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(signedPayload),
        );

        // Convert to base64
        const expectedSignature = uint8ArrayToBase64(
            new Uint8Array(signatureBytes),
        );

        // Svix sends multiple signatures separated by space, each prefixed with version
        // e.g., "v1,signature1 v1,signature2"
        const signatures = svixSignature.split(" ");

        for (const sig of signatures) {
            const [version, signature] = sig.split(",");
            if (version === "v1" && signature === expectedSignature) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error("Error verifying webhook signature:", error);
        return false;
    }
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export default http;
