import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Base input styles that all variants inherit
const inputBase = "input w-full transition-all duration-100 ease-smooth rounded-xl"

// Object-based variants for optimal performance and maintainability
const inputVariants = {
  // Core variants
  default: `${inputBase} input-bordered bg-base-100 border-base-300/50 focus:border-primary/50 focus:bg-base-100`,
  transparent: `${inputBase} input-bordered bg-base-100/80 backdrop-blur-sm border-base-300/50 focus:border-primary/50`,
  glass: `${inputBase} input-bordered bg-base-100/60 backdrop-blur-lg border-base-300/20 focus:border-primary/30`,
  solid: `${inputBase} input-bordered bg-base-200 border-base-300 focus:border-primary/50`,
  hybrid: `${inputBase} input-bordered bg-base-100 border-brand-sharp focus:border-brand-sharp`,
  
  // Layout variants
  outlined: `${inputBase} input-bordered bg-transparent border-2 border-base-300 focus:border-primary/50`,
  elevated: `${inputBase} input-bordered bg-base-100 border-base-300/50 shadow-sm focus:shadow-md`,
  floating: `${inputBase} input-bordered bg-base-100/95 backdrop-blur-md border-base-300/40 shadow-sm`,
  gradient: `${inputBase} input-bordered bg-gradient-to-br from-base-100 to-base-200 border-base-300/50`,
  
  // Semantic variants - using DaisyUI semantic colors
  primary: `${inputBase} input-bordered input-primary`,
  secondary: `${inputBase} input-bordered input-secondary`,
  success: `${inputBase} input-bordered input-success`,
  warning: `${inputBase} input-bordered input-warning`,
  error: `${inputBase} input-bordered input-error`,
  info: `${inputBase} input-bordered input-info`,
  accent: `${inputBase} input-bordered input-accent`,
  
  // Interactive variants
  ghost: `${inputBase} input-ghost hover:bg-base-200/60`,
  
  // Legacy aliases for backwards compatibility
  bordered: `${inputBase} input-bordered bg-base-100 border-base-300/50 focus:border-primary/50`,
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: keyof typeof inputVariants
  inputSize?: "xs" | "sm" | "md" | "lg"
  hoverable?: boolean
  animated?: boolean
  interactive?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const sizeVariants = {
  xs: "input-xs text-xs px-3 py-1.5",
  sm: "input-sm text-sm px-3 py-2",
  md: "input-md text-base px-4 py-2.5",
  lg: "input-lg text-lg px-5 py-3",
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = "default", 
    inputSize = "md", 
    hoverable = false,
    animated = false,
    interactive = false,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    const inputClasses = cn(
      inputVariants[variant],
      sizeVariants[inputSize],
      hoverable && "hover:border-primary/30 hover:shadow-sm transform-gpu",
      interactive && "hover:scale-[1.01] transform-gpu",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      className
    )

    if (animated) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10">
              {leftIcon}
            </div>
          )}
          <motion.input
            ref={ref}
            type={type}
            className={inputClasses}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            whileFocus={{ scale: 1.01, transition: { duration: 0.2 } }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 z-10">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants } 