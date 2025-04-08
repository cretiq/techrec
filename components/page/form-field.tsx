import { Label } from "@/components/ui/label"
import { ReactNode } from "react"

interface FormFieldProps {
  label: string
  children: ReactNode
  description?: string
  error?: string
  className?: string
}

export function FormField({ label, children, description, error, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
} 