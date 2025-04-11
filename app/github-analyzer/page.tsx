"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitHubProfile, AnalysisHistory, ImprovementPlan } from "@/types/github"
import { RepositoryAnalysis } from "./components/repository-analysis"
import { toast } from "sonner"

interface GitHubAnalysis {
  profile: GitHubProfile
  latestAnalysis: AnalysisHistory
  latestPlan: ImprovementPlan
  repositories: Array<{
    name: string
    url: string
    description: string | null
    stars: number
    forks: number
    language: string | null
    readmeScore: number
    codeQualityScore: number
    testCoverage: number
    documentationScore: number
  }>
}

export default function GitHubAnalyzer() {
  const { data: session } = useSession()
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchAnalysis()
    }
  }, [session])

  const fetchAnalysis = async () => {
    try {
      const response = await fetch("/api/github/analysis")
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Error fetching analysis:", error)
      toast.error("Failed to fetch GitHub analysis")
    }
  }

  const connectGitHub = async () => {
    setLoading(true)
    try {
      // Redirect to GitHub OAuth
      window.location.href = `/api/auth/signin/github?callbackUrl=${encodeURIComponent('/github-analyzer')}`
    } catch (error) {
      console.error("Error connecting GitHub:", error)
      toast.error("Failed to connect GitHub account")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReadme = async (repositoryName: string, template: string) => {
    try {
      const response = await fetch("/api/github/readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryName,
          template,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate README")
      }

      const data = await response.json()
      toast.success("README generated successfully")
    } catch (error) {
      console.error("Error generating README:", error)
      toast.error("Failed to generate README")
    }
  }

  if (!session) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Sign in to continue</h2>
          <p className="text-gray-500 mb-4">
            You need to sign in to analyze your GitHub profile.
          </p>
          <Button>Sign In</Button>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Connect GitHub</h2>
          <p className="text-gray-500 mb-4">
            Connect your GitHub account to get started with the analysis.
          </p>
          <Button onClick={connectGitHub} disabled={loading}>
            {loading ? "Connecting..." : "Connect GitHub"}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid gap-6">
        {/* Profile Overview */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {analysis?.profile?.avatarUrl && (
              <img
                src={analysis.profile.avatarUrl}
                alt="GitHub Avatar"
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{analysis?.profile?.username || 'GitHub User'}</h2>
              {analysis?.profile?.profileUrl && (
                <a
                  href={analysis.profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Profile
                </a>
              )}
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold">
                {Math.round(analysis?.profile?.overallScore || 0)}%
              </div>
              <div className="text-gray-500">Overall Score</div>
            </div>
          </div>
        </Card>

        {/* Analysis Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="improvement">Improvement Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Key Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {analysis?.profile?.repositoryCount || 0}
                    </div>
                    <div className="text-gray-500">Repositories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {analysis?.profile?.contributionCount || 0}
                    </div>
                    <div className="text-gray-500">Contributions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Object.keys(analysis?.profile?.languageStats || {}).length}
                    </div>
                    <div className="text-gray-500">Languages</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Language Distribution</h3>
                {Object.entries(analysis?.profile?.languageStats || {}).map(
                  ([language, count]: [string, number]) => (
                    <div key={language} className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span>{language}</span>
                        <span>{count} repos</span>
                      </div>
                      <Progress
                        value={
                          (count / (analysis?.profile?.repositoryCount || 1)) * 100
                        }
                      />
                    </div>
                  )
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="repositories" className="mt-6">
            <RepositoryAnalysis
              repositories={analysis.repositories}
              onGenerateReadme={handleGenerateReadme}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Recommendations</h3>
              {analysis?.latestAnalysis?.recommendations ? (
                <ul className="space-y-4">
                  {analysis.latestAnalysis.recommendations.map(
                    (recommendation: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
                        <span>{recommendation}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">No recommendations available yet.</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="improvement" className="mt-6">
            <Card className="p-6">
              {analysis?.latestPlan ? (
                <>
                  <h3 className="text-xl font-bold mb-4">
                    {analysis.latestPlan.title}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {analysis.latestPlan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Progress to Goal</span>
                      <span>
                        {Math.round(analysis?.profile?.overallScore || 0)}% /{" "}
                        {analysis.latestPlan.targetMetrics.targetScore}%
                      </span>
                    </div>
                    <Progress
                      value={
                        ((analysis?.profile?.overallScore || 0) /
                          analysis.latestPlan.targetMetrics.targetScore) *
                        100
                      }
                    />
                  </div>

                  {analysis.latestPlan.resources && analysis.latestPlan.resources.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Helpful Resources</h4>
                      <ul className="space-y-2">
                        {analysis.latestPlan.resources.map((resource: string, index: number) => (
                          <li key={index}>
                            <a
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {new URL(resource).hostname}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No improvement plan available yet.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 