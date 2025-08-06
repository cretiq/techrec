"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

// Base checkbox styles that all variants inherit
const checkboxBase = "checkbox transition-all duration-100 ease-smooth"

const checkboxVariants = cva(checkboxBase, {
  variants: {
    variant: {
      default: "checkbox-primary",
      primary: "checkbox-primary",
      secondary: "checkbox-secondary",
      accent: "checkbox-accent",
      success: "checkbox-success",
      warning: "checkbox-warning",
      info: "checkbox-info",
      error: "checkbox-error",
      // Glass morphism variants
      glass: "bg-base-100/60 backdrop-blur-sm border-2 border-base-300/50 hover:bg-base-100/80",
      "glass-primary": "bg-primary/10 backdrop-blur-sm border-2 border-primary/30 hover:bg-primary/20",
    },
    size: {
      xs: "checkbox-xs",
      sm: "checkbox-sm",
      default: "",
      md: "checkbox-md", 
      lg: "checkbox-lg",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
  },
})

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants> & {
      indeterminate?: boolean
      label?: string
      description?: string
      error?: string
      disabled?: boolean
    }
>(({ 
  className, 
  variant, 
  size, 
  rounded,
  indeterminate = false,
  label,
  description, 
  error,
  disabled = false,
  children,
  ...props 
}, ref) => (
  <div className="form-control">
    <label className={cn("label cursor-pointer justify-start gap-3", disabled && "opacity-50 cursor-not-allowed")}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          checkboxVariants({ variant, size, rounded }),
          "peer",
          disabled && "cursor-not-allowed opacity-50",
          error && "checkbox-error border-error",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
          {indeterminate ? (
            <Minus className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      
      {(label || children) && (
        <div className="flex-1">
          <span className="label-text font-medium">
            {label || children}
          </span>
          {description && (
            <p className="text-sm text-base-content/70 mt-1">
              {description}
            </p>
          )}
          {error && (
            <p className="text-sm text-error mt-1">
              {error}
            </p>
          )}
        </div>
      )}
    </label>
  </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// Checkbox Group for multiple checkboxes
const CheckboxGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
    description?: string
    error?: string
    orientation?: "horizontal" | "vertical"
  }
>(({ className, label, description, error, orientation = "vertical", children, ...props }, ref) => (
  <div ref={ref} className={cn("form-control w-full", className)} {...props}>
    {label && (
      <div className="label">
        <span className="label-text font-medium">{label}</span>
      </div>
    )}
    {description && (
      <p className="text-sm text-base-content/70 mb-3">
        {description}
      </p>
    )}
    <div className={cn(
      "space-y-2",
      orientation === "horizontal" && "flex flex-wrap gap-4 space-y-0"
    )}>
      {children}
    </div>
    {error && (
      <div className="label">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    )}
  </div>
))
CheckboxGroup.displayName = "CheckboxGroup"

// Simple checkbox without form control wrapper
const SimpleCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants> & {
      indeterminate?: boolean
    }
>(({ className, variant, size, rounded, indeterminate = false, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size, rounded }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      {indeterminate ? (
        <Minus className="h-3 w-3" />
      ) : (
        <Check className="h-3 w-3" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
SimpleCheckbox.displayName = "SimpleCheckbox"

export {
  Checkbox,
  CheckboxGroup,
  SimpleCheckbox,
  checkboxVariants,
}