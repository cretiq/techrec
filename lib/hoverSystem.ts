/**
 * Centralized hover system for consistent interactive effects across the application
 * Follows Tailwind/DaisyUI best practices for reusable component patterns
 */

export const HOVER_SYSTEM = {
  // Standard transition for all interactive elements
  transition: "transition-all duration-100 ease-smooth",
  
  // Core hover effect building blocks
  effects: {
    gradient: "hover:from-blue-50 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50",
    gradientReverse: "hover:from-purple-50 hover:to-blue-100 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50", 
    shadow: "hover:shadow-lg",
    shadowSoft: "hover:shadow-md",
    lift: "hover:-translate-y-1",
    liftSoft: "hover:-translate-y-0.5",
    scale: "hover:scale-[1.02]",
    scaleSubtle: "hover:scale-[1.01]",
    glow: "hover:shadow-lg hover:shadow-primary/20",
    backgroundShift: "hover:bg-base-100 dark:hover:bg-base-200",
    borderGlow: "hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10",
  },
  
  // Component-specific hover combinations
  presets: {
    card: {
      default: "hover:shadow-md hover:bg-base-100/90",
      gradient: "hover:shadow-md hover:from-blue-50 hover:to-purple-100 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50",
      gradientMuted: "hover:shadow-md hover:from-blue-50/80 hover:to-purple-100/60",
      elevated: "hover:shadow-lg hover:bg-base-50 dark:hover:bg-base-200",
      glass: "hover:bg-base-200/80 hover:backdrop-blur-lg hover:shadow-md",
      outlined: "hover:border-primary/50 hover:bg-base-100/50 hover:shadow-sm",
      floating: "hover:shadow-xl hover:bg-base-100",
      interactive: "hover:shadow-md cursor-pointer",
      selected: "", // No hover effects for selected cards
    },
    button: {
      default: "hover:shadow-md hover:bg-base-200",
      elevated: "hover:shadow-md hover:bg-base-50",
      gradient: "hover:shadow-md hover:from-base-50 hover:to-base-100",
      gradientMuted: "hover:shadow-md hover:from-blue-50/80 hover:to-purple-100/60",
      outlined: "hover:bg-primary hover:text-primary-content hover:border-primary hover:shadow-sm",
      ghost: "hover:bg-base-200/80 hover:shadow-sm",
      primary: "hover:shadow-md",
      secondary: "hover:shadow-md",
      success: "hover:shadow-md",
      warning: "hover:shadow-md",
      error: "hover:shadow-md",
      info: "hover:shadow-md",
      linkedin: "hover:shadow-md hover:from-[#005885] hover:to-[#004165]",
      interactive: "hover:shadow-md",
      flashy: "hover:shadow-xl hover:shadow-primary/60 hover:from-primary/60 hover:to-secondary/60 hover:border-primary/70",
    },
    accordion: {
      default: "hover:shadow-md hover:bg-base-100/90",
      transparent: "hover:bg-base-100/90 hover:backdrop-blur-md hover:shadow-sm",
      glass: "hover:bg-base-300/80 hover:backdrop-blur-xl hover:shadow-md",
      hybrid: "hover:bg-base-100/90 hover:shadow-sm",
      solid: "hover:bg-base-100/90 hover:shadow-md",
      outlined: "hover:border-primary/50 hover:bg-base-100/50 hover:shadow-sm",
      elevated: "hover:shadow-lg hover:bg-base-50",
      floating: "hover:shadow-xl hover:bg-base-100",
      gradient: "hover:shadow-md hover:from-base-50 hover:to-base-100",
      gradientMuted: "hover:shadow-md hover:from-blue-50/80 hover:to-purple-100/60",
      interactive: "hover:shadow-md cursor-pointer",
    },
  },
  
  // Accessibility considerations
  accessibility: {
    // Respect user's motion preferences
    respectReducedMotion: "motion-safe:transition-all motion-reduce:transition-none",
    // Focus states that match hover states
    focusVisible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  }
} as const

/**
 * Get consistent hover effect for a component type
 * @param component Component type (card, button, etc.)
 * @param preset Specific preset within component type
 * @returns Combined class string with transition and hover effects
 */
export const getHoverEffect = (
  component: keyof typeof HOVER_SYSTEM.presets, 
  preset: string = 'default'
) => {
  const componentPresets = HOVER_SYSTEM.presets[component] as Record<string, string>
  const hoverEffect = componentPresets[preset] || componentPresets.default
  
  return cn(
    HOVER_SYSTEM.transition,
    HOVER_SYSTEM.accessibility.respectReducedMotion,
    hoverEffect
  )
}

/**
 * Get button-specific hover effect with additional validation
 * @param variant Button variant name
 * @returns Combined class string with button hover effects
 */
export const getButtonHoverEffect = (variant: string) => {
  return getHoverEffect('button', variant)
}

/**
 * Get accordion-specific hover effect with additional validation
 * @param variant Accordion variant name
 * @returns Combined class string with accordion hover effects
 */
export const getAccordionHoverEffect = (variant: string) => {
  return getHoverEffect('accordion', variant)
}

/**
 * Get individual hover effects for custom combinations
 * @param effects Array of effect names to combine
 * @returns Combined class string
 */
export const getCombinedHoverEffects = (effects: (keyof typeof HOVER_SYSTEM.effects)[]) => {
  const combinedEffects = effects.map(effect => HOVER_SYSTEM.effects[effect]).join(' ')
  
  return cn(
    HOVER_SYSTEM.transition,
    HOVER_SYSTEM.accessibility.respectReducedMotion,
    combinedEffects
  )
}

/**
 * Utility for conditional hover application
 * @param condition Whether to apply hover effects
 * @param hoverClasses Hover classes to apply
 * @returns Hover classes if condition is true, empty string otherwise
 */
export const conditionalHover = (condition: boolean, hoverClasses: string) => {
  return condition ? hoverClasses : ""
}

// Helper import for cn function
import { cn } from "@/lib/utils"

// Export component-specific hover presets for easy access
export const buttonHoverPresets = HOVER_SYSTEM.presets.button
export const accordionHoverPresets = HOVER_SYSTEM.presets.accordion