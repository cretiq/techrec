"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base avatar styles that all variants inherit
const avatarBase = "avatar transition-all duration-200 ease-smooth"

const avatarVariants = cva(avatarBase, {
  variants: {
    variant: {
      default: "",
      placeholder: "placeholder",
      online: "online",
      offline: "offline", 
      // Glass morphism variants
      glass: "ring-2 ring-base-100/30 backdrop-blur-sm",
      "glass-primary": "ring-2 ring-primary/30 backdrop-blur-sm",
      "glass-success": "ring-2 ring-success/30 backdrop-blur-sm",
    },
    size: {
      xs: "w-6 h-6",
      sm: "w-8 h-8",
      default: "w-12 h-12", 
      md: "w-16 h-16",
      lg: "w-20 h-20",
      xl: "w-24 h-24",
      "2xl": "w-32 h-32",
    },
    shape: {
      circle: "rounded-full",
      square: "rounded-none",
      rounded: "rounded-lg",
    },
    ring: {
      none: "",
      sm: "ring-2 ring-base-300",
      default: "ring-4 ring-base-300",
      md: "ring-4 ring-primary",
      lg: "ring-8 ring-primary",
      primary: "ring-4 ring-primary",
      secondary: "ring-4 ring-secondary",
      accent: "ring-4 ring-accent",
      success: "ring-4 ring-success",
      warning: "ring-4 ring-warning",
      error: "ring-4 ring-error",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    shape: "circle", 
    ring: "none",
  },
})

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  animated?: boolean
  hoverable?: boolean
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape, 
    ring,
    src,
    alt,
    fallback,
    animated = false,
    hoverable = false,
    children,
    ...props 
  }, ref) => {
    const avatarClasses = cn(
      avatarVariants({ variant, size, shape, ring }),
      animated && "hover:scale-110 transform-gpu",
      hoverable && "cursor-pointer hover:ring-4 hover:ring-primary/50",
      className
    )

    return (
      <div ref={ref} className={avatarClasses} {...props}>
        <div className="w-full rounded-full overflow-hidden">
          {src ? (
            <img src={src} alt={alt || "Avatar"} className="object-cover w-full h-full" />
          ) : children ? (
            children
          ) : (
            <AvatarFallback fallback={fallback} />
          )}
        </div>
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    fallback?: string
  }
>(({ className, alt, fallback, ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false)

  const handleError = () => {
    setImageError(true)
  }

  if (imageError && fallback) {
    return <AvatarFallback fallback={fallback} />
  }

  return (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    fallback?: string
  }
>(({ className, fallback, children, ...props }, ref) => {
  // Generate initials from fallback text
  const getInitials = (text?: string) => {
    if (!text) return "?"
    return text
      .split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("")
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-base-300 text-base-content font-medium",
        className
      )}
      {...props}
    >
      {children || getInitials(fallback)}
    </div>
  )
})
AvatarFallback.displayName = "AvatarFallback"

// Avatar Group for displaying multiple avatars
const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    max?: number
    spacing?: "tight" | "normal" | "loose"
  }
>(({ className, max = 4, spacing = "normal", children, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  const displayChildren = max ? childrenArray.slice(0, max) : childrenArray
  const remainingCount = childrenArray.length - max

  const spacingClasses = {
    tight: "-space-x-4",
    normal: "-space-x-2", 
    loose: "space-x-1",
  }

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center",
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      {displayChildren}
      {remainingCount > 0 && (
        <Avatar variant="placeholder">
          <AvatarFallback fallback={`+${remainingCount}`} />
        </Avatar>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, avatarVariants }