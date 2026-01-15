/**
 * Clerk Webhook Handler
 *
 * Syncs user creation/updates/deletions from Clerk to Convex
 *
 * Setup instructions:
 * 1. Go to Clerk Dashboard → Webhooks
 * 2. Add endpoint: https://yourdomain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy webhook secret to CLERK_WEBHOOK_SECRET env var
 *
 * Testing locally:
 * 1. Use ngrok: `ngrok http 3000`
 * 2. Set webhook URL to: https://your-ngrok-url.ngrok.io/api/webhooks/clerk
 * 3. Watch terminal logs for sync messages
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
    // Get webhook secret from env
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error(
            "❌ CLERK_WEBHOOK_SECRET is not set in environment variables"
        );
        console.error(
            "ℹ️  Add it to .env.local to enable webhook functionality"
        );
        return new Response(
            JSON.stringify({
                error: "Webhook secret not configured",
                message:
                    "Set CLERK_WEBHOOK_SECRET in your environment variables",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("❌ Missing svix headers in webhook request");
        return new Response(JSON.stringify({ error: "Missing svix headers" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create webhook instance
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify webhook signature
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("❌ Error verifying webhook signature:", err);
        console.error(
            "ℹ️  Check that CLERK_WEBHOOK_SECRET matches the secret in Clerk Dashboard"
        );
        return new Response(JSON.stringify({ error: "Verification failed" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`📨 Received webhook event: ${eventType}`);

    if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } =
            evt.data;

        const userData = {
            clerkId: id,
            email: email_addresses[0]?.email_address || "",
            name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
            avatarUrl: image_url,
        };

        console.log(`📝 Syncing user to Convex:`, {
            clerkId: userData.clerkId,
            email: userData.email,
            name: userData.name,
        });

        try {
            await convex.mutation(api.userMutations.upsertUser, userData);

            console.log(`✅ Successfully synced user ${id} to Convex`);
            return new Response(
                JSON.stringify({
                    success: true,
                    message: `User ${eventType === "user.created" ? "created" : "updated"}`,
                    userId: id,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            console.error("❌ Error syncing user to Convex:", error);
            return new Response(
                JSON.stringify({
                    error: "Failed to sync user",
                    details:
                        error instanceof Error ?
                            error.message
                        :   "Unknown error",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }

    if (eventType === "user.deleted") {
        const { id } = evt.data;

        console.log(`🗑️  Deleting user ${id} from Convex`);

        try {
            await convex.mutation(api.userMutations.deleteUser, {
                clerkId: id!,
            });

            console.log(`✅ Successfully deleted user ${id} from Convex`);
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "User deleted",
                    userId: id,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            console.error("❌ Error deleting user from Convex:", error);
            return new Response(
                JSON.stringify({
                    error: "Failed to delete user",
                    details:
                        error instanceof Error ?
                            error.message
                        :   "Unknown error",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }

    // Unhandled event type
    console.log(`ℹ️  Unhandled event type: ${eventType}`);
    return new Response(
        JSON.stringify({
            success: true,
            message: "Event received but not processed",
            eventType,
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );

    return new Response("Webhook processed", { status: 200 });
}
