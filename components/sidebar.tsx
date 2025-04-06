"use client"

import Link from "next/link"
import { useState } from "react"
import { Code, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b py-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
                <Code className="h-6 w-6" />
                <span>DevAssess</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <nav className="flex flex-col gap-4 py-6">
              <Link
                href="/features"
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
            </nav>
            <div className="mt-auto border-t py-4 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-30 border-r bg-background">
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Code className="h-6 w-6" />
            <span>DevAssess</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-2 py-6">
          <Link
            href="/features"
            className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
          >
            About
          </Link>
        </nav>
        <div className="mt-auto border-t p-4 flex flex-col gap-2">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="w-full">Sign Up</Button>
          </Link>
        </div>
      </div>
    </>
  )
}

