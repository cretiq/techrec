"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "btn transition-all duration-200", // Standardized transition duration
  {
    variants: {
      variant: {
        default: "btn-primary disabled:bg-primary/30 disabled:text-primary-content/50 disabled:border-primary/20",
        destructive: "btn-error disabled:bg-error/30 disabled:text-error-content/50 disabled:border-error/20",
        outline: "btn-outline disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30",
        secondary: "btn-secondary disabled:bg-secondary/30 disabled:text-secondary-content/50 disabled:border-secondary/20", 
        ghost: "btn-ghost disabled:bg-transparent disabled:text-base-content/30",
        link: "btn-link disabled:text-base-content/30 disabled:no-underline",
        dashdot: "btn-outline border-dashed disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30",
        // LinkedIn-style button with comprehensive disabled states
        linkedin: "bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white border-0 backdrop-blur-sm shadow-md hover:shadow-lg font-medium disabled:from-[#0077b5]/30 disabled:to-[#005885]/30 disabled:text-white/50 disabled:shadow-none",
        // Consistent gradient variants with disabled states
        gradient: "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white border-0 shadow-md hover:shadow-lg disabled:from-violet-600/30 disabled:to-pink-600/30 disabled:text-white/50 disabled:shadow-none",
        "gradient-blue": "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-md hover:shadow-lg disabled:from-blue-600/30 disabled:to-cyan-600/30 disabled:text-white/50 disabled:shadow-none",
        // Glass/blur variants with disabled states
        glass: "bg-base-100/70 backdrop-blur-md border border-base-300/50 hover:bg-base-200/80 shadow-md hover:shadow-lg disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/20 disabled:shadow-none",
        "glass-outline": "bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/80 shadow-sm hover:shadow-md disabled:bg-base-100/20 disabled:text-base-content/50 disabled:border-base-300/20 disabled:shadow-none",
      },
      size: {
        default: "",
        sm: "btn-sm",
        lg: "btn-lg", 
        icon: "btn-square",
        xl: "btn-lg px-8 py-4 text-base", // Consistent extra large with LinkedIn-style padding
      },
      rounded: {
        default: "",
        sm: "rounded",
        md: "rounded-md", 
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        full: "rounded-full",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm hover:shadow-md",
        md: "shadow-md hover:shadow-lg", // Default consistent shadow
        lg: "shadow-lg hover:shadow-xl",
        xl: "shadow-xl hover:shadow-2xl",
        float: "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform duration-200",
        // Theme-aware shadow variants for future dark/light mode support
        "theme-aware-sm": "shadow-sm hover:shadow-md dark:shadow-slate-900/20 dark:hover:shadow-slate-900/40",
        "theme-aware-md": "shadow-md hover:shadow-lg dark:shadow-slate-900/30 dark:hover:shadow-slate-900/50",
        "theme-aware-lg": "shadow-lg hover:shadow-xl dark:shadow-slate-900/40 dark:hover:shadow-slate-900/60",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      elevation: "md", // Default to medium shadow for consistency
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    elevation,
    asChild = false, 
    loading = false, 
    leftIcon,
    rightIcon,
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Enhanced loading state logic: if icons exist, animate them instead of showing spinner
    const hasIcons = leftIcon || rightIcon
    const showSpinner = loading && !hasIcons
    const animateExistingIcons = loading && hasIcons
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, rounded, elevation }),
          className
        )}
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