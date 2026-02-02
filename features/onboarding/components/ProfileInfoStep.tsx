"use client";

import { useState } from 'react';
import { EducationLevel, SUGGESTED_SKILLS } from '../types';
import { OnboardingNavigation } from './OnboardingNavigation';
import { Antonio } from "next/font/google";

const antonio = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

interface ProfileInfoStepProps {
  data: {
    firstName: string;
    lastName: string;
    currentSituation: string;
    educationLevel: EducationLevel;
    skills: string[];
  };
  onChange: (data: ProfileInfoStepProps['data']) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ProfileInfoStep({
  data,
  onChange,
  onContinue,
  onBack
}: ProfileInfoStepProps) {
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !data.skills.includes(trimmedSkill)) {
      onChange({
        ...data,
        skills: [...data.skills, trimmedSkill]
      });
    }
    setSkillInput('');
    setShowSkillSuggestions(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({
      ...data,
      skills: data.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    setShowSkillSuggestions(value.length > 0);
  };

  const filteredSuggestions = SUGGESTED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !data.skills.includes(skill)
  );

  const canContinue = Boolean(
    data.firstName.trim() &&
    data.lastName.trim() &&
    data.currentSituation.trim() &&
    data.educationLevel
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-3 sm:p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-6">
            <h1 className={` ${antonio.className} tracking-tighter text-4xl md:text-5xl lg:text-6xtext-4xl md:text-5xl lg:text-6x font-bold mb-1 sm:mb-4`} style={{ color: '#2A8643' }}>
              Tell us about yourself
            </h1>
            <p className="text-xs sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Help us match you with the right opportunities.
            </p>
          </div>

          {/* Form Fields */}
          <div className="mb-4 sm:mb-16">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Current Situation */}
            <div className="mb-3 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Current Situation
              </label>
              <input
                type="text"
                value={data.currentSituation}
                onChange={(e) => onChange({ ...data, currentSituation: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Freshman, Student, Professional"
              />
            </div>

            {/* Education Level */}
            <div className="mb-3 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Education Level
              </label>
              <select
                value={data.educationLevel}
                onChange={(e) => onChange({ ...data, educationLevel: e.target.value as EducationLevel })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select education level</option>
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="phd">PhD</option>
                <option value="bootcamp">Bootcamp</option>
                <option value="self_taught">Self Taught</option>
              </select>
            </div>

            {/* Skills */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Skills
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => handleSkillInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={() => handleAddSkill(skillInput)}
                    disabled={!skillInput.trim()}
                    className="px-3 sm:px-4 py-2 sm:py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w- h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Tags */}
            {data.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1 mb-3 sm:mb-4">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 text-green-800 rounded-lg text-[10px] sm:text-xs font-medium bg-green-100 border border-green-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-0.5 hover:text-green-600 transition-colors"
                    >
                      <svg className="w- h-2 sm:w-2.5 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Suggestions */}
            <div className="mt-3 sm:mt-4">
              <h3 className="text-xs sm:text-base text-gray-600 font-medium mb-1 sm:mb-1">Suggestions:</h3>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git']
                  .filter((skill) => !data.skills.includes(skill))
                  .map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill)}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 text-gray-700 bg-white border border-gray-300 rounded-lg text-[10px] sm:text-xs hover:bg-gray-50 hover:border-green-400 transition-colors"
                    >
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {skill}
                    </button>
                  ))}
              </div>
            </div>
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
                      ${index < 2
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: '#2A8643' }}>
                Step 2 out of 4
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
