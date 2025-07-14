"use client"

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui-daisy/button'
import { Check, ArrowRight } from 'lucide-react'
import type { Role } from '@/types/role'

interface SavedRoleMarkAsAppliedButtonProps {
  role: Role
  isApplied: boolean
  onSuccess: () => void
  className?: string
  'data-testid'?: string
}

export default function SavedRoleMarkAsAppliedButton({ 
  role, 
  isApplied,
  onSuccess,
  className = "w-full", 
  'data-testid': testId
}: SavedRoleMarkAsAppliedButtonProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleMarkAsApplied = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user || isLoading || isApplied) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/developer/saved-roles/mark-applied', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: role.id,
          applicationMethod: 'external',
          jobPostingUrl: role.url || role.applicationInfo?.applicationUrl
        }),
      })

      if (response.ok) {
        onSuccess() // This will trigger parent to update local state and refresh data
      } else {
        console.error('Failed to mark role as applied:', await response.text())
      }
    } catch (error) {
      console.error('Failed to mark role as applied:', error)
    } finally {
      setIsLoading(false)
    }
  }, [role.id, role.url, role.applicationInfo?.applicationUrl, session?.user, isLoading, isApplied, onSuccess])

  // Applied state - show green success button
  if (isApplied) {
    return (
      <Button
        variant="default"
        size="xl"
        disabled={true}
        className={`${className} h-12 text-base font-semibold bg-success hover:bg-success text-success-content border-success opacity-90`}
        leftIcon={<Check className="h-5 w-5" />}
        data-testid={testId ? `${testId}-applied-status` : `saved-role-mark-applied-button-applied-${role.id}`}
      >
        Applied
      </Button>
    )
  }

  // Default state - show mark as applied button
  return (
    <Button
      variant="default"
      size="xl"
      loading={isLoading}
      disabled={!session?.user || isLoading}
      onClick={handleMarkAsApplied}
      className={`${className} h-12 text-base font-semibold`}
      leftIcon={<ArrowRight className="h-5 w-5" />}
      data-testid={testId ? `${testId}-mark-applied` : `saved-role-mark-applied-button-${role.id}`}
    >
      {isLoading ? 'Marking...' : 'Mark as Applied'}
    </Button>
  )
}