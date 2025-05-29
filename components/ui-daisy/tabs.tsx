"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component")
  }
  return context
}

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    orientation?: "horizontal" | "vertical"
  }
>(({ className, value, defaultValue, onValueChange, orientation = "horizontal", children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div
        ref={ref}
        className={cn(
          "tabs",
          orientation === "vertical" && "tabs-vertical",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "boxed" | "bordered" | "lifted"
  }
>(({ className, variant = "boxed", children, ...props }, ref) => {
  const variantClasses = {
    default: "tabs",
    boxed: "tabs-boxed",
    bordered: "tabs-bordered",
    lifted: "tabs-lifted",
  }

  return (
    <div
      ref={ref}
      className={cn(variantClasses[variant], className)}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
    size?: "xs" | "sm" | "md" | "lg"
  }
>(({ className, value, size, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useTabsContext()
  const isSelected = selectedValue === value

  const sizeClasses = {
    xs: "tab-xs",
    sm: "tab-sm",
    md: "tab-md",
    lg: "tab-lg",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "tab",
        isSelected && "tab-active",
        size && sizeClasses[size],
        className
      )}
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, children, ...props }, ref) => {
  const { value: selectedValue } = useTabsContext()
  const isSelected = selectedValue === value

  if (!isSelected) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("tab-content pt-4", className)}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 