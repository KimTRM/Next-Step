"use client";

/**
 * Job Matcher Content Component
 * AI-powered job matching based on resume skills
 */

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  Sparkles,
  Upload,
  MapPin,
  CheckCircle,
  AlertCircle,
  Brain,
  TrendingUp,
  Briefcase,
  Clock,
  BarChart3,
  Building2,
  ExternalLink,
  Loader2,
  Linkedin,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

// Configuration - uses environment variable or fallback
const API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000";

// Types
interface JobMatch {
  id: string;
  company: string;
  companySize?: string;
  title: string;
  confidence: number;
  matchedSkills?: string[];
  matched_skills?: string[];
  missingSkills?: string[];
  missing_skills?: string[];
  salaryRange?: string;
  experience?: string;
  job_url?: string;
  job_source?: string;
}

interface AIAnalysisData {
  detected_industry?: string;
  industry_confidence?: number;
  detected_skills?: string[];
  suggested_industries?: { industry: string; confidence: number }[];
  search_keywords?: string[];
  fresh_jobs_fetched?: number;
  linkedin_boost?: number;
  linkedin_skills?: string[];
  experience_years?: number;
  extracted_text?: string;
  error?: string;
}

// City and Industry options
const cities = [
  "Naga City",
  "Manila",
  "Quezon City",
  "Makati",
  "Cebu City",
  "Davao City",
  "Iloilo City",
  "Bacolod",
  "Taguig",
  "Pasig",
  "Remote Philippines",
];

const industries = [
  { value: "detect", label: "🔍 Detect Industry (AI)" },
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance & Accounting" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Marketing", label: "Marketing & Advertising" },
  { value: "Education", label: "Education" },
  { value: "Retail", label: "Retail & Sales" },
  { value: "Manufacturing", label: "Manufacturing & Logistics" },
  { value: "Consulting", label: "Consulting" },
  { value: "BPO", label: "BPO & Customer Service" },
  { value: "Engineering", label: "Engineering (Civil/Mech/Elec)" },
  { value: "Hospitality", label: "Hospitality & Tourism" },
  { value: "Legal", label: "Legal" },
  { value: "HR", label: "Human Resources" },
  { value: "Administrative", label: "Administrative" },
  { value: "Fine Arts & Design", label: "Fine Arts & Design" },
];

// Skill patterns for extraction
const skillPatterns = [
  // Tech skills
  "python",
  "javascript",
  "react",
  "node.js",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "machine learning",
  "java",
  "typescript",
  "git",
  "agile",
  "css",
  "html",
  "mongodb",
  "postgresql",
  "tensorflow",
  "vue",
  "angular",
  // Design skills
  "photoshop",
  "illustrator",
  "figma",
  "sketch",
  "adobe",
  "indesign",
  "after effects",
  "premiere",
  "ui design",
  "ux design",
  "graphic design",
  "branding",
  "typography",
  "animation",
  "canva",
  "coreldraw",
  // Marketing skills
  "seo",
  "social media",
  "content marketing",
  "google analytics",
  // Finance skills
  "accounting",
  "bookkeeping",
  "excel",
  "financial analysis",
];

const industryKeywords: Record<string, string[]> = {
  Technology: [
    "software",
    "developer",
    "engineer",
    "programming",
    "python",
    "javascript",
    "react",
    "aws",
    "cloud",
    "data",
  ],
  Finance: [
    "finance",
    "accounting",
    "bank",
    "investment",
    "audit",
    "tax",
    "bookkeeping",
  ],
  Healthcare: [
    "nurse",
    "medical",
    "hospital",
    "patient",
    "clinical",
    "doctor",
    "pharmacy",
  ],
  Marketing: [
    "marketing",
    "advertising",
    "brand",
    "social media",
    "seo",
    "content",
  ],
  Education: [
    "teacher",
    "education",
    "school",
    "training",
    "curriculum",
    "student",
  ],
  Retail: ["retail", "sales", "store", "customer service", "inventory"],
  Manufacturing: [
    "manufacturing",
    "production",
    "factory",
    "assembly",
    "quality control",
  ],
  Consulting: ["consulting", "consultant", "advisory", "strategy"],
  "Fine Arts & Design": [
    "graphic design",
    "artist",
    "illustrator",
    "creative",
    "visual",
    "animation",
    "ui",
    "ux",
    "designer",
    "art director",
    "multimedia",
    "photography",
    "adobe",
    "photoshop",
  ],
};

export function JobMatcherContent() {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeText, setResumeText] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinValid, setLinkedinValid] = useState<boolean | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [apiStatus, setApiStatus] = useState<"checking" | "ready" | "offline">(
    "checking"
  );
  const [jobCount, setJobCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");

  // Results state
  const [showResults, setShowResults] = useState(false);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const [aiAnalysisData, setAiAnalysisData] = useState<AIAnalysisData | null>(
    null
  );
  const [displayIndustry, setDisplayIndustry] = useState("");
  const [showAIResults, setShowAIResults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API status on mount
  useEffect(() => {
    checkAPI();
  }, []);

  // Validate LinkedIn URL on change
  useEffect(() => {
    if (!linkedinUrl.trim()) {
      setLinkedinValid(null);
      return;
    }
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    setLinkedinValid(pattern.test(linkedinUrl.trim()));
  }, [linkedinUrl]);

  // Check if form is ready
  const isReady =
    (resumeText.trim() || uploadedFile) &&
    selectedCity &&
    selectedIndustry.length > 0;

  // API check
  async function checkAPI() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus("ready");
        setJobCount(data.num_jobs);
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    }
  }

  // Extract skills locally
  function extractSkills(text: string): string[] {
    const textLower = text.toLowerCase();
    return skillPatterns.filter((skill) => textLower.includes(skill));
  }

  // Detect industry locally
  function detectIndustryLocal(text: string): string {
    const textLower = text.toLowerCase();
    let bestMatch = "Technology";
    let bestScore = 0;

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const score = keywords.filter((kw) => textLower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = industry;
      }
    }

    return bestMatch;
  }

  // Generate demo matches (fallback)
  function generateDemoMatches(detectedSkills: string[]): JobMatch[] {
    const companies = [
      { name: "TechFlow Inc", size: "Startup" },
      { name: "DataSphere", size: "Mid-size" },
      { name: "CloudNine Systems", size: "Enterprise" },
      { name: "InnovateLabs", size: "Startup" },
      { name: "ScaleUp Corp", size: "Mid-size" },
    ];

    const titles = [
      "Software Engineer",
      "Senior Developer",
      "Full Stack Developer",
      "Data Engineer",
      "ML Engineer",
    ];

    return companies.map((company, idx) => {
      const confidence = Math.round(95 - idx * 8 + (Math.random() * 10 - 5));
      const matchedSkills = detectedSkills.slice(
        0,
        Math.max(2, detectedSkills.length - idx)
      );
      const missingSkills = ["kubernetes", "terraform", "graphql"].slice(
        0,
        idx % 3
      );

      return {
        id: `job_${idx}`,
        company: company.name,
        companySize: company.size,
        title: titles[idx],
        confidence,
        matchedSkills,
        missingSkills,
        salaryRange: `₱${60 + idx * 15}k - ₱${100 + idx * 20}k`,
        experience: `${2 + idx}-${5 + idx} years`,
      };
    });
  }

  // File upload handler
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "txt") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText((event.target?.result as string) || "");
      };
      reader.readAsText(file);
    }
  }

  // Main analysis function
  async function handleAnalyze() {
    const useDetection = selectedIndustry === "detect";
    let detectedIndustryValue = selectedIndustry;
    let searchKeywords: string[] = [];
    let analysisData: AIAnalysisData | null = null;

    setIsAnalyzing(true);

    // If Detect Industry is selected, analyze resume first
    if (useDetection) {
      setAnalyzeStatus("AI Analyzing Resume...");

      try {
        let analyzeResponse: Response | null = null;

        // If a PDF/DOCX file is uploaded, use Gemini file analysis
        if (uploadedFile) {
          const fileExtension = uploadedFile.name
            .split(".")
            .pop()
            ?.toLowerCase();
          if (fileExtension === "pdf" || fileExtension === "docx") {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("city", selectedCity || "");
            formData.append("fetch_fresh_jobs", "true");

            analyzeResponse = await fetch(`${API_BASE}/analyze-resume-file`, {
              method: "POST",
              body: formData,
            });

            if (analyzeResponse.ok) {
              analysisData = await analyzeResponse.json();
              if (analysisData?.extracted_text) {
                setResumeText(analysisData.extracted_text);
              }
              detectedIndustryValue =
                analysisData?.detected_industry || "Technology";
              searchKeywords = analysisData?.search_keywords || [];

              if (analysisData?.error) {
                alert(
                  `PDF Analysis Issue:\n\n${analysisData.error}\n\nPlease paste your resume text in the text area.`
                );
                analyzeResponse = null;
              }
            }
          }
        }

        // Fall back to text analysis if no file or text file
        if (!analyzeResponse || !analyzeResponse.ok) {
          analyzeResponse = await fetch(`${API_BASE}/analyze-resume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume_text: resumeText,
              city: selectedCity,
              fetch_fresh_jobs: true,
            }),
          });

          if (analyzeResponse.ok) {
            analysisData = await analyzeResponse.json();
            detectedIndustryValue =
              analysisData?.detected_industry || "Technology";
            searchKeywords = analysisData?.search_keywords || [];
          }
        }

        if (!analyzeResponse?.ok) {
          // Fallback to local detection
          detectedIndustryValue = detectIndustryLocal(resumeText);
          const localSkills = extractSkills(resumeText);
          analysisData = {
            detected_industry: detectedIndustryValue,
            industry_confidence: 70,
            detected_skills: localSkills,
            suggested_industries: [
              { industry: detectedIndustryValue, confidence: 70 },
            ],
            search_keywords: localSkills.slice(0, 5),
            fresh_jobs_fetched: 0,
          };
          searchKeywords = analysisData.search_keywords || [];
        }
      } catch {
        // Fallback to local detection
        detectedIndustryValue = detectIndustryLocal(resumeText);
        const localSkills = extractSkills(resumeText);
        analysisData = {
          detected_industry: detectedIndustryValue,
          industry_confidence: 70,
          detected_skills: localSkills,
          suggested_industries: [
            { industry: detectedIndustryValue, confidence: 70 },
          ],
          search_keywords: localSkills.slice(0, 5),
          fresh_jobs_fetched: 0,
        };
        searchKeywords = analysisData.search_keywords || [];
      }
    }

    // Fetch and match jobs
    setAnalyzeStatus("Fetching Fresh Jobs & Matching...");

    let jobMatches: JobMatch[] = [];
    let detectedSkills: string[] = [];
    let experienceYears = 5;

    try {
      detectedSkills =
        analysisData?.detected_skills || extractSkills(resumeText);
      if (!searchKeywords.length) {
        searchKeywords =
          analysisData?.search_keywords || detectedSkills.slice(0, 5);
      }
      experienceYears = analysisData?.experience_years || 5;
      const targetIndustry = useDetection
        ? detectedIndustryValue
        : selectedIndustry;
      const linkedinUrlValue = linkedinUrl.trim() || null;

      const response = await fetch(`${API_BASE}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: detectedSkills,
          experience_years: experienceYears,
          city: selectedCity,
          target_industry: targetIndustry,
          limit: 15,
          search_keywords: searchKeywords,
          linkedin_url: linkedinUrlValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        jobMatches = data.matches;
        detectedSkills = data.candidate_skills;

        if (data.linkedin_boost !== undefined) {
          analysisData = analysisData || {};
          analysisData.linkedin_boost = data.linkedin_boost;
          analysisData.linkedin_skills = data.linkedin_skills || [];
        }
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback to demo mode
      await new Promise((r) => setTimeout(r, 1500));
      detectedSkills =
        analysisData?.detected_skills || extractSkills(resumeText);
      if (detectedSkills.length === 0) {
        detectedSkills = ["javascript", "python", "sql"];
      }
      jobMatches = generateDemoMatches(detectedSkills);
      experienceYears = 5;
    }

    // Update state with results
    setAiAnalysisData(analysisData);
    setMatches(jobMatches);
    setSkills(detectedSkills);
    setExperience(experienceYears);
    setDisplayIndustry(
      useDetection ? detectedIndustryValue : selectedIndustry
    );
    setShowAIResults(useDetection);
    setCurrentStep(3);
    setShowResults(true);
    setIsAnalyzing(false);
    setAnalyzeStatus("");
  }

  // Reset to new search
  function handleNewSearch() {
    setShowResults(false);
    setAiAnalysisData(null);
    setMatches([]);
    setSkills([]);
    setCurrentStep(1);
    setShowAIResults(false);
  }

  // Compute stats
  const avgConfidence =
    matches.length > 0
      ? Math.round(
          matches.reduce((a, b) => a + b.confidence, 0) / matches.length
        )
      : 0;
  const strongMatches = matches.filter((m) => m.confidence >= 75).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Title & API Status */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Job Matcher</h1>
            <p className="text-muted-foreground">
              Upload your resume and let AI find the best job matches for you
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Powered by ML</span>
            <span
              className={cn(
                "ml-3 px-2 py-1 rounded text-xs",
                apiStatus === "ready"
                  ? "bg-primary/10 text-primary"
                  : apiStatus === "offline"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {apiStatus === "ready"
                ? `API Ready (${jobCount} jobs)`
                : apiStatus === "offline"
                  ? "API Offline - Demo Mode"
                  : "Checking API..."}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              1
            </div>
            <span
              className={cn(
                "text-sm",
                currentStep >= 1 ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Upload Resume
            </span>
          </div>
          <div
            className={cn(
              "w-16 h-px",
              currentStep >= 2 ? "bg-primary" : "bg-border"
            )}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              2
            </div>
            <span
              className={cn(
                "text-sm",
                currentStep >= 2 ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Select Preferences
            </span>
          </div>
          <div
            className={cn(
              "w-16 h-px",
              currentStep >= 3 ? "bg-primary" : "bg-border"
            )}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep >= 3
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              3
            </div>
            <span
              className={cn(
                "text-sm",
                currentStep >= 3 ? "text-foreground" : "text-muted-foreground"
              )}
            >
              View Matches
            </span>
          </div>
        </div>

        {/* Input Section */}
        {!showResults && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Resume Upload */}
            <div className="bg-card rounded-2xl border shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Your Resume
              </h2>

              <label
                className={cn(
                  "block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  uploadedFile
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!uploadedFile ? (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports TXT, PDF, DOCX
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="font-medium">{uploadedFileName}</span>
                  </div>
                )}
              </label>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Or paste your resume text:
                </p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={`Paste your resume content here... 

Example:
John Smith - Software Engineer
5 years experience in Python, JavaScript, React, AWS
Bachelor's in Computer Science
Previously worked at Tech Corp, StartupXYZ`}
                  className="w-full h-40 bg-muted/50 border rounded-xl p-4 text-sm placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Location & Industry */}
            <div className="bg-card rounded-2xl border shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Job Preferences
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 font-medium">
                    Preferred City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-background border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a city...</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">
                    Target Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full bg-background border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select an industry...</option>
                    {industries.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LinkedIn Profile */}
              <div className="mt-6">
                <label className="block text-sm mb-2 font-medium">
                  <Linkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn Profile (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className="w-full bg-background border rounded-xl px-4 py-3 placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {linkedinValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {linkedinValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Adding your LinkedIn increases match accuracy by up to 15%
                </p>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!isReady || isAnalyzing}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3",
                isReady && !isAnalyzing
                  ? "bg-primary hover:bg-primary/90 shadow-lg text-primary-foreground cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{analyzeStatus}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Find Matching Jobs</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="space-y-8">
            {/* AI Detection Results */}
            {showAIResults && aiAnalysisData && (
              <div className="bg-gradient-to-br from-primary/5 to-background border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 font-semibold mb-4">
                  <Brain className="w-5 h-5 text-primary" />
                  <span>AI Industry Detection Results</span>
                  <span className="ml-auto text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">
                    Analyzed
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-card rounded-lg p-3 border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Detected Industry
                    </div>
                    <div className="font-semibold">
                      {aiAnalysisData.detected_industry || "Unknown"}
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Confidence
                    </div>
                    <div
                      className={cn(
                        "font-semibold",
                        (aiAnalysisData.industry_confidence || 0) >= 70
                          ? "text-green-600"
                          : (aiAnalysisData.industry_confidence || 0) >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      )}
                    >
                      {aiAnalysisData.industry_confidence || 0}%
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-3 border col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Search Keywords
                    </div>
                    <div className="text-sm truncate">
                      {(aiAnalysisData.search_keywords || []).join(", ") ||
                        "No specific keywords"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Detected Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(aiAnalysisData.detected_skills || [])
                      .slice(0, 15)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    {(!aiAnalysisData.detected_skills ||
                      aiAnalysisData.detected_skills.length === 0) && (
                      <span className="text-muted-foreground text-sm">
                        No specific skills detected
                      </span>
                    )}
                  </div>
                </div>

                {(aiAnalysisData.suggested_industries?.length || 0) > 1 && (
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      Other Matching Industries
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysisData.suggested_industries
                        ?.slice(1, 4)
                        .map((ind, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-card border text-muted-foreground text-xs rounded-full"
                          >
                            {ind.industry} ({ind.confidence}%)
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {(aiAnalysisData.fresh_jobs_fetched || 0) > 0 && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-1 text-primary" />
                    Fetched {aiAnalysisData.fresh_jobs_fetched} fresh jobs from
                    Indeed based on your profile
                  </div>
                )}

                {aiAnalysisData.linkedin_boost !== undefined && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-primary/5 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">LinkedIn Profile Boost:</span>
                      <span
                        className={cn(
                          "font-bold",
                          aiAnalysisData.linkedin_boost >= 0
                            ? "text-green-600"
                            : "text-red-500"
                        )}
                      >
                        {aiAnalysisData.linkedin_boost >= 0 ? "+" : ""}
                        {aiAnalysisData.linkedin_boost}%
                      </span>
                    </div>
                    {(aiAnalysisData.linkedin_skills?.length || 0) > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Additional Skills from LinkedIn:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysisData.linkedin_skills
                            ?.slice(0, 10)
                            .map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-8 text-primary-foreground">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Your Skills Analysis
                  </h2>
                  <p className="text-primary-foreground/80">
                    Found {matches.length} matching jobs in {displayIndustry} ·{" "}
                    {selectedCity}
                  </p>
                </div>
                <button
                  onClick={handleNewSearch}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors border border-white/20"
                >
                  New Search
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Briefcase className="w-4 h-4" />
                    {displayIndustry}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <Clock className="w-4 h-4" />
                    {experience}+ years experience
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                    <BarChart3 className="w-4 h-4" />
                    {skills.length} skills detected
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-primary-foreground/80 mt-1" />
                    <p className="text-base leading-relaxed">
                      {skills.length > 0
                        ? `Detected skills: ${skills.join(", ")}.`
                        : "No skills detected."}
                    </p>
                  </div>
                  <details className="mt-4">
                    <summary className="text-sm text-primary-foreground/80 cursor-pointer hover:text-primary-foreground transition-colors">
                      View skills by category
                    </summary>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/20 rounded-full text-sm border border-white/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Job Matches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Job Matches
              </h3>
              <div>
                {matches.map((job, idx) => {
                  const confBgClass =
                    job.confidence >= 75
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : job.confidence >= 50
                        ? "bg-amber-100 border-amber-300 text-amber-700"
                        : "bg-red-100 border-red-300 text-red-700";
                  const confLabel =
                    job.confidence >= 75
                      ? "Strong Match"
                      : job.confidence >= 50
                        ? "Good Fit"
                        : "Potential";
                  const matchedSkills =
                    job.matchedSkills || job.matched_skills || [];
                  const missingSkills =
                    job.missingSkills || job.missing_skills || [];

                  return (
                    <div
                      key={job.id}
                      className="bg-card rounded-xl border shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all mb-4"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                              #{idx + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-2 text-muted-foreground mt-1 flex-wrap">
                                <Building2 className="w-4 h-4" />
                                <span>{job.company}</span>
                                <span className="text-border">·</span>
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                  {job.companySize || "Company"}
                                </span>
                                {job.job_source &&
                                  job.job_source !== "synthetic" && (
                                    <>
                                      <span className="text-border">·</span>
                                      <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        {job.job_source}
                                      </span>
                                    </>
                                  )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>
                                  {job.salaryRange || "₱80k - ₱150k"}
                                </span>
                                <span>{job.experience || "3-5 years"}</span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "px-4 py-2 rounded-lg border text-center min-w-[100px]",
                              confBgClass
                            )}
                          >
                            <div className="text-2xl font-bold">
                              {job.confidence}%
                            </div>
                            <div className="text-xs opacity-75">{confLabel}</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              ✓ Matching Skills
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {matchedSkills.map((skill, sidx) => (
                                <span
                                  key={sidx}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-amber-700 mb-2">
                              ⚡ Skills to Develop
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {missingSkills.map((skill, sidx) => (
                                <span
                                  key={sidx}
                                  className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          {job.job_url ? (
                            <a
                              href={job.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-colors text-center text-primary-foreground flex items-center justify-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Apply on {job.job_source || "Indeed"}
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex-1 py-2 bg-muted text-muted-foreground rounded-lg font-medium cursor-not-allowed"
                            >
                              Application Link Unavailable
                            </button>
                          )}
                          <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Match Summary
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <div className="text-2xl font-bold">{avgConfidence}%</div>
                  <div className="text-sm text-muted-foreground">
                    Average Match
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <div className="text-2xl font-bold">{strongMatches}</div>
                  <div className="text-sm text-muted-foreground">
                    Strong Matches
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <div className="text-2xl font-bold">{skills.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Skills Detected
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
