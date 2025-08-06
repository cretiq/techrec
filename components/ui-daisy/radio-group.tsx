import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

const radioGroupVariants = cva(
  "space-y-2",
  {
    variants: {
      orientation: {
        vertical: "flex flex-col space-y-2",
        horizontal: "flex flex-row space-x-4 space-y-0",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      }
    },
    defaultVariants: {
      orientation: "vertical",
      size: "default",
    },
  }
)

const radioVariants = cva(
  "radio transition-all duration-100 ease-smooth focus:ring-2 focus:ring-primary/20 focus:outline-none",
  {
    variants: {
      variant: {
        default: "radio border-base-300 checked:border-primary checked:bg-primary",
        primary: "radio-primary shadow-brand/10 focus:shadow-brand/20",
        secondary: "radio-secondary shadow-colored/10 focus:shadow-colored/20",
        accent: "radio-accent shadow-success/10 focus:shadow-success/20",
        success: "radio border-success/50 checked:border-success checked:bg-success",
        warning: "radio border-warning/50 checked:border-warning checked:bg-warning",
        error: "radio border-error/50 checked:border-error checked:bg-error",
        glass: "radio bg-base-100/60 backdrop-blur-sm border-base-300/40 hover:border-base-300/60 checked:border-primary checked:bg-primary",
      },
      size: {
        xs: "radio-xs w-3 h-3",
        sm: "radio-sm w-4 h-4",
        default: "w-5 h-5",
        lg: "radio-lg w-6 h-6",
        xl: "w-7 h-7",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof radioGroupVariants> {
  value?: string
  onValueChange?: (value: string) => void
  name: string
  label?: string
  description?: string
  error?: string
}

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof radioVariants> {
  value: string
  label?: React.ReactNode
  description?: string
  error?: string 
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    className, 
    children, 
    value, 
    onValueChange, 
    name, 
    orientation, 
    size,
    label,
    description,
    error,
    ...props 
  }, ref) => {
    const groupId = React.useId()
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <div className="label">
            <span className="label-text font-medium">{label}</span>
          </div>
        )}
        {description && (
          <div className="label">
            <span className="label-text-alt text-base-content/70">{description}</span>
          </div>
        )}
        <div
          className={cn(radioGroupVariants({ orientation, size }), className)}
          role="radiogroup"
          aria-describedby={error ? `${groupId}-error` : undefined}
          ref={ref}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                name,
                checked: child.props.value === value,
                variant: hasError ? "error" : child.props.variant,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  if (onValueChange && e.target.checked) {
                    onValueChange(e.target.value);
                  }
                },
              });
            }
            return child;
          })}
        </div>
        {error && (
          <div id={`${groupId}-error`} className="label">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    label, 
    description, 
    error,
    checked, 
    onChange, 
    ...props 
  }, ref) => {
    const radioId = React.useId()
    const hasError = !!error
    const finalVariant = hasError ? "error" : variant

    return (
      <div className="form-control">
        <motion.label 
          className="label cursor-pointer justify-start gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors duration-100"
          htmlFor={radioId}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            type="radio"
            id={radioId}
            className={cn(
              radioVariants({ variant: finalVariant, size }),
              "input-focus-ring", // Custom focus ring from globals.css
              className
            )}
            checked={checked}
            onChange={onChange}
            ref={ref}
            aria-describedby={
              error ? `${radioId}-error` : description ? `${radioId}-desc` : undefined
            }
            aria-invalid={hasError}
            {...props}
          />
          <div className="flex-1">
            {label && (
              <div className="label-text font-medium">
                {label}
              </div>
            )}
            {description && (
              <div 
                id={`${radioId}-desc`}
                className="text-xs text-base-content/60 mt-1"
              >
                {description}
              </div>
            )}
            {error && (
              <div 
                id={`${radioId}-error`}
                className="text-xs text-error mt-1"
              >
                {error}
              </div>
            )}
          </div>
        </motion.label>
      </div>
    )
  }
)
Radio.displayName = "Radio"

export { RadioGroup, Radio }