"use client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Header } from "@/components/header"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import type React from "react"

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isDashboardPage = pathname?.includes("/company/") || pathname?.includes("/developer/")
  const isAuthPage = pathname?.includes("/auth/")

  // Redirect to sign in if not authenticated and trying to access protected routes
  if (status === "unauthenticated" && !isAuthPage && isDashboardPage) {
    redirect("/auth/signin")
  }

  return (
    <>
      {!isDashboardPage && <Header />}
      {/* <div className="flex flex-1 w-full">
        {isDashboardPage && <DashboardSidebar />}
        <main className="flex-1 w-full">{children}</main>
      </div> */}
    </>
  )
}

export default ClientLayout

