"use client";

import { Code, TrendingUp, Megaphone, Users, HeartPulse, DollarSign, Wrench, GraduationCap } from 'lucide-react';
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardIn, animationConfig, easePremium } from "@/lib/animations";

const jobCategories = [
  {
    icon: Code,
    name: 'Technology',
    count: '340+ openings',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: TrendingUp,
    name: 'Business',
    count: '520+ openings',
    color: 'bg-green-200 text-green-700'
  },
  {
    icon: Megaphone,
    name: 'Marketing',
    count: '280+ openings',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Users,
    name: 'Customer Service',
    count: '450+ openings',
    color: 'bg-green-200 text-green-700'
  },
  {
    icon: HeartPulse,
    name: 'Healthcare',
    count: '190+ openings',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: DollarSign,
    name: 'Finance',
    count: '220+ openings',
    color: 'bg-green-200 text-green-700'
  },
  {
    icon: Wrench,
    name: 'Operations',
    count: '310+ openings',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: GraduationCap,
    name: 'Education',
    count: '180+ openings',
    color: 'bg-green-200 text-green-700'
  }
];

export function Courses() {
  return (
    <section id="courses" className="py-20 bg-gradient-to-br from-green-50/50 to-white">
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
            Explore <span className="text-accent">Opportunities</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Discover entry-level positions across diverse industries tailored for fresh graduates and first-time jobseekers.
          </motion.p>
        </motion.div>

        {/* Job Categories Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {jobCategories.map((category, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-white border border-border hover:border-primary/70 hover:shadow-lg transition-all cursor-pointer group"
              variants={cardIn}
              transition={animationConfig}
              whileHover={{ y: -6, boxShadow: "0 18px 45px rgba(0, 0, 0, 0.08)" }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                className={`inline-flex p-3 rounded-lg ${category.color} mb-4 group-hover:scale-110 transition-transform`}
                whileHover={{ scale: [1, 1.12, 1.06], rotate: index % 2 === 0 ? 3 : -3 }}
                transition={{ duration: 0.35, ease: easePremium }}
              >
                <category.icon className="h-6 w-6" />
              </motion.div>
              <h4 className="mb-1">{category.name}</h4>
              <p className="text-sm text-muted-foreground">{category.count}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
            Browse All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}