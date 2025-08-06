"use client"

import React, { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui-daisy/button'
import { Check, ArrowRight, X } from 'lucide-react'
import { ConfirmationDialog } from '@/components/ui-daisy/confirmation-dialog'
import type { Role } from '@/types/role'

interface SavedRoleMarkAsAppliedButtonProps {
  role: Role
  isApplied: boolean
  onSuccess: () => void
  className?: string
  'data-testid'?: string
  allowUnApply?: boolean // New prop to enable un-apply functionality
}

export default function SavedRoleMarkAsAppliedButton({ 
  role, 
  isApplied,
  onSuccess,
  className = "w-full", 
  'data-testid': testId,
  allowUnApply = false
}: SavedRoleMarkAsAppliedButtonProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isUnApplying, setIsUnApplying] = useState(false)
  const [showUnApplyDialog, setShowUnApplyDialog] = useState(false)
  
  const handleMarkAsApplied = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user || isLoading || isApplied) return
    
    setIsLoading(true)
    
    try {
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

  const handleUnApply = useCallback(async () => {
    if (!session?.user || isUnApplying) return
    
    setIsUnApplying(true)
    
    try {
      const response = await fetch('/api/developer/me/saved-roles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: role.id,
          action: 'un-apply'
        }),
      })

      if (response.ok) {
        onSuccess() // This will trigger parent to update local state and refresh data
        setShowUnApplyDialog(false)
      } else {
        console.error('Failed to un-apply role:', await response.text())
      }
    } catch (error) {
      console.error('Failed to un-apply role:', error)
    } finally {
      setIsUnApplying(false)
    }
  }, [role.id, session?.user, isUnApplying, onSuccess])

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
          variant="default"
          size="xl"
          disabled={!allowUnApply || isUnApplying}
          loading={isUnApplying}
          onClick={allowUnApply ? handleAppliedButtonClick : undefined}
          className={`${className} h-12 text-base font-semibold bg-success hover:bg-success text-success-content border-success ${
            allowUnApply && !isUnApplying ? 'hover:bg-success/80 cursor-pointer' : 'opacity-90'
          }`}
          leftIcon={isUnApplying ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
          data-testid={testId ? `${testId}-applied-status` : `saved-role-mark-applied-button-applied-${role.id}`}
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