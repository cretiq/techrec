"use client"

import React from 'react'
import { Badge } from '@/components/ui-daisy/badge'
import { ExternalLink, Zap } from 'lucide-react'
import type { ApplicationInfo } from '@/types/role'

interface ApplicationBadgeProps {
  applicationInfo: ApplicationInfo
  className?: string
  'data-testid'?: string
}

export const ApplicationBadge: React.FC<ApplicationBadgeProps> = ({
  applicationInfo,
  className = '',
  'data-testid': testId
}) => {
  if (applicationInfo.directApply) {
    return (
      <Badge
        variant="default"
        className={`bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 transition-colors ${className}`}
        data-testid={testId || 'application-badge-easy-apply'}
      >
        <Zap className="mr-1 h-3 w-3" />
        Easy Apply
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={`border-blue-500/30 text-blue-700 hover:bg-blue-500/10 transition-colors ${className}`}
      data-testid={testId || 'application-badge-external'}
    >
      <ExternalLink className="mr-1 h-3 w-3" />
      External
    </Badge>
  )
}

export default ApplicationBadge