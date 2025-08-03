import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const textareaVariants = cva(
  "textarea textarea-bordered w-full transition-all duration-200 ease-smooth resize-none focus:shadow-medium focus:outline-none focus:ring-2 focus:ring-primary/20",
  {
    variants: {
      variant: {
        default: "bg-base-100 border-base-300/60 hover:border-base-300 focus:border-primary/50",
        primary: "textarea-primary shadow-brand/10 focus:shadow-brand/20",
        secondary: "textarea-secondary shadow-colored/10 focus:shadow-colored/20", 
        accent: "textarea-accent shadow-success/10 focus:shadow-success/20",
        ghost: "textarea-ghost border-0 bg-transparent hover:bg-base-200/50 focus:bg-base-100 focus:border focus:border-primary/50",
        glass: "bg-base-100/60 backdrop-blur-md border-base-300/40 hover:bg-base-100/80 hover:border-base-300/60 focus:bg-base-100/90 focus:border-primary/50 shadow-soft",
        success: "border-success/50 focus:border-success bg-success/5 focus:bg-success/10",
        warning: "border-warning/50 focus:border-warning bg-warning/5 focus:bg-warning/10",
        error: "border-error/50 focus:border-error bg-error/5 focus:bg-error/10",
      },
      size: {
        xs: "textarea-xs text-xs min-h-16 p-2",
        sm: "textarea-sm text-sm min-h-20 p-3", 
        default: "text-base min-h-24 p-4",
        lg: "textarea-lg text-lg min-h-32 p-5",
        xl: "text-xl min-h-40 p-6",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x", 
        both: "resize",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-3xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      resize: "vertical",
      rounded: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, resize, rounded, label, error, helperText, ...props }, ref) => {
    const textareaId = React.useId()
    const hasError = !!error
    const finalVariant = hasError ? "error" : variant

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            <span className="label-text font-medium">{label}</span>
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant: finalVariant, size, resize, rounded }),
            "input-focus-ring", // Custom focus ring from globals.css
            className
          )}
          ref={ref}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          aria-invalid={hasError}
          {...props}
        />
        {error && (
          <div id={`${textareaId}-error`} className="label">
            <span className="label-text-alt text-error">{error}</span>
          </div>
        )}
        {helperText && !error && (
          <div id={`${textareaId}-helper`} className="label">
            <span className="label-text-alt text-base-content/70">{helperText}</span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }