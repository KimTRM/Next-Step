"use client";

/**
 * AuthPageContent Component
 * Full login page content with custom UI
 */

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
import { Antonio } from "next/font/google";

const antontioFont = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export function AuthPageContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Log auth state for debugging
  useEffect(() => {
    console.log("[AuthPageContent] Auth state:", { isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn]);

  // If signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("[AuthPageContent] User is signed in, redirecting to dashboard...");
      // Use router.replace to avoid back button issues
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state if signed in (waiting for redirect)
  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Logged in! Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Show the login form

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
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
      // Use router instead of window.location to avoid full page reload
      router.push("/");
    }
  };

  return (
    <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 min-h-screen lg:min-h-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-linear-to-br from-green-50/30 to-transparent pointer-events-none" />

      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8 relative z-10">
        <h1
          className={`${antontioFont.className} tracking-tighter text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600 mb-6 sm:mb-8 text-center`}
        >
          Log In to NextStep
        </h1>

        {/* Sign Out Button - for clearing stale sessions */}
        <div className="mb-4 text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 underline hover:text-gray-700 transition-all duration-200 hover:scale-105"
          >
            Having trouble logging in? Sign out and try again
          </button>
        </div>

        <LoginForm />
      </div>

      <div className="text-center items-center justify-center flex flex-col mt-6">
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px bg-gray-300 flex-1 max-w-20" />
            <span className="text-gray-600 text-sm font-medium">
              Or log in using
            </span>
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
    <div className="relative w-1/2 h-screen bg-linear-to-br from-primary via-accent to-emerald-600 flex flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Static background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/8 rounded-full blur-xl" />
        {/* Static decorative particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 12}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 sm:mb-8">
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
          <h1
            className={`${antontioFont.className} tracking-tighter text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 text-center drop-shadow-lg`}
          >
            Welcome Back!
          </h1>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-white text-base sm:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 text-center max-w-md leading-relaxed drop-shadow">
            Enter your personal details and start your journey with us!
          </p>
          <div className="mt-7">
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
    <div className="py-4 sm:py-6 text-center bg-white border-t border-gray-200">
      <p className="text-gray-600 mb-2 text-sm sm:text-base">
        Don&apos;t have an account?
      </p>
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
