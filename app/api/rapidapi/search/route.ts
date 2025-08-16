import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import mockJobResponse from './rapidapi_job_response_enhanced.json'
import RapidApiCacheManager, { type SearchParameters } from '@/lib/api/rapidapi-cache'
import RapidApiValidator from '@/lib/api/rapidapi-validator'
import { RapidApiEndpointLogger, isPremiumEndpoint, isValidEndpoint } from '@/utils/rapidApiEndpointLogger'
import { RapidApiDebugLogger } from '@/utils/rapidApiDebugLogger'

const prisma = new PrismaClient()

// High-fidelity RapidAPI parameter defaults for enhanced data quality
const DEFAULT_AGENCY = 'FALSE' // Direct employers only
const DEFAULT_INCLUDE_AI = 'true' // Enable AI-enriched fields
const DEFAULT_DESCRIPTION_TYPE = 'text' // Full job descriptions
const DEFAULT_JOB_TITLE = 'Software Engineer'

// Debug modes
type DebugMode = 'off' | 'log' | 'stop'

function getDebugMode(): DebugMode {
  const mode = process.env.DEBUG_RAPIDAPI?.toLowerCase()
  if (mode === 'log' || mode === 'true') return 'log'
  if (mode === 'stop') return 'stop'
  return 'off'
}

// Force high-fidelity parameters regardless of frontend input
function enforceHighFidelityDefaults(params: SearchParameters): SearchParameters {
  return {
    ...params,
    // ENFORCE high-fidelity defaults - these override any frontend values
    agency: DEFAULT_AGENCY,
    include_ai: DEFAULT_INCLUDE_AI,
    description_type: DEFAULT_DESCRIPTION_TYPE,
    title_filter: params.title_filter?.trim() || DEFAULT_JOB_TITLE,
  }
}

// Helper function to handle points deduction
async function deductPointsForResults(
  request: Request,
  requestId: string,
  resultsCount: number,
  pointsPerResult: number,
  searchParams: SearchParameters,
  mode: 'cached' | 'mock' | 'production'
) {
  if (resultsCount === 0 || pointsPerResult === 0) {
    console.log(`[MVP Beta] No points deducted - ${resultsCount} results`)
    return null
  }

  const pointsToDeduct = resultsCount * pointsPerResult

  try {
    const pointsResponse = await fetch(
      `${new URL(request.url).origin}/api/gamification/points`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('Cookie') || '',
        },
        body: JSON.stringify({
          action: 'JOB_QUERY',
          sourceId: `search_${mode}_${requestId}`,
          metadata: {
            requestId,
            searchParams,
            resultsCount,
            [mode]: true,
            pointsPerResult,
          },
        }),
      }
    )

    if (pointsResponse.ok) {
      const pointsResult = await pointsResponse.json()
      console.log(`[MVP Beta] ✅ Deducted ${pointsToDeduct} points for ${resultsCount} ${mode} results`)
      return {
        pointsSpent: pointsResult.pointsSpent,
        newBalance: pointsResult.newBalance,
        resultsCount,
      }
    } else {
      const errorText = await pointsResponse.text()
      console.error(`[MVP Beta] ❌ Failed to deduct points: ${pointsResponse.status} - ${errorText}`)
    }
  } catch (error) {
    console.error(`[MVP Beta] Failed to deduct points for ${mode} results:`, error)
  }

  return null
}

// Main API handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cacheManager = RapidApiCacheManager.getInstance()
  const validator = RapidApiValidator.getInstance()
  const requestId = RapidApiEndpointLogger.generateRequestId()
  const debugMode = getDebugMode()

  // Configuration
  const isMvpBetaEnabled = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true'
  const pointsPerResult = parseInt(process.env.MVP_POINTS_PER_RESULT || '1')
  const forceRefresh = searchParams.get('forceRefresh') === 'true'
  const apiKey = process.env.RAPIDAPI_KEY
  const useMockData = process.env.USE_MOCK_DATA === 'true' || !apiKey

  // Extract and enforce parameters
  const rawParams: SearchParameters = {
    limit: parseInt(searchParams.get('limit') || '10'),
    offset: parseInt(searchParams.get('offset') || '0'),
    title_filter: searchParams.get('title') || searchParams.get('title_filter'),
    advanced_title_filter: searchParams.get('advanced_title_filter'),
    location_filter: searchParams.get('location') || searchParams.get('location_filter'),
    type_filter: searchParams.get('type_filter'),
    seniority_filter: searchParams.get('seniority_filter'),
    description_filter: searchParams.get('description_filter'),
    organization_description_filter: searchParams.get('organization_description_filter'),
    organization_specialties_filter: searchParams.get('organization_specialties_filter'),
    organization_slug_filter: searchParams.get('organization_slug_filter'),
    industry_filter: searchParams.get('industry_filter'),
    remote: searchParams.get('remote'),
    agency: searchParams.get('agency')?.trim(),
    date_filter: searchParams.get('date_filter'),
    external_apply_url: searchParams.get('external_apply_url'),
    directapply: searchParams.get('directapply'),
    employees_lte: searchParams.get('employees_lte') ? parseInt(searchParams.get('employees_lte')!) : undefined,
    employees_gte: searchParams.get('employees_gte') ? parseInt(searchParams.get('employees_gte')!) : undefined,
    order: searchParams.get('order'),
    include_ai: searchParams.get('include_ai')?.trim(),
    ai_work_arrangement_filter: searchParams.get('ai_work_arrangement_filter'),
    ai_has_salary: searchParams.get('ai_has_salary'),
    ai_experience_level_filter: searchParams.get('ai_experience_level_filter'),
    ai_visa_sponsorship_filter: searchParams.get('ai_visa_sponsorship_filter'),
    description_type: searchParams.get('description_type')?.trim(),
    endpoint: searchParams.get('endpoint') || '7d',
  }

  // Apply high-fidelity defaults
  const params = enforceHighFidelityDefaults(rawParams)

  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key as keyof SearchParameters] === undefined || params[key as keyof SearchParameters] === null) {
      delete params[key as keyof SearchParameters]
    }
  })

  console.log('🚀 RapidAPI Search Request:', {
    forceRefresh,
    debugMode,
    useMockData,
    mvpBeta: isMvpBetaEnabled,
    params: {
      title: params.title_filter,
      location: params.location_filter,
      limit: params.limit,
    }
  })

  try {
    // Validate endpoint
    if (!isValidEndpoint(params.endpoint)) {
      return NextResponse.json(
        { error: 'Invalid endpoint parameter', details: 'Endpoint must be one of: 7d, 24h, 1h' },
        { status: 400 }
      )
    }

    // Validate parameters
    const validation = validator.validateSearchParameters(params)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.errors },
        { status: 400 }
      )
    }

    // MVP Beta Points Check
    let developerForPoints: any = null
    if (isMvpBetaEnabled) {
      const session = await getServerSession()
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Authentication required', details: 'Please sign in to use the job search feature' },
          { status: 401 }
        )
      }

      developerForPoints = await prisma.developer.findUnique({
        where: { email: session.user.email },
        select: { id: true, monthlyPoints: true, pointsUsed: true, pointsEarned: true },
      })

      if (!developerForPoints) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
      }

      const availablePoints = Math.max(0, 
        developerForPoints.monthlyPoints + developerForPoints.pointsEarned - developerForPoints.pointsUsed
      )

      if (availablePoints < 1) {
        return NextResponse.json(
          {
            error: 'Insufficient points',
            details: `You need at least 1 point to search. You have ${availablePoints} points available.`,
          },
          { status: 402 }
        )
      }

      console.log(`[MVP Beta] User ${developerForPoints.id} has ${availablePoints} points`)
    }

    // Check cache (unless forceRefresh)
    if (!forceRefresh) {
      const cachedResponse = cacheManager.getCachedResponse(params)
      if (cachedResponse) {
        console.log('💾 Using cached response')

        // Deduct points for cached results
        let pointsInfo = null
        if (isMvpBetaEnabled && developerForPoints) {
          pointsInfo = await deductPointsForResults(
            request,
            requestId,
            cachedResponse.data.length,
            pointsPerResult,
            params,
            'cached'
          )
        }

        const response = NextResponse.json(cachedResponse.data)
        response.headers.set('X-Cache-Status', 'HIT')
        response.headers.set('X-Cache-Age', Math.floor(cachedResponse.age / 1000).toString())
        
        // Forward cached usage headers if available
        if (cachedResponse.usageHeaders) {
          response.headers.set('x-ratelimit-jobs-limit', cachedResponse.usageHeaders.jobsLimit.toString())
          response.headers.set('x-ratelimit-jobs-remaining', cachedResponse.usageHeaders.jobsRemaining.toString())
          response.headers.set('x-ratelimit-requests-limit', cachedResponse.usageHeaders.requestsLimit.toString())
          response.headers.set('x-ratelimit-requests-remaining', cachedResponse.usageHeaders.requestsRemaining.toString())
          response.headers.set('x-ratelimit-jobs-reset', cachedResponse.usageHeaders.jobsReset.toString())
        }
        
        if (pointsInfo) {
          response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
          response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
        }
        
        return response
      }
    }

    // Debug mode: stop (log but don't make API call)
    if (debugMode === 'stop') {
      console.log('\n🛑 DEBUG_RAPIDAPI=stop - Logging request without API call')
      console.log('Request would be made to:', `https://linkedin-job-search-api.p.rapidapi.com/${params.endpoint}`)
      console.log('Parameters:', params)

      const debugResponse = [{
        id: 'debug-1',
        title: '[DEBUG STOP] ' + params.title_filter,
        organization: '[DEBUG] Company',
        location: params.location_filter || 'Debug Location',
        description_text: 'This is a debug response - no real API call was made',
      }]

      // Create realistic debug headers and update usage
      const debugHeaders = new Headers()
      debugHeaders.set('x-ratelimit-jobs-limit', '10000')
      debugHeaders.set('x-ratelimit-jobs-remaining', '9999') // Almost full for debug
      debugHeaders.set('x-ratelimit-requests-limit', '1000')
      debugHeaders.set('x-ratelimit-requests-remaining', '999')
      debugHeaders.set('x-ratelimit-jobs-reset', '3600')
      
      // ALWAYS update usage regardless of debug mode
      cacheManager.updateUsage(debugHeaders)
      cacheManager.cacheResponse(params, debugResponse, debugHeaders)

      // Deduct points for debug results to test points system
      let pointsInfo = null
      if (isMvpBetaEnabled && developerForPoints) {
        pointsInfo = await deductPointsForResults(
          request,
          requestId,
          debugResponse.length,
          pointsPerResult,
          params,
          'production' // Use 'production' mode for debug to test the system
        )
      }

      const response = NextResponse.json(debugResponse)
      response.headers.set('X-Cache-Status', 'DEBUG_STOP')
      response.headers.set('X-API-Mode', 'DEBUG_STOP')
      
      // Forward debug headers so admin can see them
      response.headers.set('x-ratelimit-jobs-limit', '10000')
      response.headers.set('x-ratelimit-jobs-remaining', '9999')
      response.headers.set('x-ratelimit-requests-limit', '1000')
      response.headers.set('x-ratelimit-requests-remaining', '999')
      response.headers.set('x-ratelimit-jobs-reset', '3600')
      
      // Add points information to response headers
      if (pointsInfo) {
        response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
        response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
        response.headers.set('X-Points-Results-Count', debugResponse.length.toString())
      }
      
      return response
    }

    // Use mock data if configured or no API key
    if (useMockData) {
      console.log('📦 Using mock data')

      // Deduct points for mock results
      let pointsInfo = null
      if (isMvpBetaEnabled && developerForPoints) {
        pointsInfo = await deductPointsForResults(
          request,
          requestId,
          mockJobResponse.length,
          pointsPerResult,
          params,
          'mock'
        )
      }

      // Create realistic mock headers that represent actual usage
      const mockHeaders = new Headers()
      mockHeaders.set('x-ratelimit-jobs-limit', '10000')
      mockHeaders.set('x-ratelimit-jobs-remaining', '9950')
      mockHeaders.set('x-ratelimit-requests-limit', '1000')
      mockHeaders.set('x-ratelimit-requests-remaining', '985')
      mockHeaders.set('x-ratelimit-jobs-reset', '3600') // 1 hour reset
      
      // ALWAYS update usage regardless of mode
      cacheManager.updateUsage(mockHeaders)
      cacheManager.cacheResponse(params, mockJobResponse, mockHeaders)

      const response = NextResponse.json(mockJobResponse)
      response.headers.set('X-Cache-Status', 'MISS')
      response.headers.set('X-API-Mode', 'MOCK')
      
      if (pointsInfo) {
        response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
        response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
      }
      
      return response
    }

    // Make real API call
    const endpointMap = { '7d': 'active-jb-7d', '24h': 'active-jb-24h', '1h': 'active-jb-1h' }
    const endpointSuffix = endpointMap[params.endpoint as keyof typeof endpointMap] || 'active-jb-7d'
    const baseUrl = `https://linkedin-job-search-api.p.rapidapi.com/${endpointSuffix}`
    
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'endpoint') {
        queryParams.append(key, value.toString())
      }
    })

    const apiUrl = `${baseUrl}?${queryParams.toString()}`

    // Debug logging for real API calls
    if (debugMode === 'log') {
      const session = await getServerSession()
      RapidApiDebugLogger.logRequest({
        userId: session?.user?.email || 'anonymous',
        sessionId: requestId,
        originalParams: rawParams,
        normalizedParams: params,
        apiUrl,
        headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com' },
        estimatedCredits: cacheManager.calculateCreditConsumption(params),
        cacheInfo: { key: cacheManager.generateCacheKey(params), hit: false },
        endpoint: params.endpoint || '7d',
        timestamp: new Date().toISOString(),
      })
    }

    console.log('🌐 Making API call to:', apiUrl)

    const requestStartTime = Date.now()
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey!,
        'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
      },
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error(`RapidAPI Error: ${apiResponse.status} - ${errorText}`)
      
      const errorMessage = apiResponse.status === 429 ? 'Rate limit exceeded' :
                          apiResponse.status === 401 ? 'Invalid API key' :
                          apiResponse.status === 400 ? `Bad request: ${errorText}` :
                          `API request failed: ${apiResponse.status}`
      
      throw new Error(errorMessage)
    }

    const result = await apiResponse.json()

    if (!Array.isArray(result)) {
      throw new Error('Invalid API response format - expected array of jobs')
    }

    console.log(`✅ API success: received ${result.length} jobs`)

    // Debug logging for response
    if (debugMode === 'log') {
      RapidApiDebugLogger.logResponse({
        duration: Date.now() - requestStartTime,
        statusCode: apiResponse.status,
        success: true,
        responseHeaders: Object.fromEntries(apiResponse.headers.entries()),
        responseData: result,
        error: null,
        cacheStored: true,
        dataQuality: {
          jobCount: result.length,
          aiFieldsCoverage: result.filter((job: any) => job.ai_key_skills).length / result.length,
          descriptionCoverage: result.filter((job: any) => job.description_text).length / result.length,
        },
      })
    }

    // Deduct points for production results
    let pointsInfo = null
    if (isMvpBetaEnabled && developerForPoints) {
      pointsInfo = await deductPointsForResults(
        request,
        requestId,
        result.length,
        pointsPerResult,
        params,
        'production'
      )
    }

    // Update usage and cache
    cacheManager.updateUsage(apiResponse.headers)
    cacheManager.cacheResponse(params, result, apiResponse.headers)

    // Create response
    const response = NextResponse.json(result)
    response.headers.set('X-Cache-Status', 'MISS')
    response.headers.set('X-API-Mode', 'PRODUCTION')
    
    if (pointsInfo) {
      response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
      response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
    }

    // Forward rate limit headers
    apiResponse.headers.forEach((value, key) => {
      if (key.startsWith('x-ratelimit-')) {
        response.headers.set(key, value)
      }
    })

    return response

  } catch (error: any) {
    console.error('Internal Server Error in RapidAPI search:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}