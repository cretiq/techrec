import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const cardVariants = {
  default: "bg-base-200 border border-base-300 rounded-lg transition-all duration-200 ease-smooth shadow-sm",
  transparent: "bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-lg transition-all duration-200 ease-smooth",
  glass: "bg-base-100/90 backdrop-blur-lg border border-base-300/60 rounded-lg transition-all duration-200 ease-smooth shadow-soft",
  solid: "bg-base-100 border border-base-300 rounded-lg transition-all duration-200 ease-smooth shadow-sm",
  outlined: "bg-transparent border-2 border-base-300 rounded-lg transition-all duration-200 ease-smooth hover:border-primary/50 hover:bg-base-100/50",
  elevated: "bg-base-100 border border-base-300/50 rounded-lg transition-all duration-200 ease-smooth shadow-md hover:shadow-lg",
  floating: "bg-base-100/95 backdrop-blur-md border border-base-300/40 rounded-lg transition-all duration-200 ease-smooth shadow-lg",
  gradient: "bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 rounded-lg transition-all duration-200 ease-smooth shadow-sm",
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: keyof typeof cardVariants
    hoverable?: boolean
    compact?: boolean
    bordered?: boolean
    imageFull?: boolean
    animated?: boolean
    clickable?: boolean
    interactive?: boolean
  }
>(({ 
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
  const cardClasses = cn(
    cardVariants[variant],
    variant === "default" && bordered && "",
    variant === "default" && compact && "card-compact",
    variant === "default" && imageFull && "image-full",
    hoverable && "hover:shadow-sm hover:-translate-y-0.5 transform-gpu",
    clickable && "cursor-pointer active:scale-[0.98]",
    interactive && "hover:scale-[1.01] transform-gpu",
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