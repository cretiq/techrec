'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui-daisy/toaster'
import { UserNav } from '@/components/nav'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { SessionProvider, useSession } from 'next-auth/react'
import { ModeToggle } from '@/components/mode-toggle'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'
import { Menu, HelpCircle, BookOpen } from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
}

// Loading component for PersistGate
function PersistenceLoading() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Redux Persist] Rehydrating state from localStorage...');
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100" data-testid="layout-persist-loading">
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
        <header className="fixed top-0 z-50 w-full glass border-b-base-100 bg-base-100/95 backdrop-blur-md" data-testid="layout-header">
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
                  <Link href="/developer/dashboard" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-dashboard-trigger">
                    Dashboard
                  </Link>
                  <Link href="/developer/cv-management" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-cv-management-trigger">
                    CV Management
                  </Link>
                  <Link href="/developer/saved-roles" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-saved-roles-trigger">
                    Saved Roles
                  </Link>
                  <Link href="/developer/roles/search" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-job-search-trigger">
                    Job Search
                  </Link>
                  {session?.user?.email === "admin@test.com" && (
                    <Link href="/admin/gamification" className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors" data-testid="nav-desktop-link-admin-trigger">
                      Admin
                    </Link>
                  )}
                  <div className="relative group" data-testid="nav-desktop-dropdown-how-to">
                    <div className="text-sm font-medium text-base-content/80 hover:text-violet-600 transition-colors cursor-pointer flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-base-200" data-testid="nav-desktop-dropdown-how-to-trigger">
                      <span>How to</span>
                      <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute top-full left-0 z-50 w-56 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 ease-out" data-testid="nav-dropdown-how-to-menu">
                      <ul className="menu p-2 shadow-lg bg-base-100 rounded-lg border border-base-300">
                        <li>
                          <Link href="/developer/how-to/app" className="hover:bg-base-200 rounded-md flex items-center gap-3" data-testid="nav-dropdown-link-how-to-app">
                            <HelpCircle className="h-4 w-4" />
                            <span>How to use the app</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/developer/how-to/job-search" className="hover:bg-base-200 rounded-md flex items-center gap-3" data-testid="nav-dropdown-link-how-to-job-search">
                            <BookOpen className="h-4 w-4" />
                            <span>How to Get a Developer Job</span>
                          </Link>
                        </li>
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