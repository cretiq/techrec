"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

/**
 * DaisyUI-Native Accordion Component
 * 
 * Strategic Context-Based Variant Mapping:
 * - Maps accordion usage to user intent and UI hierarchy
 * - Uses DaisyUI's out-of-the-box collapse system
 * - Reduces complexity from 20 variants to 8 strategic variants
 * 
 * Based on usage audit findings:
 * - 8/20 variants actually used in production
 * - Primary contexts: FAQ, Settings/Filters, Data Display, Documentation
 */

// Context-driven variant mapping based on user intent
const accordionVariants = {
  // === CONTENT ORGANIZATION (FAQ, Documentation) ===
  default: "collapse bg-base-100 border border-base-300/50 rounded-2xl",
  faq: "collapse bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 rounded-2xl shadow-sm", // FAQ sections
  
  // === SETTINGS & CONTROLS (Filters, Preferences) ===  
  filters: "collapse bg-base-200 border border-base-300 rounded-2xl", // Advanced filters, settings
  compact: "collapse bg-transparent border border-base-300 rounded-lg", // Compact settings sections
  
  // === DATA DISPLAY (Analysis, Results) ===
  elevated: "collapse bg-base-100 border border-base-300/50 rounded-2xl shadow-md", // Important data sections
  glass: "collapse bg-base-100/80 backdrop-blur-sm border border-base-300/50 rounded-2xl", // Overlay data
  
  // === INTERACTIVE CONTENT (Forms, Actions) ===
  interactive: "collapse bg-base-100 border border-primary/30 rounded-2xl hover:border-primary/50 hover:shadow-sm transition-all duration-200", // Interactive forms
  
  // === LEGACY SUPPORT (Backward compatibility) ===
  gradient: "collapse bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 rounded-2xl", // Maps old gradient variants
} as const

type AccordionVariant = keyof typeof accordionVariants

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
  /** Strategic context-based variant */
  variant?: AccordionVariant
  /** DaisyUI collapse icon type */
  icon?: "plus" | "arrow" | "none"
  /** Enable smooth animations */
  animated?: boolean
  /** Open by default */
  defaultOpen?: boolean
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
    defaultOpen = false,
    type,
    isOpen = false,
    onToggle,
    ...props 
  }, ref) => {
    
    // Use local state for defaultOpen behavior
    const [localOpen, setLocalOpen] = React.useState(defaultOpen)
    const actuallyOpen = onToggle ? isOpen : localOpen
    
    // DaisyUI collapse classes with context-based styling
    const collapseClasses = cn(
      accordionVariants[variant],
      icon === "plus" && "collapse-plus",
      icon === "arrow" && "collapse-arrow",
      actuallyOpen && "collapse-open",
      !actuallyOpen && "collapse-close",
      className
    )

    const handleToggle = () => {
      if (onToggle) {
        onToggle(value);
      } else {
        setLocalOpen(!localOpen);
      }
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={collapseClasses}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              if (child.type === AccordionTrigger) {
                return React.cloneElement(child, {
                  onClick: handleToggle,
                  'aria-expanded': actuallyOpen,
                  'aria-controls': `${value}-content`
                });
              }
              if (child.type === AccordionContent) {
                return React.cloneElement(child, {
                  id: `${value}-content`,
                  'aria-labelledby': `${value}-trigger`,
                  isOpen: actuallyOpen
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
                'aria-expanded': actuallyOpen,
                'aria-controls': `${value}-content`
              });
            }
            if (child.type === AccordionContent) {
              return React.cloneElement(child, {
                id: `${value}-content`,
                'aria-labelledby': `${value}-trigger`,
                isOpen: actuallyOpen
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
  Accordion as DaisyAccordion, 
  AccordionItem as DaisyAccordionItem, 
  AccordionTitle as DaisyAccordionTitle, 
  AccordionContent as DaisyAccordionContent, 
  AccordionTrigger as DaisyAccordionTrigger,
  type AccordionVariant
}