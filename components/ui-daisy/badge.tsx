"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "badge inline-flex items-center gap-2 transition-colors",
  {
    variants: {
      variant: {
        default: "badge-primary",
        secondary: "badge-secondary",
        accent: "badge-accent",
        ghost: "badge-ghost",
        outline: "badge-outline",
        success: "badge-success",
        warning: "badge-warning",
        error: "badge-error",
        info: "badge-info",
        // Custom variants
        gradient: "bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 text-violet-700 dark:text-violet-300 border-0",
        "gradient-blue": "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border-0",
      },
      size: {
        default: "",
        sm: "badge-sm",
        lg: "badge-lg",
        xl: "px-4 py-2 text-base",
      },
      rounded: {
        default: "",
        full: "rounded-full",
        lg: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, rounded, pulse, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded }), className)}
        {...props}
      >
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
        )}
        {leftIcon && <span>{leftIcon}</span>}
        {children}
        {rightIcon && <span>{rightIcon}</span>}
      </span>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants } 