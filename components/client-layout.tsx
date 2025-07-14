'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { UserNav } from '@/components/nav'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { SessionProvider, useSession } from 'next-auth/react'
import { ModeToggle } from '@/components/mode-toggle'
import { ThemeColorToggle } from '@/components/theme-color-toggle'
import { FontSwitcher } from "@/components/font-switcher"
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'
import { Menu } from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
}

// Loading component for PersistGate
function PersistenceLoading() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Redux Persist] Rehydrating state from localStorage...');
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen" data-testid="layout-persist-loading">
      <div className="flex flex-col items-center space-y-4">
        <div className="sparkle-loader pulse-ring animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" data-testid="layout-persist-spinner"></div>
        <div className="text-sm text-muted-foreground animate-pulse" data-testid="layout-persist-message">
          Restoring your session...
        </div>
        <div className="text-xs text-muted-foreground" data-testid="layout-persist-subtitle">
          Loading saved preferences and selections
        </div>
      </div>
    </div>
  );
}

// Session-aware layout component that handles authentication-dependent UI rendering
function SessionAwareLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <ThemeProvider>
      <div className="ai-backdrop"></div>
      <div className="flex min-h-screen flex-col relative" data-testid="layout-main-container">
        <header className="fixed top-0 z-50 w-full glass" data-testid="layout-header">
          <div className="container mx-auto max-w-7xl">
            <div className="flex h-16 items-center justify-between px-4 md:px-6" data-testid="layout-header-content">
              <div className="flex items-center gap-8" data-testid="layout-header-left">
                <Link href="/" className="flex items-center gap-2" data-testid="nav-link-home-trigger">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center" data-testid="nav-logo">
                    <span className="text-white font-bold text-lg">#</span>
                  </div>
                  <span className="font-bold text-xl">TechRec</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6" data-testid="nav-desktop-menu">
                  <Link href="/developer/dashboard" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-home-trigger">
                    Home
                  </Link>
                  <Link href="/developer/dashboard" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-dashboard-trigger">
                    Dashboard
                  </Link>
                  <div className="relative group" data-testid="nav-desktop-dropdown-features">
                    <div className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors cursor-pointer flex items-center gap-1 py-2" data-testid="nav-desktop-dropdown-features-trigger">
                      Features
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute top-full left-0 z-50 w-52 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out" data-testid="nav-desktop-dropdown-features-menu">
                      <ul className="menu p-2 shadow-lg bg-base-100 rounded-lg border border-base-300">
                        <li><Link href="/developer/cv-management" className="hover:bg-base-200 rounded-md" data-testid="nav-desktop-dropdown-cv-management-trigger">CV Management</Link></li>
                        <li><Link href="/developer/roles/search" className="hover:bg-base-200 rounded-md" data-testid="nav-desktop-dropdown-role-search-trigger">Role Search</Link></li>
                        <li><Link href="/developer/saved-roles" className="hover:bg-base-200 rounded-md" data-testid="nav-desktop-dropdown-saved-roles-trigger">Saved Roles</Link></li>
                      </ul>
                    </div>
                  </div>
                </nav>
              </div>
              <div className="flex items-center gap-3" data-testid="layout-header-right">
                {!session ? (
                  <>
                    <Link href="/auth/signin" className="hidden md:inline-flex" data-testid="nav-link-login-trigger">
                      <button className="btn btn-ghost btn-sm" data-testid="nav-button-login-trigger">Login</button>
                    </Link>
                    <Link href="/developer/signup" data-testid="nav-link-signup-trigger">
                      <button className="btn btn-primary btn-sm rounded-full px-6" data-testid="nav-button-signup-trigger">Sign Up</button>
                    </Link>
                  </>
                ) : (
                  <UserNav />
                )}
                <ModeToggle />
                <button className="btn btn-ghost btn-sm md:hidden" data-testid="nav-mobile-menu-trigger">
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 pt-16" data-testid="layout-main-content">
          {children}
        </main>
      </div>
      <Loading />
      <Toaster />
    </ThemeProvider>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={<PersistenceLoading />} persistor={persistor}>
          <SessionAwareLayout>{children}</SessionAwareLayout>
        </PersistGate>
      </Provider>
    </SessionProvider>
  )
} 