import { GitHubClient } from "./github"
import { prisma } from "../prisma/prisma"

export class GitHubAnalyzer {
  private client: GitHubClient

  constructor(accessToken: string) {
    this.client = new GitHubClient(accessToken)
  }

  async analyzeProfile(userId: string) {
    const profile = await this.client.getUserProfile()
    const repositories = await this.client.getUserRepositories()
    const contributions = await this.client.getUserContributions(profile.login)

    // Calculate overall score
    const overallScore = this.calculateOverallScore(profile, repositories, contributions)

    // Generate recommendations
    const recommendations = this.generateRecommendations(profile, repositories, contributions)

    // Save analysis
    const githubProfile = await prisma.githubProfile.upsert({
      where: { userId },
      update: {
        username: profile.login,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        lastSyncedAt: new Date(),
        overallScore,
        repositoryCount: repositories.length,
        contributionCount: contributions.length,
        languageStats: this.calculateLanguageStats(repositories),
      },
      create: {
        userId,
        username: profile.login,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        accessToken: "stored_in_session", // Token is stored in session
        overallScore,
        repositoryCount: repositories.length,
        contributionCount: contributions.length,
        languageStats: this.calculateLanguageStats(repositories),
      },
    })

    // Save analysis history
    await prisma.analysisHistory.create({
      data: {
        githubProfileId: githubProfile.id,
        overallScore,
        metrics: {
          repositories: repositories.length,
          contributions: contributions.length,
          stars: repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0),
          forks: repositories.reduce((sum, repo) => sum + repo.forks_count, 0),
        },
        recommendations,
        completedTasks: [],
      },
    })

    // Create improvement plan
    await prisma.improvementPlan.create({
      data: {
        githubProfileId: githubProfile.id,
        title: "GitHub Profile Improvement Plan",
        description: "Personalized plan to improve your GitHub profile",
        priority: 1,
        difficulty: 2,
        resources: this.getResources(recommendations),
        targetMetrics: {
          targetScore: Math.min(overallScore + 20, 100),
          timeframe: "30 days",
        },
      },
    })

    return {
      profile: githubProfile,
      repositories,
      contributions,
      recommendations,
    }
  }

  private calculateOverallScore(
    profile: any,
    repositories: any[],
    contributions: any[]
  ): number {
    let score = 0

    // Profile completeness (20%)
    score += profile.bio ? 10 : 0
    score += profile.location ? 5 : 0
    score += profile.company ? 5 : 0

    // Repository quality (40%)
    const repoScore = repositories.reduce((sum, repo) => {
      let repoScore = 0
      repoScore += repo.description ? 5 : 0
      repoScore += repo.topics?.length > 0 ? 5 : 0
      repoScore += repo.stargazers_count > 0 ? 5 : 0
      repoScore += repo.forks_count > 0 ? 5 : 0
      return sum + repoScore
    }, 0) / repositories.length

    score += repoScore * 0.4

    // Contribution activity (30%)
    const contributionScore = Math.min(contributions.length / 100, 1) * 30
    score += contributionScore

    // Documentation (10%)
    const docScore = repositories.reduce((sum, repo) => {
      return sum + (repo.has_wiki ? 5 : 0) + (repo.has_pages ? 5 : 0)
    }, 0) / repositories.length

    score += docScore * 0.1

    return Math.min(score, 100)
  }

  private generateRecommendations(
    profile: any,
    repositories: any[],
    contributions: any[]
  ): string[] {
    const recommendations: string[] = []

    if (!profile.bio) {
      recommendations.push("Add a bio to your GitHub profile")
    }
    if (!profile.location) {
      recommendations.push("Add your location to your GitHub profile")
    }
    if (!profile.company) {
      recommendations.push("Add your company to your GitHub profile")
    }

    const reposWithoutDescription = repositories.filter((repo) => !repo.description)
    if (reposWithoutDescription.length > 0) {
      recommendations.push(
        `Add descriptions to ${reposWithoutDescription.length} repositories`
      )
    }

    const reposWithoutTopics = repositories.filter(
      (repo) => !repo.topics || repo.topics.length === 0
    )
    if (reposWithoutTopics.length > 0) {
      recommendations.push(
        `Add topics to ${reposWithoutTopics.length} repositories`
      )
    }

    if (contributions.length < 100) {
      recommendations.push("Increase your contribution activity")
    }

    return recommendations
  }

  private calculateLanguageStats(repositories: any[]): Record<string, number> {
    const languageStats: Record<string, number> = {}

    repositories.forEach((repo) => {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
      }
    })

    return languageStats
  }

  private getResources(recommendations: string[]): string[] {
    const resources: string[] = []

    if (recommendations.some((rec) => rec.includes("bio"))) {
      resources.push("https://docs.github.com/en/account-and-profile")
    }
    if (recommendations.some((rec) => rec.includes("description"))) {
      resources.push("https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-repository-descriptions")
    }
    if (recommendations.some((rec) => rec.includes("topics"))) {
      resources.push("https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics")
    }
    if (recommendations.some((rec) => rec.includes("contribution"))) {
      resources.push("https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-graphs-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile")
    }

    return resources
  }
} 