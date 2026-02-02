import React, { useState, useCallback } from 'react';
import { Upload, Briefcase, MapPin, TrendingUp, CheckCircle, AlertCircle, Loader2, ChevronDown, Building2, GraduationCap, Clock, Sparkles, Target, BarChart3, ExternalLink } from 'lucide-react';

// Simulated AI matching engine (in production, this would call your API)
const simulateAIMatching = (resumeText) => {
  const skillPatterns = [
    'python', 'javascript', 'react', 'node.js', 'sql', 'aws', 'docker',
    'kubernetes', 'machine learning', 'data analysis', 'java', 'typescript',
    'git', 'agile', 'scrum', 'product management', 'excel', 'tableau',
    'leadership', 'communication', 'project management', 'figma', 'css',
    'html', 'mongodb', 'postgresql', 'redis', 'tensorflow', 'pytorch'
  ];
  
  const textLower = resumeText.toLowerCase();
  const foundSkills = skillPatterns.filter(skill => textLower.includes(skill));
  
  const yearMatches = resumeText.match(/20\d{2}/g) || [];
  const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 2000 && y <= 2026);
  const experience = years.length >= 2 ? 2026 - Math.min(...years) : 3;
  
  return {
    skills: foundSkills.length > 0 ? foundSkills : ['javascript', 'python', 'sql'],
    experience,
    education: textLower.includes('master') ? 'Masters' : 
               textLower.includes('bachelor') ? 'Bachelors' : 'Bachelors'
  };
};

const generateMatches = (candidate, city, industry) => {
  const companies = {
    'Technology': [
      { name: 'Innovate Tech', size: 'Startup' },
      { name: 'DataFlow Systems', size: 'Mid-size' },
      { name: 'CloudScale Inc', size: 'Enterprise' },
      { name: 'Neural Labs', size: 'Startup' },
      { name: 'CodeCraft Solutions', size: 'Mid-size' },
    ],
    'Finance': [
      { name: 'Capital Dynamics', size: 'Enterprise' },
      { name: 'FinTech Ventures', size: 'Startup' },
      { name: 'Quantum Trading', size: 'Mid-size' },
      { name: 'SecureBank Corp', size: 'Enterprise' },
    ],
    'Healthcare': [
      { name: 'MedTech Innovations', size: 'Mid-size' },
      { name: 'HealthData Systems', size: 'Startup' },
      { name: 'BioAnalytics Inc', size: 'Enterprise' },
    ],
    'Consulting': [
      { name: 'Strategy Partners', size: 'Enterprise' },
      { name: 'Digital Advisors', size: 'Mid-size' },
      { name: 'Growth Consulting', size: 'Startup' },
    ],
  };

  const titles = [
    'Software Engineer', 'Senior Developer', 'Data Analyst',
    'Product Manager', 'Full Stack Developer', 'ML Engineer',
    'DevOps Engineer', 'Technical Lead'
  ];

  const industryCompanies = companies[industry] || companies['Technology'];
  
  return industryCompanies.map((company, idx) => {
    const skillMatch = 0.5 + Math.random() * 0.4;
    const expMatch = candidate.experience >= 3 ? 0.9 : 0.6 + Math.random() * 0.2;
    const confidence = Math.round((skillMatch * 0.6 + expMatch * 0.4) * 100);
    
    const matchedSkills = candidate.skills.slice(0, Math.floor(candidate.skills.length * skillMatch));
    const allJobSkills = [...candidate.skills.slice(0, 4), 'communication', 'teamwork'];
    const missingSkills = allJobSkills.filter(s => !matchedSkills.includes(s)).slice(0, 2);
    
    return {
      id: `job_${idx}`,
      company: company.name,
      companySize: company.size,
      title: titles[idx % titles.length],
      industry,
      city,
      confidence,
      matchedSkills,
      missingSkills,
      salaryRange: `$${90 + idx * 15}k - $${120 + idx * 20}k`,
      experience: `${2 + idx}-${5 + idx} years`,
    };
  }).sort((a, b) => b.confidence - a.confidence);
};

export default function JobMatcherApp() {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [matches, setMatches] = useState([]);
  const [expandedJob, setExpandedJob] = useState(null);

  const cities = [
    'Naga City', 'Manila', 'Quezon City', 'Makati', 'Cebu City',
    'Davao City', 'Iloilo City', 'Bacolod', 'Taguig', 'Pasig', 'Remote Philippines'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Consulting', 
    'Retail', 'Manufacturing', 'Education', 'Media'
  ];

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target.result);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText || !city || !industry) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const parsedCandidate = simulateAIMatching(resumeText);
    setCandidate(parsedCandidate);
    
    const jobMatches = generateMatches(parsedCandidate, city, industry);
    setMatches(jobMatches);
    
    setIsProcessing(false);
    setStep(3);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 75) return 'text-emerald-400';
    if (confidence >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 75) return 'bg-emerald-500/20 border-emerald-500/30';
    if (confidence >= 50) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-rose-500/20 border-rose-500/30';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 75) return 'Strong Match';
    if (confidence >= 50) return 'Good Fit';
    return 'Potential';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.05) 0%, transparent 70%)
      `
    }}>
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">SkillMatch AI</h1>
              <p className="text-xs text-slate-500">Intelligent Job Matching</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Powered by ML</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { num: 1, label: 'Upload Resume' },
            { num: 2, label: 'Select Preferences' },
            { num: 3, label: 'View Matches' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s.num 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-sm ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`w-16 h-px ${step > s.num ? 'bg-purple-500' : 'bg-slate-700'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 & 2: Upload and Preferences */}
        {step < 3 && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Resume Upload */}
            <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Upload Your Resume
              </h2>
              
              <label className={`
                block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${fileName 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'}
              `}>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {fileName ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span className="text-emerald-400">{fileName}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="text-slate-400">Drop your resume here or click to browse</p>
                    <p className="text-xs text-slate-500">Supports TXT, PDF, DOCX</p>
                  </div>
                )}
              </label>

              {/* Or paste text */}
              <div className="mt-6">
                <p className="text-sm text-slate-500 mb-2">Or paste your resume text:</p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
            </div>

            {/* Location & Industry Selection */}
            <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Job Preferences
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* City Select */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Preferred City</label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => { setCity(e.target.value); if (step === 1) setStep(2); }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select a city...</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Industry Select */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Target Industry</label>
                  <div className="relative">
                    <select
                      value={industry}
                      onChange={(e) => { setIndustry(e.target.value); if (step === 1) setStep(2); }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">Select an industry...</option>
                      {industries.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!resumeText || !city || !industry || isProcessing}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3
                ${resumeText && city && industry && !isProcessing
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Find Matching Jobs
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Skills Analysis</h2>
                  <p className="text-slate-400">
                    Found <span className="text-white font-semibold">{matches.length} matching jobs</span> in {industry} · {city}
                  </p>
                </div>
                <button
                  onClick={() => { setStep(1); setMatches([]); setCandidate(null); }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  New Search
                </button>
              </div>

              {/* Skill Tags */}
              {candidate && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <GraduationCap className="w-4 h-4" />
                      {candidate.education}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      {candidate.experience}+ years experience
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <BarChart3 className="w-4 h-4" />
                      {candidate.skills.length} skills detected
                    </div>
                  </div>

                  {/* Skills Sentence Display */}
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-slate-300 text-base leading-relaxed">
                        Detected skills: {candidate.skills.join(', ')}.
                      </p>
                    </div>

                    {/* Optional: Keep badge view as expandable details */}
                    <details className="mt-4">
                      <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                        View skills by category
                      </summary>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {candidate.skills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>

            {/* Job Matches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Top Job Matches
              </h3>

              {matches.map((job, idx) => (
                <div
                  key={job.id}
                  className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-400">
                          #{idx + 1}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg">{job.title}</h4>
                          <div className="flex items-center gap-2 text-slate-400 mt-1 flex-wrap">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-full">{job.companySize}</span>
                            {job.job_source && job.job_source !== 'synthetic' && (
                              <>
                                <span className="text-slate-600">·</span>
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  {job.job_source}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span>{job.salaryRange}</span>
                            <span>{job.experience}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`px-4 py-2 rounded-lg border ${getConfidenceBg(job.confidence)} text-center min-w-[100px]`}>
                        <div className={`text-2xl font-bold ${getConfidenceColor(job.confidence)}`}>
                          {job.confidence}%
                        </div>
                        <div className="text-xs text-slate-400">{getConfidenceLabel(job.confidence)}</div>
                      </div>
                    </div>
                  </div>

                  {expandedJob === job.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Matching Skills
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedSkills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Skills to Develop
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {job.missingSkills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">
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
                            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors text-center flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Apply on {job.job_source || 'JobStreet'}
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 py-2 bg-slate-700 text-slate-400 rounded-lg font-medium cursor-not-allowed"
                          >
                            Application Link Unavailable
                          </button>
                        )}
                        <button className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Industry Summary */}
            <div className="bg-slate-900/50 rounded-xl border border-white/5 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Industry Fit Summary
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Average Match', value: Math.round(matches.reduce((a, b) => a + b.confidence, 0) / matches.length) + '%' },
                  { label: 'Strong Matches', value: matches.filter(m => m.confidence >= 75).length },
                  { label: 'Skills Matched', value: candidate ? `${candidate.skills.length}/${candidate.skills.length + 2}` : '-' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          <p>SkillMatch AI — Intelligent job matching powered by machine learning</p>
          <p className="mt-1">Upload your resume and find your perfect career match</p>
        </div>
      </footer>
    </div>
  );
}
