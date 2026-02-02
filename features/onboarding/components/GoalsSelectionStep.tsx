"use client";

import { Goal, GOAL_OPTIONS } from '../types';
import { OnboardingNavigation } from './OnboardingNavigation';
import { Antonio } from "next/font/google";

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface GoalsSelectionStepProps {
  selectedGoals: Goal[];
  onGoalsChange: (goals: Goal[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function GoalsSelectionStep({
  selectedGoals,
  onGoalsChange,
  onContinue,
  onBack
}: GoalsSelectionStepProps) {
  const handleGoalToggle = (goal: Goal) => {
    if (selectedGoals.includes(goal)) {
      onGoalsChange(selectedGoals.filter(g => g !== goal));
    } else if (selectedGoals.length < 3) {
      onGoalsChange([...selectedGoals, goal]);
    }
  };

  const canContinue = selectedGoals.length > 0 && selectedGoals.length <= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 sm:p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <h1 className={` ${antonio.className} tracking-tighter text-4xl md:text-5xl lg:text-6x font-bold mb-2 sm:mb-4`} style={{ color: '#2A8643' }}>
              What are your goals?
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto mb-2 sm:mb-4">
              Select 1-3 goals that best describe what you're looking for.
            </p>
            <div className="text-center">
              <span className={`text-sm font-medium ${selectedGoals.length > 3 ? 'text-red-600' : 'text-gray-600'
                }`}>
                {selectedGoals.length} of 3 goals selected
                {selectedGoals.length > 3 && ' (maximum 3)'}
              </span>
            </div>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-8">
            {GOAL_OPTIONS.map((option) => (
              <GoalCard
                key={option.value}
                option={option}
                isSelected={selectedGoals.includes(option.value)}
                isDisabled={!selectedGoals.includes(option.value) && selectedGoals.length >= 3}
                onSelect={() => handleGoalToggle(option.value)}
              />
            ))}
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
                      ${index < 3
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: '#2A8643' }}>
                Step 3 out of 4
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
                onClick={onContinue}
                disabled={!canContinue}
                className={`
                  w-[70%] text-base font-medium transition-colors px-6 py-3 rounded-xl
                  ${canContinue
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                  }
                `}
              >
                Continue →
              </button>
            </div>

            {/* Desktop Continue Button - hidden on mobile */}
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className={`
                hidden sm:block w-auto text-lg font-medium transition-colors px-6 py-3 rounded-xl
                ${canContinue
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

interface GoalCardProps {
  option: typeof GOAL_OPTIONS[0];
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

function GoalCard({ option, isSelected, isDisabled, onSelect }: GoalCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        relative p-3 sm:p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 text-left
        ${isSelected
          ? 'border-green-500 bg-green-50 shadow-lg sm:scale-105'
          : isDisabled
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer'
        }
      `}
    >
      {/* Horizontal on mobile, vertical on sm+ */}
      <div className="flex flex-row sm:flex-col items-start sm:items-stretch gap-3 sm:gap-0">
        {/* Checkbox - inline on mobile, absolute on sm+ */}
        <div className="flex-shrink-0 sm:absolute sm:top-4 sm:right-4">
          <div className={`
            w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all
            ${isSelected
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 bg-white'
            }
          `}>
            {isSelected && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 sm:pr-8">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-3">
            {option.title}
          </h3>
          <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
            {option.description}
          </p>
        </div>
      </div>
    </button>
  );
}
