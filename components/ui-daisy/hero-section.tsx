"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  showBlobs?: boolean
  minHeight?: string
  gradient?: "default" | "dark" | "custom"
  customGradient?: string
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ 
    className,
    children,
    showBlobs = true,
    minHeight = "min-h-[calc(100vh-4rem)]",
    gradient = "default",
    customGradient,
    ...props 
  }, ref) => {
    const gradientClass = gradient === "custom" 
      ? customGradient 
      : gradient === "dark" 
        ? "hero-gradient-dark" 
        : "hero-gradient"

    return (
      <section
        ref={ref}
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          minHeight,
          className
        )}
        {...props}
      >
        {/* Animated gradient background */}
        <div className={cn("absolute inset-0", gradientClass)}>
          {showBlobs && (
            <>
              <div className="absolute top-20 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-40 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </>
          )}
        </div>
        
        <div className="container relative z-10 px-4 py-16 md:py-24">
          {children}
        </div>
      </section>
    )
  }
)
HeroSection.displayName = "HeroSection"

export { HeroSection } 