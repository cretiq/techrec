import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ClientLayout from '@/components/client-layout'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { fontVariables, sourceSansPro } from '@/utils/fonts'

export const metadata: Metadata = {
  title: 'TechRec - Developer Platform',
  description: 'Find your next tech role or hire top tech talent',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body className={sourceSansPro.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="techrec-theme"
          enableColorScheme
          themes={['light', 'dark']}
        >
          <ClientLayout session={session}>
            {children}
          </ClientLayout>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}

import './globals.css'