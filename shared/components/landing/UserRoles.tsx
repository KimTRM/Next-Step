import { User, UserCheck, Building2 } from "lucide-react";
import { Antonio } from "next/font/google";
const antontioFont = Antonio({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const roles = [
  {
    icon: User,
    title: "Job Seekers",
    description:
      "Full access to job listings, application tracking, mentor matching, and community support.",
    features: [
      "Browse job openings",
      "Track applications",
      "Connect with mentors",
      "Build your profile",
    ],
    highlight: true,
  },
  {
    icon: UserCheck,
    title: "Mentors",
    description:
      "Help guide the next generation. Share your experience and support young professionals.",
    features: [
      "Mentor matching",
      "In-app messaging",
      "Share insights",
      "Track mentee progress",
    ],
    highlight: false,
  },
  {
    icon: Building2,
    title: "Companies",
    description:
      "Post entry-level positions and connect with motivated, career-ready young talent.",
    features: [
      "Post job openings",
      "Review applications",
      "Connect with candidates",
      "Build talent pipeline",
    ],
    highlight: false,
  },
];

export function UserRoles() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={`${antontioFont.className} display-font text-4xl sm:text-5xl text-foreground mb-4`}
          >
            Built for <span className="text-primary">Everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re seeking guidance, offering mentorship, or hiring
            talent, NextStep connects you.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border-2 transition-all hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.99] ${
                role.highlight
                  ? "border-accent bg-accent/5 shadow-lg"
                  : "border-border bg-white hover:border-primary/50"
              }`}
            >
              {role.highlight && (
                <div className="inline-block px-3 py-1 bg-accent text-white rounded-full text-sm mb-4">
                  Most Popular
                </div>
              )}

              <div
                className={`inline-flex p-4 rounded-xl ${role.highlight ? "bg-accent/10" : "bg-primary/10"} mb-6`}
              >
                <role.icon
                  className={`h-8 w-8 ${role.highlight ? "text-accent" : "text-primary"}`}
                />
              </div>

              <h3 className="mb-3">{role.title}</h3>
              <p className="text-muted-foreground mb-6">{role.description}</p>

              <ul className="space-y-3">
                {role.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <svg
                      className={`h-5 w-5 mt-0.5 shrink-0 ${role.highlight ? "text-accent" : "text-primary"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
