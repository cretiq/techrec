"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function AnimatedBackground() {
  const [scrollY, setScrollY] = React.useState(0)
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Calculate parallax offset for dot pattern based on scroll
  const dotPatternTransform = `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)`

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Enhanced gradient background - light and dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-base-300 dark:via-base-200 dark:to-base-300" />
      
      {/* Animated dot pattern overlay with parallax */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{ transform: dotPatternTransform }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(139, 92, 246, 0.15) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.15) 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      {/* Secondary dot pattern for depth */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{ transform: `translate(${scrollY * -0.08}px, ${scrollY * 0.03}px)` }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50px 50px, rgba(168, 85, 247, 0.1) 1px, transparent 0)`,
          backgroundSize: '150px 150px'
        }} />
      </div>
      
      {/* Bottom gradient fade for content transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-violet-50/60 to-transparent dark:from-base-300/60 pointer-events-none" />
      
      {/* Top subtle fade */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-violet-50/40 to-transparent dark:from-base-300/40 pointer-events-none" />
    </div>
  )
}