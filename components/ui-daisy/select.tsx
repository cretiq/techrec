"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
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
Select.displayName = "Select"

// For compatibility with shadcn Select API, we'll create wrapper components
const SelectTrigger = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    variant?: "default" | "bordered" | "ghost" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error"
    selectSize?: "xs" | "sm" | "md" | "lg"
  }
>(({ className, variant = "bordered", selectSize, children, ...props }, ref) => {
  return (
    <Select
      className={className}
      variant={variant}
      selectSize={selectSize}
      ref={ref}
      {...props}
    >
      {children}
    </Select>
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