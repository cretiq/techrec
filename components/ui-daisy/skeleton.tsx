"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base skeleton styles that all variants inherit
const skeletonBase = "animate-pulse transition-all duration-200"

const skeletonVariants = cva(skeletonBase, {
  variants: {
    variant: {
      default: "bg-base-300",
      shimmer: "bg-gradient-to-r from-base-300 via-base-200 to-base-300 bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
      wave: "bg-base-300 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-base-100/20 before:to-transparent before:animate-[wave_2s_infinite]",
      // Glass morphism variants
      glass: "bg-base-100/30 backdrop-blur-sm border border-base-300/30",
      "glass-shimmer": "bg-gradient-to-r from-base-100/20 via-base-100/40 to-base-100/20 backdrop-blur-sm border border-base-300/30 bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
    },
    shape: {
      rectangle: "rounded",
      circle: "rounded-full",
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
    },
    size: {
      xs: "h-3 w-16",
      sm: "h-4 w-20",
      default: "h-4 w-24",
      md: "h-5 w-32", 
      lg: "h-6 w-40",
      xl: "h-8 w-48",
    },
  },
  defaultVariants: {
    variant: "default",
    shape: "rectangle",
    size: "default",
  },
})

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof skeletonVariants> & {
      width?: string | number
      height?: string | number
      animated?: boolean
    }
>(({ className, variant, shape, size, width, height, animated = true, style, ...props }, ref) => {
  const customStyle = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  }

  return (
    <div
      ref={ref}
      className={cn(
        skeletonVariants({ variant, shape, size }),
        !animated && "animate-none",
        className
      )}
      style={customStyle}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

// Pre-built skeleton components for common use cases
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    lines?: number
    variant?: VariantProps<typeof skeletonVariants>["variant"]
    lastLineWidth?: string
  }
>(({ className, lines = 3, variant = "default", lastLineWidth = "60%", ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant={variant}
        className="h-4"
        style={{
          width: index === lines - 1 ? lastLineWidth : "100%"
        }}
      />
    ))}
  </div>
))
SkeletonText.displayName = "SkeletonText"

const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: VariantProps<typeof skeletonVariants>["variant"]
    showAvatar?: boolean
    showImage?: boolean
  }
>(({ className, variant = "default", showAvatar = true, showImage = true, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4 p-4", className)} {...props}>
    {showImage && (
      <Skeleton variant={variant} className="h-48 w-full" shape="lg" />
    )}
    <div className="space-y-3">
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant={variant} className="h-12 w-12" shape="circle" />
          <div className="space-y-2 flex-1">
            <Skeleton variant={variant} className="h-4 w-1/4" />
            <Skeleton variant={variant} className="h-3 w-1/6" />
          </div>
        </div>
      )}
      <SkeletonText lines={3} variant={variant} />
    </div>
  </div>
))
SkeletonCard.displayName = "SkeletonCard"

const SkeletonTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    rows?: number
    columns?: number
    variant?: VariantProps<typeof skeletonVariants>["variant"]
    showHeader?: boolean
  }
>(({ className, rows = 5, columns = 4, variant = "default", showHeader = true, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props}>
    <div className="overflow-hidden border border-base-300 rounded-lg">
      {showHeader && (
        <div className="bg-base-200/50 p-4 border-b border-base-300">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant={variant} className="h-4" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-base-300">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  variant={variant} 
                  className="h-4"
                  style={{ 
                    width: Math.random() > 0.3 ? "100%" : `${60 + Math.random() * 40}%` 
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
))
SkeletonTable.displayName = "SkeletonTable"

const SkeletonList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    items?: number
    variant?: VariantProps<typeof skeletonVariants>["variant"]
    showAvatar?: boolean
  }
>(({ className, items = 5, variant = "default", showAvatar = true, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {showAvatar && (
          <Skeleton variant={variant} className="h-10 w-10" shape="circle" />
        )}
        <div className="space-y-2 flex-1">
          <Skeleton variant={variant} className="h-4 w-3/4" />
          <Skeleton variant={variant} className="h-3 w-1/2" />
        </div>
        <Skeleton variant={variant} className="h-8 w-16" />
      </div>
    ))}
  </div>
))
SkeletonList.displayName = "SkeletonList"

// Add keyframes for animations to global CSS or Tailwind config
const skeletonStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes wave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  skeletonVariants,
  skeletonStyles,
}