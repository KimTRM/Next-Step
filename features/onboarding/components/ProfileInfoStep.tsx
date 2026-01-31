"use client";

import { useState } from 'react';
import { EducationLevel, SUGGESTED_SKILLS } from '../types';
import { OnboardingNavigation } from './OnboardingNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* White Container */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-12 min-h-[600px]">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#2A8643' }}>
              Tell us about yourself
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help us match you with the right opportunities.
            </p>
          </div>

          {/* Form Fields */}
          <div className="mb-16">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={data.firstName}
                  onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={data.lastName}
                  onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Current Situation */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Situation
              </label>
              <input
                type="text"
                value={data.currentSituation}
                onChange={(e) => onChange({ ...data, currentSituation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Freshman, Student, Professional"
              />
            </div>

            {/* Education Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Level
              </label>
              <select
                value={data.educationLevel}
                onChange={(e) => onChange({ ...data, educationLevel: e.target.value as EducationLevel })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={() => handleAddSkill(skillInput)}
                    disabled={!skillInput.trim()}
                    className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Skills Tags */}
            {data.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 text-green-800 rounded-full text-sm font-medium bg-green-100 border border-green-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Suggestions */}
            <div className="mt-4">
              <h3 className="text-gray-600 font-medium mb-2">Suggestions:</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'HTML/CSS', 'SQL', 'Git'].map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleAddSkill(skill)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-gray-700 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Continue Button - Right */}
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
