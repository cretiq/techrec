import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const cardVariants = {
  default: "card shadow-medium border border-base-300/50 bg-base-100 transition-all duration-200 ease-smooth",
  transparent: "bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-200 ease-smooth rounded-lg shadow-soft hover:shadow-medium",
  glass: "bg-base-100/40 backdrop-blur-lg border border-base-200/60 transition-all duration-200 ease-smooth rounded-lg shadow-medium hover:shadow-large hover:border-base-200",
  solid: "bg-base-100 border border-base-300/50 transition-all duration-200 ease-smooth rounded-lg shadow-medium hover:shadow-large",
  outlined: "bg-transparent border border-base-300 transition-all duration-200 ease-smooth rounded-lg shadow-none hover:shadow-soft hover:bg-base-100/30",
  elevated: "bg-base-100 shadow-large border border-base-300/30 transition-all duration-200 ease-smooth rounded-lg hover:shadow-xl",
  floating: "bg-base-100/95 backdrop-blur-md shadow-xl border border-base-300/40 transition-all duration-200 ease-smooth rounded-xl hover:shadow-2xl hover:-translate-y-1",
  gradient: "bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 shadow-medium transition-all duration-200 ease-smooth rounded-lg hover:shadow-large",
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
    hoverable && "hover:shadow-lg hover:-translate-y-0.5 transform-gpu",
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