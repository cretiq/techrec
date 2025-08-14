import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { getHoverEffect } from "@/lib/hoverSystem"

/**
 * Card component built on DaisyUI v5 card system
 * 
 * DaisyUI Classes Used:
 * - card: Base card component
 * - card-body: Content area with proper padding
 * - card-title: Styled heading for card titles
 * - card-actions: Action area (typically for buttons)
 * - card-border: Adds border to card
 * - card-side: Side-by-side layout
 * - image-full: Background image mode
 * - card-{size}: Size variants (xs, sm, md, lg, xl)
 */

// DaisyUI card variants - systematic migration following DAISYUI_MIGRATION_GUIDE.md
const cardVariants = {
  // Phase 1: Pure DaisyUI Core Variants (like btn-primary, btn-secondary)
  default: "card bg-base-200 shadow-sm",
  primary: "card bg-primary text-primary-content",
  secondary: "card bg-secondary text-secondary-content",
  accent: "card bg-accent text-accent-content",
  neutral: "card bg-neutral text-neutral-content",
  info: "card bg-info text-info-content",
  success: "card bg-success text-success-content",
  warning: "card bg-warning text-warning-content",
  error: "card bg-error text-error-content",
  
  // Phase 2: DaisyUI Style Variants (like btn-outline, btn-ghost)
  bordered: "card bg-base-100 card-border",
  flat: "card bg-base-200", // no shadow
  elevated: "card bg-base-200 shadow-lg",
  outlined: "card bg-transparent card-border",
  
  // Phase 3: Custom variants only where DaisyUI lacks equivalent (like LinkedIn button custom)
  glass: "card bg-base-100/80 backdrop-blur-sm card-border",
  selected: "card bg-success/10 shadow-md ring-2 ring-success/20",
  gradient: "card bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm",
  'gradient-brand': "card bg-gradient-brand-sharp border-none text-white",
  
  // Phase 4: Interactive variants with built-in hover effects
  'default-interactive': "card bg-base-100 shadow-md hover:shadow-lg hover:bg-base-200",
  'primary-interactive': "card bg-primary text-primary-content hover:bg-primary/80",
  'secondary-interactive': "card bg-secondary text-secondary-content hover:bg-secondary/80",
  'accent-interactive': "card bg-accent text-accent-content hover:bg-accent/80",
  'bordered-interactive': "card bg-base-200 card-border hover:bg-base-300",
  'elevated-interactive': "card bg-base-200 shadow-lg hover:shadow-xl",
  'selected-interactive': "card bg-success/10 shadow-md ring-2 ring-success/20 hover:bg-success/20",
} as const

// Type for all available card variants
type CardVariant = keyof typeof cardVariants

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: CardVariant
  /** DaisyUI card size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** DaisyUI: Side-by-side layout */
  side?: boolean
  /** DaisyUI: Makes image fill the card background */
  imageFull?: boolean
  /** Enables Framer Motion animations */
  animated?: boolean
  /** Makes card clickable with active state */
  clickable?: boolean
  /** Legacy: Use size prop instead */
  compact?: boolean
}

const sizeVariants = {
  xs: "card-xs",
  sm: "card-sm",
  md: "", // card-md is default, no class needed
  lg: "card-lg", 
  xl: "card-xl"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  className, 
  variant = "default", 
  size,
  compact = false, 
  imageFull = false,
  side = false,
  animated = false,
  clickable = false,
  children,
  ...props 
}, ref) => {
  // Apply hover effects for interactive variants or clickable cards
  const isInteractiveVariant = variant.includes('-interactive')
  const isSelectedVariant = variant.includes('selected')
  
  const cardClasses = cn(
    cardVariants[variant],
    // DaisyUI size classes
    size && sizeVariants[size],
    // Legacy compact support
    compact && 'card-sm',
    // DaisyUI modifiers
    imageFull && 'image-full',
    side && 'card-side',
    // Apply hover effects for interactive variants (but not selected variants)
    isInteractiveVariant && !isSelectedVariant && getHoverEffect('card', variant.replace('-interactive', '')),
    // Apply interactive effects for clickable cards (but not selected variants)
    clickable && !isInteractiveVariant && !isSelectedVariant && getHoverEffect('card', 'interactive'),
    clickable && "cursor-pointer",
    className
  )

  if (animated) {
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        whileHover={undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-body pb-2", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("card-title", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-neutral-600 text-base leading-6", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("card-body", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-actions justify-end", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CardFigure = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <figure
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
CardFigure.displayName = "CardFigure"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardFigure } 