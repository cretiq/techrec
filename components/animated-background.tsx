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

  // Calculate parallax offset for each blob based on scroll
  const blob1Transform = `translate(${scrollY * 0.1}px, ${scrollY * 0.15}px)`
  const blob2Transform = `translate(${scrollY * -0.08}px, ${scrollY * 0.12}px)`
  const blob3Transform = `translate(${scrollY * 0.12}px, ${scrollY * -0.1}px)`

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient that extends full page */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Animated blobs with scroll-based movement */}
      <div 
        className="absolute top-20 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
        style={{ transform: blob1Transform }}
      />
      <div 
        className="absolute top-40 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
        style={{ transform: blob2Transform }}
      />
      <div 
        className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
        style={{ transform: blob3Transform }}
      />
      
      {/* Additional blobs for depth throughout the page */}
      <div 
        className="absolute top-[50vh] left-[60%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"
        style={{ transform: `${blob1Transform} scale(1.2)` }}
      />
      <div 
        className="absolute top-[100vh] right-[20%] w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"
        style={{ transform: `${blob2Transform} scale(0.8)` }}
      />
      <div 
        className="absolute top-[150vh] left-[30%] w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"
        style={{ transform: `${blob3Transform} scale(0.9)` }}
      />
    </div>
  )
}