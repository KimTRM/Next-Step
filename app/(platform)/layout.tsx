"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/features/users/api";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const router = useRouter();

  const currentUser = useCurrentUser();

  useEffect(() => {
    if (userId && currentUser) {
      // If user exists but hasn't completed onboarding, redirect to onboarding
      if (!currentUser.onboardingCompleted) {
        router.push("/onboarding");
      }
    }
  }, [userId, currentUser, router]);

  // Show content immediately, only redirect if we have user data
  return <>{children}</>;
}
