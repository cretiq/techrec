"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui-daisy/card'
import { Badge } from '@/components/ui-daisy/badge'
import { Button } from '@/components/ui-daisy/button'
import { User, Mail, ExternalLink, Users } from 'lucide-react'
import type { ApplicationInfo } from '@/types/role'

interface RecruiterCardProps {
  applicationInfo: ApplicationInfo
  className?: string
  'data-testid'?: string
}

export const RecruiterCard: React.FC<RecruiterCardProps> = ({
  applicationInfo,
  className = '',
  'data-testid': testId
}) => {
  const { recruiter, hiringManager } = applicationInfo

  // Don't render if no contact information is available
  if (!recruiter && !hiringManager) {
    return null
  }

  return (
    <Card className={`bg-base-100/60 backdrop-blur-sm border border-base-200 ${className}`} data-testid={testId || 'recruiter-card'}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Contact Information</span>
        </div>

        {/* Recruiter Information */}
        {recruiter && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recruiter</span>
            </div>
            <div className="pl-5 space-y-1">
              <div className="text-sm font-medium">{recruiter.name}</div>
              <div className="text-xs text-muted-foreground">{recruiter.title}</div>
              {recruiter.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(recruiter.url, '_blank', 'noopener,noreferrer')
                  }}
                  data-testid="recruiter-card-button-contact-recruiter"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Contact
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Hiring Manager Information */}
        {hiringManager && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Hiring Manager</span>
              <Badge variant="secondary" className="text-xs">AI</Badge>
            </div>
            <div className="pl-5 space-y-1">
              <div className="text-sm font-medium">{hiringManager.name}</div>
              {hiringManager.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`mailto:${hiringManager.email}`, '_blank')
                  }}
                  data-testid="recruiter-card-button-email-hiring-manager"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecruiterCard