"use client";

import { Sparkles, FileText, Brain, Briefcase, TrendingUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn, staggerContainer, cardIn, animationConfig, easePremium } from '@/shared/lib/animations';

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
        <motion.div
          className="text-center mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
            variants={scaleIn}
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary">Powered by Advanced AI</span>
          </motion.div>

          <motion.h2
            className="display-font text-4xl sm:text-5xl text-foreground mb-4"
            variants={fadeInUp}
          >
            Job Search Made <span className="text-primary">Smarter</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Harness the power of artificial intelligence to accelerate your career journey.
            From resume optimization to personalized job matching.
          </motion.p>
        </motion.div>

        {/* AI Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className="relative p-6 rounded-xl bg-white border border-border hover:border-primary/50 hover:shadow-xl transition-all group overflow-hidden"
              variants={cardIn}
              transition={animationConfig}
              whileHover={{ y: -6, boxShadow: "0 18px 45px rgba(0, 0, 0, 0.08)" }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <motion.div
                  className="relative inline-flex p-3 bg-primary/10 rounded-lg mb-4 group-hover:scale-110 transition-transform"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 3.2, ease: easePremium, repeat: Infinity, repeatDelay: 1.6 }}
                  whileHover={{ rotate: index % 2 === 0 ? 3 : -3, scale: 1.08 }}
                  whileTap={{ scale: 0.98 }}
                  whileFocus={{ scale: 1.04 }}
                >

                  <motion.span
                    className="absolute inset-0 rounded-lg bg-primary/20"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: [0, 0.22, 0], scale: [1, 1.6, 2] }}
                    transition={{ duration: 2.8, ease: easePremium, repeat: Infinity, repeatDelay: 2.6 }}
                  />
                  <feature.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

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