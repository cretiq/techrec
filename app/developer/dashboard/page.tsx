import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-daisy/card'
import { Button } from '@/components/ui-daisy/button'
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

/**
 * Simplified Developer Dashboard
 * 
 * This is the main dashboard page that serves as the central hub for developers.
 * It provides:
 * - Onboarding roadmap with progress tracking
 * - Gamification stats (XP, points, badges)
 * - Quick actions for key platform features
 * 
 * Layout: Two-column 50/50 split for clean, focused experience
 */
export default async function DeveloperDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  console.log('🏠 [Dashboard] Loading dashboard for user:', session.user?.email)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8" data-testid="developer-dashboard">
      {/* Dashboard Client Component */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
    </div>
  )
}

// Loading skeleton for dashboard
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8" data-testid="dashboard-skeleton">
      {/* Left Column - Roadmap Skeleton */}
      <div className="lg:col-span-7 space-y-6">
        <Card 
          variant="transparent" 
          className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-base-300/50 rounded animate-pulse" />
              <div className="h-6 bg-base-300/50 rounded animate-pulse w-48" />
            </div>
            <div className="h-4 bg-base-300/30 rounded animate-pulse w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-base-300/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                    <div className="h-3 bg-base-300/30 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Stats Skeleton */}
      <div className="lg:col-span-3 space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card 
            key={i}
            variant="transparent" 
            className="bg-base-100/60 backdrop-blur-sm border border-base-300/50"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-base-300/50 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300/50 rounded animate-pulse" />
                  <div className="h-3 bg-base-300/30 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}