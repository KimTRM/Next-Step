import { MessageSquare, Users, ThumbsUp, Award } from 'lucide-react';
import { CountUp } from "@/shared/animations/CountUp";

const stats = [
  { icon: MessageSquare, end: 3000, suffix: "+", label: 'Active Mentors' },
  { icon: Users, end: 5000, suffix: "+", label: 'Job Seekers' },
  { icon: ThumbsUp, end: 12000, suffix: "+", label: 'Success Stories' },
  { icon: Award, end: 800, suffix: "+", label: 'Partner Companies' }
];

export function Community() {
  return (
    <section id="community" className="py-20 bg-gradient-to-br from-green-50/30 via-white to-green-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="display-font text-4xl sm:text-5xl text-foreground mb-6">
              Join a Supportive <span className="text-accent">Network</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with mentors, professionals, and fellow jobseekers. Get guidance, share experiences,
              and navigate your career journey with confidence and support.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4>One-on-One Mentorship</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance from experienced professionals who understand your journey.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4>Community Forums</h4>
                  <p className="text-sm text-muted-foreground">
                    Share tips, ask questions, and learn from peers in the same career transition phase.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4>Verified Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with verified mentors and companies committed to youth development.
                  </p>
                </div>
              </div>
            </div>

            <button className="px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all">
              Find a Mentor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white border border-border hover:border-primary/70 hover:shadow-lg transition-all transition-transform hover:-translate-y-1.5 active:scale-[0.99]"
              >
                <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <CountUp end={stat.end} suffix={stat.suffix} className="text-3xl text-foreground mb-1" />
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
