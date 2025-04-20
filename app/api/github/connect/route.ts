import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/prisma/prisma"
import { GitHubAnalyzer } from "@/lib/github-analyzer"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || !session?.user?.githubAccessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { githubProfile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (user.githubProfile) {
      return NextResponse.json(
        { error: "GitHub profile already connected" },
        { status: 400 }
      )
    }

    const analyzer = new GitHubAnalyzer(session.user.githubAccessToken)
    const analysis = await analyzer.analyzeProfile(user.id)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error connecting GitHub account:", error)
    return NextResponse.json(
      { error: "Failed to connect GitHub account" },
      { status: 500 }
    )
  }
} 