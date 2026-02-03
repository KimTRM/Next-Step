"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

import { OnboardingData, UserRole, EducationLevel, Goal } from '../types';
import { RoleSelectionStep } from './RoleSelectionStep';
import { ProfileInfoStep } from './ProfileInfoStep';
import { GoalsSelectionStep } from './GoalsSelectionStep';
import { ReviewStep } from './ReviewStep';

export function NewOnboardingFlow() {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const currentUser = useQuery(
    api.users.index.getCurrentUser,
    isSignedIn ? {} : "skip"
  );

  // Mutations for saving onboarding data
  const setRole = useMutation(api.users.mutations.setRole);
  const setGoals = useMutation(api.users.mutations.setGoals);
  const saveOnboardingProfile = useMutation(api.users.mutations.saveOnboardingProfile);
  const completeOnboarding = useMutation(api.users.mutations.completeOnboarding);
  const startOnboarding = useMutation(api.users.mutations.startOnboarding);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: null as any,
    firstName: '',
    lastName: '',
    currentSituation: '',
    educationLevel: 'undergraduate',
    skills: [],
    goals: []
  });

  // Initialize with existing user data if available and mark onboarding as in_progress
  useEffect(() => {
    if (currentUser) {
      // Split the name field into firstName and lastName
      const nameParts = (currentUser.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setOnboardingData(prev => ({
        ...prev,
        firstName,
        lastName,
        currentSituation: currentUser.currentStatus || '',
        educationLevel: (currentUser.educationLevel as EducationLevel) || 'undergraduate',
        skills: currentUser.skills || [],
        goals: (currentUser.goals as Goal[]) || [],
        role: (currentUser.role as UserRole) || null
      }));

      // Mark onboarding as in_progress if not started yet
      if (currentUser.onboardingStatus === 'not_started') {
        startOnboarding({}).catch(console.error);
      }
    }
  }, [currentUser, startOnboarding]);

  const handleRoleSelect = (role: UserRole) => {
    setOnboardingData(prev => ({ ...prev, role }));
  };

  const handleProfileInfoChange = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const handleGoalsChange = (goals: Goal[]) => {
    setOnboardingData(prev => ({ ...prev, goals }));
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    // Prevent double submission
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate required data
      if (!onboardingData.role) {
        toast.error('Please select a role');
        setCurrentStep(1);
        return;
      }

      if (!onboardingData.firstName.trim() || !onboardingData.lastName.trim()) {
        toast.error('Please enter your name');
        setCurrentStep(2);
        return;
      }

      if (onboardingData.goals.length === 0) {
        toast.error('Please select at least one goal');
        setCurrentStep(3);
        return;
      }

      // Save profile information
      await saveOnboardingProfile({
        name: `${onboardingData.firstName} ${onboardingData.lastName}`.trim(),
        currentStatus: onboardingData.currentSituation || undefined,
        educationLevel: onboardingData.educationLevel,
        skills: onboardingData.skills.length > 0 ? onboardingData.skills : undefined
      });

      // Set user role
      await setRole({
        role: onboardingData.role
      });

      // Set user goals
      await setGoals({
        goals: onboardingData.goals
      });

      // Mark onboarding as complete
      await completeOnboarding({});

      toast.success('Profile setup complete! Welcome to NextStep!');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelectionStep
            selectedRole={onboardingData.role}
            onRoleSelect={handleRoleSelect}
            onContinue={handleContinue}
          />
        );
      case 2:
        return (
          <ProfileInfoStep
            data={{
              firstName: onboardingData.firstName,
              lastName: onboardingData.lastName,
              currentSituation: onboardingData.currentSituation,
              educationLevel: onboardingData.educationLevel,
              skills: onboardingData.skills
            }}
            onChange={handleProfileInfoChange}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <GoalsSelectionStep
            selectedGoals={onboardingData.goals}
            onGoalsChange={handleGoalsChange}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={onboardingData}
            onComplete={handleComplete}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Show loading while checking auth or waiting for user to be created (webhook timing)
  if (!isSignedIn || currentUser === undefined || currentUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {currentUser === null ? "Setting up your profile..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {renderCurrentStep()}
    </div>
  );
}
