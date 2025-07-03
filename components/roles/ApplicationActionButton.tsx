"use client"

import React from 'react'
import { Button } from '@/components/ui-daisy/button'
import { ArrowRight, Zap, ExternalLink, AlertTriangle } from 'lucide-react'
import type { ApplicationInfo } from '@/types/role'

interface ApplicationActionButtonProps {
  applicationInfo: ApplicationInfo
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

export const ApplicationActionButton: React.FC<ApplicationActionButtonProps> = ({
  applicationInfo,
  disabled = false,
  className = '',
  'data-testid': testId
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!applicationInfo.applicationUrl) {
      return
    }

    // Open in new tab for external links
    window.open(applicationInfo.applicationUrl, '_blank', 'noopener,noreferrer')
  }

  // If no application URL is available
  if (!applicationInfo.applicationUrl) {
    return (
      <Button 
        size="sm" 
        disabled 
        className={`text-xs px-3 ${className}`}
        data-testid={testId || 'application-action-button-disabled'}
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        Apply Now
      </Button>
    )
  }

  // Easy Apply button (LinkedIn)
  if (applicationInfo.directApply) {
    return (
      <Button
        size="sm"
        variant="default"
        onClick={handleClick}
        disabled={disabled}
        className={`text-xs px-3 bg-green-500 hover:bg-green-600 border-green-500 ${className}`}
        title="Apply directly through LinkedIn Easy Apply"
        data-testid={testId || 'application-action-button-easy-apply'}
      >
        <Zap className="h-3 w-3 mr-1" />
        Easy Apply
      </Button>
    )
  }

  // External application button
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={disabled}
      className={`text-xs px-3 ${className}`}
      title="Apply on company website (opens in new tab)"
      data-testid={testId || 'application-action-button-external'}
    >
      Apply Externally
      <ArrowRight className="h-3 w-3 ml-1" />
    </Button>
  )
}

export default ApplicationActionButton