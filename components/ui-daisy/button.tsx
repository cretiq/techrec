"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "btn transition-all duration-200 ease-smooth relative overflow-hidden font-medium", // Enhanced base with smooth transitions
  {
    variants: {
      variant: {
        default: "btn-primary shadow-brand hover:shadow-lg hover:shadow-brand/25 disabled:bg-primary/30 disabled:text-primary-content/50 disabled:border-primary/20 disabled:shadow-none",
        destructive: "btn-error shadow-error hover:shadow-lg hover:shadow-error/25 disabled:bg-error/30 disabled:text-error-content/50 disabled:border-error/20 disabled:shadow-none",
        outline: "btn-outline hover:shadow-medium disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30 disabled:shadow-none",
        secondary: "btn-secondary shadow-colored hover:shadow-lg hover:shadow-colored/25 disabled:bg-secondary/30 disabled:text-secondary-content/50 disabled:border-secondary/20 disabled:shadow-none", 
        ghost: "btn-ghost hover:bg-base-200/60 disabled:bg-transparent disabled:text-base-content/30",
        link: "btn-link hover:scale-105 disabled:text-base-content/30 disabled:no-underline disabled:transform-none",
        dashdot: "btn-outline border-dashed hover:shadow-medium disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30 disabled:shadow-none",
        // Enhanced professional variants
        success: "btn-success shadow-success hover:shadow-lg hover:shadow-success/25 disabled:bg-success/30 disabled:text-success-content/50 disabled:border-success/20 disabled:shadow-none",
        warning: "btn-warning shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:bg-warning/30 disabled:text-warning-content/50 disabled:border-warning/20 disabled:shadow-none",
        info: "btn-info shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:bg-info/30 disabled:text-info-content/50 disabled:border-info/20 disabled:shadow-none",
        // Premium gradient variants
        "gradient-brand": "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border-0 shadow-brand hover:shadow-lg hover:shadow-brand/30 disabled:from-brand-500/30 disabled:to-brand-600/30 disabled:text-white/50 disabled:shadow-none",
        linkedin: "bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-medium disabled:from-[#0077b5]/30 disabled:to-[#005885]/30 disabled:text-white/50 disabled:shadow-none",
        gradient: "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white border-0 shadow-colored hover:shadow-lg hover:shadow-colored/30 disabled:from-violet-600/30 disabled:to-pink-600/30 disabled:text-white/50 disabled:shadow-none",
        "gradient-blue": "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:from-blue-600/30 disabled:to-cyan-600/30 disabled:text-white/50 disabled:shadow-none",
        "gradient-emerald": "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-success hover:shadow-lg hover:shadow-success/30 disabled:from-emerald-500/30 disabled:to-teal-600/30 disabled:text-white/50 disabled:shadow-none",
        // Enhanced glass variants
        glass: "bg-base-100/70 backdrop-blur-lg border border-base-300/50 hover:bg-base-200/80 hover:border-base-300 shadow-soft hover:shadow-medium disabled:bg-base-100/30 disabled:text-neutral-500 disabled:border-base-300/30 disabled:shadow-none disabled:opacity-50",
        "glass-outline": "bg-base-100/40 backdrop-blur-md border border-base-300/60 hover:bg-base-100/60 hover:border-base-300 shadow-soft hover:shadow-medium disabled:bg-base-100/20 disabled:text-neutral-500 disabled:border-base-300/30 disabled:shadow-none disabled:opacity-50",
        "glass-primary": "bg-primary/10 backdrop-blur-lg border border-primary/20 hover:bg-primary/20 hover:border-primary/30 text-primary shadow-soft hover:shadow-medium disabled:bg-primary/5 disabled:text-primary/30 disabled:border-primary/10 disabled:shadow-none",
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