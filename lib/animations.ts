import { Variants } from "framer-motion"

// Page Transition Animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // Custom easing for smooth feel
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Staggered List Animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Card Hover Animations
export const cardHover: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
}

// Button Animations
export const buttonHover: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
}

export const buttonBounce: Variants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  tap: { 
    y: 0,
    scale: 0.98
  }
}

// Loading Animations
export const pulseAnimation: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const spinnerAnimation: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Modal/Dialog Animations
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

export const modalContent: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Notification Animations
export const slideInFromRight: Variants = {
  initial: { 
    x: 400, 
    opacity: 0 
  },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export const slideInFromTop: Variants = {
  initial: { 
    y: -100, 
    opacity: 0 
  },
  animate: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    y: -100, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Form Field Animations
export const fieldFocus: Variants = {
  initial: { scale: 1 },
  focus: { 
    scale: 1.01,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Progress Animations
export const progressFill: Variants = {
  initial: { width: "0%" },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  })
}

// Accordion/Collapsible Animations
export const accordionContent: Variants = {
  closed: { 
    height: 0, 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  open: { 
    height: "auto", 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Floating Action Button
export const fabAnimation: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    scale: 1.1,
    transition: {
      duration: 0.15
    }
  },
  tap: { scale: 0.95 }
}

// Page Navigation Animations
export const slideLeft: Variants = {
  initial: { x: 300, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    x: -300, 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export const slideRight: Variants = {
  initial: { x: -300, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    x: 300, 
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

// Reduced Motion Variants (for accessibility)
export const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

// Utility function to check for reduced motion preference
export const getAnimationVariant = (normalVariant: Variants) => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return reducedMotion
  }
  return normalVariant
}