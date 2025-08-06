"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

// Base overlay styles that all variants inherit
const overlayBase = "fixed inset-0 z-50 transition-all duration-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

const overlayVariants = cva(overlayBase, {
  variants: {
    variant: {
      default: "bg-black/80 backdrop-blur-sm",
      glass: "bg-base-content/20 backdrop-blur-md",
      "glass-dark": "bg-base-content/40 backdrop-blur-lg",
      solid: "bg-base-content",
      none: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof overlayVariants>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(overlayVariants({ variant }), className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// Base content styles that all variants inherit
const contentBase = "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-100 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"

const contentVariants = cva(contentBase, {
  variants: {
    variant: {
      default: "bg-base-100 text-base-content border-base-300",
      modal: "modal-box bg-base-100 text-base-content border-base-300",
      // Glass morphism variants
      glass: "bg-base-100/80 backdrop-blur-sm border-base-300/50 text-base-content",
      "glass-dark": "bg-base-300/90 backdrop-blur-lg border-base-100/30 text-base-content",
      // Gradient variants
      "gradient-subtle": "bg-gradient-to-br from-base-100/95 to-base-200/95 backdrop-blur-sm border-base-300/50",
    },
    size: {
      sm: "max-w-sm",
      default: "max-w-lg",
      md: "max-w-2xl",
      lg: "max-w-4xl", 
      xl: "max-w-6xl",
      full: "max-w-screen-lg w-[95vw]",
      auto: "max-w-fit",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded",
      default: "rounded-lg", 
      md: "rounded-lg",
      lg: "rounded-xl",
      xl: "rounded-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    rounded: "default",
  },
})

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof contentVariants> &
    VariantProps<typeof overlayVariants> & {
      overlayVariant?: VariantProps<typeof overlayVariants>["variant"]
      showClose?: boolean
    }
>(({ className, variant, size, rounded, overlayVariant = "default", showClose = true, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={overlayVariant} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(contentVariants({ variant, size, rounded }), className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-base-100 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-content">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-base-content/70", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Modal variant using DaisyUI modal classes
const Modal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    variant?: "default" | "glass"
  }
>(({ className, open, onOpenChange, variant = "default", children, ...props }, ref) => {
  const handleBackdropClick = () => {
    onOpenChange?.(false)
  }

  if (!open) return null

  return (
    <div className={cn("modal modal-open", className)} {...props}>
      <div 
        className="modal-backdrop" 
        onClick={handleBackdropClick}
        aria-label="Close modal"
      />
      <div 
        ref={ref} 
        className={cn(
          "modal-box relative",
          variant === "glass" && "bg-base-100/80 backdrop-blur-sm border border-base-300/50"
        )}
      >
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={() => onOpenChange?.(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
})
Modal.displayName = "Modal"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Modal,
  contentVariants,
  overlayVariants,
}