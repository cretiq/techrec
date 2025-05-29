"use client"

import { useState } from "react"
import Link from "next/link"
import {  Button  } from '@/components/ui-daisy/button'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b py-4">
            <span className="font-bold text-xl">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
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
  )
}

