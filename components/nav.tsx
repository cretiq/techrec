'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {  Button  } from '@/components/ui-daisy/button'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Loader2, User, LogOut, Settings } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { userLoggedOut } from '@/lib/features/metaSlice'
import { persistor } from '@/lib/store'

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
  const dispatch = useDispatch()

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
    
    try {
      // Dispatch the Redux action to clear all user state (includes localStorage cleanup)
      dispatch(userLoggedOut())
      
      // Explicitly purge persistor to ensure complete cleanup
      await persistor.purge()
      
      // Sign out from NextAuth without automatic redirect for maximum reliability
      await signOut({ redirect: false })
      
      // Debug logging for persistence cleanup verification
      if (process.env.NODE_ENV === 'development') {
        console.log('[Logout] Redux state cleared and persistor purged');
      }
      
      // Manually navigate to home and refresh for clean state
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, ensure we navigate away from protected routes
      router.push('/')
      router.refresh()
    } finally {
      setIsNavigating(false)
    }
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
      <div className="relative group" data-testid="nav-desktop-dropdown-account">
        <div className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors cursor-pointer flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-base-200" data-testid="nav-button-account-trigger">
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin" data-testid="nav-account-loading-spinner" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">My Account</span>
          <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="absolute top-full right-0 z-50 w-48 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out" data-testid="nav-dropdown-account-menu">
          <ul className="menu p-2 shadow-lg bg-base-100 rounded-lg border border-base-300">
            <li>
              <Link href="/developer/profile" className="hover:bg-base-200 rounded-md flex items-center gap-2" data-testid="nav-dropdown-profile-trigger">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link href="/developer/settings" className="hover:bg-base-200 rounded-md flex items-center gap-2" data-testid="nav-dropdown-settings-trigger">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="w-full text-left hover:bg-base-200 rounded-md flex items-center gap-2 text-red-600 hover:text-red-600 p-2"
                data-testid="nav-dropdown-logout-trigger"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 