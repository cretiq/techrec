import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"

const dropdownVariants = cva(
  "dropdown relative",
  {
    variants: {
      end: {
        true: "dropdown-end",
        false: "",
      },
      hover: {
        true: "dropdown-hover",
        false: "",
      }
    },
    defaultVariants: {
      end: false,
      hover: false,
    },
  }
)

interface DropdownProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ className, end, hover, open, onOpenChange, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const controlledOpen = open !== undefined ? open : isOpen

    const handleToggle = React.useCallback(() => {
      const newOpen = !controlledOpen
      if (open === undefined) {
        setIsOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [controlledOpen, open, onOpenChange])

    return (
      <div
        ref={ref}
        className={cn(
          dropdownVariants({ end, hover }),
          controlledOpen && "dropdown-open",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass down the toggle handler to trigger components
            if (child.type === DropdownTrigger) {
              return React.cloneElement(child, {
                ...child.props,
                onClick: handleToggle,
              })
            }
            // Pass down the open state to content components
            if (child.type === DropdownContent) {
              return React.cloneElement(child, {
                ...child.props,
                open: controlledOpen,
              })
            }
          }
          return child
        })}
      </div>
    )
  }
)
Dropdown.displayName = "Dropdown"

const DropdownTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    asChild?: boolean
  }
>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "div"
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      className: cn("btn", className),
      tabIndex: 0,
      role: "button"
    })
  }
  
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("btn", className)}
      tabIndex={0}
      role="button"
      {...props}
    >
      {children}
    </div>
  )
})
DropdownTrigger.displayName = "DropdownTrigger"

const dropdownContentVariants = cva(
  "dropdown-content menu bg-base-100 rounded-xl z-50 min-w-48 p-2 transition-all duration-100 ease-smooth",
  {
    variants: {
      variant: {
        default: "shadow-large border border-base-300/20",
        glass: "bg-base-100/90 backdrop-blur-lg border border-base-300/30 shadow-xl",
        minimal: "shadow-medium border border-base-300/40",
        elevated: "shadow-xl border border-base-300/10",
      },
      size: {  
        sm: "w-40 p-1",
        default: "w-52 p-2",
        lg: "w-64 p-3",
        xl: "w-80 p-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface DropdownContentProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof dropdownContentVariants> {
  align?: "start" | "end"
  open?: boolean
  animated?: boolean
}

const DropdownContent = React.forwardRef<HTMLUListElement, DropdownContentProps>(
  ({ className, variant, size, align, open, animated = true, children, ...props }, ref) => {
    if (!animated) {
      return (
        <ul
          ref={ref}
          className={cn(dropdownContentVariants({ variant, size }), className)}
          {...props}
        >
          {children}
        </ul>
      )
    }

    return (
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={ref}
            className={cn(dropdownContentVariants({ variant, size }), className)}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ 
              duration: 0.15, 
              ease: [0.4, 0, 0.2, 1]
            }}
            {...props}
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
    )
  }
)
DropdownContent.displayName = "DropdownContent"

interface DropdownItemProps extends React.HTMLAttributes<HTMLLIElement> {
  disabled?: boolean
  variant?: "default" | "destructive"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

const DropdownItem = React.forwardRef<HTMLLIElement, DropdownItemProps>(
  ({ 
    className, 
    disabled, 
    variant = "default",
    leftIcon,
    rightIcon,
    asChild = false,
    children, 
    ...props 
  }, ref) => {
    const itemClasses = cn(
      "rounded-lg transition-all duration-150 ease-smooth font-medium",
      "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
      "active:bg-primary/20 active:scale-[0.98]",
      variant === "destructive" && "hover:bg-error/10 hover:text-error focus:bg-error/10 focus:text-error text-error/80",
      disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-inherit",
      className
    )

    if (asChild) {
      return (
        <li ref={ref} className={disabled ? "disabled" : ""}>
          {React.cloneElement(children as React.ReactElement, {
            className: cn(itemClasses, (children as React.ReactElement).props.className)
          })}
        </li>
      )
    }

    return (
      <motion.li 
        ref={ref} 
        className={disabled ? "disabled" : ""}
        whileHover={!disabled ? { x: 2 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
      >
        <a
          className={itemClasses}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          {...props}
        >
          <div className="flex items-center gap-3 w-full">
            {leftIcon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {leftIcon}
              </span>
            )}
            <span className="flex-1 text-left">{children}</span>
            {rightIcon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {rightIcon}
              </span>
            )}
          </div>
        </a>
      </motion.li>
    )
  }
)
DropdownItem.displayName = "DropdownItem"

const DropdownSeparator = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className="menu-title">
    <hr className={cn("my-2", className)} {...props} />
  </li>
))
DropdownSeparator.displayName = "DropdownSeparator"

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
}