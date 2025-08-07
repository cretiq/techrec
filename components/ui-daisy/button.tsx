"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

const buttonBase = "btn rounded-xl  transition-all duration-100 ease-smooth relative overflow-hidden border"

const buttonVariants = {
  default: `${buttonBase} bg-base-100 hover:bg-base-100 hover:border-base-100`,
  transparent: `${buttonBase} bg-base-100 backdrop-blur-sm hover:bg-base-100`,
  glass: `${buttonBase} bg-base-300/60 backdrop-blur-lg hover:bg-base-300`,
  solid: `${buttonBase} bg-base-200 hover:bg-base-300 hover:border-base-300`,
  hybrid: `${buttonBase} bg-brand-muted hover:bg-brand-muted`,
  outlined: `${buttonBase} bg-transparent hover:border-primary/50 hover:bg-base-100/50`,
  elevated: `${buttonBase} bg-base-100 shadow-sm hover:shadow-md`,
  floating: `${buttonBase} bg-base-100/95 backdrop-blur-md shadow-sm hover:shadow-md`,
  gradient: `${buttonBase} bg-gradient-to-br from-base-100 to-base-200 hover:from-base-50 hover:to-base-100`,
  primary: `${buttonBase} bg-primary/80 text-primary-content dark:text-white`,
  secondary: `${buttonBase} bg-secondary/80 text-secondary-content dark:text-white`,
  success: `${buttonBase} bg-success/80 text-success-content dark:text-white`,
  warning: `${buttonBase} bg-warning/80 text-warning-content dark:text-white`,
  error: `${buttonBase} bg-error/90 text-error-content dark:text-white`,
  info: `${buttonBase} bg-info/90 text-info-content dark:text-white`,
  ghost: `${buttonBase} bg-transparent hover:bg-base-200/60 hover:border-base-300/50`,
  link: `${buttonBase} bg-transparent text-primary hover:text-primary/80 underline hover:no-underline`,

  // Premium variants (keeping some gradients for special cases)
  linkedin: `${buttonBase} bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white font-medium`,
  outline: `${buttonBase} bg-transparent hover:border-primary/50 hover:bg-base-100/50`,

  destructive: `${buttonBase} bg-error/90 text-error-content hover:bg-error hover:border-error/70`,
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: keyof typeof buttonVariants
  size?: "sm" | "default" | "lg" | "xl" | "icon"
  hoverable?: boolean
  animated?: boolean
  interactive?: boolean
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
    hoverable = false,
    animated = false,
    interactive = false,
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
      hoverable && "hover:shadow-sm hover:-translate-y-0.5 transform-gpu",
      interactive && "hover:scale-[1.01] transform-gpu",
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
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
          whileTap={{ scale: 0.98 }}
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