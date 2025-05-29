"use client"

import { SessionProvider } from "next-auth/react"

// Mock session for demo purposes
const mockSession = {
  user: {
    id: "demo-user",
    email: "demo@example.com",
    name: "Demo User"
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  )
}