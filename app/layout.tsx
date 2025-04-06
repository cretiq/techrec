import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import ClientLayout from "./ClientLayout"
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevAssess - Technical Assessment Platform",
  description: "A comprehensive platform for technical skill assessment and hiring",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <ClientLayout>
              <div className="container mx-auto px-4 py-8">
                {children}
              </div>
            </ClientLayout>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

import './globals.css'