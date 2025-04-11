import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        githubProfile: {
          include: {
            analyses: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            improvementPlans: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // If no GitHub profile exists, return an empty analysis
    if (!user.githubProfile) {
      return NextResponse.json({
        profile: null,
        latestAnalysis: null,
        latestPlan: null,
        repositories: [],
      })
    }

    return NextResponse.json({
      profile: user.githubProfile,
      latestAnalysis: user.githubProfile.analyses[0] || null,
      latestPlan: user.githubProfile.improvementPlans[0] || null,
      repositories: [], // TODO: Fetch repositories from GitHub API
    })
  } catch (error) {
    console.error("Error fetching GitHub analysis:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 