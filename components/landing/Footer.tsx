"use client";

import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';
import { motion } from "framer-motion";
import { fadeInUp, animationConfig, animationConfigFast } from "@/lib/animations";

export function Footer() {
  return (
    <motion.footer
      className="bg-gradient-to-br from-gray-50 to-white border-t border-border"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
      transition={animationConfig}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <Image src="/assets/logo.png" alt="NextStep" width={120} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Helping you take your next step in life. Empowering youth through job discovery and mentorship.
            </p>
            <div className="flex gap-3">
              <motion.a
                href="#"
                className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                whileHover={{ y: -2, scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                transition={animationConfigFast}
              >
                <Facebook className="h-5 w-5 text-primary" />
              </motion.a>
              <motion.a
                href="#"
                className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                whileHover={{ y: -2, scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                transition={animationConfigFast}
              >
                <Twitter className="h-5 w-5 text-primary" />
              </motion.a>
              <motion.a
                href="#"
                className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                whileHover={{ y: -2, scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                transition={animationConfigFast}
              >
                <Instagram className="h-5 w-5 text-primary" />
              </motion.a>
              <motion.a
                href="#"
                className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                whileHover={{ y: -2, scale: 1.06 }}
                whileTap={{ scale: 0.98 }}
                transition={animationConfigFast}
              >
                <Linkedin className="h-5 w-5 text-primary" />
              </motion.a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Job Categories
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  For Mentors
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  For Companies
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About NextStep
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#community" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 NextStep. All rights reserved. Team Array Code.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@nextstep.com" className="hover:text-primary transition-colors">
                support@nextstep.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}