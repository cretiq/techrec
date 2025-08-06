"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  AlertCircle,
  X 
} from "lucide-react"

// Base alert styles that all variants inherit
const alertBase = "alert transition-all duration-200 ease-smooth"

const alertVariants = cva(alertBase, {
  variants: {
    variant: {
      default: "alert-info",
      info: "alert-info",
      success: "alert-success",
      warning: "alert-warning", 
      error: "alert-error",
      // Glass morphism variants
      glass: "bg-base-100/60 backdrop-blur-sm border border-base-300/50 text-base-content",
      "glass-info": "bg-info/10 backdrop-blur-sm border border-info/30 text-info",
      "glass-success": "bg-success/10 backdrop-blur-sm border border-success/30 text-success",
      "glass-warning": "bg-warning/10 backdrop-blur-sm border border-warning/30 text-warning",
      "glass-error": "bg-error/10 backdrop-blur-sm border border-error/30 text-error",
      // Gradient variants
      "gradient-info": "bg-gradient-to-r from-info/20 to-cyan-500/20 border border-info/30 text-info",
      "gradient-success": "bg-gradient-to-r from-success/20 to-emerald-500/20 border border-success/30 text-success",
      "gradient-warning": "bg-gradient-to-r from-warning/20 to-orange-500/20 border border-warning/30 text-warning",
      "gradient-error": "bg-gradient-to-r from-error/20 to-red-500/20 border border-error/30 text-error",
    },
    size: {
      sm: "text-sm p-3",
      default: "text-base p-4",
      lg: "text-lg p-6",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded",
      default: "rounded-lg", 
      md: "rounded-lg",
      lg: "rounded-xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
  },
})

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle, 
  error: XCircle,
  glass: Info,
  "glass-info": Info,
  "glass-success": CheckCircle,
  "glass-warning": AlertTriangle,
  "glass-error": XCircle,
  "gradient-info": Info,
  "gradient-success": CheckCircle,
  "gradient-warning": AlertTriangle,
  "gradient-error": XCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }> | boolean
  dismissible?: boolean
  onDismiss?: () => void
  animated?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = "default", 
    size, 
    rounded,
    title,
    description,
    icon = true,
    dismissible = false,
    onDismiss,
    animated = false,
    children,
    ...props 
  }, ref) => {
    const [dismissed, setDismissed] = React.useState(false)
    
    const handleDismiss = () => {
      setDismissed(true)
      onDismiss?.()
    }

    const alertClasses = cn(
      alertVariants({ variant, size, rounded }),
      animated && "animate-in slide-in-from-top-2 fade-in-0",
      dismissed && "animate-out slide-out-to-top-2 fade-out-0",
      className
    )

    const IconComponent = typeof icon === "boolean" ? (icon ? iconMap[variant] : null) : icon

    if (dismissed) return null

    return (
      <div ref={ref} className={alertClasses} {...props}>
        {IconComponent && (
          <IconComponent className="h-5 w-5 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle>{title}</AlertTitle>
          )}
          {description && (
            <AlertDescription>{description}</AlertDescription>
          )}
          {children}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-medium leading-none tracking-tight mb-1", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Alert variants for common use cases
const AlertDestructive = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="error" {...props} />
)
AlertDestructive.displayName = "AlertDestructive"

const AlertSuccess = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="success" {...props} />
)
AlertSuccess.displayName = "AlertSuccess"

const AlertWarning = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="warning" {...props} />
)
AlertWarning.displayName = "AlertWarning"

const AlertInfo = React.forwardRef<HTMLDivElement, Omit<AlertProps, 'variant'>>(
  (props, ref) => <Alert ref={ref} variant="info" {...props} />
)
AlertInfo.displayName = "AlertInfo"

export { 
  Alert, 
  AlertTitle, 
  AlertDescription,
  AlertDestructive,
  AlertSuccess,
  AlertWarning,
  AlertInfo,
  alertVariants 
}