// components/roles/EndpointSelector.tsx
"use client"

import React from 'react'
import { useSelector } from 'react-redux'
import { RadioGroup, Radio, Badge } from '@/components/ui-daisy'
import { Calendar, Crown, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { RootState } from '@/lib/store'
import type { SearchParameters } from '@/lib/api/rapidapi-cache'

interface EndpointSelectorProps {
  value: string
  onValueChange: (endpoint: string) => void
  disabled?: boolean
}

interface EndpointOption {
  value: string
  label: string
  description: string
  isPremium: boolean
  pointCost?: number
  badge: {
    text: string
    variant: 'outline' | 'secondary'
  }
}

const EndpointSelector: React.FC<EndpointSelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  // Get user state from Redux for premium feature validation
  const userState = useSelector((state: RootState) => state.user)
  const gamificationState = useSelector((state: RootState) => state.gamification)

  const endpointOptions: EndpointOption[] = [
    {
      value: '7d',
      label: 'Last 7 Days',
      description: 'Broadest selection',
      isPremium: false,
      badge: { text: 'Free', variant: 'outline' }
    },
    {
      value: '24h',
      label: 'Last 24 Hours',
      description: 'Fresh opportunities',
      isPremium: true,
      pointCost: 5,
      badge: { text: '5 pts', variant: 'secondary' }
    },
    {
      value: '1h',
      label: 'Last Hour',
      description: 'Latest postings',
      isPremium: true,
      pointCost: 5,
      badge: { text: '5 pts', variant: 'secondary' }
    }
  ]

  // Check if user is eligible for premium features
  const isEligibleForPremium = () => {
    if (!userState.isAuthenticated) return false
    
    const tier = userState.subscriptionTier
    const eligibleTiers = ['STARTER', 'PRO', 'EXPERT']
    return eligibleTiers.includes(tier)
  }

  // Check if user has sufficient points
  const hasSufficientPoints = (cost: number) => {
    if (!gamificationState.balance) return false
    return gamificationState.balance.available >= cost
  }

  const isOptionDisabled = (option: EndpointOption) => {
    if (disabled) return true
    if (!option.isPremium) return false
    
    if (!isEligibleForPremium()) return true
    if (option.pointCost && !hasSufficientPoints(option.pointCost)) return true
    
    return false
  }

  const getDisabledReason = (option: EndpointOption) => {
    if (!option.isPremium) return null
    if (!userState.isAuthenticated) return 'Sign in required'
    if (!isEligibleForPremium()) return 'Starter tier required'
    if (option.pointCost && !hasSufficientPoints(option.pointCost)) return 'Insufficient points'
    return null
  }

  return (
    <div className="space-y-3" data-testid="endpoint-selector">
      {/* TODO: Job Freshness header temporarily hidden for UI simplicity
          Will be re-added in a future iteration when we want to emphasize 
          this feature more prominently to users */}
      {/* <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Job Freshness</span>
      </div> */}

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        name="endpoint"
        className="space-y-3"
      >
        {/* Free Option */}
        <Radio
          value={endpointOptions[0].value}
          disabled={isOptionDisabled(endpointOptions[0])}
          data-testid={`endpoint-radio-${endpointOptions[0].value}`}
          label={
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{endpointOptions[0].label}</span>
                <Badge variant={endpointOptions[0].badge.variant} className="text-xs">
                  {endpointOptions[0].badge.text}
                </Badge>
              </div>
              <span className="text-xs text-base-content/60">{endpointOptions[0].description}</span>
            </div>
          }
        />

        {/* Premium Options Section */}
        <div className="border-l-2 border-primary/20 pl-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <Crown className="h-3 w-3" />
            <span>Premium Features</span>
          </div>

          {endpointOptions.slice(1).map((option) => {
            const disabledReason = getDisabledReason(option)
            
            return (
              <div key={option.value}>
                <Radio
                  value={option.value}
                  disabled={isOptionDisabled(option)}
                  data-testid={`endpoint-radio-${option.value}`}
                  label={
                    <div className="flex items-center justify-between flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isOptionDisabled(option) ? 'text-base-content/40' : ''}`}>
                          {option.label}
                        </span>
                        <Badge 
                          variant={option.badge.variant} 
                          className={`text-xs ${isOptionDisabled(option) ? 'opacity-50' : ''}`}
                        >
                          {option.badge.text}
                        </Badge>
                        {disabledReason && (
                          <Badge variant="outline" className="text-xs opacity-60">
                            {disabledReason}
                          </Badge>
                        )}
                      </div>
                      <span className={`text-xs ${isOptionDisabled(option) ? 'text-base-content/40' : 'text-base-content/60'}`}>
                        {option.description}
                      </span>
                    </div>
                  }
                />
              </div>
            )
          })}

          {/* Premium Feature Requirements */}
          <Alert className="text-xs">
            <Info className="h-3 w-3" />
            <AlertDescription>
              <div>
                <p className="font-medium">Premium search endpoints require:</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• Starter subscription tier or higher</li>
                  <li>• 5 points per search</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </RadioGroup>
    </div>
  )
}

export default EndpointSelector