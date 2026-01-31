"use client";

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
        <div className="flex flex-col lg:flex-row min-h-screen bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
            {!isMobile && !isTablet && <LoginDirection />}
            <SignUpSection />
            {(isMobile || isTablet) && <MobileLoginLink />}
        </div>
    );
}

function LoginDirection() {
    return (
        <div
            className="relative w-1/2 h-screen bg-linear-to-br from-primary via-accent to-emerald-600 flex flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* Static background decorative elements */}
            <div className="absolute inset-0">
                <div
                    className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                />
                <div
                    className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl"
                />
                <div
                    className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/8 rounded-full blur-xl"
                />
                {/* Static decorative particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full"
                        style={{
                            top: `${20 + i * 15}%`,
                            left: `${10 + i * 12}%`
                        }}
                    />
                ))}
            </div>

            <div
                className="relative z-10 flex flex-col items-center"
            >
                <div
                    className="relative z-10 flex flex-col items-center"
                >
                    <div
                        className="mb-8 sm:mb-10"
                    >
                        <div className="relative">
                            <div
                                className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"
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
                    </div>
                    <h1
                        className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg"
                    >
                        Welcome Back!
                    </h1>
                </div>
                <div
                    className="flex flex-col items-center"
                >
                    <p
                        className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-center max-w-md leading-relaxed drop-shadow"
                    >
                        To keep connected with us, please log in to your account.
                    </p>
                    <div>
                        <Link href="/auth">
                            <button className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Log In
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignUpSection() {
    return (
        <div
            className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen lg:min-h-0 relative overflow-hidden"
        >
            {/* Enhanced Background decoration */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-accent/5 to-emerald-50/30 pointer-events-none" />

            {/* Static decorative patterns */}
            <div className="absolute inset-0 opacity-30">
                <div
                    className="absolute top-10 right-10 w-20 h-20 border-2 border-primary/10 rounded-full"
                />
                <div
                    className="absolute bottom-10 left-10 w-16 h-16 border-2 border-accent/10 rounded-lg"
                />
            </div>

            <div
                className="w-full max-w-md px-4 sm:px-6 lg:px-8 relative z-10"
            >
                <h1
                    className="font-['Antonio-Bold',Helvetica] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600 mb-6 sm:mb-8 text-center"
                >
                    Create an Account
                </h1>

                <SignUpForm />
            </div>

            <div
                className="text-center items-center justify-center flex flex-col mt-8"
            >
                <div
                    className="mb-6"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                        <span className="text-gray-600 text-sm font-medium">Or sign up using</span>
                        <div className="h-px bg-gray-300 flex-1 max-w-20" />
                    </div>
                </div>
                <div>
                    <OAuthButtons mode="signup" />
                </div>
            </div>
        </div>
    );
}

function MobileLoginLink() {
    return (
        <div
            className="py-6 sm:py-8 text-center bg-linear-to-r from-gray-50 to-white border-t border-gray-200"
        >
            <p className="text-gray-600 mb-2 text-sm sm:text-base">Already have an account?</p>
            <div>
                <Link
                    href="/auth"
                    className="text-green-600 font-bold hover:text-green-700 transition-colors text-sm sm:text-base inline-flex items-center gap-1"
                >
                    <span>Log In</span>
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
