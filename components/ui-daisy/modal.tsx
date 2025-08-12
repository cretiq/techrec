import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"

// Base modal styles that all variants inherit
const modalBase = "rounded-3xl transition-all duration-100 ease-smooth"

const modalVariants = {
  // Basic variants
  default: `${modalBase} bg-base-100 border border-base-300 shadow-lg`,
  transparent: `${modalBase} bg-base-100/95 backdrop-blur-sm border border-base-300/50 shadow-xl`,
  glass: `${modalBase} bg-base-100/80 backdrop-blur-lg border border-base-300/60 shadow-2xl`,
  elevated: `${modalBase} bg-base-100 border border-base-300/50 shadow-2xl`,
  floating: `${modalBase} bg-base-100/98 backdrop-blur-md border border-base-300/40 shadow-2xl`,
  gradient: `${modalBase} bg-gradient-to-br from-base-100 to-base-200 border border-base-300/50 shadow-xl`,
}

// Backdrop variants
const backdropVariants = {
  default: "bg-base-300/40 backdrop-blur-md",
  dark: "bg-black/50 backdrop-blur-sm", 
  light: "bg-white/30 backdrop-blur-lg",
  glass: "bg-base-300/20 backdrop-blur-xl",
}

type ModalVariant = keyof typeof modalVariants
type BackdropVariant = keyof typeof backdropVariants

interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean
  /** Called when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: React.ReactNode
  /** Visual style variant */
  variant?: ModalVariant
  /** Backdrop style variant */
  backdropVariant?: BackdropVariant
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Close on escape key */
  closeOnEscape?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: "max-w-sm w-full",
  md: "max-w-lg w-full", 
  lg: "max-w-2xl w-full",
  xl: "max-w-4xl w-full",
  full: "max-w-none w-full h-full"
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({
  isOpen,
  onClose,
  title,
  children,
  variant = "default",
  backdropVariant = "default", 
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  ...props
}, ref) => {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scrolling
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalClasses = cn(
    modalVariants[variant],
    sizeClasses[size],
    className
  )

  const backdropClasses = cn(
    "fixed inset-0 z-50 flex items-center justify-center p-4",
    "min-h-screen w-screen", // Force full screen dimensions
    backdropVariants[backdropVariant]
  )

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={backdropClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} // Force positioning
        >
          {/* Backdrop click area */}
          <div 
            className="absolute inset-0 w-full h-full"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          
          <motion.div
            ref={ref}
            className={modalClasses}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ position: 'relative', zIndex: 1 }} // Ensure modal is above backdrop
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-base-300/50">
                {title && (
                  <h2 className="text-xl font-semibold text-base-content">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-auto h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Use portal to render at document root, avoiding parent constraints
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return null
})

Modal.displayName = "Modal"

// Modal sub-components for better composition
const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between p-6 border-b border-base-300/50", className)}
    {...props}
  />
))
ModalHeader.displayName = "ModalHeader"

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-xl font-semibold text-base-content", className)}
    {...props}
  />
))
ModalTitle.displayName = "ModalTitle"

const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    {...props}
  />
))
ModalContent.displayName = "ModalContent"

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-end gap-3 p-6 border-t border-base-300/50", className)}
    {...props}
  />
))
ModalFooter.displayName = "ModalFooter"

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter }