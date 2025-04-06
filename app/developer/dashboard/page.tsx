import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DeveloperDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Developer Dashboard</h1>
      <p>Welcome, {session.user?.name}!</p>
    </div>
  )
}

