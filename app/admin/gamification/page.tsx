import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GamificationAdminClient } from "@/components/admin/GamificationAdminClient"

/**
 * Admin Gamification Management Page
 * 
 * Allows administrators to manage user gamification:
 * - Award/deduct points
 * - Award badges
 * - Award XP
 * - View user gamification stats
 */
export default async function GamificationAdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect("/auth/signin")
  }

  // Simple admin check - in production, you'd want proper role-based access
  const adminEmails = [
    "filipmellqvist255@gmail.com",
    "admin@techrec.com",
    // Add more admin emails as needed
  ]

  if (!adminEmails.includes(session.user.email)) {
    redirect("/developer/dashboard")
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8" data-testid="gamification-admin-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content">
          Gamification Admin Panel
        </h1>
        <p className="text-base-content/70 mt-2">
          Manage user points, badges, and XP across the platform
        </p>
      </div>

      <GamificationAdminClient />
    </div>
  )
}