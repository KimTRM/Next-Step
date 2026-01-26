"use client";

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp, animationConfig } from '@/shared/lib/animations';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up'
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getInitialVariants = () => {
    switch (direction) {
      case 'left':
        return {
          initial: { opacity: 0, x: -50 },
          animate: { opacity: 1, x: 0 }
        };
      case 'right':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 }
        };
      default:
        return fadeInUp;
    }
  };

  const variants = getInitialVariants();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={variants}
      transition={{
        ...animationConfig,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = '', speed = 0.5 }: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
