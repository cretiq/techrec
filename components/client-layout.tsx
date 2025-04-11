'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { UserNav } from '@/components/nav'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { ModeToggle } from '@/components/mode-toggle'
import { ThemeColorToggle } from '@/components/theme-color-toggle'

interface ClientLayoutProps {
  children: React.ReactNode
  session: Session | null
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl">
              <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center">
                    <span className="font-bold text-xl">TechRec</span>
                  </Link>
                  <nav className="hidden md:flex items-center gap-6">
                    <Link href="/developer/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                      Home
                    </Link>
                    <Link href="/developer/roles" className="text-sm font-medium hover:text-primary transition-colors">
                      Roles
                    </Link>
                    {session && (
                      <>
                        <Link href="/developer/profile" className="text-sm font-medium hover:text-primary transition-colors">
                          Profile
                        </Link>
                        <Link href="/developer/applications" className="text-sm font-medium hover:text-primary transition-colors">
                          Applications
                        </Link>
                        <Link href="/developer/writing-help" className="text-sm font-medium hover:text-primary transition-colors">
                          Writing Help
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeColorToggle />
                  <ModeToggle />
                  <UserNav />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Loading />
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
} 