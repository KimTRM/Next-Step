"use client";

/**
 * AuthPageContent Component
 * Full login page content with custom UI
 */

import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/shared/components/ui/use-mobile";
import { useIsTablet } from "@/shared/components/ui/use-tablet";
import { LoginForm } from "./LoginForm";
import { OAuthButtons } from "./OAuthButtons";
import { AuthLoading } from "./AuthLoading";
import Image from "next/image";
import { Skeleton } from "@/shared/components/ui/skeleton";

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
        <div className="flex flex-col lg:flex-row min-h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
            <LoginSection />
            {!isMobile && !isTablet && <SignUpDirection />}
            {(isMobile || isTablet) && <MobileSignUpLink />}
        </div>
    );
}

function LoginSection() {
    const { signOut } = useClerk();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");

    const handleForgotPassword = () => {
        setShowForgotPassword(true);
        setForgotPasswordMessage("");
        setForgotPasswordError("");
    };

    const handleSignOut = async () => {
        try {
            await signOut({ redirectUrl: '/' });
        } catch (error) {
            console.error('Error signing out:', error);
            // Fallback: force page reload if sign out fails
            window.location.href = '/';
        }
    };

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!forgotPasswordEmail.trim()) {
            setForgotPasswordError("Please enter your email address");
            return;
        }

        setIsSubmittingForgotPassword(true);
        // Simulate loading state
        setTimeout(() => {
            setIsSubmittingForgotPassword(false);
            setForgotPasswordMessage("Password reset link sent!");
        }, 2000);
    };

    if (isSubmittingForgotPassword) {
        return (
            <div className="p-4">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-3/4" />
            </div>
        );
    }

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordMessage("");
        setForgotPasswordError("");
    };

    return (
        <div
            className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen lg:min-h-0 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-linear-to-br from-green-50/30 to-transparent pointer-events-none" />

            <div
                className="w-full max-w-md px-4 sm:px-6 lg:px-8 relative z-10"
            >
                <h1
                    className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600 mb-6 sm:mb-8 text-center"
                >
                    Log In to NextStep
                </h1>

                {/* Sign Out Button - for clearing stale sessions */}
                <div
                    className="mb-4 text-center"
                >
                    <button
                        onClick={handleSignOut}
                        className="text-sm text-gray-500 underline hover:text-gray-700 transition-all duration-200 hover:scale-105"
                    >
                        Having trouble logging in? Sign out and try again
                    </button>
                </div>

                <LoginForm onForgotPassword={handleForgotPassword} />
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
                    onClick={closeForgotPassword}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-full max-w-md relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeForgotPassword}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2
                            className="text-2xl font-bold text-gray-900 mb-4"
                        >
                            Reset Password
                        </h2>

                        <p
                            className="text-gray-600 mb-6"
                        >
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </p>

                        <form
                            onSubmit={handleForgotPasswordSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    disabled={isSubmittingForgotPassword}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    autoComplete="email"
                                />
                            </div>

                            {forgotPasswordError && (
                                <div
                                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                                >
                                    {forgotPasswordError}
                                </div>
                            )}

                            {forgotPasswordMessage && (
                                <div
                                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                                >
                                    {forgotPasswordMessage}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeForgotPassword}
                                    disabled={isSubmittingForgotPassword}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmittingForgotPassword}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmittingForgotPassword ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div
                className="text-center items-center justify-center flex flex-col mt-6"
            >
                <div
                    className="mb-4"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                        <span className="text-gray-600 text-sm font-medium">Or log in using</span>
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                    </div>
                </div>
                <div>
                    <OAuthButtons />
                </div>
            </div>
        </div>
    );
}

function SignUpDirection() {
    return (
        <div
            className="relative w-1/2 h-screen bg-linear-to-br from-green-500 via-green-600 to-green-700 flex flex-col items-center justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* Static background decorative elements */}
            <div className="absolute inset-0">
                <div
                    className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
                />
                <div
                    className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"
                />
                <div
                    className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/8 rounded-full blur-lg"
                />
            </div>

            <div
                className="relative z-10 flex flex-col items-center"
            >
                <div
                    className="relative z-10 flex flex-col items-center"
                >
                    <div
                        className="mb-6 sm:mb-8"
                    >
                        <Image
                            className="w-16 sm:w-20 lg:w-24 h-auto drop-shadow-2xl relative z-10"
                            src="/logo-white.png"
                            alt="NextStep logo"
                            width={130}
                            height={130}
                            style={{ height: "auto", width: "auto" }}
                            priority
                        />
                    </div>
                    <h1 className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg">
                        Welcome Back!
                    </h1>
                </div>
                <div
                    className="flex flex-col items-center"
                >
                    <p className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-center max-w-md leading-relaxed drop-shadow">
                        Enter your personal details and start your journey with us!
                    </p>
                    <div>
                        <Link href="/sign-up">
                            <button className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MobileSignUpLink() {
    return (
        <div
            className="py-4 sm:py-6 text-center bg-white border-t border-gray-200"
        >
            <p className="text-gray-600 mb-2 text-sm sm:text-base">Don&apos;t have an account?</p>
            <div>
                <Link
                    href="/sign-up"
                    className="text-green-600 font-bold hover:text-green-700 transition-colors text-sm sm:text-base inline-flex items-center gap-1"
                >
                    Sign Up
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
