import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base slider track styling
const sliderBase = "relative flex w-full touch-none select-none items-center cursor-pointer"

// Track variants following DaisyUI range component patterns  
const trackVariants = cva(
  "relative h-2 w-full grow overflow-hidden rounded-full bg-base-300",
  {
    variants: {
      variant: {
        default: "bg-base-300",
        primary: "bg-primary/20",
        secondary: "bg-secondary/20", 
        accent: "bg-accent/20",
        success: "bg-success/20",
        warning: "bg-warning/20",
        error: "bg-error/20",
        glass: "bg-base-300/60 backdrop-blur-sm border border-base-200/50"
      },
      size: {
        sm: "h-1",
        default: "h-2", 
        lg: "h-3",
        xl: "h-4"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

// Range (filled portion) variants
const rangeVariants = cva(
  "absolute h-full rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        primary: "bg-primary",
        secondary: "bg-secondary",
        accent: "bg-accent", 
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        glass: "bg-primary/80 backdrop-blur-sm"
      },
      animated: {
        true: "transition-all duration-100 ease-out",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      animated: true
    }
  }
)

// Thumb (handle) variants
const thumbVariants = cva(
  "block rounded-full border-2 bg-base-100 ring-offset-base-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-primary hover:bg-base-200",
        primary: "border-primary hover:bg-primary/10",
        secondary: "border-secondary hover:bg-secondary/10", 
        accent: "border-accent hover:bg-accent/10",
        success: "border-success hover:bg-success/10",
        warning: "border-warning hover:bg-warning/10",
        error: "border-error hover:bg-error/10",
        glass: "border-primary/60 bg-base-100/80 backdrop-blur-sm hover:bg-base-100"
      },
      size: {
        sm: "h-3 w-3",
        default: "h-5 w-5",
        lg: "h-6 w-6", 
        xl: "h-7 w-7"
      },
      interactive: {
        true: "hover:scale-110 active:scale-95 cursor-grab active:cursor-grabbing",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: true
    }
  }
)

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof trackVariants> {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "glass"
  size?: "sm" | "default" | "lg" | "xl"
  interactive?: boolean
  animated?: boolean
  showValue?: boolean
  valueFormatter?: (value: number) => string
  label?: string
  description?: string
  marks?: Array<{ value: number; label?: string }>
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ 
  className, 
  variant = "default",
  size = "default", 
  interactive = true,
  animated = true,
  showValue = false,
  valueFormatter = (value) => value.toString(),
  label,
  description,
  marks = [],
  ...props 
}, ref) => {
  const currentValue = props.value?.[0] || props.defaultValue?.[0] || 0

  return (
    <div className="w-full space-y-2">
      {/* Label and Value Display */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-base-content">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-base-content/70">
              {valueFormatter(currentValue)}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-base-content/60">{description}</p>
      )}

      {/* Slider Component */}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(sliderBase, className)}
        {...props}
      >
        <SliderPrimitive.Track 
          className={cn(trackVariants({ variant, size }))}
        >
          <SliderPrimitive.Range 
            className={cn(rangeVariants({ variant, animated }))} 
          />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb 
          className={cn(thumbVariants({ variant, size, interactive }))}
        />
      </SliderPrimitive.Root>

      {/* Marks */}
      {marks.length > 0 && (
        <div className="relative">
          <div className="flex justify-between text-xs text-base-content/60">
            {marks.map((mark, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-px h-2 bg-base-300 mb-1" />
                {mark.label && <span>{mark.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

Slider.displayName = "Slider"

// Range Slider Component (dual thumbs)
export interface RangeSliderProps extends SliderProps {
  value?: [number, number]
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, variant, size, interactive = true, animated = true, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderBase, className)}
    {...props}
  >
    <SliderPrimitive.Track className={cn(trackVariants({ variant, size }))}>
      <SliderPrimitive.Range className={cn(rangeVariants({ variant, animated }))} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(thumbVariants({ variant, size, interactive }))} />
    <SliderPrimitive.Thumb className={cn(thumbVariants({ variant, size, interactive }))} />
  </SliderPrimitive.Root>
))

RangeSlider.displayName = "RangeSlider"

// Vertical Slider Component  
export interface VerticalSliderProps extends SliderProps {
  orientation: "vertical"
  height?: string | number
}

const VerticalSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  VerticalSliderProps
>(({ className, variant, size, height = "200px", interactive = true, animated = true, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation="vertical"
    className={cn("flex h-full w-5 flex-col items-center justify-center touch-none select-none", className)}
    style={{ height }}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative w-2 grow overflow-hidden rounded-full bg-base-300",
      variant === "glass" && "bg-base-300/60 backdrop-blur-sm border border-base-200/50"
    )}>
      <SliderPrimitive.Range className={cn(rangeVariants({ variant, animated }))} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(thumbVariants({ variant, size, interactive }))} />
  </SliderPrimitive.Root>
))

VerticalSlider.displayName = "VerticalSlider"

export { Slider, RangeSlider, VerticalSlider }