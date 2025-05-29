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
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/developer/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/developer/dashboard") ? "text-primary" : "text-muted-foreground"
        )}
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
            href="/developer/profile"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/developer/profile") ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isActive("/developer/profile") && isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Profile"
            )}
          </Link>
          <Link
            href="/developer/applications"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              isActive("/developer/applications") ? "text-primary" : "text-muted-foreground"
            )}
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
      <div className="flex items-center space-x-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/auth/signin">
          <Button variant="outline" size="sm">
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "My Account"
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/developer/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 