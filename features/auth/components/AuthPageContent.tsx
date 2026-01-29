"use client";

/**
 * AuthPageContent Component
 * Full login page content with custom UI
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";
import { LoginForm } from "./LoginForm";
import { OAuthButtons } from "./OAuthButtons";
import { AuthLoading } from "./AuthLoading";
import Image from "next/image";

export function AuthPageContent() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // Redirect if already signed in
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace("/dashboard");
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading state while Clerk initializes
    if (!isLoaded) {
        return <AuthLoading message="Preparing login..." />;
    }

    // Don't render anything if already signed in (will redirect)
    if (isSignedIn) {
        return <AuthLoading message="Redirecting to dashboard..." />;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            <LoginSection />
            {!isMobile && !isTablet && <SignUpDirection />}
            {(isMobile || isTablet) && <MobileSignUpLink />}
        </div>
    );
}

function LoginSection() {
    const { signOut } = useClerk();

    const handleForgotPassword = () => {
        // TODO: Implement forgot password flow using Clerk's password reset
        // See: https://clerk.com/docs/custom-flows/forgot-password
    };

    const handleSignOut = async () => {
        await signOut({ redirectUrl: '/' });
    };

    return (
        <motion.div
            className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
            initial={{ x: "25vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
        >
            <motion.div
                className="w-full max-w-md px-8"
                initial={{ y: "-7vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <h1 className="font-['Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-600 mb-8 text-center">
                    Log In to NextStep
                </h1>

                {/* Sign Out Button - for clearing stale sessions */}
                <div className="mb-4 text-center">
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 underline hover:text-gray-700"
                    >
                        Having trouble logging in? Sign out and try again
                    </button>
                </div>

                <LoginForm onForgotPassword={handleForgotPassword} />
            </motion.div>

            <motion.div
                className="text-center items-center justify-center flex flex-col mt-6"
                initial={{ x: "-7vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <br />
                <p className="text-gray-600">Or log in using</p>
                <OAuthButtons />
            </motion.div>
        </motion.div>
    );
}

function SignUpDirection() {
    return (
        <div className="relative w-1/2 h-screen bg-linear-to-b from-green-500 to-green-700 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ y: "7vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <div className="relative z-10 flex flex-col items-center">
                    <Image
                        className="w-16 sm:w-20 lg:w-24 h-auto mb-8"
                        src="/logo-white.png"
                        alt="NextStep logo"
                        width={96}
                        height={96}
                        priority
                        style={{ height: "auto" }}
                    />
                    <h1 className="font-['Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-center">
                        Hello User!
                    </h1>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-white text-lg sm:text-xl lg:text-2xl mb-8 text-center max-w-md">
                        Enter your personal details and start your journey with us!
                    </p>
                    <Link href="/sign-up">
                        <button className="px-6 sm:px-8 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition duration-200">
                            Sign Up
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

function MobileSignUpLink() {
    return (
        <div className="py-6 text-center">
            <p className="text-gray-600 mb-2">Don&apos;t have an account?</p>
            <Link
                href="/sign-up"
                className="text-green-600 font-semibold hover:underline"
            >
                Sign Up
            </Link>
        </div>
    );
}
