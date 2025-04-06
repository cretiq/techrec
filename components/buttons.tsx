"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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

export function StartAssessmentButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="gap-2">
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
      Start Assessment
    </Button>
  )
}

export function SubmitSolutionButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="gap-2">
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      Submit Solution
    </Button>
  )
}

export function SaveDraftButton({ onClick, disabled, loading }: ActionButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled || loading} className="gap-2">
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Save Draft
    </Button>
  )
}

export function NavigationButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      <Button className="gap-2">
        Next
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function StatusButtons() {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
      >
        <CheckCircle className="h-4 w-4" />
        Pass
      </Button>
      <Button variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
        <XCircle className="h-4 w-4" />
        Fail
      </Button>
      <Button
        variant="outline"
        className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
      >
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
      <Button size="sm" className="gap-1">
        <Code className="h-4 w-4" />
        Code
      </Button>
    </div>
  )
}

export function CreateAssessmentButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button onClick={onClick} className="gap-2">
      <Plus className="h-4 w-4" />
      Create Assessment
    </Button>
  )
}

export function DeleteButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
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
    <Button className="gap-2">
      <Award className="h-4 w-4" />
      {matchPercentage}% Match
    </Button>
  )
}

export function WarningButton({ onClick, children }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
    >
      <AlertTriangle className="h-4 w-4" />
      {children}
    </Button>
  )
}

export function ExportButton({ onClick, format = "PDF" }: { onClick?: () => void; format?: string }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <Download className="h-4 w-4" />
      Export {format}
    </Button>
  )
}

export function ImportButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="outline" onClick={onClick} className="gap-2">
      <Upload className="h-4 w-4" />
      Import
    </Button>
  )
}

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
    <div className="flex border rounded-md overflow-hidden">
      {options.map((option, index) => (
        <button
          key={index}
          className={`px-4 py-2 text-sm font-medium ${
            selected === index ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
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
        <h3 className="text-lg font-medium mb-4">Primary Action Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <StartAssessmentButton />
          <SubmitSolutionButton />
          <CreateAssessmentButton />
          <Button className="gap-2">
            <Award className="h-4 w-4" />
            View Results
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Secondary Action Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <SaveDraftButton />
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <ExportButton />
          <ImportButton />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Navigation Buttons</h3>
        <NavigationButtons />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Status Buttons</h3>
        <StatusButtons />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Utility Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <ActionButtons />
          <DeleteButton />
          <TimerButton timeRemaining="45:00" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Toggle Buttons</h3>
        <ToggleButton options={["All", "Active", "Completed"]} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Warning and Info Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <WarningButton>End Assessment</WarningButton>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Delete Assessment
          </Button>
          <ExternalLinkButton href="#">Documentation</ExternalLinkButton>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Button States</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button className="gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading
          </Button>
        </div>
      </div>
    </div>
  )
}

