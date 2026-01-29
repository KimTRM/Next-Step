/**
 * Clerk Webhook Handler
 * Syncs user data from Clerk to Convex
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
    // Get the webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
        return new Response("Webhook secret not configured", { status: 500 });
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with the secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }

    // Handle the webhook event
    const eventType = evt.type;

    try {
        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const email = email_addresses?.[0]?.email_address;
            const name = [first_name, last_name].filter(Boolean).join(" ") || email?.split("@")[0] || "User";

            if (!email) {
                console.error("No email found for user:", id);
                return new Response("No email found", { status: 400 });
            }

            // Upsert user in Convex
            await convex.mutation(api.users.index.upsertUser, {
                clerkId: id,
                email,
                name,
                avatarUrl: image_url,
            });

            console.log(`User ${eventType === "user.created" ? "created" : "updated"}:`, id);
        }

        if (eventType === "user.deleted") {
            const { id } = evt.data;

            if (id) {
                // Delete user from Convex
                await convex.mutation(api.users.index.deleteUser, {
                    clerkId: id,
                });

                console.log("User deleted:", id);
            }
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error processing webhook", { status: 500 });
    }
}
