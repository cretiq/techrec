"use client"

import * as React from "react"
import { Badge } from "@/components/ui-daisy/badge"
import { cn } from "@/lib/utils"

export interface SectionBadgeProps {
  children: React.ReactNode
  icon?: React.ReactNode
  variant?: "gradient" | "outline" | "glass" | "primary" | "secondary" | "accent" | "ghost"
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  className?: string
}

export function SectionBadge({ 
  children, 
  icon, 
  variant = "outline", 
  size = "lg",
  className 
}: SectionBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      size={size} 
      className={cn(
        "whitespace-nowrap !inline-flex !items-center !flex-row !gap-2 !justify-center",
        className
      )}
    >
      {icon && (
        <span className="h-4 w-4 flex-shrink-0 !inline-flex !items-center !justify-center">
          {icon}
        </span>
      )}
      <span className="!inline !whitespace-nowrap">{children}</span>
    </Badge>
  )
}