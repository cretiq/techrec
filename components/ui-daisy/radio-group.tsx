import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
  name: string
}

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  variant?: "default" | "primary" | "secondary" | "accent"
  size?: "xs" | "sm" | "md" | "lg"
  label?: React.ReactNode
  description?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, value, onValueChange, name, ...props }, ref) => {
    return (
      <div
        className={cn("space-y-2", className)}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              name,
              checked: child.props.value === value,
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
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant = "default", size = "md", label, description, checked, onChange, ...props }, ref) => {
    const variantClasses = {
      default: "radio",
      primary: "radio radio-primary",
      secondary: "radio radio-secondary", 
      accent: "radio radio-accent",
    }

    const sizeClasses = {
      xs: "radio-xs",
      sm: "radio-sm",
      md: "radio-md", 
      lg: "radio-lg",
    }

    const radioId = `radio-${props.value}-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="radio"
            id={radioId}
            className={cn(
              variantClasses[variant],
              sizeClasses[size],
              className
            )}
            checked={checked}
            onChange={onChange}
            ref={ref}
            {...props}
          />
          {label && (
            <div className="label-text-alt flex-1">
              {label}
              {description && (
                <div className="text-xs text-base-content/60 mt-1">
                  {description}
                </div>
              )}
            </div>
          )}
        </label>
      </div>
    )
  }
)
Radio.displayName = "Radio"

export { RadioGroup, Radio }