/**
 * SSO Callback Page
 * Handles OAuth redirect from Clerk (Google, Apple, Facebook)
 */

"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">Completing sign in...</p>
            </div>

            {/* Clerk's OAuth callback handler */}
            <AuthenticateWithRedirectCallback
                signInFallbackRedirectUrl="/dashboard"
                signUpFallbackRedirectUrl="/welcome"
            />
        </div>
    );
}
