import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base switch styling following DaisyUI toggle patterns
const switchBase = "peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:cursor-not-allowed disabled:opacity-50"

// Switch root variants  
const switchVariants = cva(
  switchBase,
  {
    variants: {
      variant: {
        default: "rounded-full bg-base-300 data-[state=checked]:bg-primary",
        primary: "rounded-full bg-base-300 data-[state=checked]:bg-primary",
        secondary: "rounded-full bg-base-300 data-[state=checked]:bg-secondary",
        accent: "rounded-full bg-base-300 data-[state=checked]:bg-accent",
        success: "rounded-full bg-base-300 data-[state=checked]:bg-success",
        warning: "rounded-full bg-base-300 data-[state=checked]:bg-warning",
        error: "rounded-full bg-base-300 data-[state=checked]:bg-error",
        glass: "rounded-full bg-base-300/60 backdrop-blur-sm border border-base-200/50 data-[state=checked]:bg-primary/80 data-[state=checked]:backdrop-blur-sm",
        ios: "rounded-full bg-base-300 data-[state=checked]:bg-success shadow-inner",
        toggle: "rounded-lg bg-base-300 data-[state=checked]:bg-primary",
      },
      size: {
        sm: "h-4 w-7",
        default: "h-6 w-11", 
        lg: "h-7 w-12",
        xl: "h-8 w-14"
      },
      animated: {
        true: "transition-all duration-100 ease-out",
        false: "transition-colors"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: true
    }
  }
)

// Switch thumb variants
const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-base-100 shadow-lg ring-0 transition-transform",
  {
    variants: {
      variant: {
        default: "bg-base-100 data-[state=checked]:bg-base-100",
        primary: "bg-base-100 data-[state=checked]:bg-base-100",
        secondary: "bg-base-100 data-[state=checked]:bg-base-100", 
        accent: "bg-base-100 data-[state=checked]:bg-base-100",
        success: "bg-base-100 data-[state=checked]:bg-base-100",
        warning: "bg-base-100 data-[state=checked]:bg-base-100",
        error: "bg-base-100 data-[state=checked]:bg-base-100",
        glass: "bg-base-100/90 backdrop-blur-sm data-[state=checked]:bg-base-100/90",
        ios: "bg-base-100 data-[state=checked]:bg-base-100 shadow-md",
        toggle: "bg-base-100 data-[state=checked]:bg-base-100 rounded-md",
      },
      size: {
        sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
        default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0", 
        xl: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      },
      animated: {
        true: "transition-transform duration-100 ease-out",
        false: "transition-transform"
      }
    },
    defaultVariants: {
      variant: "default", 
      size: "default",
      animated: true
    }
  }
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "glass" | "ios" | "toggle"
  size?: "sm" | "default" | "lg" | "xl"  
  animated?: boolean
  label?: string
  description?: string
  labelPosition?: "left" | "right"
  showStatus?: boolean
  statusLabels?: { on: string; off: string }
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ 
  className, 
  variant = "default", 
  size = "default",
  animated = true,
  label,
  description,
  labelPosition = "right",
  showStatus = false,
  statusLabels = { on: "On", off: "Off" },
  checked,
  ...props 
}, ref) => {
  const switchElement = (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(switchVariants({ variant, size, animated }), className)}
      checked={checked}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(thumbVariants({ variant, size, animated }))}
      />
    </SwitchPrimitive.Root>
  )

  // If no label, return just the switch
  if (!label && !showStatus) {
    return switchElement
  }

  // Return switch with label and optional status
  return (
    <div className={cn(
      "flex items-center gap-3", 
      labelPosition === "left" && "flex-row-reverse"
    )}>
      {switchElement}
      <div className="flex flex-col">
        {label && (
          <label className="text-sm font-medium text-base-content cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-base-content/60">{description}</p>
        )}
        {showStatus && (
          <span className="text-xs text-base-content/70">
            {checked ? statusLabels.on : statusLabels.off}
          </span>
        )}
      </div>
    </div>
  )
})

Switch.displayName = "Switch"

// iOS-style switch (preset variant)
export interface IOSSwitchProps extends Omit<SwitchProps, "variant"> {}

const IOSSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  IOSSwitchProps
>((props, ref) => (
  <Switch ref={ref} variant="ios" {...props} />
))

IOSSwitch.displayName = "IOSSwitch"

// Toggle-style switch (preset variant)
export interface ToggleSwitchProps extends Omit<SwitchProps, "variant"> {}

const ToggleSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ToggleSwitchProps
>((props, ref) => (
  <Switch ref={ref} variant="toggle" {...props} />
))

ToggleSwitch.displayName = "ToggleSwitch"

// Switch Group for multiple related switches
export interface SwitchGroupProps {
  children: React.ReactNode
  label?: string
  description?: string
  orientation?: "horizontal" | "vertical"
  className?: string
}

const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  label,
  description,
  orientation = "vertical", 
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div>
          <h3 className="text-sm font-medium text-base-content">{label}</h3>
          {description && (
            <p className="text-xs text-base-content/60 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className={cn(
        orientation === "horizontal" 
          ? "flex flex-wrap gap-4" 
          : "flex flex-col space-y-3"
      )}>
        {children}
      </div>
    </div>
  )
}

export { Switch, IOSSwitch, ToggleSwitch, SwitchGroup }