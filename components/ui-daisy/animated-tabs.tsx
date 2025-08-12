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

interface AnimatedTabsProps {
  tabs: TabConfig[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  listClassName?: string
  layoutId?: string
  testId?: string
}

export function AnimatedTabs({
  tabs,
  value,
  onValueChange,
  className,
  listClassName,
  layoutId = "animatedTabBackground",
  testId = "animated-tabs"
}: AnimatedTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.value === value)
  const tabWidth = `calc(${100 / tabs.length}% - ${4 * (tabs.length - 1) / tabs.length}px)`
  const leftPosition = activeIndex >= 0 ? `calc(${(100 / tabs.length) * activeIndex}% + ${activeIndex * 2}px)` : "0px"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-6", className)}
    >
      <Tabs
        value={value}
        onValueChange={onValueChange}
        className="w-full"
      >
        <TabsList 
          variant="glass"
          className={cn(
            "relative grid w-full max-w-2xl mx-auto h-12 bg-base-100/60 backdrop-blur-md border border-base-300/50 rounded-xl p-1.5 shadow-xl items-center place-items-center",
            `grid-cols-${tabs.length}`,
            listClassName
          )}
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
                "relative flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-all duration-100 z-20 h-full min-h-0 py-0 leading-none",
                "data-[state=active]:bg-transparent data-[state=inactive]:bg-transparent hover:bg-transparent",
                tab.disabled 
                  ? "opacity-50 cursor-not-allowed text-base-content/40 hover:text-base-content/40" 
                  : "data-[state=active]:text-white data-[state=inactive]:text-base-content/70 hover:text-base-content"
              )}
              data-testid={tab.testId || `${testId}-trigger-${tab.value}`}
            >
              <tab.icon className="h-4 w-4" />
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
            className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-primary to-secondary rounded-lg shadow-lg z-10"
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
    </motion.div>
  )
}