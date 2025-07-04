"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "btn transition-all duration-200", // Standardized transition duration
  {
    variants: {
      variant: {
        default: "btn-primary",
        destructive: "btn-error",
        outline: "btn-outline",
        secondary: "btn-secondary", 
        ghost: "btn-ghost",
        link: "btn-link",
        dashdot: "btn-outline border-dashed",
        // LinkedIn-style button (commonly used across the app)
        linkedin: "bg-gradient-to-r from-[#0077b5] to-[#005885] hover:from-[#005885] hover:to-[#004165] text-white border-0 backdrop-blur-sm shadow-md hover:shadow-lg font-medium",
        // Consistent gradient variants
        gradient: "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white border-0 shadow-md hover:shadow-lg",
        "gradient-blue": "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-md hover:shadow-lg",
        "gradient-purple": "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-md hover:shadow-lg",
        // Glass/blur variants for modern look
        glass: "bg-base-100/70 backdrop-blur-md border border-base-300/50 hover:bg-base-200/80 shadow-md hover:shadow-lg",
        "glass-outline": "bg-base-100/60 backdrop-blur-sm border border-base-300/50 hover:bg-base-100/80 shadow-sm hover:shadow-md",
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
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, rounded, elevation }),
          loading && "loading",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 