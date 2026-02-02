"use client";

import { Goal, GOAL_OPTIONS } from '../types';
import { OnboardingNavigation } from './OnboardingNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-12 min-h-[600px]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2A8643' }}>
              What are your goals?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Select 1-3 goals that best describe what you're looking for.
            </p>
            <div className="text-center">
              <span className={`text-sm font-medium ${
                selectedGoals.length > 3 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {selectedGoals.length} of 3 goals selected
                {selectedGoals.length > 3 && ' (maximum 3)'}
              </span>
            </div>
          </div>

          {/* Goal Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <div className="flex items-center justify-between relative">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="px-6 py-3 font-medium transition-colors" style={{ color: '#2A8643' }}
            >
              ← Back
            </button>
            
            {/* Step Indicators - Perfect Center */}
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

            {/* Continue Button - Green */}
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className={`
                text-lg font-medium transition-colors
                ${canContinue
                  ? 'text-green-500 hover:text-green-600 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
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
        relative p-8 rounded-2xl border-2 transition-all duration-200 text-left
        ${isSelected 
          ? 'border-green-500 bg-green-50 shadow-lg scale-105' 
          : isDisabled
            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer'
        }
      `}
    >
      {/* Checkbox */}
      <div className="absolute top-4 right-4">
        <div className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
          ${isSelected 
            ? 'border-green-500 bg-green-500' 
            : 'border-gray-300 bg-white'
          }
        `}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {option.title}
      </h3>
      
      <p className="text-gray-600 leading-relaxed text-sm">
        {option.description}
      </p>
    </button>
  );
}
