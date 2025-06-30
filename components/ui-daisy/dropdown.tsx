import * as React from "react"
import { cn } from "@/lib/utils"

const Dropdown = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    end?: boolean
    open?: boolean
  }
>(({ className, end = false, open, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "dropdown",
      end && "dropdown-end",
      open && "dropdown-open",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
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

const DropdownContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    align?: "start" | "end"
  }
>(({ className, align, children, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow",
      className
    )}
    {...props}
  >
    {children}
  </ul>
))
DropdownContent.displayName = "DropdownContent"

const DropdownItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    disabled?: boolean
  }
>(({ className, disabled, children, ...props }, ref) => (
  <li ref={ref} className={disabled ? "disabled" : ""}>
    <a
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  </li>
))
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