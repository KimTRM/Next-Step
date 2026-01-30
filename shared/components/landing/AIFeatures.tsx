import { Sparkles, FileText, Brain, Briefcase, TrendingUp, MessageCircle } from 'lucide-react';

const aiFeatures = [
  {
    icon: FileText,
    title: 'Smart Resume Builder',
    description: 'AI helps you create professional resumes tailored to specific job requirements and industries.'
  },
  {
    icon: Brain,
    title: 'Interview Preparation',
    description: 'Get AI-generated interview questions and personalized tips based on the role you\'re applying for.'
  },
  {
    icon: Briefcase,
    title: 'Job Recommendations',
    description: 'AI matches you with opportunities that fit your skills, interests, and career goals.'
  },
  {
    icon: TrendingUp,
    title: 'Skills Gap Analysis',
    description: 'Identify skills you need to develop and get personalized learning recommendations.'
  },
  {
    icon: MessageCircle,
    title: 'Application Insights',
    description: 'AI analyzes your applications and provides suggestions to improve your success rate.'
  },
  {
    icon: Brain,
    title: 'Career Path Guidance',
    description: 'Get AI-powered recommendations on career paths based on your profile and market trends.'
  }
];

export function AIFeatures() {
  return (
    <section className="py-20 bg-linear-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary">Powered by Advanced AI</span>
          </div>

          <h2 className="display-font text-4xl sm:text-5xl text-foreground mb-4">
            Job Search Made <span className="text-primary">Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Harness the power of artificial intelligence to accelerate your career journey.
            From resume optimization to personalized job matching.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-xl transition-all group overflow-hidden hover:-translate-y-1.5 active:scale-[0.99]"
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="relative inline-flex p-3 bg-primary/10 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/20">
          <h3 className="mb-4">Ready to accelerate your career search?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of young professionals who are already using AI to land their dream jobs.
          </p>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
            Try AI Features Free
          </button>
        </div>
      </div>
    </section>
  );
}
