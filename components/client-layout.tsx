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
                      <div className="dropdown dropdown-hover group">
                        <label tabIndex={0} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-1">
                          Features
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-1 group-hover:block">
                          <li><Link href="/developer/cv-management">CV Management</Link></li>
                          <li><Link href="/developer/roles/search2">Role Search</Link></li>
                          {session && (
                            <>
                              <li><Link href="/developer/profile">Profile</Link></li>
                              <li><Link href="/developer/applications">Applications</Link></li>
                            </>
                          )}
                        </ul>
                      </div>
                      <Link href="#testimonial" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        Testimonial
                      </Link>
                      <Link href="#pricing" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                        Pricing
                      </Link>
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