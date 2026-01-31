import {
  Briefcase,
  ClipboardList,
  UserCheck,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Target,
} from "lucide-react";
import { Antonio } from "next/font/google";

const antontioFont = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const features = [
  {
    icon: Briefcase,
    title: "Job Discovery",
    description:
      "Browse student-friendly job listings tailored for fresh graduates and first-time jobseekers.",
    color: "text-primary",
  },
  {
    icon: ClipboardList,
    title: "Application Tracker",
    description:
      "Keep track of all your applications, interviews, and follow-ups in one organized dashboard.",
    color: "text-accent",
  },
  {
    icon: UserCheck,
    title: "Mentor Matching",
    description:
      "Get connected with professionals, alumni, and experienced workers who can guide your career journey.",
    color: "text-primary",
  },
  {
    icon: MessageSquare,
    title: "In-App Messaging",
    description:
      "Communicate directly with mentors and receive guidance and feedback on your career development.",
    color: "text-accent",
  },
  {
    icon: FileText,
    title: "Profile Builder",
    description:
      "Showcase your skills, interests, and goals with a comprehensive profile that highlights your strengths.",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor your job search progress and get insights on improving your application success rate.",
    color: "text-accent",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Connect with other jobseekers, share experiences, and learn from peers going through the same journey.",
    color: "text-primary",
  },
  {
    icon: Target,
    title: "Guided Experience",
    description:
      "Step-by-step guidance through the entire job search process, from application to acceptance.",
    color: "text-accent",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={`${antontioFont.className} tracking-tighter display-font text-4xl sm:text-5xl text-foreground mb-4`}
          >
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to guide you from student to professional. Find
            jobs, track applications, and get mentored.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-xl transition-all group h-full hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-primary/10 mb-4 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
