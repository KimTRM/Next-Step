"use client";

import { ArrowRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from "@/components/animations/CountUp";
import { fadeInUp, staggerContainer, staggerItem, animationConfig, animationConfigFast, scaleIn } from '@/lib/animations';

export function Hero() {
  return (
    <section className="relative bg-linear-to-br from-white via-green-50/30 to-green-100/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
            variants={fadeInUp}
            transition={animationConfig}
          >
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Your Career Journey Starts Here</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="display-font text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6"
            variants={staggerContainer}
          >
            <motion.span className="block" variants={fadeInUp} transition={animationConfig}>
              Helping You Take Your
            </motion.span>
            <motion.span className="block" variants={fadeInUp} transition={animationConfig}>
              <span className="relative inline-block">
                <motion.span
                  className="absolute inset-x-0 bottom-2 h-3 rounded bg-primary/15"
                  variants={scaleIn}
                  transition={animationConfig}
                />
                <span className="relative text-primary">Next Step</span>
              </span>{" "}
              in Life
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
            transition={animationConfig}
          >
            A jobseeker and mentorship hub designed for youth. Discover opportunities,
            track applications, and connect with mentors who guide you from campus to career.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={staggerContainer}
          >
            <motion.button
              className="group w-full sm:w-auto px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
              variants={staggerItem}
              whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(0, 0, 0, 0.10)" }}
              whileTap={{ scale: 0.97 }}
              transition={animationConfigFast}
            >
              Get Started Free
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={animationConfigFast}
                className="inline-flex"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              variants={staggerItem}
              whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(0, 0, 0, 0.10)" }}
              whileTap={{ scale: 0.97 }}
              transition={animationConfigFast}
            >
              Find a Mentor
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <CountUp end={5000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2" />
              <div className="text-sm text-muted-foreground">Job Seekers</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <CountUp end={800} suffix="+" className="text-3xl sm:text-4xl text-accent mb-2" />
              <div className="text-sm text-muted-foreground">Mentors</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <CountUp end={2000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2" />
              <div className="text-sm text-muted-foreground">Success Stories</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
