"use client"

import React from 'react'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'destructive' | 'warning'
  isLoading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  isLoading = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconColor: 'text-error',
          confirmButtonClass: 'btn-error'
        }
      case 'warning':
        return {
          iconColor: 'text-warning',
          confirmButtonClass: 'btn-warning'
        }
      default:
        return {
          iconColor: 'text-info',
          confirmButtonClass: 'btn-primary'
        }
    }
  }

  const { iconColor, confirmButtonClass } = getVariantStyles()

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        {/* Dialog */}
        <div 
          className="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-6 pb-4">
            <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-base-content/70">{message}</p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 pt-4 border-t border-base-300">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className={confirmButtonClass}
              onClick={onConfirm}
              loading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}