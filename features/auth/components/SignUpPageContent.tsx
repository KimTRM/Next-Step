"use client";

/**
 * SignUpPageContent Component
 * Full sign-up page content with custom UI
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";
import { SignUpForm } from "./SignUpForm";
import { OAuthButtons } from "./OAuthButtons";
import { AuthLoading } from "./AuthLoading";

export function SignUpPageContent() {
    const { isLoaded } = useAuth();
    const isMobile = useIsMobile();
    const isTablet = useIsTablet();

    // Show loading state while Clerk initializes
    if (!isLoaded) {
        return <AuthLoading message="Preparing sign up..." />;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {!isMobile && !isTablet && <LoginDirection />}
            <SignUpSection />
            {(isMobile || isTablet) && <MobileLoginLink />}
        </div>
    );
}

function LoginDirection() {
    return (
        <div className="relative w-1/2 h-screen bg-gradient-to-b from-green-500 to-green-700 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ y: "7vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <div className="relative z-10 flex flex-col items-center">
                    <img
                        className="w-16 sm:w-20 lg:w-24 h-auto mb-8"
                        src="/logo-white.png"
                        alt="NextStep logo"
                    />
                    <h1 className="[font-family:'Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-center">
                        Welcome Back!
                    </h1>
                </div>
                <div className="flex flex-col items-center">
                    <p className="text-white text-lg sm:text-xl lg:text-2xl mb-8 text-center max-w-md">
                        To keep connected with us, please log in to your account.
                    </p>
                    <Link href="/auth">
                        <button className="px-6 sm:px-8 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition duration-200">
                            Log In
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

function SignUpSection() {
    return (
        <motion.div
            className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
            initial={{ x: "-25vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "tween", duration: 0.8, ease: "easeInOut" }}
        >
            <motion.div
                className="w-full max-w-md px-8"
                initial={{ y: "-7vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <h1 className="[font-family:'Antonio-Bold',Helvetica] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-600 mb-8 text-center">
                    Create an Account
                </h1>

                <SignUpForm />
            </motion.div>

            <motion.div
                className="text-center items-center justify-center flex flex-col mt-6"
                initial={{ x: "7vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 40 }}
            >
                <br />
                <p className="text-gray-600">Or sign up using</p>
                <OAuthButtons mode="signup" />
            </motion.div>
        </motion.div>
    );
}

function MobileLoginLink() {
    return (
        <div className="py-6 text-center bg-white">
            <p className="text-gray-600 mb-2">Already have an account?</p>
            <Link
                href="/auth"
                className="text-green-600 font-semibold hover:underline"
            >
                Log In
            </Link>
        </div>
    );
}
