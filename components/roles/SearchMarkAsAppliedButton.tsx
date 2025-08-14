"use client"

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui-daisy/button'
import { Check, ArrowRight } from 'lucide-react'
import { useSavedRoleStatus } from '@/hooks/useSavedRoles'
import type { Role } from '@/types/role'

interface SearchMarkAsAppliedButtonProps {
  role: Role
  className?: string
  'data-testid'?: string
  onSuccess?: () => void
}

export default function SearchMarkAsAppliedButton({ 
  role, 
  className = "w-full", 
  'data-testid': testId,
  onSuccess
}: SearchMarkAsAppliedButtonProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [localAppliedState, setLocalAppliedState] = useState(false)
  
  // Check if role is already saved and applied in Redux state
  const { isApplied: reduxIsApplied, isSaved } = useSavedRoleStatus(role.id)
  
  // Use local state if we've marked it as applied, otherwise use Redux state
  const isApplied = localAppliedState || reduxIsApplied
  
  const handleMarkAsApplied = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user || isLoading || isApplied) return
    
    setIsLoading(true)
    
    try {
      if (isSaved) {
        // Role is already saved, just mark as applied
        const response = await fetch('/api/developer/me/saved-roles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roleId: role.id,
            action: 'mark-applied',
            applicationMethod: 'external',
            jobPostingUrl: role.url || role.applicationInfo?.applicationUrl
          }),
        });

        if (response.ok) {
          setLocalAppliedState(true)
          onSuccess?.()
        } else {
          console.error('Failed to mark role as applied:', await response.text())
        }
      } else {
        // Role is not saved, save it first then mark as applied
        // First save the role
        const saveResponse = await fetch('/api/developer/me/saved-roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roleData: role }),
        });
        
        if (!saveResponse.ok) {
          console.error('Failed to save role:', await saveResponse.text())
          return
        }
        
        // Then mark it as applied
        const markResponse = await fetch('/api/developer/me/saved-roles', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roleId: role.id,
            action: 'mark-applied',
            applicationMethod: 'external',
            jobPostingUrl: role.url || role.applicationInfo?.applicationUrl
          }),
        });

        if (markResponse.ok) {
          setLocalAppliedState(true)
          onSuccess?.()
        } else {
          console.error('Failed to mark role as applied:', await markResponse.text())
        }
      }
    } catch (error) {
      console.error('Failed to mark role as applied:', error)
    } finally {
      setIsLoading(false)
    }
  }, [role, isSaved, session?.user, isLoading, isApplied, onSuccess])

  // Applied state - show green success button
  if (isApplied) {
    return (
      <Button
        variant="success"
        size="xl"
        disabled={true}
        className={`${className} h-12 text-base font-semibold opacity-90`}
        leftIcon={<Check className="h-5 w-5" />}
        data-testid={testId ? `${testId}-applied-status` : `search-mark-applied-button-applied-${role.id}`}
      >
        Applied
      </Button>
    )
  }

  // Default state - show mark as applied button
  return (
    <Button
      variant="primary"
      size="xl"
      loading={isLoading}
      disabled={!session?.user || isLoading}
      onClick={handleMarkAsApplied}
      className={`${className} h-12 text-base font-semibold`}
      leftIcon={<ArrowRight className="h-5 w-5" />}
      data-testid={testId ? `${testId}-mark-applied` : `search-mark-applied-button-${role.id}`}
    >
      {isLoading ? 'Marking...' : 'Mark as Applied'}
    </Button>
  )
}