"use client"

import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui-daisy/button'
import { Check, ArrowRight } from 'lucide-react'
import { markRoleAsApplied, saveAndMarkRoleAsApplied } from '@/lib/features/savedRolesSlice'
import { useSavedRoleStatus } from '@/hooks/useSavedRoles'
import type { AppDispatch } from '@/lib/store'
import type { Role } from '@/types/role'

interface MarkAsAppliedButtonProps {
  role: Role
  className?: string
  'data-testid'?: string
  onSuccess?: () => void
}

export default function MarkAsAppliedButton({ 
  role, 
  className = "w-full", 
  'data-testid': testId,
  onSuccess
}: MarkAsAppliedButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { data: session } = useSession()
  
  // Use custom hook for clean state management
  const { isApplied, isMarkingAsApplied, isSaved } = useSavedRoleStatus(role.id)
  
  const handleMarkAsApplied = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user) return
    
    try {
      if (isSaved) {
        // Role is already saved, just mark as applied
        await dispatch(markRoleAsApplied({
          roleId: role.id,
          applicationMethod: 'external', // Default to external since most roles use external applications
          jobPostingUrl: role.url || role.applicationInfo?.applicationUrl
        })).unwrap()
      } else {
        // Role is not saved, save it first then mark as applied
        await dispatch(saveAndMarkRoleAsApplied({
          roleData: role,
          applicationMethod: 'external',
          applicationNotes: undefined
        })).unwrap()
      }
      
      // Call success callback if provided
      onSuccess?.()
    } catch (error) {
      console.error('Failed to mark role as applied:', error)
    }
  }, [dispatch, role, isSaved, session?.user, onSuccess])

  // Applied state - show green success button
  if (isApplied) {
    return (
      <Button
        variant="default"
        size="xl"
        disabled={true}
        className={`${className} h-12 text-base font-semibold bg-success hover:bg-success text-success-content border-success opacity-90`}
        leftIcon={<Check className="h-5 w-5" />}
        data-testid={testId ? `${testId}-applied-status` : `mark-applied-button-applied-${role.id}`}
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
      loading={isMarkingAsApplied}
      disabled={!session?.user || isMarkingAsApplied}
      onClick={handleMarkAsApplied}
      className={`${className} h-12 text-base font-semibold`}
      leftIcon={<ArrowRight className="h-5 w-5" />}
      data-testid={testId ? `${testId}-mark-applied` : `mark-applied-button-${role.id}`}
    >
      {isMarkingAsApplied ? 'Marking...' : 'Mark as Applied'}
    </Button>
  )
}