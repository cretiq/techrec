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
import { FontSwitcher } from "@/components/font-switcher"
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { Menu } from 'lucide-react'

interface ClientLayoutProps {
  children: React.ReactNode
  session: Session | null
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col hero-gradient">
            <header className="fixed top-0 z-50 w-full glass dark:glass-dark">
              <div className="container mx-auto max-w-7xl">
                <div className="flex h-16 items-center justify-between px-4 md:px-6">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#</span>
                      </div>
                      <span className="font-bold text-xl">TechRec</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                      <Link href="/developer/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        Home
                      </Link>
                      <Link href="/developer/roles" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        About
                      </Link>
                      <div className="relative group">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-1 py-2">
                          Features
                          <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="absolute top-full left-0 z-50 w-52 mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out">
                          <ul className="menu p-2 shadow-lg bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <li><Link href="/developer/cv-management" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">CV Management</Link></li>
                            <li><Link href="/developer/roles/search" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Role Search</Link></li>
                            {session && (
                              <>
                                <li><Link href="/developer/profile" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Profile</Link></li>
                                <li><Link href="/developer/applications" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Applications</Link></li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </nav>
                  </div>
                  <div className="flex items-center gap-3">
                    {!session ? (
                      <>
                        <Link href="/auth/signin" className="hidden md:inline-flex">
                          <button className="btn btn-ghost btn-sm">Login</button>
                        </Link>
                        <Link href="/developer/signup">
                          <button className="btn btn-primary btn-sm rounded-full px-6">Sign Up</button>
                        </Link>
                      </>
                    ) : (
                      <UserNav />
                    )}
                    <ModeToggle />
                    <button className="btn btn-ghost btn-sm md:hidden">
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>
          <Loading />
          <Toaster />
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  )
} 