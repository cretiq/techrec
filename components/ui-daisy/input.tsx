import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "bordered" | "ghost" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error"
  inputSize?: "xs" | "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "bordered", inputSize, ...props }, ref) => {
    const variantClasses = {
      default: "input",
      bordered: "input input-bordered",
      ghost: "input input-ghost", 
      primary: "input input-bordered input-primary",
      secondary: "input input-bordered input-secondary",
      accent: "input input-bordered input-accent",
      info: "input input-bordered input-info",
      success: "input input-bordered input-success",
      warning: "input input-bordered input-warning",
      error: "input input-bordered input-error",
    }

    const sizeClasses = {
      xs: "input-xs",
      sm: "input-sm", 
      md: "input-md",
      lg: "input-lg",
    }

    return (
      <input
        type={type}
        className={cn(
          variantClasses[variant],
          inputSize && sizeClasses[inputSize],
          "w-full",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 