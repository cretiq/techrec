import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base separator styling following DaisyUI divider patterns
const separatorVariants = cva(
  "shrink-0",
  {
    variants: {
      variant: {
        default: "bg-base-300",
        primary: "bg-primary",
        secondary: "bg-secondary",
        accent: "bg-accent", 
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        neutral: "bg-neutral",
        ghost: "bg-transparent",
        dashed: "border-dashed border-base-300 bg-transparent",
        dotted: "border-dotted border-base-300 bg-transparent",
        gradient: "bg-gradient-to-r from-transparent via-base-300 to-transparent",
        glass: "bg-base-300/60 backdrop-blur-sm"
      },
      size: {
        xs: "data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
        sm: "data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5", 
        default: "data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
        lg: "data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5",
        xl: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1"
      },
      spacing: {
        none: "",
        sm: "data-[orientation=horizontal]:my-2 data-[orientation=vertical]:mx-2",
        default: "data-[orientation=horizontal]:my-4 data-[orientation=vertical]:mx-4", 
        lg: "data-[orientation=horizontal]:my-6 data-[orientation=vertical]:mx-6",
        xl: "data-[orientation=horizontal]:my-8 data-[orientation=vertical]:mx-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      spacing: "default"
    }
  }
)

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "neutral" | "ghost" | "dashed" | "dotted" | "gradient" | "glass"
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  spacing?: "none" | "sm" | "default" | "lg" | "xl"
  label?: string
  labelPosition?: "left" | "center" | "right"
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ 
  className, 
  orientation = "horizontal", 
  decorative = true,
  variant = "default",
  size = "default",
  spacing = "default",
  label,
  labelPosition = "center",
  ...props 
}, ref) => {
  // Handle dashed and dotted variants with border instead of background
  const isDashedOrDotted = variant === "dashed" || variant === "dotted"
  const borderClass = isDashedOrDotted 
    ? `border-t ${variant === "dashed" ? "border-dashed" : "border-dotted"} border-base-300`
    : ""

  const separatorElement = (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant, size, spacing }),
        isDashedOrDotted && borderClass,
        className
      )}
      {...props}
    />
  )

  // If no label, return basic separator
  if (!label) {
    return separatorElement
  }

  // Separator with label (only for horizontal orientation)
  if (orientation === "vertical") {
    console.warn("Separator labels are only supported for horizontal orientation")
    return separatorElement
  }

  return (
    <div className={cn(
      "relative flex items-center",
      spacing === "sm" && "my-2",
      spacing === "default" && "my-4", 
      spacing === "lg" && "my-6",
      spacing === "xl" && "my-8"
    )}>
      {/* Left separator (when label is center or right) */}
      {(labelPosition === "center" || labelPosition === "right") && (
        <div className={cn(
          "flex-1",
          separatorVariants({ variant, size, spacing: "none" }),
          isDashedOrDotted && borderClass
        )} />
      )}
      
      {/* Label */}
      <div className={cn(
        "px-3 text-sm text-base-content/60 bg-base-100",
        labelPosition === "left" && "pl-0",
        labelPosition === "right" && "pr-0"
      )}>
        {label}
      </div>
      
      {/* Right separator (when label is center or left) */}
      {(labelPosition === "center" || labelPosition === "left") && (
        <div className={cn(
          "flex-1", 
          separatorVariants({ variant, size, spacing: "none" }),
          isDashedOrDotted && borderClass
        )} />
      )}
    </div>
  )
})

Separator.displayName = "Separator"

// DaisyUI Divider-style component (with text)
export interface DividerProps extends Omit<SeparatorProps, "orientation"> {
  children?: React.ReactNode
  vertical?: boolean
}

const Divider = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  DividerProps
>(({ 
  children, 
  vertical = false,
  variant = "default",
  size = "default",
  className,
  ...props 
}, ref) => {
  if (!children) {
    return (
      <Separator
        ref={ref}
        orientation={vertical ? "vertical" : "horizontal"}
        variant={variant}
        size={size}
        className={className}
        {...props}
      />
    )
  }

  if (vertical) {
    return (
      <div className="flex items-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "h-full w-px",
            separatorVariants({ variant, size, spacing: "none" })
          )} />
          <div className="text-sm text-base-content/60 whitespace-nowrap writing-mode-vertical">
            {children}
          </div>
          <div className={cn(
            "h-full w-px", 
            separatorVariants({ variant, size, spacing: "none" })
          )} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center w-full">
      <div className={cn(
        "flex-1",
        separatorVariants({ variant, size, spacing: "none" })
      )} />
      <div className="px-4 text-sm text-base-content/60 whitespace-nowrap">
        {children}
      </div>
      <div className={cn(
        "flex-1",
        separatorVariants({ variant, size, spacing: "none" })
      )} />
    </div>
  )
})

Divider.displayName = "Divider"

// Section Separator with enhanced styling
export interface SectionSeparatorProps extends SeparatorProps {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

const SectionSeparator: React.FC<SectionSeparatorProps> = ({
  title,
  subtitle, 
  icon,
  variant = "gradient",
  spacing = "lg",
  className,
  ...props
}) => {
  if (!title && !subtitle && !icon) {
    return <Separator variant={variant} spacing={spacing} className={className} {...props} />
  }

  return (
    <div className={cn(
      "relative flex flex-col items-center text-center",
      spacing === "sm" && "my-4",
      spacing === "default" && "my-6", 
      spacing === "lg" && "my-8",
      spacing === "xl" && "my-12"
    )}>
      <Separator variant={variant} spacing="none" className="w-full" {...props} />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
        <div className="bg-base-100 px-4 flex items-center gap-2">
          {icon}
          <div>
            {title && (
              <h3 className="text-sm font-medium text-base-content">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-base-content/60">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Separator, Divider, SectionSeparator }