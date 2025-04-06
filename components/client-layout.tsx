'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { MainNav } from '@/components/nav'
import { UserNav } from '@/components/nav'
import { Loading } from '@/components/loading'
import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

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
            <div className="container flex h-14 items-center">
              <div className="mr-4 hidden md:flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                  <span className="hidden font-bold sm:inline-block">
                    TechRec
                  </span>
                </Link>
                <MainNav />
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  {/* Add search component here if needed */}
                </div>
                <nav className="flex items-center">
                  <UserNav />
                </nav>
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