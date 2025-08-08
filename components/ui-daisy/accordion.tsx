"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { getAccordionHoverEffect } from "@/lib/hoverSystem"

// Base accordion styles that all variants inherit
const accordionBase = "rounded-2xl transition-all duration-100 ease-smooth p-2 border shadow-xs"

const accordionVariants = {
  // Basic variants without built-in hover effects
  default: `${accordionBase} bg-base-100 border border-base-300 shadow-sm`,
  transparent: `${accordionBase} bg-base-100/80 backdrop-blur-sm border border-base-300/50`,
  glass: `${accordionBase} bg-base-300/60 backdrop-blur-lg border border-base-100/50 shadow-soft`,
  hybrid: `${accordionBase} bg-base-100 border border-brand-sharp`,
  solid: `${accordionBase} bg-base-200 border border-base-300 shadow-sm`,
  outlined: `${accordionBase} bg-transparent border-2 border-base-300`,
  elevated: `${accordionBase} bg-base-100 border border-base-300/50 shadow-md`,
  floating: `${accordionBase} bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
  gradient: `${accordionBase} bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50`,
  gradientMuted: `${accordionBase} bg-gradient-to-br from-base-100/70 to-base-200/40 border border-base-300/30`,
  
  // Interactive variants with built-in hover effects
  'default-interactive': `${accordionBase} bg-base-100 border border-base-300 shadow-sm`,
  'transparent-interactive': `${accordionBase} bg-base-100/80 backdrop-blur-sm border border-base-300/50`,
  'glass-interactive': `${accordionBase} bg-base-300/60 backdrop-blur-lg border border-base-100/50 shadow-soft`,
  'hybrid-interactive': `${accordionBase} bg-base-100 border border-brand-sharp`,
  'solid-interactive': `${accordionBase} bg-base-200 border border-base-300 shadow-sm`,
  'outlined-interactive': `${accordionBase} bg-transparent border-2 border-base-300`,
  'elevated-interactive': `${accordionBase} bg-base-100 border border-base-300/50 shadow-md`,
  'floating-interactive': `${accordionBase} bg-base-100/95 backdrop-blur-md border border-base-300/40 shadow-lg`,
  'gradient-interactive': `${accordionBase} bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50`,
  'gradientMuted-interactive': `${accordionBase} bg-gradient-to-br from-base-100/70 to-base-200/40 border border-base-300/30`,
}

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
  id?: string
  /** Visual style variant. Use '-interactive' suffix for built-in hover effects */
  variant?: keyof typeof accordionVariants
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
        className={cn("space-y-4", className)}
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
    id,
    variant = "default", 
    animated = false,
    type,
    isOpen = false,
    onToggle,
    ...props 
  }, ref) => {
    // Apply hover effects for interactive variants
    const isInteractiveVariant = variant.includes('-interactive')
    
    const accordionClasses = cn(
      accordionVariants[variant],
      // Apply hover effects for interactive variants
      isInteractiveVariant && getAccordionHoverEffect(variant.replace('-interactive', '')),
      "overflow-hidden",
      className
    )

    const handleToggle = () => {
      onToggle?.(value);
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          id={id}
          className={accordionClasses}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          whileHover={undefined}
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
                  style: { display: isOpen ? 'block' : 'none' }
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
        id={id}
        className={accordionClasses}
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
                style: { display: isOpen ? 'block' : 'none' }
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

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps & {
  onClick?: () => void;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}>(
  ({ children, className, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "w-full px-8 py-6 text-left text-lg font-semibold",
          "hover:bg-base-200/50 transition-colors duration-100",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-inset",
          "flex items-center justify-between group",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <svg
          className={cn(
            "h-5 w-5 transition-transform duration-100",
            props['aria-expanded'] ? "rotate-180" : "rotate-0"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps & {
  id?: string;
  'aria-labelledby'?: string;
  style?: React.CSSProperties;
}>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-8 pb-6", className)}
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

export { Accordion, AccordionItem, AccordionTitle, AccordionContent, AccordionTrigger }