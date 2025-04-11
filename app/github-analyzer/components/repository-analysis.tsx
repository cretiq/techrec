"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ReadmeTemplate } from "./readme-template"

interface Repository {
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
}

interface RepositoryAnalysisProps {
  repositories: Repository[]
  onGenerateReadme: (name: string, template: string) => void
}

export function RepositoryAnalysis({
  repositories,
  onGenerateReadme,
}: RepositoryAnalysisProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<keyof Repository>("stars")
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)

  const filteredRepositories = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedRepositories = [...filteredRepositories].sort((a, b) => {
    if (typeof a[sortBy] === "string" && typeof b[sortBy] === "string") {
      return (a[sortBy] as string).localeCompare(b[sortBy] as string)
    }
    return (b[sortBy] as number) - (a[sortBy] as number)
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as keyof Repository)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
          <option value="readmeScore">README Score</option>
          <option value="codeQualityScore">Code Quality</option>
          <option value="testCoverage">Test Coverage</option>
          <option value="documentationScore">Documentation</option>
        </select>
      </div>

      <div className="grid gap-6">
        {sortedRepositories.map((repo) => (
          <Card key={repo.name} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {repo.name}
                  </a>
                </h3>
                <p className="text-gray-500 mt-1">{repo.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getLanguageColor(repo.language),
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                </div>
              </div>
              <ReadmeTemplate
                repositoryName={repo.name}
                onGenerate={(template) => onGenerateReadme(repo.name, template)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>README Score</span>
                  <span className={getScoreColor(repo.readmeScore)}>
                    {Math.round(repo.readmeScore)}%
                  </span>
                </div>
                <Progress value={repo.readmeScore} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Code Quality</span>
                  <span className={getScoreColor(repo.codeQualityScore)}>
                    {Math.round(repo.codeQualityScore)}%
                  </span>
                </div>
                <Progress value={repo.codeQualityScore} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Test Coverage</span>
                  <span className={getScoreColor(repo.testCoverage)}>
                    {Math.round(repo.testCoverage)}%
                  </span>
                </div>
                <Progress value={repo.testCoverage} />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span>Documentation</span>
                  <span className={getScoreColor(repo.documentationScore)}>
                    {Math.round(repo.documentationScore)}%
                  </span>
                </div>
                <Progress value={repo.documentationScore} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Function to get a color for a programming language
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178C6",
    JavaScript: "#F7DF1E",
    Python: "#3776AB",
    Java: "#007396",
    Ruby: "#CC342D",
    Go: "#00ADD8",
    Rust: "#DEA584",
    PHP: "#777BB4",
    Swift: "#FA7343",
    Kotlin: "#7F52FF",
  }

  return colors[language] || "#6E7681"
} 