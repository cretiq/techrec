'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {  Button  } from '@/components/ui-daisy/button'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Loader2, User, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleStop = () => setIsNavigating(false)

    window.addEventListener('beforeunload', handleStart)
    window.addEventListener('load', handleStop)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
      window.removeEventListener('load', handleStop)
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex items-center space-x-4 lg:space-x-6" data-testid="nav-main-container">
      <Link
        href="/developer/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/developer/dashboard") ? "text-primary" : "text-muted-foreground"
        )}
        data-testid="nav-link-dashboard-trigger"
      >
        {isActive("/developer/dashboard") && isNavigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Home"
        )}
      </Link>
      {status === "authenticated" && (
        <>
          <Link
            href="/developer/cv-management"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/developer/cv-management") ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="nav-link-profile-trigger"
          >
            {isActive("/developer/cv-management") && isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "My Profile & CV"
            )}
          </Link>
          <Link
            href="/developer/applications"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/developer/applications") ? "text-primary" : "text-muted-foreground"
            )}
            data-testid="nav-link-applications-trigger"
          >
            {isActive("/developer/applications") && isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Applications"
            )}
          </Link>
        </>
      )}
    </div>
  )
}

export function UserNav() {
  const { data: session, status } = useSession()
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleStop = () => setIsNavigating(false)

    window.addEventListener('beforeunload', handleStart)
    window.addEventListener('load', handleStop)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
      window.removeEventListener('load', handleStop)
    }
  }, [])

  const handleLogout = async () => {
    setIsNavigating(true)
    await signOut({ callbackUrl: '/' })
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-4" data-testid="nav-user-loading">
        <Loader2 className="h-4 w-4 animate-spin" data-testid="nav-user-loading-spinner" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center space-x-4" data-testid="nav-user-unauthenticated">
        <Link href="/auth/signin" data-testid="nav-link-signin-trigger">
          <Button variant="outline" size="sm" data-testid="nav-button-signin-trigger">
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" data-testid="nav-signin-loading-spinner" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4" data-testid="nav-user-authenticated">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" data-testid="nav-button-account-trigger">
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" data-testid="nav-account-loading-spinner" />
            ) : (
              "My Account"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-testid="nav-dropdown-account-menu">
          <DropdownMenuItem asChild>
            <Link href="/developer/cv-management" className="flex items-center" data-testid="nav-dropdown-profile-trigger">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile & CV</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center text-red-600 focus:text-red-600"
            data-testid="nav-dropdown-logout-trigger"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 