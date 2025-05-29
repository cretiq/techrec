"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Shield, 
  Award, 
  Users,
  Zap,
  Heart,
  type LucideIcon 
} from "lucide-react"

// Map of available icons
const iconMap: Record<string, LucideIcon> = {
  checkCircle: CheckCircle,
  star: Star,
  trendingUp: TrendingUp,
  shield: Shield,
  award: Award,
  users: Users,
  zap: Zap,
  heart: Heart,
}

export interface TrustIndicatorItem {
  icon: keyof typeof iconMap
  text: string
  iconColor?: string
}

export interface TrustIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TrustIndicatorItem[]
}

const TrustIndicator = React.forwardRef<HTMLDivElement, TrustIndicatorProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400",
          className
        )}
        {...props}
      >
        {items.map((item, index) => {
          const Icon = iconMap[item.icon]
          if (!Icon) return null
          
          return (
            <div key={index} className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", item.iconColor)} />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    )
  }
)
TrustIndicator.displayName = "TrustIndicator"

export { TrustIndicator } 