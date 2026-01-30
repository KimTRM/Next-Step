"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";
import { SignUpForm } from "./SignUpForm";
import { OAuthButtons } from "./OAuthButtons";
import { AuthLoading } from "./AuthLoading";

export function SignUpPageContent() {
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
        return <AuthLoading message="Preparing sign up..." />;
    }

    // Don't render form if already signed in (will redirect)
    if (isSignedIn) {
        return <AuthLoading message="Redirecting to dashboard..." />;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {!isMobile && !isTablet && <LoginDirection />}
            <SignUpSection />
            {(isMobile || isTablet) && <MobileLoginLink />}
        </div>
    );
}

function LoginDirection() {
    return (
        <motion.div 
            className="relative w-1/2 h-screen bg-gradient-to-br from-primary via-accent to-emerald-600 flex flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
                duration: 0.8, 
                delay: 0.1,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            {/* Enhanced Animated background elements */}
            <div className="absolute inset-0">
                <motion.div 
                    className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                        x: [0, 20, 0],
                        y: [0, -15, 0]
                    }}
                    transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
                <motion.div 
                    className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.5, 0.2],
                        x: [0, -25, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ 
                        duration: 12, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/8 rounded-full blur-xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, 10, 0],
                        y: [0, 10, 0]
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 4
                    }}
                />
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full"
                        style={{
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 12}%`
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1]
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.3
                        }}
                    />
                ))}
            </div>
            
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ y: "10vh", opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                    duration: 0.6, 
                    delay: 0.4,
                    ease: [0.23, 1, 0.32, 1]
                }}
            >
                <motion.div 
                    className="relative z-10 flex flex-col items-center"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                        duration: 0.5, 
                        delay: 0.5,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                >
                    <motion.div
                        className="mb-8 sm:mb-10"
                        whileHover={{ scale: 1.1, rotate: -8 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <Image
                                className="w-16 sm:w-20 lg:w-24 h-auto drop-shadow-2xl relative z-10"
                                src="/logo-white.png"
                                alt="NextStep logo"
                                width={120}
                                height={120}
                                style={{ height: "auto", width: "auto" }}
                                priority
                            />
                        </div>
                    </motion.div>
                    <motion.h1 
                        className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ 
                            duration: 0.5, 
                            delay: 0.6,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                    >
                        Welcome Back!
                    </motion.h1>
                </motion.div>
                <motion.div 
                    className="flex flex-col items-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                        duration: 0.5, 
                        delay: 0.7,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                >
                    <motion.p 
                        className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-center max-w-md leading-relaxed drop-shadow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        To keep connected with us, please log in to your account.
                    </motion.p>
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Link href="/auth">
                            <button className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Log In
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function SignUpSection() {
    return (
        <motion.div
            className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen lg:min-h-0 relative overflow-hidden"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ 
                duration: 0.4, 
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            {/* Enhanced Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-emerald-50/30 pointer-events-none" />
            
            {/* Subtle animated patterns */}
            <div className="absolute inset-0 opacity-30">
                <motion.div
                    className="absolute top-10 right-10 w-20 h-20 border-2 border-primary/10 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-10 left-10 w-16 h-16 border-2 border-accent/10 rounded-lg"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>
            
            <motion.div
                className="w-full max-w-md px-4 sm:px-6 lg:px-8 relative z-10"
                initial={{ y: "-5vh", opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                    duration: 0.3, 
                    delay: 0.1,
                    ease: [0.23, 1, 0.32, 1]
                }}
            >
                <motion.h1 
                    className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600 mb-6 sm:mb-8 text-center"
                    initial={{ y: -15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                        duration: 0.2, 
                        delay: 0.15,
                        ease: [0.23, 1, 0.32, 1]
                    }}
                >
                    Create an Account
                </motion.h1>

                <SignUpForm />
            </motion.div>

            <motion.div
                className="text-center items-center justify-center flex flex-col mt-8"
                initial={{ y: "3vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                    duration: 0.3, 
                    delay: 0.25,
                    ease: [0.23, 1, 0.32, 1]
                }}
            >
                <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                        <span className="text-gray-600 text-sm font-medium">Or sign up using</span>
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                >
                    <OAuthButtons mode="signup" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function MobileLoginLink() {
    return (
        <motion.div 
            className="py-6 sm:py-8 text-center bg-gradient-to-r from-gray-50 to-white border-t border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                duration: 0.5, 
                delay: 0.8,
                ease: [0.23, 1, 0.32, 1]
            }}
        >
            <p className="text-gray-600 mb-2 text-sm sm:text-base">Already have an account?</p>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            >
                <Link
                    href="/auth"
                    className="text-green-600 font-bold hover:text-green-700 transition-colors text-sm sm:text-base inline-flex items-center gap-1"
                >
                    <span>Log In</span>
                    <motion.svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.15 }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                </Link>
            </motion.div>
        </motion.div>
    );
}
