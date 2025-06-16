import * as React from "react"
import { cn } from "@/lib/utils"

const cardVariants = {
  default: "card",
  transparent: "overflow-hidden bg-base-100/60 backdrop-blur-sm border border-base-300/50 transition-all duration-300 rounded-lg shadow-none",
  glass: "bg-base-100/40 backdrop-blur-md border border-base-300/30 transition-all duration-300 rounded-lg shadow-sm",
  solid: "bg-base-100 border border-base-300 transition-all duration-300 rounded-lg shadow-md",
  outlined: "bg-transparent border border-base-300 transition-all duration-300 rounded-lg shadow-none",
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: keyof typeof cardVariants
    hoverable?: boolean
    compact?: boolean
    bordered?: boolean
    imageFull?: boolean
  }
>(({ className, variant = "default", hoverable = false, compact = false, bordered = true, imageFull = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardVariants[variant],
      variant === "default" && bordered && "",
      variant === "default" && compact && "card-compact",
      variant === "default" && imageFull && "image-full",
      hoverable && "hover:shadow-2xl transition-shadow duration-200",
      className
    )}
    {...props}
  />
))
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
    className={cn("text-base-content/70 text-sm", className)}
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