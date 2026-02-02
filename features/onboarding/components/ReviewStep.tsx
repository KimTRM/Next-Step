"use client";

import { OnboardingData, UserRole, GOAL_OPTIONS } from '../types';
import { OnboardingNavigation } from './OnboardingNavigation';
import { useUser } from '@clerk/nextjs';
import { Antonio } from "next/font/google";

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface ReviewStepProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export function ReviewStep({
  data,
  onComplete,
  onBack
}: ReviewStepProps) {
  const { user } = useUser();

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'employer':
        return 'Employer';
      case 'job_seeker':
        return 'Job Seeker';
      case 'mentor':
        return 'Mentor';
      default:
        return role;
    }
  };

  const getGoalDisplay = (goal: string) => {
    const goalOption = GOAL_OPTIONS.find(g => g.value === goal);
    return goalOption?.title || goal;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 min-h-[600px]">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className={`${antonio.className} tracking-tighter text-4xl md:text-5xl lg:text-6x font-bold mb-4`} style={{ color: '#2A8643' }}>
              You're all set!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review your profile and complete your setup.
            </p>
          </div>

          {/* Profile Summary */}
          <div className="mb-14">
            <div className="flex items-center gap-4 mb-4">
              {/* Profile Picture - Gmail/Google Account */}
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">Profile Summary</h3>
            </div>

            {/* Name */}
            <div className="mb-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Name</span>
                <span className="text-gray-900 font-medium">
                  {data.firstName} {data.lastName}
                </span>
              </div>
            </div>

            {/* Role */}
            <div className="mb-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Role</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {data.role ? getRoleDisplay(data.role) : 'Not selected'}
                </span>
              </div>
            </div>

            {/* Current Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Current Status</span>
                <span className="text-gray-900">{data.currentSituation}</span>
              </div>
            </div>

            {/* Education */}
            <div className="mb-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Education</span>
                <span className="text-gray-900 capitalize">
                  {data.educationLevel.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Goals */}
            {data.goals.length > 0 && (
              <div className="mb-4">
                <div className="flex items-start justify-between py-3">
                  <span className="text-gray-600 font-medium">Goals</span>
                  <div className="flex flex-col gap-2">
                    {data.goals.map((goal) => (
                      <div key={goal} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-900 text-sm">{getGoalDisplay(goal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Step Indicators and Continue Button */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            {/* Back Button - hidden on mobile, shown on desktop left */}
            <button
              onClick={onBack}
              className="hidden sm:block w-auto text-center px-6 py-3 font-medium transition-colors" style={{ color: '#2A8643' }}
            >
              ← Back
            </button>

            {/* Step Indicators - Center */}
            <div className="flex flex-col items-center space-y-2 mx-auto">
              <div className="flex space-x-1">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className={`
                      w-6 h-3 rounded transition-colors
                      ${index < 4
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: '#2A8643' }}>
                Step 4 out of 4
              </span>
            </div>

            {/* Mobile buttons row - side by side */}
            <div className="flex sm:hidden w-full gap-2">
              <button
                onClick={onBack}
                className="w-[30%] text-center px-4 py-3 font-medium rounded-xl border border-green-500 transition-colors" style={{ color: '#2A8643' }}
              >
                ← Back
              </button>
              <button
                onClick={onComplete}
                className="w-[70%] px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 shadow-sm hover:shadow-md transition-all"
              >
                Complete Setup
              </button>
            </div>

            {/* Desktop Continue Button - hidden on mobile */}
            <button
              onClick={onComplete}
              className="hidden sm:block w-auto px-8 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 shadow-sm hover:shadow-md transition-all"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}
