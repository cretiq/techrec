"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base label styles that all variants inherit
const labelBase = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-all duration-100"

const labelVariants = cva(labelBase, {
  variants: {
    variant: {
      default: "text-base-content",
      required: "text-base-content after:content-['*'] after:text-error after:ml-1",
      error: "text-error",
      success: "text-success", 
      warning: "text-warning",
      info: "text-info",
      muted: "text-base-content/70",
      accent: "text-accent",
      // Glass morphism variants
      glass: "text-base-content/90 backdrop-blur-sm",
      "glass-error": "text-error/90 backdrop-blur-sm",
      "glass-success": "text-success/90 backdrop-blur-sm",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      default: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium", 
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    weight: "medium",
  },
})

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean
  animated?: boolean
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, weight, required, animated = false, children, ...props }, ref) => {
    const finalVariant = required ? "required" : variant

    const labelClasses = cn(
      labelVariants({ variant: finalVariant, size, weight }),
      animated && "hover:scale-105 transform-gpu",
      className
    )

    return (
      <label ref={ref} className={labelClasses} {...props}>
        {children}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label, labelVariants }