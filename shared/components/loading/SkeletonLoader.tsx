"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

interface SkeletonLoaderProps {
  type?: "dashboard" | "jobs" | "mentors" | "messages" | "profile";
}

export function SkeletonLoader({ type = "dashboard" }: SkeletonLoaderProps) {
  if (type === "dashboard") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "jobs") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "mentors") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "messages") {
    return (
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-80 border-r space-y-2 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-3/4 rounded-lg" />
              <Skeleton className="h-20 w-2/3 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <div className="space-y-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
