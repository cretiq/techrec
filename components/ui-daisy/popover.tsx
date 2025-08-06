"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

// Base popover content styles that all variants inherit
const popoverBase = "z-50 w-72 rounded-md border p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"

const popoverVariants = cva(popoverBase, {
  variants: {
    variant: {
      default: "bg-base-100 text-base-content border-base-300",
      // Glass morphism variants
      glass: "bg-base-100/80 backdrop-blur-sm border-base-300/50 text-base-content",
      "glass-dark": "bg-base-300/90 backdrop-blur-lg border-base-100/30 text-base-content",
      // Menu-style variants
      menu: "dropdown-content bg-base-100 border-base-300 shadow-lg",
      // Tooltip-style variants  
      tooltip: "bg-neutral text-neutral-content border-neutral px-3 py-2 text-sm",
    },
    size: {
      sm: "w-56 p-3",
      default: "w-72 p-4",
      md: "w-80 p-4", 
      lg: "w-96 p-6",
      xl: "w-[28rem] p-6",
      auto: "w-auto p-4",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded",
      default: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
  },
})

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
    VariantProps<typeof popoverVariants>
>(({ className, variant, size, rounded, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(popoverVariants({ variant, size, rounded }), className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Specialized popover variants
const PopoverMenu = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    size?: VariantProps<typeof popoverVariants>["size"]
  }
>(({ size = "sm", ...props }, ref) => (
  <PopoverContent ref={ref} variant="menu" size={size} {...props} />
))
PopoverMenu.displayName = "PopoverMenu"

const PopoverTooltip = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ ...props }, ref) => (
  <PopoverContent ref={ref} variant="tooltip" size="auto" {...props} />
))
PopoverTooltip.displayName = "PopoverTooltip"

// PopoverClose component for easy dismissal
const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-sm opacity-70 ring-offset-base-100 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className
    )}
    {...props}
  />
))
PopoverClose.displayName = PopoverPrimitive.Close.displayName

// PopoverArrow component
const PopoverArrow = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Arrow
    ref={ref}
    className={cn("fill-base-100 stroke-base-300", className)}
    {...props}
  />
))
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverMenu,
  PopoverTooltip,
  PopoverClose,
  PopoverArrow,
  popoverVariants,
}