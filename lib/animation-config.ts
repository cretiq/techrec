import { Transition } from 'framer-motion';

// Default transition for most standard animations
export const defaultTransition: Transition = {
  duration: 0.15,
  ease: "easeInOut",
};

// Faster transition for hover effects
export const hoverTransition: Transition = {
  duration: 0.15,
  ease: "easeOut",
};

// Transition for page/section entrances (slightly longer)
export const entranceTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

// Transition specifically for accordion content reveal/hide
export const contentTransition: Transition = {
  duration: 0.2,
  ease: "easeInOut",
};

// Transition for exit animations (e.g., suggestion dismiss)
export const exitTransition: Transition = {
  duration: 0.2, 
  ease: "easeOut",
};

// Example of shared variants (optional, can be added as needed)
export const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: entranceTransition },
};

export const scaleOnHover = {
  scale: 1.01,
  transition: hoverTransition,
}; 