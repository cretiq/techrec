"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

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

const tabsListVariants = cva(
  "tabs transition-all duration-200 ease-smooth",
  {
    variants: {
      variant: {
        default: "tabs bg-transparent",
        boxed: "tabs-boxed bg-base-200 p-1 rounded-lg shadow-soft",
        bordered: "tabs-bordered border-b-2 border-base-300/50",
        lifted: "tabs-lifted shadow-medium bg-base-100",
        glass: "bg-base-100/60 backdrop-blur-md border border-base-300/30 rounded-xl p-1 shadow-medium",
        minimal: "tabs border-b border-base-300/30",
        pills: "tabs bg-base-200/50 p-1 rounded-full shadow-soft",
      },
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      }
    },
    defaultVariants: {
      variant: "boxed",
      size: "default",
      fullWidth: false,
    },
  }
)

interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tabsListVariants({ variant, size, fullWidth }), className)}
        role="tablist"
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsList.displayName = "TabsList"

const tabsTriggerVariants = cva(
  "tab relative transition-all duration-200 ease-smooth font-medium hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
  {
    variants: {
      variant: {
        default: "hover:bg-base-200/60",
        boxed: "rounded-md hover:bg-base-300/50 data-[state=active]:bg-primary data-[state=active]:text-primary-content data-[state=active]:shadow-sm",
        bordered: "border-b-2 border-transparent hover:border-primary/50 data-[state=active]:border-primary data-[state=active]:text-primary",
        lifted: "hover:bg-base-200/60 data-[state=active]:bg-base-100 data-[state=active]:text-primary",
        glass: "rounded-lg hover:bg-base-100/60 data-[state=active]:bg-base-100/80 data-[state=active]:text-primary data-[state=active]:shadow-soft",
        minimal: "border-b-2 border-transparent hover:border-primary/30 data-[state=active]:border-primary data-[state=active]:text-primary",
        pills: "rounded-full hover:bg-base-100/60 data-[state=active]:bg-primary data-[state=active]:text-primary-content data-[state=active]:shadow-medium",
      },
      size: {
        xs: "tab-xs text-xs px-3 py-1.5",
        sm: "tab-sm text-sm px-4 py-2", 
        default: "px-6 py-2.5",
        lg: "tab-lg text-lg px-8 py-3",
      }
    },
    defaultVariants: {
      variant: "boxed",
      size: "default",
    },
  }
)

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, variant, size, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext()
    const isSelected = selectedValue === value

    return (
      <motion.button
        ref={ref}
        className={cn(
          tabsTriggerVariants({ variant, size }),
          isSelected && "tab-active",
          className
        )}
        role="tab"
        aria-selected={isSelected}
        data-state={isSelected ? "active" : "inactive"}
        onClick={() => onValueChange(value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {children}
        {isSelected && variant === "minimal" && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            layoutId="activeTab"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  animated?: boolean
  forceMount?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, animated = true, forceMount = false, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isSelected = selectedValue === value

    if (!isSelected && !forceMount) {
      return null
    }

    const content = (
      <div
        ref={ref}
        className={cn("pt-6", className)}
        role="tabpanel"
        aria-hidden={!isSelected}
        data-state={isSelected ? "active" : "inactive"}
        {...props}
      >
        {children}
      </div>
    )

    if (!animated) {
      return content
    }

    return (
      <AnimatePresence mode="wait">
        {isSelected && (
          <motion.div
            key={value}
            ref={ref}
            className={cn("pt-6", className)}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.4, 0, 0.2, 1]
            }}
            {...props}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 