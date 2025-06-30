import type { Metadata } from 'next'
import ClientLayout from '@/components/client-layout'
import { Toaster } from 'sonner'
import { fontVariables, sourceSansPro } from '@/utils/fonts'
import { AnimatedBackground } from '@/components/animated-background'
import './globals.css'

export const metadata: Metadata = {
  title: 'TechRec - Developer Platform',
  description: 'Find your next tech role or hire top tech talent',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={sourceSansPro.className} suppressHydrationWarning>
          <AnimatedBackground />
          <ClientLayout>
            {children}
          </ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}