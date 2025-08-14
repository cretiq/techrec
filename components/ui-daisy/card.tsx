import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { getHoverEffect } from "@/lib/hoverSystem"

const cardVariants = {
  // Basic variants without hover effects
  default: `card bg-base-200 border border-base-300 shadow-sm`,
  transparent: `card bg-base-100/80 backdrop-blur-sm border border-base-300/50`,
  glass: `card bg-base-100 backdrop-blur-lg border border-brand-sharp shadow-xs`,
  solid: `card bg-base-100 border border-base-300 shadow-sm`,
  hybrid: `card bg-brand-muted border border-brand-sharp`,
  outlined: `card bg-transparent border-2 border-base-300`,
  elevated: `card bg-base-100 border border-base-300/50 shadow-md`,
  floating: `card bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
  gradient: `card bg-gradient-to-br from-blue-50 to-purple-50 border border-base-100`,
  gradientSharp: `card bg-gradient-brand-sharp border border-brand-sharp`,
  gradientMuted: `card bg-gradient-to-br from-base-200 to-base-300 border border-base-100`,
  selected: `card bg-primary/10 border border-primary/30 shadow-md ring-2 ring-primary/20`,
  
  // Interactive variants with built-in hover effects
  'default-interactive': `card bg-base-200 border border-base-300 shadow-sm`,
  'gradient-interactive': `card bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50`,
  'gradientMuted-interactive': `card bg-gradient-to-br from-base-200 to-base-300 border border-base-100`,
  'elevated-interactive': `card bg-base-100 border border-base-300/50 shadow-md`,
  'glass-interactive': `card bg-base-200/60 backdrop-blur-lg border border-brand-sharp shadow-xs`,
  'outlined-interactive': `card bg-transparent border-2 border-base-300`,
  'floating-interactive': `card bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
  'selected-interactive': `card bg-primary/10 border border-primary/30 shadow-md ring-2 ring-primary/20`,
}

// Type for all available card variants
type CardVariant = keyof typeof cardVariants

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: CardVariant
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
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ 
  className, 
  variant = "default", 
  compact = false, 
  bordered = true, 
  imageFull = false,
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
    // Apply hover effects for interactive variants (but not selected variants)
    isInteractiveVariant && !isSelectedVariant && getHoverEffect('card', variant.replace('-interactive', '')),
    // For selected variants, don't apply any hover system at all
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