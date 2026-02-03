"use client";

/**
 * WelcomePageContent Component
 * Simple greeting + CTA to start onboarding
 * No forms, no data collection - just a welcome message
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export default function WelcomePageContent() {
    const router = useRouter();
    const { isLoaded, userId } = useAuth();
    const [isStarting, setIsStarting] = useState(false);

    // Get current user for personalization
    const user = useQuery(
        api.users.index.getCurrentUser,
        isLoaded && userId ? {} : "skip"
    );

    // Mutation to update onboarding status
    const setOnboardingStatus = useMutation(api.users.index.setOnboardingStatus);

    const handleGetStarted = async () => {
        if (isStarting) return;

        setIsStarting(true);
        try {
            // Set onboarding status to "in_progress"
            await setOnboardingStatus({ status: "in_progress" });

            // Redirect to the onboarding flow
            router.push("/onboarding");
        } catch (error) {
            console.error("Failed to start onboarding:", error);
            setIsStarting(false);
        }
    };

    // Get user's first name for greeting
    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
            {/* Left Side - Welcome Message */}
            <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center gap-6 px-6 py-12 sm:px-8 lg:px-12">
                <div className="max-w-lg text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                        Welcome,
                        <br />
                        <span className="text-green-200">{firstName}!</span>
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed">
                        We&apos;re excited to have you here. Let&apos;s set up your profile
                        so we can help you find the perfect opportunities.
                    </p>
                    <p className="text-white/70 text-base sm:text-lg mb-10">
                        This will only take a few minutes.
                    </p>

                    <Button
                        onClick={handleGetStarted}
                        disabled={isStarting}
                        size="lg"
                        className="w-full sm:w-auto bg-white text-green-700 hover:bg-green-50 font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                Let&apos;s get started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Right Side - Logo/Branding */}
            <div className="hidden lg:flex relative w-1/2 flex-col items-center justify-center px-8 py-12">
                <div className="relative">
                    <Image
                        className="w-64 xl:w-80 h-auto drop-shadow-2xl"
                        src="/square-logo-white.png"
                        alt="NextStep Logo"
                        width={320}
                        height={320}
                    />
                    <div className="mt-8 text-center">
                        <p className="text-white/80 text-xl font-medium">
                            Your next step starts here
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
