"use client";

import {
  Briefcase,
  ClipboardList,
  UserCheck,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/shared/animations/ScrollReveal';
import { fadeInUp, staggerContainer, cardIn, animationConfig, animationConfigFast, scaleIn } from '@/shared/lib/animations';

const features = [
  {
    icon: Briefcase,
    title: 'Job Discovery',
    description: 'Browse student-friendly job listings tailored for fresh graduates and first-time jobseekers.',
    color: 'text-primary'
  },
  {
    icon: ClipboardList,
    title: 'Application Tracker',
    description: 'Keep track of all your applications, interviews, and follow-ups in one organized dashboard.',
    color: 'text-accent'
  },
  {
    icon: UserCheck,
    title: 'Mentor Matching',
    description: 'Get connected with professionals, alumni, and experienced workers who can guide your career journey.',
    color: 'text-primary'
  },
  {
    icon: MessageSquare,
    title: 'In-App Messaging',
    description: 'Communicate directly with mentors and receive guidance and feedback on your career development.',
    color: 'text-accent'
  },
  {
    icon: FileText,
    title: 'Profile Builder',
    description: 'Showcase your skills, interests, and goals with a comprehensive profile that highlights your strengths.',
    color: 'text-primary'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your job search progress and get insights on improving your application success rate.',
    color: 'text-accent'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with other jobseekers, share experiences, and learn from peers going through the same journey.',
    color: 'text-primary'
  },
  {
    icon: Target,
    title: 'Guided Experience',
    description: 'Step-by-step guidance through the entire job search process, from application to acceptance.',
    color: 'text-accent'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <ScrollReveal className="text-center mb-16" delay={0}>
          <h2 className="display-font text-4xl sm:text-5xl text-foreground mb-4">
            Everything You Need to <span className="text-primary">Succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to guide you from student to professional. Find jobs, track applications, and get mentored.
          </p>
        </ScrollReveal>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <motion.div
                className="p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-xl transition-all group h-full"
                whileHover={{
                  y: -8,
                  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className={`inline-flex p-3 rounded-lg bg-primary/10 mb-4 ${feature.color}`}
                  whileHover={{
                    rotate: index % 2 === 0 ? 5 : -5,
                    scale: 1.1,
                    backgroundColor: "rgba(34, 197, 94, 0.2)"
                  }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}