"use client"

import { useState } from "react"
import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen} data-testid="nav-mobile-sheet">
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" data-testid="nav-mobile-trigger">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]" data-testid="nav-mobile-content">
        <div className="flex flex-col h-full" data-testid="nav-mobile-container">
          <div className="flex items-center justify-between py-4" data-testid="nav-mobile-header">
            <span className="font-bold text-xl">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} data-testid="nav-mobile-close-trigger">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <nav className="flex flex-col gap-4 py-6" data-testid="nav-mobile-menu">
            <Link
              href="/features"
              className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-link-features-trigger"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-link-pricing-trigger"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={() => setOpen(false)}
              data-testid="nav-mobile-link-about-trigger"
            >
              About
            </Link>
          </nav>
          <div className="mt-auto border-t py-4 flex flex-col gap-2" data-testid="nav-mobile-auth-section">
            <Link href="/login" onClick={() => setOpen(false)} data-testid="nav-mobile-link-login-trigger">
              <Button variant="outline" className="w-full" data-testid="nav-mobile-button-login-trigger">
                Log In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} data-testid="nav-mobile-link-signup-trigger">
              <Button className="w-full" data-testid="nav-mobile-button-signup-trigger">Sign Up</Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

