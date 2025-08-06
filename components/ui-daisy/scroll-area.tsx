"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Base scroll area styles that all variants inherit
const scrollAreaBase = "relative overflow-hidden"

const scrollAreaVariants = cva(scrollAreaBase, {
  variants: {
    variant: {
      default: "",
      // Glass morphism variants
      glass: "bg-base-100/60 backdrop-blur-sm border border-base-300/50 rounded-lg",
      "glass-dark": "bg-base-300/80 backdrop-blur-lg border border-base-100/30 rounded-lg",
      // Styled variants
      bordered: "border border-base-300 rounded-lg",
      card: "bg-base-100 border border-base-300 rounded-lg shadow-sm",
    },
    size: {
      sm: "h-32",
      default: "h-64",
      md: "h-80",
      lg: "h-96", 
      xl: "h-[32rem]",
      full: "h-full",
      auto: "h-auto",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> &
    VariantProps<typeof scrollAreaVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(scrollAreaVariants({ variant, size }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

// Base scrollbar styles that all variants inherit
const scrollBarBase = "flex touch-none select-none transition-colors"

const scrollBarVariants = cva(scrollBarBase, {
  variants: {
    variant: {
      default: "bg-base-200/50 hover:bg-base-200/80",
      primary: "bg-primary/20 hover:bg-primary/40",
      glass: "bg-base-100/30 backdrop-blur-sm hover:bg-base-100/50",
      thin: "bg-base-300/50 hover:bg-base-300/80",
    },
    orientation: {
      vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
      horizontal: "h-2.5 w-full border-t border-t-transparent p-[1px]",
    },
  },
  defaultVariants: {
    variant: "default",
    orientation: "vertical",
  },
})

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> &
    VariantProps<typeof scrollBarVariants>
>(({ className, orientation = "vertical", variant, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollBarVariants({ variant, orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-base-content/20 hover:bg-base-content/30 transition-colors" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

// Specialized scroll area variants
const ScrollAreaCard = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    size?: VariantProps<typeof scrollAreaVariants>["size"]
  }
>(({ size = "default", ...props }, ref) => (
  <ScrollArea ref={ref} variant="card" size={size} {...props} />
))
ScrollAreaCard.displayName = "ScrollAreaCard"

const ScrollAreaGlass = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    size?: VariantProps<typeof scrollAreaVariants>["size"]
  }
>(({ size = "default", ...props }, ref) => (
  <ScrollArea ref={ref} variant="glass" size={size} {...props} />
))
ScrollAreaGlass.displayName = "ScrollAreaGlass"

// Horizontal scroll area
const HorizontalScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> &
    VariantProps<typeof scrollAreaVariants>
>(({ className, variant, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(scrollAreaVariants({ variant }), "w-full", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      <div className="flex space-x-4 pb-4">
        {children}
      </div>
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
HorizontalScrollArea.displayName = "HorizontalScrollArea"

export {
  ScrollArea,
  ScrollBar,
  ScrollAreaCard,
  ScrollAreaGlass,
  HorizontalScrollArea,
  scrollAreaVariants,
  scrollBarVariants,
}