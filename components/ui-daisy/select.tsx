"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const selectVariants = cva(
  "select w-full transition-all duration-200 ease-smooth focus:shadow-medium focus:outline-none focus:ring-2 focus:ring-primary/20",
  {
    variants: {
      variant: {
        default: "select-bordered bg-base-100 border-base-300/60 hover:border-base-300 focus:border-primary/50",
        bordered: "select-bordered bg-base-100 border-base-300/60 hover:border-base-300 focus:border-primary/50",
        ghost: "select-ghost border-0 bg-transparent hover:bg-base-200/50 focus:bg-base-100 focus:border focus:border-primary/50",
        primary: "select-bordered select-primary shadow-brand/10 focus:shadow-brand/20",
        secondary: "select-bordered select-secondary shadow-colored/10 focus:shadow-colored/20",
        accent: "select-bordered select-accent shadow-success/10 focus:shadow-success/20",
        info: "select-bordered select-info shadow-lg shadow-cyan-500/10 focus:shadow-cyan-500/20",
        success: "select-bordered border-success/50 focus:border-success bg-success/5 focus:bg-success/10",
        warning: "select-bordered border-warning/50 focus:border-warning bg-warning/5 focus:bg-warning/10",
        error: "select-bordered border-error/50 focus:border-error bg-error/5 focus:bg-error/10",
        glass: "bg-base-100/60 backdrop-blur-md border border-base-300/40 hover:bg-base-100/80 hover:border-base-300/60 focus:bg-base-100/90 focus:border-primary/50 shadow-soft",
      },
      size: {
        xs: "select-xs text-xs h-8",
        sm: "select-sm text-sm h-10",
        md: "text-base h-12",
        lg: "select-lg text-lg h-14",
        xl: "text-xl h-16 px-6",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "bordered",
      size: "md",
      rounded: "default",
    },
  }
)

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  label?: string
  error?: string
  helperText?: string
  selectSize?: "xs" | "sm" | "md" | "lg" | "xl" // Keep for backward compatibility
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, selectSize, rounded, label, error, helperText, children, ...props }, ref) => {
    const selectId = React.useId()
    const hasError = !!error
    const finalVariant = hasError ? "error" : variant
    const finalSize = size || selectSize // Use size first, fallback to selectSize for backward compatibility

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            <span className="label-text font-medium">{label}</span>
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            selectVariants({ variant: finalVariant, size: finalSize, rounded }),
            "input-focus-ring", // Custom focus ring from globals.css
            className
          )}
          ref={ref}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          aria-invalid={hasError}
          {...props}
        >
          {children}
        </select>
        {error && (
          <div id={`${selectId}-error`} className="label">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
        {helperText && !error && (
          <div id={`${selectId}-helper`} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

// For compatibility with shadcn Select API, we'll create wrapper components
const SelectTrigger = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    variant?: "default" | "bordered" | "ghost" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error"
    selectSize?: "xs" | "sm" | "md" | "lg"
  }
>(({ className, variant = "bordered", selectSize, children, ...props }, ref) => {
  const variantClasses = {
    default: "select",
    bordered: "select select-bordered",
    ghost: "select select-ghost",
    primary: "select select-bordered select-primary",
    secondary: "select select-bordered select-secondary",
    accent: "select select-bordered select-accent",
    info: "select select-bordered select-info",
    success: "select select-bordered select-success",
    warning: "select select-bordered select-warning",
    error: "select select-bordered select-error",
  }

  const sizeClasses = {
    xs: "select-xs",
    sm: "select-sm",
    md: "select-md",
    lg: "select-lg",
  }

  return (
    <select
      className={cn(
        variantClasses[variant],
        selectSize && sizeClasses[selectSize],
        "w-full",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  // In DaisyUI, the content is handled by the select element itself
  // This is just for API compatibility
  return <>{children}</>
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => {
  return (
    <option
      className={cn("", className)}
      ref={ref}
      {...props}
    >
      {children}
    </option>
  )
})
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement> & {
    placeholder?: string
  }
>(({ className, placeholder, children, ...props }, ref) => {
  return (
    <option
      className={cn("", className)}
      value=""
      disabled
      ref={ref}
      {...props}
    >
      {placeholder || children}
    </option>
  )
})
SelectValue.displayName = "SelectValue"

// Additional components for full compatibility
const SelectGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.OptgroupHTMLAttributes<HTMLOptGroupElement>
>(({ className, children, ...props }, ref) => {
  return (
    <optgroup
      className={cn("", className)}
      ref={ref}
      {...props}
    >
      {children}
    </optgroup>
  )
})
SelectGroup.displayName = "SelectGroup"

const SelectLabel = React.forwardRef<
  HTMLOptGroupElement,
  React.OptgroupHTMLAttributes<HTMLOptGroupElement>
>(({ className, children, ...props }, ref) => {
  return (
    <optgroup
      className={cn("font-medium", className)}
      ref={ref}
      {...props}
      label={children as string}
    />
  )
})
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  return (
    <hr
      ref={ref}
      className={cn("my-1 border-base-300", className)}
      {...props}
    />
  )
})
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} 