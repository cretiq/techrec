import { Loader2 } from "lucide-react"

export default function EditAssessmentLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        </div>
      </header>
      <main className="flex-1 container py-6 md:py-10 px-4 md:px-6">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading assessment...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

