"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"

export function Header() {
  const pathname = usePathname()

  const isCompanyDashboard = pathname?.includes("/company/")
  const isDeveloperDashboard = pathname?.includes("/developer/")
  const isAuthenticated = isCompanyDashboard || isDeveloperDashboard

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">DevAssess</span>
          </Link>

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/features"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/features" ? "text-primary" : "text-muted-foreground",
                )}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/pricing" ? "text-primary" : "text-muted-foreground",
                )}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/about" ? "text-primary" : "text-muted-foreground",
                )}
              >
                About
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
              <div className="md:hidden">
                <MobileNav />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                {isCompanyDashboard ? "RightHub" : "Profile"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

