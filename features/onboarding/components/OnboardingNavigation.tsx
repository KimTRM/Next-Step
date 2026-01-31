"use client";

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onContinue: () => void;
  onBack?: () => void;
  canContinue: boolean;
  continueText?: string;
  backText?: string;
}

export function OnboardingNavigation({
  currentStep,
  totalSteps,
  onContinue,
  onBack,
  canContinue,
  continueText = "Continue",
  backText = "Back"
}: OnboardingNavigationProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← {backText}
        </button>
      )}

      {/* Empty space when no back button */}
      {!onBack && <div />}

      {/* Step Indicators - Center */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`
                w-6 h-3 rounded transition-colors
                ${index < currentStep 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
                }
              `}
            />
          ))}
        </div>
        <span className="text-sm font-medium" style={{ color: '#2A8643' }}>
          Step {currentStep} out of {totalSteps}
        </span>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={!canContinue}
        className={`
          px-6 py-3 text-green-500 hover:text-green-600 font-medium transition-colors
          ${!canContinue ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {continueText} →
      </button>
    </div>
  );
}
