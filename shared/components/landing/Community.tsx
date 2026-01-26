"use client";

import { MessageSquare, Users, ThumbsUp, Award } from 'lucide-react';
import { motion } from "framer-motion";
import { CountUp } from "@/shared/animations/CountUp";
import { fadeInUp, staggerContainer, cardIn, animationConfig, animationConfigFast } from "@/shared/lib/animations";

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
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2
              className="display-font text-4xl sm:text-5xl text-foreground mb-6"
              variants={fadeInUp}
            >
              Join a Supportive <span className="text-accent">Network</span>
            </motion.h2>
            <motion.p className="text-lg text-muted-foreground mb-8" variants={fadeInUp}>
              Connect with mentors, professionals, and fellow jobseekers. Get guidance, share experiences,
              and navigate your career journey with confidence and support.
            </motion.p>

            {/* Features List */}
            <motion.div className="space-y-4 mb-8" variants={staggerContainer}>
              <motion.div className="flex items-start gap-3" variants={fadeInUp}>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4>One-on-One Mentorship</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance from experienced professionals who understand your journey.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex items-start gap-3" variants={fadeInUp}>
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4>Community Forums</h4>
                  <p className="text-sm text-muted-foreground">
                    Share tips, ask questions, and learn from peers in the same career transition phase.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex items-start gap-3" variants={fadeInUp}>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4>Verified Professionals</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with verified mentors and companies committed to youth development.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <button className="px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all">
              Find a Mentor
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-xl bg-white border border-border hover:border-primary/70 hover:shadow-lg transition-all"
                variants={cardIn}
                transition={animationConfig}
                whileHover={{ y: -6, boxShadow: "0 18px 45px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.div
                  className="inline-flex p-3 bg-primary/10 rounded-lg mb-4"
                  whileHover={{ rotate: index % 2 === 0 ? 3 : -3, scale: 1.06 }}
                  transition={animationConfigFast}
                >
                  <stat.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <CountUp end={stat.end} suffix={stat.suffix} className="text-3xl text-foreground mb-1" />
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}