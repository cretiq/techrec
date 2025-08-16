import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GamificationAdminClient } from "@/components/admin/GamificationAdminClient"
import { RapidApiUsageTracker } from "@/components/admin/RapidApiUsageTracker"

/**
 * Admin Dashboard Page
 * 
 * Main admin panel for platform management:
 * - RapidAPI usage monitoring and tracking
 * - User management and gamification
 * - Award/deduct points
 * - Award badges and XP
 * - View user stats and profile data
 */
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect("/auth/signin")
  }

  // Simple admin check - in production, you'd want proper role-based access
  const adminEmails = [
    "filipmellqvist255@gmail.com",
    "admin@techrec.com",
    "admin@test.com",
    // Add more admin emails as needed
  ]

  if (!adminEmails.includes(session.user.email)) {
    redirect("/developer/dashboard")
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8" data-testid="admin-dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Admin Dashboard
        </h1>
        <p className="text-base-content/70 mt-2">
          Manage users, gamification, RapidAPI usage, and platform settings
        </p>
      </div>

      <div className="space-y-8">
        {/* RapidAPI Usage Monitoring */}
        <section>
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            RapidAPI Usage Monitoring
          </h2>
          <RapidApiUsageTracker />
        </section>

        {/* Gamification Management */}
        <section>
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            Gamification Management
          </h2>
          <GamificationAdminClient />
        </section>
      </div>
    </div>
  )
}