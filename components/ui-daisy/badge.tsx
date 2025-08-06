"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge inline-flex items-center gap-1.5 transition-all duration-100 ease-smooth font-medium",
  {
    variants: {
      variant: {
        default: "badge-neutral",
        primary: "badge-primary shadow-brand/20 hover:shadow-brand/30",
        secondary: "badge-secondary shadow-colored/20 hover:shadow-colored/30", 
        accent: "badge-accent shadow-success/20 hover:shadow-success/30",
        ghost: "badge-ghost hover:bg-base-200/60",
        outline: "badge-outline hover:bg-base-100/50",
        success: "badge-success shadow-success/20 hover:shadow-success/30",
        warning: "badge-warning shadow-amber-500/20 hover:shadow-amber-500/30",
        error: "badge-error shadow-error/20 hover:shadow-error/30",
        info: "badge-info shadow-cyan-500/20 hover:shadow-cyan-500/30",
        // Premium gradient variants
        gradient: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-colored hover:shadow-colored/40",
        "gradient-brand": "bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0 shadow-brand hover:shadow-brand/40",
        "gradient-blue": "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30",
        "gradient-success": "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-success hover:shadow-success/40",
        "gradient-warning": "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30",
        // Glass morphism variants
        glass: "bg-base-100 backdrop-blur-md border border-base-100/20 shadow-soft hover:shadow-medium hover:bg-base-100/80",
        "glass-primary": "bg-primary/10 backdrop-blur-md border border-primary/20 text-primary shadow-soft hover:bg-primary/20",
        "glass-success": "bg-success/10 backdrop-blur-md border border-success/20 text-success shadow-soft hover:bg-success/20",
        "glass-error": "bg-error/10 backdrop-blur-md border border-error/20 text-error shadow-soft hover:bg-error/20",
      },
      size: {
        xs: "badge-xs text-xs px-1.5 py-0.5 gap-0.5",
        sm: "badge-sm text-sm px-2 py-1 gap-1",
        default: "text-sm px-2.5 py-1 gap-1.5",
        lg: "badge-lg text-base px-3 py-1.5 gap-1.5",
        xl: "text-lg px-4 py-2 gap-2",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm", 
        default: "rounded-full",
        lg: "rounded-xl",
        xl: "rounded-2xl",
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95 transform-gpu",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      rounded: "default",
      interactive: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRemove?: () => void
  dot?: boolean
  count?: number | string
  animated?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    interactive,
    pulse, 
    leftIcon, 
    rightIcon, 
    onRemove,
    dot = false,
    count,
    animated = false,
    children, 
    ...props 
  }, ref) => {
    const isClickable = interactive || onRemove || props.onClick

    // Handle count display
    if (count !== undefined) {
      children = typeof count === 'number' && count > 99 ? '99+' : count
    }

    // Handle dot badge (notification dot)
    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            "relative inline-block",
            size === "xs" && "w-2 h-2",
            size === "sm" && "w-2.5 h-2.5", 
            (!size || size === "default") && "w-3 h-3",
            size === "lg" && "w-3.5 h-3.5",
            size === "xl" && "w-4 h-4",
          )}
          {...props}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full",
              variant === "primary" && "bg-primary",
              variant === "secondary" && "bg-secondary",
              variant === "accent" && "bg-accent", 
              variant === "success" && "bg-success",
              variant === "warning" && "bg-warning",
              variant === "error" && "bg-error",
              variant === "info" && "bg-info",
              (!variant || variant === "default") && "bg-neutral",
              pulse && "animate-pulse",
              className
            )}
          />
          {pulse && (
            <span
              className={cn(
                "absolute inset-0 rounded-full animate-ping",
                variant === "primary" && "bg-primary",
                variant === "secondary" && "bg-secondary",
                variant === "accent" && "bg-accent",
                variant === "success" && "bg-success", 
                variant === "warning" && "bg-warning",
                variant === "error" && "bg-error",
                variant === "info" && "bg-info",
                (!variant || variant === "default") && "bg-neutral",
              )}
            />
          )}
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, rounded, interactive: isClickable }),
          "badge-enhanced", // Add shimmer effect from globals.css
          className
        )}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
        )}
        {leftIcon && (
          <span className="flex-shrink-0">
            {leftIcon}
          </span>
        )}
        {children && (
          <span className="truncate">
            {children}
          </span>
        )}
        {rightIcon && !onRemove && (
          <span className="flex-shrink-0">
            {rightIcon}
          </span>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="flex-shrink-0 ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
            aria-label="Remove"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </span>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants } 