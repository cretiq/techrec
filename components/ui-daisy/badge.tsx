"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Base badge styles that all variants inherit
const badgeBase = "badge inline-flex items-center gap-1.5 transition-all duration-100 ease-smooth font-medium"

// Object-based variants for optimal performance and maintainability
const badgeVariants = {
  // Core variants
  default: `${badgeBase} badge-neutral`,
  transparent: `${badgeBase} bg-base-100/80 backdrop-blur-sm border border-base-300/50`,
  glass: `${badgeBase} bg-base-100/60 backdrop-blur-lg border border-base-300/20`,
  solid: `${badgeBase} bg-base-200 border border-base-300`,
  hybrid: `${badgeBase} border border-brand-sharp shadow-xs`,
  
  // Layout variants
  outlined: `${badgeBase} badge-outline hover:bg-base-100/50`,
  elevated: `${badgeBase} bg-base-100 shadow-sm hover:shadow-md`,
  floating: `${badgeBase} bg-base-100/95 backdrop-blur-md shadow-sm`,
  gradient: `${badgeBase} bg-gradient-to-r from-base-100 to-base-200`,
  
  // Semantic variants - using DaisyUI semantic colors
  primary: `${badgeBase} badge-primary`,
  secondary: `${badgeBase} badge-secondary`,
  success: `${badgeBase} badge-success`,
  warning: `${badgeBase} badge-warning`,
  error: `${badgeBase} badge-error`,
  info: `${badgeBase} badge-info`,
  accent: `${badgeBase} badge-accent`,
  
  // Interactive variants
  ghost: `${badgeBase} badge-ghost hover:bg-base-200/60`,
  
  // Special variants
  soft: `${badgeBase} badge-soft`,
  
  // Premium gradient variants
  "gradient-brand": `${badgeBase} bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0 shadow-lg`,
  "gradient-blue": `${badgeBase} bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg`,
  "gradient-success": `${badgeBase} bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg`,
  "gradient-warning": `${badgeBase} bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg`,
  
  // Glass morphism variants
  "glass-primary": `${badgeBase} bg-primary/10 backdrop-blur-md border border-primary/20 text-primary`,
  "glass-success": `${badgeBase} bg-success/10 backdrop-blur-md border border-success/20 text-success`,
  "glass-error": `${badgeBase} bg-error/10 backdrop-blur-md border border-error/20 text-error`,
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

  // Size variants
  const sizeClasses = {
    xs: "badge-xs text-xs px-1.5 py-0.5 gap-0.5",
    sm: "badge-sm text-sm px-2 py-1 gap-1",
    default: "text-sm px-2.5 py-1 gap-1.5",
    lg: "badge-lg text-base px-3 py-1.5 gap-1.5",
    xl: "text-lg px-4 py-2 gap-2",
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

    const dotColors = {
      primary: "bg-primary",
      secondary: "bg-secondary",
      accent: "bg-accent", 
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-info",
      default: "bg-neutral",
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