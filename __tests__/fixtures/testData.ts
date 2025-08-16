import { SubscriptionTier, PointsSpendType } from '@prisma/client'

// Test user data
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  subscriptionTier: 'FREE' as SubscriptionTier,
  monthlyPoints: 100,
  pointsUsed: 30,
  pointsEarned: 10,
}

// Test search parameters
export const mockSearchParams = {
  limit: 10,
  location: 'San Francisco',
  keywords: 'React Developer',
  ai_visa_sponsorship_filter: 'true'
}

// Mock job search results
export const mockJobResults = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'Looking for a React developer with TypeScript experience',
    skills: ['React', 'TypeScript', 'Node.js'],
    salary_range: '$120k - $150k',
    posted_date: '2025-08-15',
    ai_key_skills: ['React', 'TypeScript'],
    ai_experience_level: 'Senior',
    ai_visa_sponsorship: true
  },
  {
    id: '2', 
    title: 'Frontend Engineer',
    company: 'StartupCo',
    location: 'San Francisco, CA',
    description: 'Frontend role with modern JavaScript frameworks',
    skills: ['JavaScript', 'Vue.js', 'CSS'],
    salary_range: '$100k - $130k',
    posted_date: '2025-08-14',
    ai_key_skills: ['JavaScript', 'Vue.js'],
    ai_experience_level: 'Mid-level',
    ai_visa_sponsorship: false
  }
]

// Mock RapidAPI response with usage headers
export const mockRapidAPIResponse = {
  data: mockJobResults,
  headers: {
    'x-rapidapi-requests-left': '4950',
    'x-rapidapi-requests-remaining': '4950',
    'x-rapidapi-quota-reset': '1692000000'
  }
}

// Mock points transaction
export const mockPointsTransaction = {
  id: 'tx-123',
  developerId: mockUser.id,
  amount: -2, // 2 points spent
  spendType: 'JOB_QUERY' as PointsSpendType,
  source: 'SUBSCRIPTION_MONTHLY',
  description: 'job query action',
  createdAt: new Date(),
  metadata: {
    resultsCount: 2,
    searchParams: mockSearchParams
  }
}

// Mock session
export const mockSession = {
  user: {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
  },
  expires: '2025-12-31'
}

// Different subscription tiers for testing
export const subscriptionTiers = {
  FREE: { monthlyPoints: 100, xpMultiplier: 1.0 },
  BASIC: { monthlyPoints: 300, xpMultiplier: 1.2 },
  STARTER: { monthlyPoints: 500, xpMultiplier: 1.5 },
  PRO: { monthlyPoints: 1000, xpMultiplier: 2.0 },
  EXPERT: { monthlyPoints: 2000, xpMultiplier: 2.5 }
}

// Test environment variables for different debug modes
export const debugModeEnvs = {
  off: {
    DEBUG_RAPIDAPI: 'off',
    USE_MOCK_DATA: 'false'
  },
  log: {
    DEBUG_RAPIDAPI: 'log', 
    USE_MOCK_DATA: 'false'
  },
  stop: {
    DEBUG_RAPIDAPI: 'stop',
    USE_MOCK_DATA: 'false' 
  },
  mock: {
    DEBUG_RAPIDAPI: 'off',
    USE_MOCK_DATA: 'true'
  }
}

// Error scenarios for testing
export const errorScenarios = {
  insufficientPoints: {
    user: { ...mockUser, pointsUsed: 95 }, // Only 15 points available
    searchParams: { ...mockSearchParams, limit: 20 }, // Would cost 20 points
    expectedError: 'Insufficient points: need 20, have 15'
  },
  databaseError: {
    message: 'Database connection failed',
    code: 'P1001'
  },
  rapidApiError: {
    message: 'RapidAPI rate limit exceeded',
    status: 429
  }
}