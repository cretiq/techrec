"use client"

import React from 'react'
import { Button } from '@/components/ui-daisy/button'
import { ArrowRight, Zap, ExternalLink, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ApplicationInfo } from '@/types/role'

// LinkedIn Logo Component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

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
  // Detect if this is being used full-width (cover letter mode)
  const isFullWidth = className.includes('w-full')
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
        size={isFullWidth ? "lg" : "sm"} 
        variant="glass-outline"
        disabled 
        leftIcon={<AlertTriangle className={`${isFullWidth ? 'h-5 w-5' : 'h-3 w-3'} flex-shrink-0`} />}
        className={`${isFullWidth ? 'text-base' : 'text-xs'} font-medium ${className}`}
        data-testid={testId || 'application-action-button-disabled'}
      >
        <span className={`${isFullWidth ? 'text-lg' : ''}`}>
          {isFullWidth ? 'Application Link Not Available' : 'Apply Now'}
        </span>
      </Button>
    )
  }

  // Easy Apply button (LinkedIn)
  if (applicationInfo.directApply) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          size={isFullWidth ? "lg" : "sm"}
          variant="linkedin"
          elevation="lg"
          onClick={handleClick}
          disabled={disabled}
          leftIcon={
            <div className={`flex items-center ${isFullWidth ? 'gap-2' : 'gap-1'}`}>
              <LinkedInIcon className={`${isFullWidth ? 'h-5 w-5' : 'h-3 w-3'} flex-shrink-0`} />
              <Zap className={`${isFullWidth ? 'h-5 w-5' : 'h-3 w-3'} flex-shrink-0 group-hover:animate-pulse`} />
            </div>
          }
          rightIcon={isFullWidth ? <ArrowRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" /> : undefined}
          className={`${isFullWidth ? 'text-base' : 'text-xs'} font-medium group ${className}`}
          title="Apply directly through LinkedIn Easy Apply"
          data-testid={testId || 'application-action-button-easy-apply'}
        >
          <span className={`${isFullWidth ? 'text-lg' : ''}`}>
            {isFullWidth ? 'Apply on LinkedIn - Easy Apply' : 'Easy Apply'}
          </span>
        </Button>
      </motion.div>
    )
  }

  // External application button
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        size={isFullWidth ? "lg" : "sm"}
        variant="glass-outline"
        elevation="md"
        onClick={handleClick}
        disabled={disabled}
        leftIcon={<LinkedInIcon className={`${isFullWidth ? 'h-5 w-5' : 'h-3 w-3'} flex-shrink-0`} />}
        rightIcon={<ArrowRight className={`${isFullWidth ? 'h-5 w-5' : 'h-3 w-3'} flex-shrink-0 group-hover:translate-x-0.5 transition-transform`} />}
        className={`${isFullWidth ? 'text-base' : 'text-xs'} font-medium text-[#0077b5] hover:text-[#005885] border-[#0077b5]/30 hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10 group ${className}`}
        title="Apply via LinkedIn (opens in new tab)"
        data-testid={testId || 'application-action-button-external'}
      >
        <span className={`${isFullWidth ? 'text-lg' : ''}`}>
          {isFullWidth ? 'Apply on LinkedIn - External' : 'Apply on LinkedIn'}
        </span>
      </Button>
    </motion.div>
  )
}

export default ApplicationActionButton