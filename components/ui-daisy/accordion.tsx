"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface AccordionProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "arrow" | "plus"
  grouped?: boolean
}

interface AccordionItemProps {
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
  name?: string
}

interface AccordionTitleProps {
  children: React.ReactNode
  className?: string
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className, variant = "plus", grouped = true, ...props }, ref) => {
    const baseClasses = grouped ? "join join-vertical w-full" : "space-y-2"
    
    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
              variant,
              grouped,
              name: child.props.name || `accordion-group`
            })
          }
          return child
        })}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps & { variant?: string; grouped?: boolean }>(
  ({ children, className, defaultOpen = false, name, variant = "plus", grouped = true, ...props }, ref) => {
    const baseClasses = cn(
      "collapse",
      {
        "collapse-arrow": variant === "arrow",
        "collapse-plus": variant === "plus",
        "join-item": grouped,
        "border border-base-300": !grouped,
        "bg-base-100": true
      }
    )

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      >
        <input 
          type="radio" 
          name={name}
          defaultChecked={defaultOpen}
        />
        {children}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTitle = React.forwardRef<HTMLDivElement, AccordionTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("collapse-title text-lg font-semibold", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionTitle.displayName = "AccordionTitle"

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("collapse-content", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTitle, AccordionContent }