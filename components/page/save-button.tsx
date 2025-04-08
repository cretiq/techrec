import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"

interface SaveButtonProps {
  isLoading?: boolean
  onClick: () => void
  label?: string
  className?: string
}

export function SaveButton({
  isLoading = false,
  onClick,
  label = "Save",
  className = ""
}: SaveButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {label}
    </Button>
  )
} 