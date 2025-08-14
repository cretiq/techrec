"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Base badge styles that all variants inherit
const badgeBase = "badge inline-flex items-center gap-1.5 transition-all duration-100 ease-smooth font-medium"

// Simplified DaisyUI-first badge variants (90% reduction in custom CSS)
const badgeVariants = {
  // Core DaisyUI variants
  default: `${badgeBase} badge-neutral`,
  primary: `${badgeBase} badge-primary`,
  secondary: `${badgeBase} badge-secondary`,
  accent: `${badgeBase} badge-accent`,
  success: `${badgeBase} badge-success`,
  warning: `${badgeBase} badge-warning`,
  error: `${badgeBase} badge-error`,
  info: `${badgeBase} badge-info`,
  
  // DaisyUI style variants
  outline: `${badgeBase} badge-outline`,
  ghost: `${badgeBase} badge-ghost`,
  dash: `${badgeBase} badge-dash`,
  soft: `${badgeBase} badge-soft`,
  
  // Legacy aliases for backward compatibility during migration
  outlined: `${badgeBase} badge-outline`, // maps to DaisyUI outline
  transparent: `${badgeBase} badge-ghost`, // maps to DaisyUI ghost
  glass: `${badgeBase} badge-neutral badge-outline`, // simplified glass effect
  elevated: `${badgeBase} badge-neutral shadow-md`, // minimal shadow for elevation
  destructive: `${badgeBase} badge-error`, // maps to DaisyUI error
  gradient: `${badgeBase} badge-primary`, // simplified gradient to primary
  "gradient-brand": `${badgeBase} badge-primary`, // simplified gradient to primary
  "gradient-blue": `${badgeBase} badge-info`, // maps to DaisyUI info
  "gradient-success": `${badgeBase} badge-success`, // maps to DaisyUI success
  "gradient-warning": `${badgeBase} badge-warning`, // maps to DaisyUI warning
}

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: keyof typeof badgeVariants
    size?: "xs" | "sm" | "default" | "lg" | "xl"
    hoverable?: boolean
    interactive?: boolean
    animated?: boolean
    pulse?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    onRemove?: () => void
    dot?: boolean
    count?: number | string
  }
>(({ 
  className, 
  variant = "default",
  size = "default",
  hoverable = false,
  interactive = false,
  animated = false,
  pulse = false,
  leftIcon,
  rightIcon,
  onRemove,
  dot = false,
  count,
  children,
  ...props 
}, ref) => {
  const isClickable = interactive || onRemove || props.onClick

  // DaisyUI size variants with minimal custom additions
  const sizeClasses = {
    xs: "badge-xs",
    sm: "badge-sm", 
    default: "", // badge-md is default size
    lg: "badge-lg",
    xl: "badge-lg", // DaisyUI doesn't have xl, map to lg
  }

  // Handle count display
  if (count !== undefined) {
    children = typeof count === 'number' && count > 99 ? '99+' : count
  }

  // Handle dot badge (notification dot)
  if (dot) {
    const dotSizes = {
      xs: "w-2 h-2",
      sm: "w-2.5 h-2.5", 
      default: "w-3 h-3",
      lg: "w-3.5 h-3.5",
      xl: "w-4 h-4",
    }

    // DaisyUI semantic colors for dots
    const dotColors = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent", 
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-info",
      neutral: "bg-neutral",
      default: "bg-neutral",
      // Legacy aliases for backward compatibility
      outlined: "bg-neutral",
      ghost: "bg-neutral",
      outline: "bg-neutral",
    }

    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-block",
          dotSizes[size],
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute inset-0 rounded-full",
            dotColors[variant as keyof typeof dotColors] || dotColors.default,
            pulse && "animate-pulse",
            className
          )}
        />
        {pulse && (
          <span
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              dotColors[variant as keyof typeof dotColors] || dotColors.default,
            )}
          />
        )}
      </span>
    )
  }

  const badgeClasses = cn(
    badgeVariants[variant],
    sizeClasses[size],
    hoverable && "hover:shadow-sm hover:-translate-y-0.5 transform-gpu",
    interactive && "cursor-pointer hover:scale-105 active:scale-95 transform-gpu",
    isClickable && "cursor-pointer",
    className
  )

  if (animated) {
    return (
      <motion.span
        ref={ref}
        className={badgeClasses}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={hoverable ? { y: -2, transition: { duration: 0.15 } } : undefined}
        whileTap={{ scale: 0.95 }}
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
      </motion.span>
    )
  }

  return (
    <span
      ref={ref}
      className={badgeClasses}
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
})
Badge.displayName = "Badge"

// Additional badge components for specific use cases
const StatusBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    status: "active" | "inactive" | "pending" | "success" | "error" | "warning"
    pulse?: boolean
  }
>(({ status, pulse, ...props }, ref) => {
  const statusVariants = {
    active: "success" as const,
    inactive: "default" as const,
    pending: "warning" as const,
    success: "success" as const,
    error: "error" as const,
    warning: "warning" as const,
  }

  return (
    <Badge
      ref={ref}
      variant={statusVariants[status]}
      pulse={pulse}
      {...props}
    />
  )
})
StatusBadge.displayName = "StatusBadge"

const CountBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    count: number | string
    variant?: keyof typeof badgeVariants
    max?: number
  }
>(({ count, variant = "primary", max = 99, ...props }, ref) => {
  const displayCount = typeof count === 'number' && count > max ? `${max}+` : count

  return (
    <Badge
      ref={ref}
      variant={variant}
      size="sm"
      count={displayCount}
      {...props}
    />
  )
})
CountBadge.displayName = "CountBadge"

export { Badge, StatusBadge, CountBadge, badgeVariants }