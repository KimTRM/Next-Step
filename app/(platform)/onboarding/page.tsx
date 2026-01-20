"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, User, GraduationCap, Target, Briefcase, X, Plus } from "lucide-react";

interface OnboardingData {
  // Basic Info
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  
  // Education
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }>;
  
  // Skills & Interests
  skills: string[];
  interests: string[];
  workStyles: Array<"remote" | "hybrid" | "onsite" | "flexible">;
  
  // Career Goals
  careerGoals: string;
  targetIndustries: string[];
  targetRoles: string[];
  salaryExpectation: string;
  availability: "immediately" | "within_1_month" | "within_3_months" | "within_6_months" | "just_exploring";
}

const SKILL_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++",
  "HTML/CSS", "SQL", "MongoDB", "PostgreSQL", "Docker", "AWS", "Azure", "GCP",
  "Machine Learning", "Data Science", "UI/UX Design", "Project Management", "Agile", "Scrum",
  "Communication", "Leadership", "Problem Solving", "Critical Thinking", "Teamwork"
];

const INTEREST_OPTIONS = [
  "Technology", "Healthcare", "Finance", "Education", "Marketing", "Sales", "Design",
  "Research", "Consulting", "Entrepreneurship", "Non-profit", "Government", "Real Estate",
  "Media", "Entertainment", "Sports", "Travel", "Food", "Fashion", "Automotive"
];

const INDUSTRY_OPTIONS = [
  "Software Development", "Data Science", "Cybersecurity", "Cloud Computing", "AI/ML",
  "Healthcare Technology", "Financial Technology", "E-commerce", "Digital Marketing",
  "Consulting", "Education Technology", "Gaming", "Social Media", "Clean Energy"
];

const ROLE_OPTIONS = [
  "Software Engineer", "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer",
  "Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile Developer",
  "Data Analyst", "Business Analyst", "Project Manager", "Marketing Manager", "Sales Manager"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customSkill, setCustomSkill] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [customRole, setCustomRole] = useState("");
  
  const [formData, setFormData] = useState<OnboardingData>({
    education: [{
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      isCurrent: false
    }],
    skills: [],
    interests: [],
    workStyles: [],
    careerGoals: "",
    targetIndustries: [],
    targetRoles: [],
    salaryExpectation: "",
    availability: "just_exploring"
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback((data: OnboardingData, step: number) => {
    localStorage.setItem("onboardingData", JSON.stringify({ ...data, currentStep: step }));
  }, []);

  // Convex mutations
  const updateUser = useMutation(api.userMutations.updateUser);
  const getUser = useQuery(api.users.getUserByClerkId, { clerkId: userId || "" });

  // Check if user already completed onboarding
  useEffect(() => {
    if (getUser?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [getUser, router]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.phone?.trim()) {
          newErrors.phone = "Phone number is required";
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = "Date of birth is required";
        }
        if (!formData.gender) {
          newErrors.gender = "Please select your gender";
        }
        break;
      
      case 2: // Education
        const edu = formData.education[0];
        if (!edu?.institution?.trim()) {
          newErrors.institution = "Institution name is required";
        }
        if (!edu?.degree?.trim()) {
          newErrors.degree = "Degree is required";
        }
        if (!edu?.field?.trim()) {
          newErrors.field = "Field of study is required";
        }
        if (!edu?.startDate) {
          newErrors.startDate = "Start date is required";
        }
        if (!edu.isCurrent && !edu?.endDate) {
          newErrors.endDate = "End date is required (unless currently studying)";
        }
        break;
      
      case 3: // Skills & Interests
        if (formData.skills.length === 0) {
          newErrors.skills = "Please select at least one skill";
        }
        if (formData.interests.length === 0) {
          newErrors.interests = "Please select at least one interest";
        }
        if (formData.workStyles.length === 0) {
          newErrors.workStyles = "Please select at least one work style preference";
        }
        break;
      
      case 4: // Career Goals
        if (!formData.careerGoals?.trim()) {
          newErrors.careerGoals = "Please describe your career goals";
        }
        if (formData.targetIndustries.length === 0) {
          newErrors.targetIndustries = "Please select at least one target industry";
        }
        if (formData.targetRoles.length === 0) {
          newErrors.targetRoles = "Please select at least one target role";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveToLocalStorage(formData, nextStep);
      
      // Scroll to top for mobile
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveToLocalStorage(formData, prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkip = async () => {
    saveToLocalStorage(formData, currentStep);
    router.push("/dashboard");
  };

  const handleComplete = async () => {
    if (!userId || !validateStep(4)) return;

    setIsSaving(true);
    try {
      await updateUser({
        clerkId: userId,
        onboardingCompleted: true,
        onboardingStep: 4,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        gender: formData.gender,
        education: formData.education.map(edu => ({
          ...edu,
          startDate: new Date(edu.startDate).getTime(),
          endDate: edu.endDate ? new Date(edu.endDate).getTime() : undefined,
        })),
        skills: formData.skills,
        interests: formData.interests,
        workStyles: formData.workStyles,
        careerGoals: formData.careerGoals,
        targetIndustries: formData.targetIndustries,
        targetRoles: formData.targetRoles,
        salaryExpectation: formData.salaryExpectation,
        availability: formData.availability,
      });

      localStorage.removeItem("onboardingData");
      router.push("/dashboard?welcome=true");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const toggleWorkStyle = (style: "remote" | "hybrid" | "onsite" | "flexible") => {
    setFormData(prev => ({
      ...prev,
      workStyles: prev.workStyles.includes(style)
        ? prev.workStyles.filter(s => s !== style)
        : [...prev.workStyles, style]
    }));
  };

  const addIndustry = (industry: string) => {
    if (industry && !formData.targetIndustries.includes(industry)) {
      setFormData(prev => ({
        ...prev,
        targetIndustries: [...prev.targetIndustries, industry]
      }));
    }
  };

  const removeIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      targetIndustries: prev.targetIndustries.filter(i => i !== industry)
    }));
  };

  const addRole = (role: string) => {
    if (role && !formData.targetRoles.includes(role)) {
      setFormData(prev => ({
        ...prev,
        targetRoles: [...prev.targetRoles, role]
      }));
    }
  };

  const removeRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.filter(r => r !== role)
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, formData]);

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold">Welcome to NextStep</h1>
            <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
              Skip for now
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <User className="h-5 w-5" />}
              {currentStep === 2 && <GraduationCap className="h-5 w-5" />}
              {currentStep === 3 && <Target className="h-5 w-5" />}
              {currentStep === 4 && <Briefcase className="h-5 w-5" />}
              
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Education"}
              {currentStep === 3 && "Skills & Interests"}
              {currentStep === 4 && "Career Goals"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself to get started"}
              {currentStep === 2 && "Share your educational background"}
              {currentStep === 3 && "Help us understand your skills and interests"}
              {currentStep === 4 && "Let us know your career aspirations"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className={errors.dateOfBirth ? "border-destructive" : ""}
                    />
                    {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${index}`}>Institution *</Label>
                        <Input
                          id={`institution-${index}`}
                          placeholder="University name"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].institution = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className={errors.institution ? "border-destructive" : ""}
                        />
                        {errors.institution && <p className="text-sm text-destructive">{errors.institution}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${index}`}>Degree *</Label>
                        <Input
                          id={`degree-${index}`}
                          placeholder="e.g., Bachelor's, Master's, PhD"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].degree = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className={errors.degree ? "border-destructive" : ""}
                        />
                        {errors.degree && <p className="text-sm text-destructive">{errors.degree}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`field-${index}`}>Field of Study *</Label>
                        <Input
                          id={`field-${index}`}
                          placeholder="e.g., Computer Science, Business"
                          value={edu.field}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].field = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className={errors.field ? "border-destructive" : ""}
                        />
                        {errors.field && <p className="text-sm text-destructive">{errors.field}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${index}`}>Start Date *</Label>
                        <Input
                          id={`startDate-${index}`}
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].startDate = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className={errors.startDate ? "border-destructive" : ""}
                        />
                        {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`isCurrent-${index}`}
                        checked={edu.isCurrent}
                        onCheckedChange={(checked) => {
                          const newEducation = [...formData.education];
                          newEducation[index].isCurrent = checked as boolean;
                          if (checked) {
                            newEducation[index].endDate = "";
                          }
                          setFormData(prev => ({ ...prev, education: newEducation }));
                        }}
                      />
                      <Label htmlFor={`isCurrent-${index}`}>Currently studying here</Label>
                    </div>
                    
                    {!edu.isCurrent && (
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${index}`}>End Date *</Label>
                        <Input
                          id={`endDate-${index}`}
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEducation = [...formData.education];
                            newEducation[index].endDate = e.target.value;
                            setFormData(prev => ({ ...prev, education: newEducation }));
                          }}
                          className={errors.endDate ? "border-destructive" : ""}
                        />
                        {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Skills & Interests */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Skills */}
                <div className="space-y-3">
                  <Label>Skills *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select from popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.filter(skill => !formData.skills.includes(skill)).slice(0, 8).map((skill) => (
                        <Button
                          key={skill}
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill(skill)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom skill"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customSkill.trim()) {
                            addSkill(customSkill.trim());
                            setCustomSkill("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customSkill.trim()) {
                          addSkill(customSkill.trim());
                          setCustomSkill("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
                </div>

                <Separator />

                {/* Interests */}
                <div className="space-y-3">
                  <Label>Interests *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select from popular interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.filter(interest => !formData.interests.includes(interest)).slice(0, 8).map((interest) => (
                        <Button
                          key={interest}
                          variant="outline"
                          size="sm"
                          onClick={() => addInterest(interest)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {interest}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom interest"
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customInterest.trim()) {
                            addInterest(customInterest.trim());
                            setCustomInterest("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customInterest.trim()) {
                          addInterest(customInterest.trim());
                          setCustomInterest("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
                </div>

                <Separator />

                {/* Work Styles */}
                <div className="space-y-3">
                  <Label>Work Style Preferences *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "remote", label: "Remote" },
                      { value: "hybrid", label: "Hybrid" },
                      { value: "onsite", label: "On-site" },
                      { value: "flexible", label: "Flexible" }
                    ].map((style) => (
                      <div key={style.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={style.value}
                          checked={formData.workStyles.includes(style.value as any)}
                          onCheckedChange={() => toggleWorkStyle(style.value as any)}
                        />
                        <Label htmlFor={style.value}>{style.label}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.workStyles && <p className="text-sm text-destructive">{errors.workStyles}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Career Goals */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Career Goals */}
                <div className="space-y-2">
                  <Label htmlFor="careerGoals">Career Goals *</Label>
                  <Textarea
                    id="careerGoals"
                    placeholder="Describe your career aspirations and what you hope to achieve..."
                    value={formData.careerGoals}
                    onChange={(e) => setFormData(prev => ({ ...prev, careerGoals: e.target.value }))}
                    rows={4}
                    className={errors.careerGoals ? "border-destructive" : ""}
                  />
                  {errors.careerGoals && <p className="text-sm text-destructive">{errors.careerGoals}</p>}
                </div>

                {/* Target Industries */}
                <div className="space-y-3">
                  <Label>Target Industries *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.targetIndustries.map((industry) => (
                      <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                        {industry}
                        <button
                          onClick={() => removeIndustry(industry)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select from popular industries:</p>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRY_OPTIONS.filter(industry => !formData.targetIndustries.includes(industry)).slice(0, 6).map((industry) => (
                        <Button
                          key={industry}
                          variant="outline"
                          size="sm"
                          onClick={() => addIndustry(industry)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {industry}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom industry"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customIndustry.trim()) {
                            addIndustry(customIndustry.trim());
                            setCustomIndustry("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customIndustry.trim()) {
                          addIndustry(customIndustry.trim());
                          setCustomIndustry("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.targetIndustries && <p className="text-sm text-destructive">{errors.targetIndustries}</p>}
                </div>

                {/* Target Roles */}
                <div className="space-y-3">
                  <Label>Target Roles *</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.targetRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="flex items-center gap-1">
                        {role}
                        <button
                          onClick={() => removeRole(role)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Select from popular roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.filter(role => !formData.targetRoles.includes(role)).slice(0, 6).map((role) => (
                        <Button
                          key={role}
                          variant="outline"
                          size="sm"
                          onClick={() => addRole(role)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom role"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customRole.trim()) {
                            addRole(customRole.trim());
                            setCustomRole("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (customRole.trim()) {
                          addRole(customRole.trim());
                          setCustomRole("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {errors.targetRoles && <p className="text-sm text-destructive">{errors.targetRoles}</p>}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryExpectation">Salary Expectation</Label>
                    <Input
                      id="salaryExpectation"
                      placeholder="e.g., $50,000 - $70,000"
                      value={formData.salaryExpectation}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryExpectation: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, availability: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Immediately</SelectItem>
                        <SelectItem value="within_1_month">Within 1 month</SelectItem>
                        <SelectItem value="within_3_months">Within 3 months</SelectItem>
                        <SelectItem value="within_6_months">Within 6 months</SelectItem>
                        <SelectItem value="just_exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="min-h-[48px] px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="min-h-[48px] px-6"
          >
            {isSaving ? (
              "Saving..."
            ) : currentStep === 4 ? (
              "Complete"
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> to continue • 
          Press <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> to go back
        </div>
      </div>
    </div>
  );
}
