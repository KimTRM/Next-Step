import { ArrowRight, Target } from 'lucide-react';
import { CountUp } from "@/shared/animations/CountUp";

export function Hero() {
  return (
    <section className="relative bg-linear-to-br from-white via-green-50/30 to-green-100/20 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 backdrop-blur-sm border border-primary/20">
            <div>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-primary font-medium">Your Career Journey Starts Here</span>
          </div>

          {/* Main Heading */}
          <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6">
            <span className="block">
              Helping You Take Your
            </span>
            <span className="block">
              <span className="relative inline-block">
                <span className="relative bg-linear-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Next Step</span>
              </span>{" "}
              in Life
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A jobseeker and mentorship hub designed for youth. Discover opportunities,
            track applications, and connect with mentors who guide you from campus to career.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]">
              <span>Get Started Free</span>
              <span className="inline-flex">
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
            <button className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]">
              Find a Mentor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-border/50">
            <div className="text-center">
              <CountUp end={5000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Job Seekers</div>
            </div>
            <div className="text-center">
              <CountUp end={800} suffix="+" className="text-3xl sm:text-4xl text-accent mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Mentors</div>
            </div>
            <div className="text-center">
              <CountUp end={2000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Success Stories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
