'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function MainNav() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigation = () => {
    setIsNavigating(true)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/") ? "text-primary" : "text-muted-foreground"
        )}
        onClick={handleNavigation}
      >
        {isActive("/") && isNavigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Home"
        )}
      </Link>
      <Link
        href="/developer/roles"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/developer/roles") ? "text-primary" : "text-muted-foreground"
        )}
        onClick={handleNavigation}
      >
        {isActive("/developer/roles") && isNavigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Roles"
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
            onClick={handleNavigation}
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
            onClick={handleNavigation}
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

  const handleNavigation = () => {
    setIsNavigating(true)
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
          <Button variant="outline" size="sm" onClick={handleNavigation}>
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
      <Link href="/developer/profile">
        <Button variant="outline" size="sm" onClick={handleNavigation}>
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "My Profile"
          )}
        </Button>
      </Link>
    </div>
  )
} 