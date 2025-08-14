"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// DaisyUI button variants - using out-of-the-box classes
const buttonVariants = {
  // Core DaisyUI variants
  default: "btn btn-neutral",
  primary: "btn btn-primary", 
  secondary: "btn btn-secondary",
  accent: "btn btn-accent",
  success: "btn btn-success",
  warning: "btn btn-warning",
  error: "btn btn-error",
  info: "btn btn-info",
  
  // Style variants
  ghost: "btn btn-ghost",
  link: "btn btn-link",
  outline: "btn btn-outline",
  
  // Custom variants that need special styling
  linkedin: "btn btn-primary [--btn-color:#0077b5] [--btn-color-hover:#005885] text-white",
  'linkedin-light': "btn btn-outline [--btn-color:#0077b5] [--btn-border-color:#0077b5]",
  'export-action': "btn btn-info",
  'copy-action': "btn btn-success",
  glass: "btn btn-ghost backdrop-blur-sm",
  
  // Legacy aliases for backwards compatibility
  destructive: "btn btn-error",
  elevated: "btn btn-neutral shadow-md",
  gradient: "btn btn-primary",
  writeto: "btn btn-primary bg-gradient-to-r from-purple-500 to-indigo-600 border-none",
  markasapplied: "btn btn-primary bg-gradient-to-r from-blue-500 to-cyan-600 border-none",
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
  sm: "btn-sm",
  default: "", // btn-md is default, no class needed
  lg: "btn-lg", 
  xl: "btn-xl",
  icon: "btn-square"
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
    
    const buttonClasses = cn(
      buttonVariants[variant],
      sizeVariants[size],
      disabled && "btn-disabled",
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