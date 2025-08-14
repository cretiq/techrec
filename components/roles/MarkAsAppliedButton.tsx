"use client"

import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui-daisy/button'
import { Check, ArrowRight, X } from 'lucide-react'
import { markRoleAsApplied, saveAndMarkRoleAsApplied, unApplyRole } from '@/lib/features/savedRolesSlice'
import { useSavedRoleStatus } from '@/hooks/useSavedRoles'
import { ConfirmationDialog } from '@/components/ui-daisy/confirmation-dialog'
import { cn } from '@/lib/utils'
import type { AppDispatch } from '@/lib/store'
import type { Role } from '@/types/role'

interface MarkAsAppliedButtonProps {
  role: Role
  className?: string
  'data-testid'?: string
  onSuccess?: () => void
  allowUnApply?: boolean // New prop to enable un-apply functionality
}

export default function MarkAsAppliedButton({ 
  role, 
  className = "w-full", 
  'data-testid': testId,
  onSuccess,
  allowUnApply = false
}: MarkAsAppliedButtonProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { data: session } = useSession()
  const [showUnApplyDialog, setShowUnApplyDialog] = useState(false)
  
  // Use custom hook for clean state management
  const { isApplied, isMarkingAsApplied, isUnApplying, isSaved } = useSavedRoleStatus(role.id)
  
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

  const handleUnApply = useCallback(async () => {
    if (!session?.user) return
    
    try {
      await dispatch(unApplyRole({
        roleId: role.id,
        keepNotes: true // Keep application notes by default
      })).unwrap()
      
      // Call success callback if provided
      onSuccess?.()
      
      // Close the confirmation dialog
      setShowUnApplyDialog(false)
    } catch (error) {
      console.error('Failed to un-apply role:', error)
      // Keep dialog open on error so user can try again
    }
  }, [dispatch, role.id, session?.user, onSuccess])

  const handleAppliedButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (allowUnApply && !isUnApplying) {
      setShowUnApplyDialog(true)
    }
  }, [allowUnApply, isUnApplying])

  // Applied state - show green success button
  if (isApplied) {
    return (
      <>
        <Button
          variant="success"
          size="lg"
          disabled={!allowUnApply || isUnApplying}
          loading={isUnApplying}
          onClick={allowUnApply ? handleAppliedButtonClick : undefined}
          className={cn(className)}
          leftIcon={isUnApplying ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
          data-testid={testId ? `${testId}-applied-status` : `mark-applied-button-applied-${role.id}`}
        >
          {isUnApplying ? 'Removing...' : 'Applied'}
        </Button>
        
        {/* Un-apply confirmation dialog */}
        <ConfirmationDialog
          isOpen={showUnApplyDialog}
          title="Remove Application Status?"
          message="This will mark the role as not applied. Your application notes will be kept, and you can re-apply later if needed."
          confirmText="Remove Application"
          cancelText="Keep Application"
          onConfirm={handleUnApply}
          onCancel={() => setShowUnApplyDialog(false)}
          variant="warning"
          isLoading={isUnApplying}
        />
      </>
    )
  }

  // Default state - show mark as applied button
  return (
    <Button
      variant="accent"
      size="lg"
      loading={isMarkingAsApplied}
      disabled={!session?.user || isMarkingAsApplied}
      onClick={handleMarkAsApplied}
      className={cn(className, "")}
      leftIcon={<ArrowRight className="h-5 w-5" />}
      data-testid={testId ? `${testId}-mark-applied` : `mark-applied-button-${role.id}`}
    >
      {isMarkingAsApplied ? 'Marking...' : 'Mark as Applied'}
    </Button>
  )
}