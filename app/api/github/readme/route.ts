import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/prisma/prisma"
import { GitHubClient } from "@/lib/github"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
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

    if (!user.githubProfile) {
      return NextResponse.json(
        { error: "GitHub profile not connected" },
        { status: 404 }
      )
    }

    const { repositoryName, template } = await req.json()

    if (!repositoryName || !template) {
      return NextResponse.json(
        { error: "Repository name and template required" },
        { status: 400 }
      )
    }

    const githubClient = new GitHubClient(user.githubProfile.accessToken)
    const repoDetails = await githubClient.getRepositoryDetails(
      user.githubProfile.username,
      repositoryName
    )

    // Generate README content based on template and repository details
    const readmeContent = generateReadme(template, repoDetails)

    // TODO: Implement GitHub API call to update README.md
    // This would require additional GitHub API permissions and implementation

    return NextResponse.json({
      message: "README updated successfully",
      content: readmeContent,
    })
  } catch (error) {
    console.error("Error updating README:", error)
    return NextResponse.json(
      { error: "Failed to update README" },
      { status: 500 }
    )
  }
}

function generateReadme(template: string, repoDetails: any): string {
  // Replace template variables with repository details
  let content = template
    .replace("{{name}}", repoDetails.name)
    .replace("{{description}}", repoDetails.description || "")
    .replace("{{language}}", repoDetails.language || "")
    .replace("{{stars}}", repoDetails.stargazers_count.toString())
    .replace("{{forks}}", repoDetails.forks_count.toString())
    .replace("{{license}}", repoDetails.license?.name || "")

  // Add installation section if package.json exists
  if (repoDetails.has_packages) {
    content += "\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`"
  }

  // Add contribution guidelines
  content += "\n\n## Contributing\n\nPull requests are welcome. For major changes, please open an issue first to discuss what you would like to change."

  return content
} 