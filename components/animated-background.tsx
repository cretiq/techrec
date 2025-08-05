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

  // Calculate parallax offset for each blob based on scroll (much slower)
  const blob1Transform = `translate(${scrollY * 0.02}px, ${scrollY * 0.03}px)`
  const blob2Transform = `translate(${scrollY * -0.015}px, ${scrollY * 0.025}px)`
  const blob3Transform = `translate(${scrollY * 0.025}px, ${scrollY * -0.02}px)`

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient that extends full page */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Animated blobs with scroll-based movement */}
      {/* <div 
        className="absolute top-20 -left-4 w-42 h-42 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"
        style={{ transform: blob1Transform }}
      />
      <div 
        className="absolute top-40 -right-4 w-96 h-96 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
        style={{ transform: blob2Transform }}
      />
      <div 
        className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
        style={{ transform: blob3Transform }}
      />
      
      {/* Additional blobs for depth throughout the page */}
      {/* <div 
        className="absolute top-[50vh] left-[60%] w-96 h-96 bg-neutral-200 rounded-full mix-blend-multiply filter blur-xl opacity-90 animate-blob animation-delay-2000"
        style={{ transform: `${blob1Transform} scale(1.2)` }}
      />
      <div 
        className="absolute top-[100vh] right-[20%] w-80 h-80 bg-zinc-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
        style={{ transform: `${blob2Transform} scale(0.8)` }}
      />
      <div 
        className="absolute top-[150vh] left-[30%] w-64 h-64 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-4000"
        style={{ transform: `${blob3Transform} scale(0.9)` }}
      /> */}
    </div>
  )
}