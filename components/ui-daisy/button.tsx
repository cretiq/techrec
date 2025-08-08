"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { getButtonHoverEffect } from "@/lib/hoverSystem"

// Base classes - shared foundation for all button variants
const buttonBase = "btn rounded-xl btn-shadow-mixed transition-all duration-100 ease-smooth relative overflow-hidden border"

// Object-based variants for optimal performance and maintainability
const buttonVariants = {
  // Basic variants (no built-in hover effects)
  default: `${buttonBase} bg-base-100 border-base-300`,
  transparent: `${buttonBase} bg-base-100/80 backdrop-blur-sm border-base-300/50`,
  glass: `${buttonBase} bg-base-100/60 backdrop-blur-lg border-base-300/30`,
  solid: `${buttonBase} bg-base-200 border-base-300`,
  hybrid: `${buttonBase} bg-brand-muted border-brand-sharp`,
  
  // Layout variants
  outlined: `${buttonBase} bg-transparent border-base-300/50`,
  elevated: `${buttonBase} bg-base-100 shadow-sm border-base-300/50`,
  floating: `${buttonBase} bg-base-100/95 backdrop-blur-md shadow-sm border-base-300/30`,
  gradient: `${buttonBase} bg-gradient-to-br from-base-100 to-base-200 border-base-300/50`,
  
  // Semantic variants - using DaisyUI semantic colors
  primary: `${buttonBase} btn-primary`, 
  secondary: `${buttonBase} btn-secondary`,
  success: `${buttonBase} btn-success`,
  warning: `${buttonBase} btn-warning`,
  error: `${buttonBase} btn-error`,
  info: `${buttonBase} btn-info`,
  
  // Interactive variants
  ghost: `${buttonBase} btn-ghost`,
  link: `${buttonBase} btn-link text-primary`,
  
  // Special variants
  linkedin: `${buttonBase} bg-gradient-to-r from-[#0077b5] to-[#005885] text-white font-medium border-transparent`,
  writeto: `${buttonBase} bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium border-transparent`,
  markasapplied: `${buttonBase} bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium border-transparent`,
  
  // Interactive variants with built-in hover effects
  'default-interactive': `${buttonBase} bg-base-100 border-base-300`,
  'elevated-interactive': `${buttonBase} bg-base-100 shadow-sm border-base-300/50`,
  'gradient-interactive': `${buttonBase} bg-gradient-to-br from-base-100 to-base-200 border-base-300/50`,
  'outlined-interactive': `${buttonBase} bg-transparent border-base-300/50`,
  'ghost-interactive': `${buttonBase} btn-ghost`,
  'primary-interactive': `${buttonBase} btn-primary`,
  'secondary-interactive': `${buttonBase} btn-secondary`,
  'success-interactive': `${buttonBase} btn-success`,
  'warning-interactive': `${buttonBase} btn-warning`,
  'error-interactive': `${buttonBase} btn-error`,
  'info-interactive': `${buttonBase} btn-info`,
  'linkedin-interactive': `${buttonBase} bg-gradient-to-r from-[#0077b5] to-[#005885] text-white font-medium border-transparent`,
  'flashy-interactive': `${buttonBase} bg-gradient-to-br from-base-100 to-base-200 border-base-300/50 text-base-content font-medium`,
  
  // Legacy aliases for backwards compatibility
  outline: `${buttonBase} bg-transparent border-base-300/50`,
  destructive: `${buttonBase} btn-error`,
}

// Type for all available button variants
type ButtonVariant = keyof typeof buttonVariants

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: ButtonVariant
  size?: "sm" | "default" | "lg" | "xl" | "icon"
  animated?: boolean
}

const sizeVariants = {
  sm: "btn-sm px-3 py-1.5 text-sm",
  default: "px-4 py-2 text-base",
  lg: "btn-lg px-6 py-3 text-lg", 
  xl: "btn-lg px-8 py-4 text-base",
  icon: "btn-square p-2"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default",
    size = "default",
    asChild = false, 
    loading = false, 
    leftIcon,
    rightIcon,
    animated = false,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const hasIcons = leftIcon || rightIcon
    const showSpinner = loading && !hasIcons
    const animateExistingIcons = loading && hasIcons
    
    // Apply hover effects for interactive variants
    const isInteractiveVariant = variant.includes('-interactive')
    
    const buttonClasses = cn(
      buttonVariants[variant],
      sizeVariants[size],
      // Apply hover effects for interactive variants
      isInteractiveVariant && getButtonHoverEffect(variant.replace('-interactive', '')),
      disabled && "opacity-50 cursor-not-allowed",
      className
    )

    if (animated) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          whileHover={undefined}
          whileTap={undefined}
          disabled={disabled || loading}
          {...props}
        >
          {showSpinner && (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          )}
          {leftIcon && (
            <span className={cn(
              "mr-2", 
              animateExistingIcons && "animate-pulse"
            )}>
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className={cn(
              "ml-2", 
              animateExistingIcons && "animate-pulse"
            )}>
              {rightIcon}
            </span>
          )}
        </motion.button>
      )
    }

    return (
      <Comp
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {showSpinner && (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        )}
        {leftIcon && (
          <span className={cn(
            "mr-2", 
            animateExistingIcons && "animate-pulse"
          )}>
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className={cn(
            "ml-2", 
            animateExistingIcons && "animate-pulse"
          )}>
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 