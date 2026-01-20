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
import { fadeInUp, staggerContainer, cardIn, animationConfig, animationConfigFast } from '@/lib/animations';

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
        <motion.div
          className="text-center mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <motion.h2
            className="display-font text-4xl sm:text-5xl text-foreground mb-4"
            variants={fadeInUp}
          >
            Everything You Need to <span className="text-primary">Succeed</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Comprehensive tools to guide you from student to professional. Find jobs, track applications, and get mentored.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
              variants={cardIn}
              transition={animationConfig}
              whileHover={{ y: -6, boxShadow: "0 18px 45px rgba(0, 0, 0, 0.08)" }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                className={`inline-flex p-3 rounded-lg bg-primary/10 mb-4 group-hover:scale-110 transition-transform ${feature.color}`}
                whileHover={{ rotate: index % 2 === 0 ? 3 : -3, scale: 1.08 }}
                transition={animationConfigFast}
              >
                <feature.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}