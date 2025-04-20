import { FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DeveloperProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <FileText className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              RightHub
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 md:py-10 px-4 md:px-6">
        <div className="flex justify-center items-center h-[70vh]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Loading developer profile...</p>
          </div>
        </div>
      </main>
    </div>
  )
}

