"use client"

import type React from "react"

import { useState } from "react"
import {  Button  } from '@/components/ui-daisy/button'
import { cn } from '@/lib/utils'
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  Code,
  FileText,
  Eye,
  Award,
  AlertTriangle,
  RefreshCw,
  Send,
  Plus,
  Trash2,
  Download,
  Upload,
  ExternalLink,
} from "lucide-react"

interface ActionButtonProps {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}

// Common props interface for style-first button variants
interface StyleFirstButtonProps {
  loading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

interface BadgeButtonProps extends StyleFirstButtonProps {
  badge?: React.ReactNode
  badgePosition?: 'left' | 'right'
}

// ========== STYLE-FIRST BUTTON VARIANTS ==========

// Utility functions for consistent size handling across all button variants
const getSizeClasses = (size?: string) => size === 'full' ? 'w-full h-full' : ''
const getButtonSize = (size?: string) => size === 'full' ? undefined : size === 'md' ? 'default' : size

export function PrimaryButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="primary"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function SecondaryButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="secondary"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function GhostButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="ghost"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function DestructiveButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="error"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function GlassButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="ghost"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2 backdrop-blur-sm", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function LinkedInButton({ loading, disabled, size, icon, onClick, className, children }: StyleFirstButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  return (
    <Button 
      variant="linkedin"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={icon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

export function BadgeButton({ loading, disabled, size, icon, onClick, className, children, badge, badgePosition = 'left' }: BadgeButtonProps) {
  const sizeClass = getSizeClasses(size)
  const buttonSize = getButtonSize(size)
  
  const leftIcon = badgePosition === 'left' ? badge : icon
  const rightIcon = badgePosition === 'right' ? badge : undefined
  
  return (
    <Button 
      variant="primary"
      size={buttonSize}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      className={cn("gap-2", sizeClass, className)}
    >
      {children}
    </Button>
  )
}

// ========== MIGRATED FEATURE-SPECIFIC BUTTONS (NOW USE STYLE-FIRST VARIANTS) ==========

export function StartAssessmentButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <PrimaryButton 
      onClick={onClick} 
      disabled={disabled} 
      loading={loading} 
      icon={<Play className="h-4 w-4" />}
    >
      Start Assessment
    </PrimaryButton>
  )
}

export function SubmitSolutionButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <PrimaryButton 
      onClick={onClick} 
      disabled={disabled} 
      loading={loading} 
      icon={<Send className="h-4 w-4" />}
    >
      Submit Solution
    </PrimaryButton>
  )
}

export function SaveDraftButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <SecondaryButton 
      onClick={onClick} 
      disabled={disabled} 
      loading={loading} 
      icon={<Save className="h-4 w-4" />}
    >
      Save Draft
    </SecondaryButton>
  )
}

export function NavigationButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      <Button variant="primary" className="gap-2">
        Next
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function StatusButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="success" className="gap-2">
        <CheckCircle className="h-4 w-4" />
        Pass
      </Button>
      <Button variant="error" className="gap-2">
        <XCircle className="h-4 w-4" />
        Fail
      </Button>
      <Button variant="warning" className="gap-2">
        <Clock className="h-4 w-4" />
        Review
      </Button>
    </div>
  )
}

export function ActionButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1">
        <Eye className="h-4 w-4" />
        View
      </Button>
      <Button variant="outline" size="sm" className="gap-1">
        <FileText className="h-4 w-4" />
        Details
      </Button>
      <Button variant="primary" size="sm" className="gap-1">
        <Code className="h-4 w-4" />
        Code
      </Button>
    </div>
  )
}

export function CreateAssessmentButton({ onClick }: { onClick?: () => void }) {
  return (
    <PrimaryButton 
      onClick={onClick} 
      icon={<Plus className="h-4 w-4" />}
    >
      Create Assessment
    </PrimaryButton>
  )
}

export function DeleteButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <DestructiveButton 
      onClick={onClick} 
      disabled={disabled} 
      size="sm"
      icon={<Trash2 className="h-4 w-4" />}
    >
      Delete
    </DestructiveButton>
  )
}

export function TimerButton({ timeRemaining }: { timeRemaining: string }) {
  return (
    <Button variant="outline" size="sm" className="gap-2 cursor-default">
      <Clock className="h-4 w-4" />
      {timeRemaining} remaining
    </Button>
  )
}

export function MatchButton({ matchPercentage }: { matchPercentage: number }) {
  return (
    <PrimaryButton 
      icon={<Award className="h-4 w-4" />}
    >
      {matchPercentage}% Match
    </PrimaryButton>
  )
}

// Create a WarningButton variant for amber-colored warnings
export function WarningButton({ onClick, children }: ActionButtonProps) {
  return (
    <Button 
      variant="warning"
      onClick={onClick}
      leftIcon={<AlertTriangle className="h-4 w-4" />}
      className="gap-2"
    >
      {children}
    </Button>
  )
}

export function ExportButton({ onClick, format = "PDF" }: { onClick?: () => void; format?: string }) {
  return (
    <SecondaryButton 
      onClick={onClick}
      icon={<Download className="h-4 w-4" />}
    >
      Export {format}
    </SecondaryButton>
  )
}

export function ImportButton({ onClick }: { onClick?: () => void }) {
  return (
    <SecondaryButton 
      onClick={onClick}
      icon={<Upload className="h-4 w-4" />}
    >
      Import
    </SecondaryButton>
  )
}

// ========== SPECIALIZED BUTTONS (KEPT AS COMPLEX COMPONENTS) ==========

export function ExternalLinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" className="gap-2">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ExternalLink className="h-4 w-4 ml-1" />
      </a>
    </Button>
  )
}

export function ToggleButton({ options }: { options: string[] }) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="join">
      {options.map((option, index) => (
        <button
          key={index}
          className={`btn join-item ${
            selected === index ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => setSelected(index)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export function ButtonShowcase() {
  return (
    <div className="space-y-8 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-medium mb-4">Style-First Button Variants</h3>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton icon={<Play className="h-4 w-4" />}>Primary Action</PrimaryButton>
          <SecondaryButton icon={<Save className="h-4 w-4" />}>Secondary Action</SecondaryButton>
          <GhostButton icon={<Eye className="h-4 w-4" />}>Ghost Button</GhostButton>
          <DestructiveButton icon={<Trash2 className="h-4 w-4" />}>Delete</DestructiveButton>
          <GlassButton icon={<RefreshCw className="h-4 w-4" />}>Glass Effect</GlassButton>
          <LinkedInButton icon={<ExternalLink className="h-4 w-4" />}>LinkedIn Style</LinkedInButton>
          <BadgeButton badge={<CheckCircle className="h-4 w-4" />}>With Badge</BadgeButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Button Sizes & States</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <PrimaryButton size="sm">Small</PrimaryButton>
          <PrimaryButton size="md">Medium</PrimaryButton>
          <PrimaryButton size="lg">Large</PrimaryButton>
          <PrimaryButton size="xl">Extra Large</PrimaryButton>
          <PrimaryButton loading>Loading</PrimaryButton>
          <PrimaryButton disabled>Disabled</PrimaryButton>
          <PrimaryButton size="full" className="max-w-xs">Full Width</PrimaryButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Legacy Feature-Specific Buttons (Now Using Style-First)</h3>
        <div className="flex flex-wrap gap-4">
          <StartAssessmentButton />
          <SubmitSolutionButton />
          <CreateAssessmentButton />
          <SaveDraftButton />
          <DeleteButton />
          <ExportButton />
          <ImportButton />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Specialized Complex Buttons (Kept as Components)</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Navigation Components</h4>
            <NavigationButtons />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Status Button Groups</h4>
            <StatusButtons />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Action Button Groups</h4>
            <ActionButtons />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Interactive Components</h4>
            <div className="flex flex-wrap gap-4 items-center">
              <TimerButton timeRemaining="45:00" />
              <ToggleButton options={["All", "Active", "Completed"]} />
              <ExternalLinkButton href="#">Documentation</ExternalLinkButton>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Custom Styling Examples</h3>
        <div className="flex flex-wrap gap-4">
          <PrimaryButton className="bg-gradient-to-r from-purple-500 to-pink-500">Custom Gradient</PrimaryButton>
          <SecondaryButton className="border-dashed border-2">Dashed Border</SecondaryButton>
          <GhostButton className="text-green-600 hover:text-green-700">Custom Color</GhostButton>
          <BadgeButton 
            badge={<Award className="h-4 w-4 text-yellow-500" />} 
            badgePosition="right"
            className="min-w-[200px]"
          >
            Right Badge
          </BadgeButton>
        </div>
      </div>
    </div>
  )
}

