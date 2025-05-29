import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ClientLayout from '@/components/client-layout'
import { Toaster } from 'sonner'
import { fontVariables, sourceSansPro } from '@/utils/fonts'
import './globals.css'

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
    <html lang="en" className={fontVariables} data-theme="fantasy">
      <body className={sourceSansPro.className} suppressHydrationWarning>
          <ClientLayout session={session}>
            {children}
          </ClientLayout>
        <Toaster />
      </body>
    </html>
  )
}