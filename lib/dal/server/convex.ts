/**
 * Convex client for server-side operations
 * Used by DAL classes to interact with Convex database
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not set");
}

let convexClient: ConvexHttpClient | null = null;

type AuthProvider = string | (() => Promise<string | null>);

function resolveAuth(auth: AuthProvider): Promise<string | null> {
    return typeof auth === "string" ? Promise.resolve(auth) : auth();
}

export function getConvexClient(): ConvexHttpClient {
    if (!convexClient) {
        convexClient = new ConvexHttpClient(CONVEX_URL!);
    }
    return convexClient;
}

export async function queryConvex<T>(
    queryFn: unknown,
    args?: Record<string, unknown>,
    auth?: AuthProvider,
): Promise<T> {
    if (auth) {
        const token = await resolveAuth(auth);
        if (!token) {
            throw new Error("Missing Convex auth token");
        }
        const client = new ConvexHttpClient(CONVEX_URL!);
        client.setAuth(token);
        return (await client.query(
            queryFn as never,
            (args || {}) as never,
        )) as T;
    }

    const client = getConvexClient();
    return (await client.query(queryFn as never, (args || {}) as never)) as T;
}

export async function mutateConvex<T>(
    mutationFn: unknown,
    args?: Record<string, unknown>,
    auth?: AuthProvider,
): Promise<T> {
    if (auth) {
        const token = await resolveAuth(auth);
        if (!token) {
            throw new Error("Missing Convex auth token");
        }
        const client = new ConvexHttpClient(CONVEX_URL!);
        client.setAuth(token);
        return (await client.mutation(
            mutationFn as never,
            (args || {}) as never,
        )) as T;
    }

    const client = getConvexClient();
    return (await client.mutation(
        mutationFn as never,
        (args || {}) as never,
    )) as T;
}

export { api };
