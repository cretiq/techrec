import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { ReactNode } from "react"

interface FormActionsProps {
  isLoading?: boolean
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  children?: ReactNode
}

export function FormActions({
  isLoading = false,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  children
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-4 pt-4">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="hover:bg-primary/10"
        >
          {cancelLabel}
        </Button>
      )}
      {children}
      <Button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {submitLabel}
      </Button>
    </div>
  )
} 