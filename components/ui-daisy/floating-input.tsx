"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input, type InputProps } from "./input"
import { Badge } from "./badge"
import { Tooltip } from "./tooltip"

export interface FloatingInputProps extends Omit<InputProps, 'placeholder'> {
  label: string
  error?: string
  helperText?: string
  showStatus?: boolean
  statusVariant?: 'warning' | 'error' | 'success' | 'info'
  statusTooltip?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    showStatus = false,
    statusVariant = 'warning',
    statusTooltip,
    leftIcon,
    rightIcon,
    variant,
    inputSize,
    value,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const hasValue = Boolean(value && value.toString().trim() !== '')
    const isFloated = isFocused || hasValue

    // Determine input variant based on status (keep original variant, don't change border color)
    let inputVariant = variant
    if (error) {
      inputVariant = 'error'
    }
    // Don't change input variant for status - keep status separate

    return (
      <div className="relative">
        <div className="relative flex items-center">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-base-content/60">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            value={value}
            variant={inputVariant}
            inputSize={inputSize}
            className={cn(
              "peer placeholder-transparent pt-7 pb-3 text-base rounded-xl",
              leftIcon && "pl-10",
              (rightIcon || showStatus) && "pr-12",
              className
            )}
            placeholder={label}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* Floating Label */}
          <label 
            className={cn(
              "absolute left-3 transition-all duration-200 ease-out pointer-events-none",
              leftIcon && "left-10",
              isFloated 
                ? "top-1.5 text-xs text-base-content/60" 
                : "top-1/2 -translate-y-1/2 text-base text-base-content/40",
              error && "text-error",
              isFocused && !error && "text-primary"
            )}
          >
            {label}
          </label>

          {/* Status Badge */}
          {showStatus && statusTooltip && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
              <Tooltip content={statusTooltip} position="top">
                <Badge 
                  variant={statusVariant} 
                  size="xs" 
                  dot
                  pulse
                  className="flex-shrink-0"
                />
              </Tooltip>
            </div>
          )}

          {/* Right Icon */}
          {rightIcon && !showStatus && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-base-content/60">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-xs text-error">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-xs text-base-content/60">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }