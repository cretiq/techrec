"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "btn transition-all duration-100 ease-smooth relative overflow-hidden linear-button rounded-lg", // Enhanced base with Linear typography and smooth transitions
  {
    variants: {
      variant: {
        default: "btn-primary border border-primary/30 hover:border-primary/50 disabled:bg-primary/30 disabled:text-primary-content/50 disabled:border-primary/20",
        destructive: "btn-error border border-error/30 hover:border-error/50 disabled:bg-error/30 disabled:text-error-content/50 disabled:border-error/20",
        outline: "btn-outline border border-base-300/30 hover:border-base-300/50 disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30",
        secondary: "btn-secondary border border-secondary/30 hover:border-secondary/50 disabled:bg-secondary/30 disabled:text-secondary-content/50 disabled:border-secondary/20", 
        ghost: "btn-ghost hover:bg-base-200/60 disabled:bg-transparent disabled:text-base-content/30",
        link: "btn-link hover:scale-105 disabled:text-base-content/30 disabled:no-underline disabled:transform-none",
        dashdot: "btn-outline border-dashed border-base-300/30 hover:border-base-300/50 disabled:bg-base-100/30 disabled:text-base-content/50 disabled:border-base-300/30",
        // Enhanced professional variants
        success: "btn-success border border-success/30 hover:border-success/50 disabled:bg-success/30 disabled:text-success-content/50 disabled:border-success/20",
        warning: "btn-warning border border-warning/30 hover:border-warning/50 disabled:bg-warning/30 disabled:text-warning-content/50 disabled:border-warning/20",
        info: "btn-info border border-info/30 hover:border-info/50 disabled:bg-info/30 disabled:text-info-content/50 disabled:border-info/20",
        // Premium gradient variants
        "gradient-brand": "bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white border border-brand-500/30 hover:border-brand-600/50 disabled:from-brand-500/30 disabled:to-brand-600/30 disabled:text-white/50",
        linkedin: "bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white border border-[#0077b5]/30 hover:border-[#005885]/50 font-medium disabled:from-[#0077b5]/30 disabled:to-[#005885]/30 disabled:text-white/50",
        gradient: "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white border border-orange-500/30 hover:border-orange-600/50 disabled:from-yellow-500/30 disabled:via-orange-500/30 disabled:to-red-500/30 disabled:text-white/50",
        "gradient-blue": "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border border-blue-600/30 hover:border-blue-700/50 disabled:from-blue-600/30 disabled:to-cyan-600/30 disabled:text-white/50",
        "gradient-emerald": "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border border-emerald-500/30 hover:border-emerald-600/50 disabled:from-emerald-500/30 disabled:to-teal-600/30 disabled:text-white/50",
        // Enhanced glass variants
        glass: "bg-gray-700/20 backdrop-blur-lg border border-gray-600/30 hover:bg-gray-700/30 hover:border-gray-600/50 text-gray-300 hover:text-gray-200 disabled:bg-gray-700/10 disabled:text-gray-500 disabled:border-gray-600/20 disabled:opacity-50",
        "glass-outline": "bg-base-100/40 backdrop-blur-md border border-base-300/30 hover:bg-base-100/60 hover:border-base-300/50 disabled:bg-base-100/20 disabled:text-neutral-500 disabled:border-base-300/30 disabled:opacity-50",
        "glass-primary": "bg-primary/10 backdrop-blur-lg border border-primary/20 hover:bg-primary/20 hover:border-primary/30 text-primary disabled:bg-primary/5 disabled:text-primary/30 disabled:border-primary/10",
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
        float: "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform duration-100",
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