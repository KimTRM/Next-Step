"use client";

import { Suspense } from "react";
import { SkeletonLoader } from "./SkeletonLoader";

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: "dashboard" | "jobs" | "mentors" | "messages" | "profile";
}

export function LoadingBoundary({ 
  children, 
  fallback, 
  type = "dashboard" 
}: LoadingBoundaryProps) {
  return (
    <Suspense fallback={fallback || <SkeletonLoader type={type} />}>
      {children}
    </Suspense>
  );
}
