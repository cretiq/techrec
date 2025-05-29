import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const textareaVariants = cva(
  "textarea textarea-bordered w-full transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        primary: "textarea-primary",
        secondary: "textarea-secondary",
        accent: "textarea-accent",
        ghost: "textarea-ghost border-0 focus:border",
      },
      size: {
        xs: "textarea-xs text-xs",
        sm: "textarea-sm text-sm",
        default: "",
        lg: "textarea-lg text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }