"use client";

import { ArrowRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from "@/shared/animations/CountUp";
import { BackgroundParticles } from "@/shared/animations/BackgroundParticles";
import { fadeInUp, staggerContainer, staggerItem, animationConfig, animationConfigFast, animationConfigSmooth, slideInLeft, slideInRight, glowPulse } from '@/shared/lib/animations';

export function Hero() {
  return (
    <section className="relative bg-linear-to-br from-white via-green-50/30 to-green-100/20 overflow-hidden">
      <BackgroundParticles />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 backdrop-blur-sm border border-primary/20"
            variants={slideInLeft}
            initial="initial"
            animate="animate"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Target className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm text-primary font-medium">Your Career Journey Starts Here</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="display-font text-5xl sm:text-6xl lg:text-7xl text-foreground mb-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.span className="block" variants={fadeInUp}>
              Helping You Take Your
            </motion.span>
            <motion.span className="block" variants={fadeInUp}>
              <motion.span
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">Next Step</span>
              </motion.span>{" "}
              in Life
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            variants={slideInRight}
            initial="initial"
            animate="animate"
          >
            A jobseeker and mentorship hub designed for youth. Discover opportunities,
            track applications, and connect with mentors who guide you from campus to career.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.button
              className="group w-full sm:w-auto px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              variants={staggerItem}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              transition={animationConfigFast}
            >
              <span>Get Started Free</span>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="inline-flex"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </motion.button>
            <motion.button
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-lg hover:shadow-xl"
              variants={staggerItem}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              transition={animationConfigFast}
            >
              Find a Mentor
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-8 mt-20 pt-16 border-t border-border/50"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-center"
            >
              <CountUp end={5000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Job Seekers</div>
            </motion.div>
            <motion.div
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-center"
            >
              <CountUp end={800} suffix="+" className="text-3xl sm:text-4xl text-accent mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Mentors</div>
            </motion.div>
            <motion.div
              variants={staggerItem}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-center"
            >
              <CountUp end={2000} suffix="+" className="text-3xl sm:text-4xl text-primary mb-2 font-bold" />
              <div className="text-sm text-muted-foreground font-medium">Success Stories</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
