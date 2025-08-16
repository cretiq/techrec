import { NextRequest } from 'next/server'
import { mockUser, mockSearchParams, mockJobResults, mockSession } from '../fixtures/testData'
import { prismaMock, setupSuccessfulPointsDeduction, setupInsufficientPoints, setupCompleteTransactionMock } from '../mocks/prismaMock'

// Mock the dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/utils/configService', () => ({
  configService: {
    getPointsCost: jest.fn().mockResolvedValue(1),
    getSubscriptionTier: jest.fn().mockResolvedValue({ monthlyPoints: 100, xpMultiplier: 1.0 }),
  }
}))

jest.mock('@/lib/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
}))

// Mock the actual API route handler (we'll need to import this when we create it)
// For now, let's simulate the core logic
async function mockAPIRouteHandler(request: NextRequest) {
  const { getServerSession } = require('next-auth')
  const { getCache, setCache } = require('@/lib/redis')
  
  // Check authentication
  const session = await getServerSession()
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await request.json()
    const { searchParams, resultsCount } = body

    // Get debug mode
    const debugMode = process.env.DEBUG_RAPIDAPI?.toLowerCase() || 'off'
    const useMockData = process.env.USE_MOCK_DATA === 'true'

    // Get user for points checking
    const developer = await prismaMock.developer.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
      },
    })

    if (!developer) {
      return new Response(JSON.stringify({ error: 'Developer not found' }), { status: 404 })
    }

    // Calculate points cost (MVP Beta: 1 point per result)
    const pointsCost = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true' && resultsCount 
      ? resultsCount * parseInt(process.env.MVP_POINTS_PER_RESULT || '1')
      : 1

    // Check cache first
    const cacheKey = `search:${developer.id}:${JSON.stringify(searchParams)}`
    const cachedData = await getCache(cacheKey)
    let results
    let usageHeaders = {}

    if (!cachedData) {
      // Simulate API call based on debug mode
      if (debugMode === 'stop') {
        // Stop mode: don't make real API call, use mock data
        results = mockJobResults.slice(0, resultsCount || 2)
        usageHeaders = {
          'x-rapidapi-requests-left': '4950',
          'x-rapidapi-requests-remaining': '4950'
        }
      } else if (useMockData) {
        // Mock mode: use predefined mock data
        results = mockJobResults.slice(0, resultsCount || 2) 
        usageHeaders = {
          'x-rapidapi-requests-left': '4999',
          'x-rapidapi-requests-remaining': '4999'
        }
      } else {
        // Normal/log mode: would make real API call (mocked here)
        results = mockJobResults.slice(0, resultsCount || 2)
        usageHeaders = {
          'x-rapidapi-requests-left': '4948',
          'x-rapidapi-requests-remaining': '4948'
        }
      }

      // Cache the results with usage headers
      await setCache(cacheKey, { results, headers: usageHeaders }, 3600)
    } else {
      // Use cached data including preserved headers
      results = cachedData.results
      usageHeaders = cachedData.headers || {}
    }

    // Calculate points cost for MVP Beta mode
    let actualPointsCost
    if (process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true') {
      // MVP Beta: 1 point per result, 0 if no results
      actualPointsCost = Array.isArray(results) ? results.length * parseInt(process.env.MVP_POINTS_PER_RESULT || '1') : 0
    } else {
      // Standard: fixed cost regardless of results
      actualPointsCost = 1
    }

    const pointsResult = await prismaMock.$transaction(async (tx) => {
      const currentUser = await tx.developer.findUnique({
        where: { id: developer.id },
        select: {
          monthlyPoints: true,
          pointsUsed: true,
          pointsEarned: true,
        },
      })

      if (!currentUser) {
        throw new Error('Developer not found')
      }

      const available = Math.max(0, currentUser.monthlyPoints + currentUser.pointsEarned - currentUser.pointsUsed)
      
      if (available < actualPointsCost) {
        throw new Error(`Insufficient points: need ${actualPointsCost}, have ${available}`)
      }

      const updatedUser = await tx.developer.update({
        where: { id: developer.id },
        data: { pointsUsed: { increment: actualPointsCost } },
      })

      const transaction = await tx.pointsTransaction.create({
        data: {
          developerId: developer.id,
          amount: -actualPointsCost,
          spendType: 'JOB_QUERY',
          source: 'SUBSCRIPTION_MONTHLY',
          description: 'job query action',
          metadata: {
            resultsCount: Array.isArray(results) ? results.length : 0,
            searchParams,
            debugMode,
          },
        },
      })

      return {
        pointsSpent: actualPointsCost,
        newBalance: Math.max(0, updatedUser.monthlyPoints + updatedUser.pointsEarned - updatedUser.pointsUsed),
        transaction,
      }
    })

    return new Response(JSON.stringify({
      success: true,
      results,
      pointsSpent: pointsResult.pointsSpent,
      newBalance: pointsResult.newBalance,
      usageHeaders,
      debugInfo: debugMode !== 'off' ? {
        mode: debugMode,
        usedMockData: useMockData,
        cacheHit: !!cachedData,
      } : undefined,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...usageHeaders,
      },
    })

  } catch (error) {
    console.error('API Route error:', error)
    
    if (error instanceof Error && error.message.includes('Insufficient points')) {
      return new Response(JSON.stringify({
        error: 'Insufficient points',
        details: error.message,
      }), { status: 402 })
    }

    return new Response(JSON.stringify({
      error: 'Internal server error',
      retryable: false,
    }), { status: 500 })
  }
}

describe('RapidAPI Search Route Integration Tests', () => {
  const { getServerSession } = require('next-auth')
  const { getCache, setCache } = require('@/lib/redis')

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default session
    getServerSession.mockResolvedValue(mockSession)
    
    // Setup default cache behavior
    getCache.mockResolvedValue(null) // No cache by default
    setCache.mockResolvedValue(undefined)
    
    // Setup default environment
    process.env.NEXT_PUBLIC_ENABLE_MVP_MODE = 'true'
    process.env.MVP_POINTS_PER_RESULT = '1'
    process.env.DEBUG_RAPIDAPI = 'off'
    process.env.USE_MOCK_DATA = 'false'
  })

  describe('Successful Search Scenarios', () => {
    it('should successfully perform search with points deduction', async () => {
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.results).toHaveLength(2)
      expect(data.pointsSpent).toBe(2)
      expect(data.newBalance).toBe(78) // 100 + 10 - 32 = 78
      expect(data.usageHeaders).toHaveProperty('x-rapidapi-requests-left')
    })

    it('should use cached results and preserve usage headers', async () => {
      const cachedData = {
        results: mockJobResults.slice(0, 3),
        headers: { 'x-rapidapi-requests-left': '4945' }
      }
      getCache.mockResolvedValue(cachedData)
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 3)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 3
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.results).toHaveLength(3)
      expect(data.usageHeaders['x-rapidapi-requests-left']).toBe('4945')
      expect(getCache).toHaveBeenCalled()
      expect(setCache).not.toHaveBeenCalled() // Should not cache again
    })

    it('should handle zero results without points deduction', async () => {
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 0)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 0 // No results
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pointsSpent).toBe(0)
      expect(data.results).toHaveLength(0)
    })
  })

  describe('Debug Mode Scenarios', () => {
    it('should handle DEBUG_RAPIDAPI=log mode', async () => {
      process.env.DEBUG_RAPIDAPI = 'log'
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.debugInfo).toBeDefined()
      expect(data.debugInfo.mode).toBe('log')
      expect(data.pointsSpent).toBe(2) // Still deducts points
    })

    it('should handle DEBUG_RAPIDAPI=stop mode', async () => {
      process.env.DEBUG_RAPIDAPI = 'stop'
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.debugInfo.mode).toBe('stop')
      expect(data.pointsSpent).toBe(2) // CRITICAL: Still deducts points for testing
      expect(data.usageHeaders).toHaveProperty('x-rapidapi-requests-left')
    })

    it('should handle USE_MOCK_DATA=true', async () => {
      process.env.USE_MOCK_DATA = 'true'
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.debugInfo.usedMockData).toBe(true)
      expect(data.pointsSpent).toBe(2)
    })
  })

  describe('Error Scenarios', () => {
    it('should return 401 when not authenticated', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
        }),
      })

      const response = await mockAPIRouteHandler(request)
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when developer not found', async () => {
      prismaMock.developer.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
        }),
      })

      const response = await mockAPIRouteHandler(request)
      expect(response.status).toBe(404)
      
      const data = await response.json()
      expect(data.error).toBe('Developer not found')
    })

    it('should return 402 when insufficient points', async () => {
      const currentPoints = { monthly: 100, used: 95, earned: 0 } // Only 5 available
      
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)

      prismaMock.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          developer: {
            findUnique: jest.fn().mockResolvedValue(currentPoints),
          },
        }
        return await callback(mockTx)
      })

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 10 // Need 10 points, only have 5
        }),
      })

      const response = await mockAPIRouteHandler(request)
      expect(response.status).toBe(402)
      
      const data = await response.json()
      expect(data.error).toBe('Insufficient points')
    })

    it('should handle database transaction failures', async () => {
      prismaMock.developer.findUnique.mockResolvedValue(mockUser as any)
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'))

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('MVP Beta Points System', () => {
    it('should charge 1 point per result in MVP mode', async () => {
      process.env.NEXT_PUBLIC_ENABLE_MVP_MODE = 'true'
      process.env.MVP_POINTS_PER_RESULT = '1'
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 5)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 5 // Should cost 5 points
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pointsSpent).toBe(5)
    })

    it('should handle custom points per result rate', async () => {
      process.env.NEXT_PUBLIC_ENABLE_MVP_MODE = 'true'
      process.env.MVP_POINTS_PER_RESULT = '2'
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 6) // 3 results * 2 points

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 3 // Should cost 6 points (3 * 2)
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pointsSpent).toBe(6)
    })
  })

  describe('Usage Header Preservation', () => {
    it('should capture and return usage headers from real API calls', async () => {
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usageHeaders).toHaveProperty('x-rapidapi-requests-left')
      expect(data.usageHeaders).toHaveProperty('x-rapidapi-requests-remaining')
      
      // Should also be in response headers
      expect(response.headers.get('x-rapidapi-requests-left')).toBeTruthy()
    })

    it('should preserve usage headers from cached responses', async () => {
      const cachedData = {
        results: mockJobResults.slice(0, 2),
        headers: { 
          'x-rapidapi-requests-left': '4942',
          'x-rapidapi-requests-remaining': '4942'
        }
      }
      getCache.mockResolvedValue(cachedData)
      
      const currentPoints = { monthly: 100, used: 30, earned: 10 }
      
      // Setup initial developer lookup
      prismaMock.developer.findUnique.mockResolvedValue({
        id: mockUser.id,
        subscriptionTier: 'FREE',
        ...currentPoints,
      } as any)
      
      setupCompleteTransactionMock(mockUser.id, currentPoints, 2)

      const request = new NextRequest('http://localhost:3000/api/rapidapi/search', {
        method: 'POST',
        body: JSON.stringify({
          searchParams: mockSearchParams,
          resultsCount: 2
        }),
      })

      const response = await mockAPIRouteHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.usageHeaders['x-rapidapi-requests-left']).toBe('4942')
      expect(response.headers.get('x-rapidapi-requests-left')).toBe('4942')
    })
  })
})