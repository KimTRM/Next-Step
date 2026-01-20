import { cubicBezier } from "framer-motion";

export const easePremium = cubicBezier(0.25, 0.46, 0.45, 0.94);
export const easeSmooth = cubicBezier(0.4, 0, 0.2, 1);
export const easeBounce = cubicBezier(0.68, -0.55, 0.265, 1.55);

export const animationConfig = {
  duration: 0.6,
  ease: easePremium,
};

export const animationConfigSmooth = {
  duration: 0.8,
  ease: easeSmooth,
};

export const animationConfigFast = {
  duration: 0.3,
  ease: easePremium,
};

export const animationConfigBounce = {
  duration: 0.5,
  ease: easeBounce,
};

export const fadeInUp = {
  initial: {
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: easePremium,
    },
  },
};

export const fadeInDown = {
  initial: {
    opacity: 0,
    y: -10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotate: -2,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.7,
      ease: easeBounce,
    },
  },
};

export const cardIn = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: easePremium,
    },
  },
};

export const slideInLeft = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeSmooth,
    },
  },
};

export const slideInRight = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easeSmooth,
    },
  },
};

export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(34, 197, 94, 0.3)",
      "0 0 40px rgba(34, 197, 94, 0.5)",
      "0 0 20px rgba(34, 197, 94, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
