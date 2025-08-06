"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base progress styles that all variants inherit
const progressBase = "progress transition-all duration-100 ease-smooth"

const progressVariants = cva(progressBase, {
  variants: {
    variant: {
      default: "progress-primary",
      primary: "progress-primary",
      secondary: "progress-secondary", 
      accent: "progress-accent",
      info: "progress-info",
      success: "progress-success",
      warning: "progress-warning",
      error: "progress-error",
      // Gradient variants
      gradient: "progress-primary [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-yellow-500 [&::-webkit-progress-value]:via-orange-500 [&::-webkit-progress-value]:to-red-500",
      "gradient-brand": "progress-primary [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-brand-500 [&::-webkit-progress-value]:to-brand-600",
      "gradient-blue": "progress-primary [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-blue-500 [&::-webkit-progress-value]:to-cyan-500",
      "gradient-success": "progress-primary [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-emerald-500 [&::-webkit-progress-value]:to-teal-500",
      // Glass morphism variants
      glass: "bg-base-100/30 backdrop-blur-sm border border-base-300/50 [&::-webkit-progress-value]:bg-base-content/60",
      "glass-primary": "bg-primary/10 backdrop-blur-sm border border-primary/30 [&::-webkit-progress-value]:bg-primary",
      "glass-success": "bg-success/10 backdrop-blur-sm border border-success/30 [&::-webkit-progress-value]:bg-success",
    },
    size: {
      xs: "h-1",
      sm: "h-2", 
      default: "h-3",
      md: "h-4",
      lg: "h-6",
      xl: "h-8",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded",
      default: "rounded-lg",
      md: "rounded-lg", 
      lg: "rounded-xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default", 
    rounded: "default",
  },
})

export interface ProgressProps
  extends React.ProgressHTMLAttributes<HTMLProgressElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  animated?: boolean
  showValue?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    value = 0, 
    max = 100, 
    animated = false,
    showValue = false,
    label,
    ...props 
  }, ref) => {
    const progressClasses = cn(
      progressVariants({ variant, size, rounded }),
      animated && "animate-pulse",
      className
    )

    const percentage = Math.round((value / max) * 100)

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && (
              <span className="text-sm font-medium text-base-content/70">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm font-medium text-base-content">
                {percentage}%
              </span>
            )}
          </div>
        )}
        <progress
          ref={ref}
          className={progressClasses}
          value={value}
          max={max}
          {...props}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Linear Progress Bar variant for more control
const LinearProgress = React.forwardRef<HTMLDivElement, Omit<ProgressProps, 'value' | 'max'> & { 
  value?: number
  max?: number
  indeterminate?: boolean
}>(({
  className,
  variant = "default",
  size = "default", 
  rounded = "default",
  value = 0,
  max = 100,
  animated = false,
  indeterminate = false,
  showValue = false,
  label,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const containerClasses = cn(
    "relative overflow-hidden",
    progressVariants({ variant: "glass", size, rounded }),
    className
  )
  
  const fillClasses = cn(
    "h-full transition-all duration-500 ease-out",
    variant === "gradient" && "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500",
    variant === "gradient-brand" && "bg-gradient-to-r from-brand-500 to-brand-600", 
    variant === "gradient-blue" && "bg-gradient-to-r from-blue-500 to-cyan-500",
    variant === "gradient-success" && "bg-gradient-to-r from-emerald-500 to-teal-500",
    variant === "primary" && "bg-primary",
    variant === "secondary" && "bg-secondary",
    variant === "accent" && "bg-accent",
    variant === "info" && "bg-info", 
    variant === "success" && "bg-success",
    variant === "warning" && "bg-warning",
    variant === "error" && "bg-error",
    variant === "default" && "bg-primary",
    indeterminate && "animate-pulse",
    animated && !indeterminate && "animate-pulse"
  )

  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-base-content/70">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="text-sm font-medium text-base-content">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div ref={ref} className={containerClasses} {...props}>
        <div 
          className={fillClasses}
          style={{ 
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
})
LinearProgress.displayName = "LinearProgress"

export { Progress, LinearProgress, progressVariants }