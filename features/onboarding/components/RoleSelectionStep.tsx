"use client";

import { UserRole, ROLE_OPTIONS } from '../types';
import { OnboardingNavigation } from '@/features/onboarding/components';
import { Building2, Briefcase, Users } from 'lucide-react';
import { Antonio } from "next/font/google";

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface RoleSelectionStepProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export function RoleSelectionStep({
  selectedRole,
  onRoleSelect,
  onContinue,
  onBack
}: RoleSelectionStepProps) {
  const handleContinue = () => {
    if (selectedRole) {
      onContinue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 sm:p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className={` ${antonio.className} tracking-tighter text-4xl md:text-5xl lg:text-6x font-bold mb-2 sm:mb-4`} style={{ color: '#2A8643' }}>
              What brings you here?
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Select the option that best describes you. This helps us personalize your experience.
            </p>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8 mb-6 sm:mb-16">
            {ROLE_OPTIONS.map((option) => (
              <RoleCard
                key={option.value}
                option={option}
                isSelected={selectedRole === option.value}
                onSelect={() => onRoleSelect(option.value)}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Step Indicators and Continue Button - responsive */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            {/* Empty placeholder for desktop left alignment */}
            <div className="hidden sm:block w-auto px-6 py-3"></div>

            {/* Step Indicators - Center */}
            <div className="flex flex-col items-center space-y-2 mx-auto">
              <div className="flex space-x-1">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className={`
                      w-6 h-3 rounded transition-colors
                      ${index < 1
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: '#2A8643' }}>
                Step 1 out of 4
              </span>
            </div>

            {/* Mobile Continue Button - full width */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`
                sm:hidden w-full text-base font-medium transition-colors px-6 py-3 rounded-xl
                ${selectedRole
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                }
              `}
            >
              Continue →
            </button>

            {/* Desktop Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`
                hidden sm:block w-auto text-lg font-medium transition-colors px-6 py-3 rounded-xl
                ${selectedRole
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                }
              `}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoleCardProps {
  option: typeof ROLE_OPTIONS[0];
  isSelected: boolean;
  onSelect: () => void;
}

function RoleCard({ option, isSelected, onSelect }: RoleCardProps) {
  const getRoleIcon = () => {
    switch (option.value) {
      case 'employer':
        return <Building2 className="w-full h-full object-contain text-green-500" strokeWidth={1.5} />;
      case 'job_seeker':
        return <Briefcase className="w-full h-full object-contain text-green-500" strokeWidth={1.5} />;
      case 'mentor':
        return <Users className="w-full h-full object-contain text-green-500" strokeWidth={1.5} />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative p-4 sm:p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 text-left
        ${isSelected
          ? 'border-green-500 bg-green-50 shadow-lg sm:scale-105'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Horizontal on mobile, vertical on sm+ */}
      <div className="flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 sm:mb-4 overflow-hidden">
          {getRoleIcon()}
        </div>
        <div className="flex flex-col sm:items-center">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-0.5 sm:mb-3 text-left sm:text-center" style={{ color: '#2A8643' }}>
            {option.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-left sm:text-center text-xs sm:text-sm">
            {option.description}
          </p>
        </div>
      </div>
    </button>
  );
}
