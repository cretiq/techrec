"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const featureCardVariants = cva(
  "relative group",
  {
    variants: {
      variant: {
        default: "",
        gradient: "",
      },
      glowColor: {
        violet: "from-violet-600 to-pink-600",
        pink: "from-pink-600 to-rose-600",
        blue: "from-blue-600 to-cyan-600",
        green: "from-green-600 to-emerald-600",
        purple: "from-purple-600 to-pink-600",
        orange: "from-orange-600 to-red-600",
      }
    },
    defaultVariants: {
      variant: "gradient",
      glowColor: "violet",
    },
  }
)

type GlowColor = "violet" | "pink" | "blue" | "green" | "purple" | "orange"

const glowColorMap: Record<GlowColor, string> = {
  violet: "from-violet-600 to-pink-600",
  pink: "from-pink-600 to-rose-600",
  blue: "from-blue-600 to-cyan-600",
  green: "from-green-600 to-emerald-600",
  purple: "from-purple-600 to-pink-600",
  orange: "from-orange-600 to-red-600",
}

const iconColorMap: Record<GlowColor, string> = {
  violet: "from-violet-500 to-violet-600",
  pink: "from-pink-500 to-rose-600",
  blue: "from-blue-500 to-cyan-600",
  green: "from-green-500 to-emerald-600",
  purple: "from-purple-500 to-pink-600",
  orange: "from-orange-500 to-red-600",
}

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof featureCardVariants>, 'glowColor'> {
  icon?: React.ReactNode
  iconClassName?: string
  title: string
  description: string
  showGlow?: boolean
  glowColor?: GlowColor
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    variant, 
    glowColor = "violet",
    icon,
    iconClassName,
    title,
    description,
    showGlow = true,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(featureCardVariants({ variant, glowColor }), className)}
        {...props}
      >
        {showGlow && (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity",
            glowColorMap[glowColor]
          )} />
        )}
        <div className="relative card bg-base-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-100 transform">
          {icon && (
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br",
              iconColorMap[glowColor]
            )}>
              <div className={cn("h-7 w-7 text-white", iconClassName)}>
                {icon}
              </div>
            </div>
          )}
          <h3 className="text-2xl font-bold mb-3 text-base-content">
            {title}
          </h3>
          <p className="text-base-content/80 leading-relaxed">
            {description}
          </p>
          {children}
        </div>
      </div>
    )
  }
)
FeatureCard.displayName = "FeatureCard"

export { FeatureCard, featureCardVariants } 