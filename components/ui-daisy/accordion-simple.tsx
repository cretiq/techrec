"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Simplified variant mapping to DaisyUI + Tailwind classes
const accordionVariants = {
  default: "bg-base-100 border border-base-300",
  outlined: "bg-transparent border-2 border-base-300",
  elevated: "bg-base-100 border border-base-300/50 shadow-md",
  glass: "bg-base-300/60 backdrop-blur-lg border border-base-100/50",
  gradient: "bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50"
} as const

interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
  value: string
  /** Visual style variant */
  variant?: keyof typeof accordionVariants
  /** Add plus/minus icon */
  icon?: "plus" | "arrow" | "none"
  animated?: boolean
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className, type = "single", value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
              type,
              value: child.props.value,
              isOpen: type === "multiple" 
                ? Array.isArray(value) && value.includes(child.props.value)
                : value === child.props.value,
              onToggle: (itemValue: string) => {
                if (!onValueChange) return;
                
                if (type === "multiple") {
                  const currentValues = Array.isArray(value) ? value : [];
                  const newValues = currentValues.includes(itemValue)
                    ? currentValues.filter(v => v !== itemValue)
                    : [...currentValues, itemValue];
                  onValueChange(newValues);
                } else {
                  onValueChange(value === itemValue ? "" : itemValue);
                }
              }
            });
          }
          return child;
        })}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps & { 
  type?: "single" | "multiple";
  isOpen?: boolean;
  onToggle?: (value: string) => void;
}>(
  ({ 
    children, 
    className, 
    value, 
    variant = "default", 
    icon = "arrow",
    animated = false,
    type,
    isOpen = false,
    onToggle,
    ...props 
  }, ref) => {
    
    const variantClasses = accordionVariants[variant]
    
    // DaisyUI collapse classes
    const collapseClasses = cn(
      "collapse rounded-2xl",
      icon === "plus" && "collapse-plus",
      icon === "arrow" && "collapse-arrow", 
      isOpen && "collapse-open",
      !isOpen && "collapse-close",
      variantClasses,
      className
    )

    const handleToggle = () => {
      onToggle?.(value);
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={collapseClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (child.type === AccordionTrigger) {
                return React.cloneElement(child, {
                  onClick: handleToggle,
                  'aria-expanded': isOpen,
                  'aria-controls': `${value}-content`
                });
              }
              if (child.type === AccordionContent) {
                return React.cloneElement(child, {
                  id: `${value}-content`,
                  'aria-labelledby': `${value}-trigger`,
                  isOpen
                });
              }
            }
            return child;
          })}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={collapseClasses}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === AccordionTrigger) {
              return React.cloneElement(child, {
                onClick: handleToggle,
                'aria-expanded': isOpen,
                'aria-controls': `${value}-content`
              });
            }
            if (child.type === AccordionContent) {
              return React.cloneElement(child, {
                id: `${value}-content`,
                'aria-labelledby': `${value}-trigger`,
                isOpen
              });
            }
          }
          return child;
        })}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLDivElement, AccordionTriggerProps & {
  onClick?: () => void;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}>(
  ({ children, className, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "collapse-title text-lg font-semibold cursor-pointer",
          "hover:bg-base-200/50 transition-colors duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
          className
        )}
        onClick={onClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps & {
  id?: string;
  'aria-labelledby'?: string;
  isOpen?: boolean;
}>(
  ({ children, className, isOpen, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "collapse-content",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

// Create AccordionTitle alias for AccordionTrigger to maintain compatibility
const AccordionTitle = AccordionTrigger

export { 
  Accordion as SimpleAccordion, 
  AccordionItem as SimpleAccordionItem, 
  AccordionTitle as SimpleAccordionTitle, 
  AccordionContent as SimpleAccordionContent, 
  AccordionTrigger as SimpleAccordionTrigger 
}