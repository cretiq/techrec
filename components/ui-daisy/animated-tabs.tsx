"use client"

import React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger } from '@/components/ui-daisy/tabs'
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TabConfig {
  value: string
  icon: LucideIcon
  label: string
  shortLabel?: string
  testId?: string
  disabled?: boolean
}

// Base classes - shared foundation for all animated tab variants
const animatedTabsBase = "w-full transition-all duration-100 ease-smooth"

// Object-based variants for optimal performance and maintainability
const animatedTabsVariants = {
  // Basic variants without hover effects
  default: `${animatedTabsBase}`,
  glass: `${animatedTabsBase}`,
  elevated: `${animatedTabsBase}`,
  minimal: `${animatedTabsBase}`,
  outlined: `${animatedTabsBase}`,
  
  // Interactive variants with built-in hover effects
  'default-interactive': `${animatedTabsBase}`,
  'glass-interactive': `${animatedTabsBase}`,
  'elevated-interactive': `${animatedTabsBase}`,
  'minimal-interactive': `${animatedTabsBase}`,
  'outlined-interactive': `${animatedTabsBase}`,
}

// Tab container variants - controls the overall container styling
const tabContainerVariants = {
  default: "max-w-2xl mx-auto h-12 bg-base-100/60 backdrop-blur-md border border-base-300/50 rounded-xl p-1.5 shadow-xl",
  glass: "max-w-2xl mx-auto h-12 bg-base-100/60 backdrop-blur-lg border border-base-300/30 rounded-xl p-1.5 shadow-lg",
  elevated: "max-w-2xl mx-auto h-12 bg-base-100 border border-base-300/50 rounded-xl p-1.5 shadow-md",
  minimal: "max-w-2xl mx-auto h-12 bg-transparent border-b border-base-300/50 p-1.5",
  outlined: "max-w-2xl mx-auto h-12 bg-transparent border-2 border-base-300/50 rounded-xl p-1.5",
}

// Background variants for the animated selection indicator
const backgroundVariants = {
  default: "bg-primary/50 rounded-lg shadow-sm",
  glass: "bg-base-300/80 rounded-lg shadow-sm",
  elevated: "bg-base-300 rounded-lg shadow-md",
  minimal: "bg-base-300 rounded-sm shadow-xs",
  outlined: "bg-base-300 border-2 border-base-300 rounded-lg shadow-sm",
}

// Type for all available animated tabs variants
type AnimatedTabsVariant = keyof typeof animatedTabsVariants

interface AnimatedTabsProps {
  tabs: TabConfig[]
  value: string
  onValueChange: (value: string) => void
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: AnimatedTabsVariant
  size?: "sm" | "default" | "lg"
  /** Enables Framer Motion animations */
  animated?: boolean
  className?: string
  listClassName?: string
  layoutId?: string
  testId?: string
}

// Size variants for different tab sizes
const sizeVariants = {
  sm: {
    container: "h-10 p-1",
    icon: "h-3 w-3",
    text: "text-xs",
    gap: "gap-1.5",
  },
  default: {
    container: "h-12 p-1.5",
    icon: "h-4 w-4",
    text: "text-sm",
    gap: "gap-2",
  },
  lg: {
    container: "h-14 p-2",
    icon: "h-5 w-5", 
    text: "text-base",
    gap: "gap-2.5",
  },
}

export function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  variant = "default",
  size = "default",
  animated = false,
  className,
  listClassName,
  layoutId = "animatedTabBackground",
  testId = "animated-tabs"
}: AnimatedTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.value === value)
  const tabWidth = `calc(${100 / tabs.length}% - ${4 * (tabs.length - 1) / tabs.length}px)`
  const leftPosition = activeIndex >= 0 ? `calc(${(100 / tabs.length) * activeIndex}% + ${activeIndex * 2}px)` : "0px"
  
  const isInteractiveVariant = variant.includes('-interactive')
  const baseVariant = variant.replace('-interactive', '') as keyof typeof tabContainerVariants
  const sizeConfig = sizeVariants[size]

  const containerClasses = cn(
    "relative grid w-full items-center place-items-center",
    tabContainerVariants[baseVariant],
    sizeConfig.container,
    `grid-cols-${tabs.length}`,
    listClassName
  )

  const content = (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn(animatedTabsVariants[variant], className)}
    >
      <TabsList 
        variant="glass"
        className={containerClasses}
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        data-testid={`${testId}-list`}
      >
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            variant="glass"
            className={cn(
              "relative flex items-center justify-center font-medium rounded-lg transition-all duration-100 z-20 h-full min-h-0 py-0 leading-none",
              sizeConfig.gap,
              sizeConfig.text,
              "data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent",
              tab.disabled 
                ? "opacity-50 cursor-not-allowed text-base-content/40 hover:text-base-content/40" 
                : "data-[state=active]:text-white data-[state=inactive]:text-base-content/70 hover:text-base-content"
            )}
            data-testid={tab.testId || `${testId}-trigger-${tab.value}`}
          >
            <tab.icon className={sizeConfig.icon} />
            <span className="hidden sm:inline font-semibold">{tab.label}</span>
            {tab.shortLabel && (
              <span className="sm:hidden font-semibold">{tab.shortLabel}</span>
            )}
            {tab.disabled && (
              <span className="ml-1 text-xs hidden lg:inline">(Coming Soon)</span>
            )}
          </TabsTrigger>
        ))}
        
        {/* Active Tab Background */}
        <motion.div
          layoutId={layoutId}
          className={cn(
            "absolute z-10",
            backgroundVariants[baseVariant],
            size === "sm" ? "top-1 bottom-1" : size === "lg" ? "top-2 bottom-2" : "top-1.5 bottom-1.5"
          )}
          style={{
            width: tabWidth,
            left: leftPosition
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 35,
            duration: 0.25
          }}
        />
      </TabsList>
    </Tabs>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        {content}
      </motion.div>
    )
  }

  return (
    <div className="mb-6">
      {content}
    </div>
  )
}

export { animatedTabsVariants, type AnimatedTabsVariant }