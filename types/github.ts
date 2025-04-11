export interface GitHubProfile {
  id: string
  userId: string
  accessToken: string
  refreshToken?: string | null
  tokenExpiresAt?: Date | null
  username: string
  avatarUrl?: string | null
  profileUrl: string
  lastSyncedAt: Date
  overallScore: number
  repositoryCount: number
  contributionCount: number
  languageStats?: Record<string, number> | null
  createdAt: Date
  updatedAt: Date
}

export interface AnalysisHistory {
  id: string
  githubProfileId: string
  timestamp: Date
  overallScore: number
  metrics: {
    repositories: number
    contributions: number
    stars: number
    forks: number
  }
  recommendations: string[]
  completedTasks: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ImprovementPlan {
  id: string
  githubProfileId: string
  title: string
  description: string
  priority: number
  difficulty: number
  status: string
  dueDate?: Date | null
  completedAt?: Date | null
  resources: string[]
  targetMetrics: {
    targetScore: number
    timeframe: string
  }
  createdAt: Date
  updatedAt: Date
} 