import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { getHoverEffect } from "@/lib/hoverSystem"

// Base card styles that all variants inherit
const cardBase = "rounded-3xl transition-all duration-100 ease-smooth"

const cardVariants = {
  // Basic variants without hover effects
  default: `${cardBase} bg-base-200 border border-base-300 shadow-sm`,
  transparent: `${cardBase} bg-base-100/80 backdrop-blur-sm border border-base-300/50`,
  glass: `${cardBase} bg-base-200/60 backdrop-blur-lg border border-brand-sharp shadow-xs`,
  solid: `${cardBase} bg-base-100 border border-base-300 shadow-sm`,
  hybrid: `${cardBase} bg-brand-muted border border-brand-sharp`,
  outlined: `${cardBase} bg-transparent border-2 border-base-300`,
  elevated: `${cardBase} bg-base-100 border border-base-300/50 shadow-md`,
  floating: `${cardBase} bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
  gradient: `${cardBase} bg-gradient-to-br from-base-200 to-base-300 border border-base-100`,
  
  // Interactive variants with built-in hover effects
  'default-interactive': `${cardBase} bg-base-200 border border-base-300 shadow-sm`,
  'gradient-interactive': `${cardBase} bg-gradient-to-br from-base-200 to-base-300 border border-base-100`,
  'elevated-interactive': `${cardBase} bg-base-100 border border-base-300/50 shadow-md`,
  'glass-interactive': `${cardBase} bg-base-200/60 backdrop-blur-lg border border-brand-sharp shadow-xs`,
  'outlined-interactive': `${cardBase} bg-transparent border-2 border-base-300`,
  'floating-interactive': `${cardBase} bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
}

// Type for all available card variants
type CardVariant = keyof typeof cardVariants

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: CardVariant
  /** @deprecated Use 'variant-interactive' instead */
  hoverable?: boolean
  /** Makes the card compact (DaisyUI) */
  compact?: boolean
  /** Shows border (DaisyUI) */
  bordered?: boolean
  /** Makes image fill the card (DaisyUI) */
  imageFull?: boolean
  /** Enables Framer Motion animations */
  animated?: boolean
  /** Makes card clickable with active state */
  clickable?: boolean
  /** @deprecated Use 'variant-interactive' instead */
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  className, 
  variant = "default", 
  hoverable = false, 
  compact = false, 
  bordered = true, 
  imageFull = false,
  animated = false,
  clickable = false,
  interactive = false,
  children,
  ...props 
}, ref) => {
  // Determine if this is an interactive variant or needs hover effects applied
  const isInteractiveVariant = variant.includes('-interactive')
  const needsHoverEffects = (hoverable || interactive) && !isInteractiveVariant
  
  const cardClasses = cn(
    cardVariants[variant],
    // Apply hover effects for interactive variants or legacy props
    isInteractiveVariant && getHoverEffect('card', variant.replace('-interactive', '')),
    needsHoverEffects && hoverable && getHoverEffect('card', 'default'),
    needsHoverEffects && interactive && getHoverEffect('card', 'interactive'),
    clickable && "cursor-pointer active:scale-[0.98] transform-gpu",
    className
  )

  if (animated) {
    return (
      <motion.div
        ref={ref}
        className={cardClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : undefined}
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
    className={cn("card-body pb-2 rounded-t-xl", className)}
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
    className={cn("card-body pt-2", className)} 
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
    className={cn("card-actions justify-end pt-2", className)}
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