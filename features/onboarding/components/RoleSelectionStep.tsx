"use client";

import { UserRole, ROLE_OPTIONS } from '../types';
import { OnboardingNavigation } from '@/features/onboarding/components';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-12 min-h-[600px]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold" style={{ color: '#2A8643' }}>
              What brings you here?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the option that best describes you. This helps us personalize your experience.
            </p>
          </div>

          {/* Goal Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
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

          {/* Step Indicators and Continue Button */}
          <div className="flex items-center justify-between relative">
            {/* Continue Button - Right */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`
                text-lg font-medium transition-colors absolute right-0
                ${selectedRole
                  ? 'text-green-500 hover:text-green-600 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continue →
            </button>
            
            {/* Step Indicators - Perfect Center */}
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
  const getRoleImage = () => {
    switch (option.value) {
      case 'employer':
        return '/Employe.png';
      case 'job_seeker':
        return '/Job seeker.png';
      case 'mentor':
        return '/Mentor.png';
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative p-8 rounded-2xl border-2 transition-all duration-200 text-left
        ${isSelected 
          ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-24 h-24 mb-4 overflow-hidden">
          <img 
            src={getRoleImage() || '/logo.png'} 
            alt={option.title}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-center" style={{ color: '#2A8643' }}>
          {option.title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-center text-sm">
          {option.description}
        </p>
      </div>
    </button>
  );
}
