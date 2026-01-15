import { ArrowRight, Target } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-linear-to-br from-white via-green-50/30 to-green-100/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Your Career Journey Starts Here</span>
          </div>

          {/* Main Heading */}
          <h1 className="display-font text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6">
            Helping You Take Your<br />
            <span className="text-primary">Next Step in Life</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A jobseeker and mentorship hub designed for youth. Discover opportunities,
            track applications, and connect with mentors who guide you from campus to career.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
              Find a Mentor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            <div>
              <div className="text-3xl sm:text-4xl text-primary mb-2">5K+</div>
              <div className="text-sm text-muted-foreground">Job Seekers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-accent mb-2">800+</div>
              <div className="text-sm text-muted-foreground">Mentors</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-primary mb-2">2K+</div>
              <div className="text-sm text-muted-foreground">Success Stories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}