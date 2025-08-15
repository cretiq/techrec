import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import mockJobResponse from './rapidapi_job_response_enhanced.json'
import RapidApiCacheManager, { type SearchParameters } from '@/lib/api/rapidapi-cache'
import RapidApiValidator from '@/lib/api/rapidapi-validator'
import { RapidApiEndpointLogger, isPremiumEndpoint, isValidEndpoint, isEligibleSubscriptionTier } from '@/utils/rapidApiEndpointLogger'

const prisma = new PrismaClient()

// High-fidelity RapidAPI parameter defaults for enhanced data quality
const DEFAULT_AGENCY = process.env.RAPIDAPI_DEFAULT_AGENCY || 'FALSE' // Direct employers only
const DEFAULT_INCLUDE_AI = process.env.RAPIDAPI_DEFAULT_INCLUDE_AI || 'true' // Enable AI-enriched fields
const DEFAULT_DESCRIPTION_TYPE = process.env.RAPIDAPI_DEFAULT_DESCRIPTION_TYPE || 'text' // Full job descriptions

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cacheManager = RapidApiCacheManager.getInstance()
  const validator = RapidApiValidator.getInstance()

  const requestId = RapidApiEndpointLogger.generateRequestId()
  
  // Check if MVP beta mode is enabled
  const isMvpBetaEnabled = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true'
  const pointsPerResult = parseInt(process.env.MVP_POINTS_PER_RESULT || '1')
  
  // Extract all possible parameters from URL
  const params: SearchParameters = {
    limit: parseInt(searchParams.get('limit') || '10'),
    offset: parseInt(searchParams.get('offset') || '0'),
    title_filter: searchParams.get('title') || searchParams.get('title_filter'),
    advanced_title_filter: searchParams.get('advanced_title_filter'), // BLUEPRINT REQUIREMENT
    location_filter: searchParams.get('location') || searchParams.get('location_filter'),
    type_filter: searchParams.get('type_filter'),
    seniority_filter: searchParams.get('seniority_filter'),
    description_filter: searchParams.get('description_filter'),
    // Organization filters
    organization_description_filter: searchParams.get('organization_description_filter'),
    organization_specialties_filter: searchParams.get('organization_specialties_filter'),
    organization_slug_filter: searchParams.get('organization_slug_filter'),
    industry_filter: searchParams.get('industry_filter'),
    remote: searchParams.get('remote'),
    remote_derived: searchParams.get('remote_derived'), // BLUEPRINT REQUIREMENT
    agency: searchParams.get('agency') || DEFAULT_AGENCY,
    date_filter: searchParams.get('date_filter'),
    external_apply_url: searchParams.get('external_apply_url'),
    directapply: searchParams.get('directapply'),
    employees_lte: searchParams.get('employees_lte') ? parseInt(searchParams.get('employees_lte')!) : undefined,
    employees_gte: searchParams.get('employees_gte') ? parseInt(searchParams.get('employees_gte')!) : undefined,
    order: searchParams.get('order'),
    include_ai: searchParams.get('include_ai') || DEFAULT_INCLUDE_AI,
    ai_work_arrangement_filter: searchParams.get('ai_work_arrangement_filter'),
    ai_has_salary: searchParams.get('ai_has_salary'),
    ai_experience_level_filter: searchParams.get('ai_experience_level_filter'),
    ai_visa_sponsorship_filter: searchParams.get('ai_visa_sponsorship_filter'),
    description_type: searchParams.get('description_type') || DEFAULT_DESCRIPTION_TYPE,
    // Endpoint selection (defaults to '7d' if not specified)
    endpoint: searchParams.get('endpoint') || '7d',
  }

  // Log high-fidelity parameter usage for monitoring
  console.log('🚀 High-fidelity RapidAPI parameters:', {
    agency: params.agency,
    include_ai: params.include_ai,
    description_type: params.description_type,
    defaultsUsed: {
      agency: !searchParams.get('agency'),
      include_ai: !searchParams.get('include_ai'),
      description_type: !searchParams.get('description_type')
    }
  });

  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key as keyof SearchParameters] === undefined || params[key as keyof SearchParameters] === null) {
      delete params[key as keyof SearchParameters]
    }
  })

  try {
    // Validate endpoint parameter
    if (!isValidEndpoint(params.endpoint)) {
      RapidApiEndpointLogger.logError('Invalid Endpoint', `Invalid endpoint: ${params.endpoint}`, { requestId })
      return NextResponse.json(
        { 
          error: 'Invalid endpoint parameter',
          details: 'Endpoint must be one of: 7d, 24h, 1h',
          requestId
        },
        { status: 400 }
      )
    }

    // Log endpoint selection
    RapidApiEndpointLogger.logEndpointSelection({
      endpoint: params.endpoint,
      isPremium: isPremiumEndpoint(params.endpoint),
      requestId,
      timestamp: new Date().toISOString()
    })

    // Validate parameters
    const validation = validator.validateSearchParameters(params)
    if (!validation.valid) {
      console.error('Parameter validation failed:', validation.errors)
      RapidApiEndpointLogger.logError('Parameter Validation Failed', validation.errors, { requestId })
      return NextResponse.json(
        { 
          error: 'Invalid search parameters',
          details: validation.errors,
          warnings: validation.warnings,
          requestId
        },
        { status: 400 }
      )
    }

    // Log validation warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Parameter validation warnings:', validation.warnings)
    }

    // Use normalized parameters
    const normalizedParams = validation.normalizedParams
    
    // MVP Beta Points Check - Check if user has enough points BEFORE search
    let developerForPoints: any = null
    if (isMvpBetaEnabled) {
      // Get user session for points validation
      const session = await getServerSession()
      if (!session?.user?.email) {
        return NextResponse.json(
          { 
            error: 'Authentication required',
            details: 'Please sign in to use the job search feature',
            requestId
          },
          { status: 401 }
        )
      }

      // Get user's points balance
      developerForPoints = await prisma.developer.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          monthlyPoints: true,
          pointsUsed: true,
          pointsEarned: true,
        },
      })

      if (!developerForPoints) {
        return NextResponse.json(
          { 
            error: 'User profile not found',
            requestId
          },
          { status: 404 }
        )
      }

      // Calculate available points
      const availablePoints = Math.max(0, developerForPoints.monthlyPoints + developerForPoints.pointsEarned - developerForPoints.pointsUsed)
      const maxPossibleCost = (normalizedParams.limit || 10) * pointsPerResult

      // Check if user has at least 1 point (minimum to search)
      if (availablePoints < 1) {
        return NextResponse.json(
          { 
            error: 'Insufficient points',
            details: `You need at least 1 point to search. You have ${availablePoints} points available. Please contact support for more points.`,
            pointsRequired: 1,
            pointsAvailable: availablePoints,
            requestId
          },
          { status: 402 }
        )
      }

      console.log(`[MVP Beta] User ${developerForPoints.id} has ${availablePoints} points, max possible cost: ${maxPossibleCost}`)
    }

    // Check cache first
    const cachedResponse = cacheManager.getCachedResponse(normalizedParams)
    if (cachedResponse) {
      console.log('Returning cached response for parameters:', normalizedParams)
      
      // Deduct points for MVP Beta (even for cached results)
      if (isMvpBetaEnabled && developerForPoints) {
        const resultsCount = cachedResponse.data.length
        const pointsToDeduct = resultsCount * pointsPerResult
        
        if (pointsToDeduct > 0) {
          try {
            const pointsResponse = await fetch(`${new URL(request.url).origin}/api/gamification/points`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('Cookie') || '',
              },
              body: JSON.stringify({
                action: 'JOB_QUERY',
                sourceId: `search_cached_${requestId}`,
                metadata: {
                  requestId,
                  searchParams: normalizedParams,
                  resultsCount,
                  cached: true,
                  pointsPerResult,
                },
              }),
            })

            if (pointsResponse.ok) {
              const pointsResult = await pointsResponse.json()
              console.log(`[MVP Beta] Deducted ${pointsToDeduct} points for ${resultsCount} cached results`)
            }
          } catch (error) {
            console.error('[MVP Beta] Failed to deduct points for cached results:', error)
          }
        }
      }
      
      // Add cache metadata to response headers
      const response = NextResponse.json(cachedResponse.data)
      response.headers.set('X-Cache-Status', 'HIT')
      response.headers.set('X-Cache-Age', Math.floor(cachedResponse.age / 1000).toString())
      response.headers.set('X-Cache-Timestamp', new Date(cachedResponse.timestamp).toISOString())
      
      return response
    }

    // Check if we can make a request (credit limits)
    const creditCheck = cacheManager.canMakeRequest(normalizedParams)
    if (!creditCheck.allowed) {
      console.error('API request blocked due to credit limits:', creditCheck.reason)
      return NextResponse.json(
        { 
          error: 'API request blocked',
          reason: creditCheck.reason,
          suggestion: 'Please try again later or reduce the search limit'
        },
        { status: 429 }
      )
    }

    // Get current usage for logging
    const currentUsage = cacheManager.getCurrentUsage()
    const consumption = cacheManager.calculateCreditConsumption(normalizedParams)
    
    console.log('Making API request with normalized parameters:', normalizedParams)
    console.log('Estimated credit consumption:', consumption)
    if (currentUsage) {
      console.log('Current API usage:', {
        jobsRemaining: currentUsage.jobsRemaining,
        requestsRemaining: currentUsage.requestsRemaining
      })
    }

    // PRODUCTION MODE: Check for API key to determine mode
    const apiKey = process.env.RAPIDAPI_KEY
    const isDevelopment = !apiKey || apiKey.trim() === ''

    console.log('Environment check:', { 
      hasApiKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      isDevelopment,
      envKeys: Object.keys(process.env).filter(key => key.includes('RAPID')),
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
    })

    const forceDevMode = true; // Currently forced for testing
    RapidApiEndpointLogger.logModeDetection(isDevelopment, !!apiKey, forceDevMode)

    // if (isDevelopment) {
    if (forceDevMode) {
      // DEVELOPMENT MODE: Return mock data with simulated headers
      console.log('Running in DEVELOPMENT mode (forced for testing)')
      
      // Deduct points for MVP Beta (mock results)
      if (isMvpBetaEnabled && developerForPoints) {
        const resultsCount = mockJobResponse.length
        const pointsToDeduct = resultsCount * pointsPerResult
        
        if (pointsToDeduct > 0) {
          try {
            const pointsResponse = await fetch(`${new URL(request.url).origin}/api/gamification/points`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('Cookie') || '',
              },
              body: JSON.stringify({
                action: 'JOB_QUERY',
                sourceId: `search_mock_${requestId}`,
                metadata: {
                  requestId,
                  searchParams: normalizedParams,
                  resultsCount,
                  mockData: true,
                  pointsPerResult,
                },
              }),
            })

            if (pointsResponse.ok) {
              const pointsResult = await pointsResponse.json()
              console.log(`[MVP Beta] Deducted ${pointsToDeduct} points for ${resultsCount} mock results`)
            }
          } catch (error) {
            console.error('[MVP Beta] Failed to deduct points for mock results:', error)
          }
        }
      }
      
      // Simulate usage headers for development
      const mockHeaders = new Headers()
      mockHeaders.set('x-ratelimit-jobs-limit', '10000')
      mockHeaders.set('x-ratelimit-jobs-remaining', '9950')
      mockHeaders.set('x-ratelimit-requests-limit', '1000')
      mockHeaders.set('x-ratelimit-requests-remaining', '985')
      mockHeaders.set('x-ratelimit-jobs-reset', '86400')

      // Update usage tracking with mock headers
      cacheManager.updateUsage(mockHeaders)

      // Cache the mock response
      cacheManager.cacheResponse(normalizedParams, mockJobResponse, mockHeaders)

      // Create response with usage headers
      const response = NextResponse.json(mockJobResponse)
      response.headers.set('X-Cache-Status', 'MISS')
      response.headers.set('X-API-Mode', 'DEVELOPMENT')
      
      // Forward the usage headers
      mockHeaders.forEach((value, key) => {
        if (key.startsWith('x-ratelimit-')) {
          response.headers.set(key, value)
        }
      })

      console.log('Returned mock response with simulated API usage tracking')
      return response
    }

    // PRODUCTION MODE: Make real API calls
    console.log('Running in PRODUCTION mode with real API calls')
    
    // Construct dynamic endpoint URL based on selection
    const endpointMap = {
      '7d': 'active-jb-7d',
      '24h': 'active-jb-24h', 
      '1h': 'active-jb-1h'
    }
    const endpointSuffix = endpointMap[normalizedParams.endpoint as keyof typeof endpointMap] || 'active-jb-7d'
    const baseUrl = `https://linkedin-job-search-api.p.rapidapi.com/${endpointSuffix}`
    const apiHost = 'linkedin-job-search-api.p.rapidapi.com'
    
    RapidApiEndpointLogger.logApiCall({
      endpoint: normalizedParams.endpoint,
      originalUrl: 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d',
      constructedUrl: baseUrl,
      parameters: normalizedParams,
      success: true // Will be updated based on actual response
    })

    // Build query string from normalized parameters (excluding our internal endpoint parameter)
    const queryParams = new URLSearchParams()
    Object.entries(normalizedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'endpoint') {
        queryParams.append(key, value.toString())
      }
    })

    const apiUrl = `${baseUrl}?${queryParams.toString()}`
    
    console.log('Making PRODUCTION API call to:', apiUrl)
    console.log('Estimated credit consumption:', consumption)

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error(`RapidAPI Error: ${apiResponse.status} - ${errorText}`)
      
      // Provide detailed error information
      if (apiResponse.status === 429) {
        throw new Error('Rate limit exceeded - please wait before making more requests')
      } else if (apiResponse.status === 401) {
        throw new Error('Invalid API key - check RAPIDAPI_KEY environment variable')
      } else if (apiResponse.status === 400) {
        throw new Error(`Bad request parameters: ${errorText}`)
      } else {
        throw new Error(`RapidAPI request failed: ${apiResponse.status} - ${errorText}`)
      }
    }

    const result = await apiResponse.json()
    
    // Validate API response structure
    if (!Array.isArray(result)) {
      console.warn('API response is not an array:', result)
      throw new Error('Invalid API response format - expected array of jobs')
    }

    console.log(`PRODUCTION API success: received ${result.length} jobs`)

    // Deduct points for MVP Beta (production results)
    if (isMvpBetaEnabled && developerForPoints) {
      const resultsCount = result.length
      const pointsToDeduct = resultsCount * pointsPerResult
      
      if (pointsToDeduct > 0) {
        try {
          const pointsResponse = await fetch(`${new URL(request.url).origin}/api/gamification/points`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('Cookie') || '',
            },
            body: JSON.stringify({
              action: 'JOB_QUERY',
              sourceId: `search_production_${requestId}`,
              metadata: {
                requestId,
                searchParams: normalizedParams,
                resultsCount,
                production: true,
                pointsPerResult,
              },
            }),
          })

          if (pointsResponse.ok) {
            const pointsResult = await pointsResponse.json()
            console.log(`[MVP Beta] Deducted ${pointsToDeduct} points for ${resultsCount} production results`)
          }
        } catch (error) {
          console.error('[MVP Beta] Failed to deduct points for production results:', error)
        }
      } else {
        console.log(`[MVP Beta] No points deducted - search returned 0 results`)
      }
    }

    // Update usage tracking
    cacheManager.updateUsage(apiResponse.headers)

    // Cache the response
    cacheManager.cacheResponse(normalizedParams, result, apiResponse.headers)

    // Create response with usage headers
    const response = NextResponse.json(result)
    response.headers.set('X-Cache-Status', 'MISS')
    response.headers.set('X-API-Mode', 'PRODUCTION')
    
    // Forward important headers
    apiResponse.headers.forEach((value, key) => {
      if (key.startsWith('x-ratelimit-')) {
        response.headers.set(key, value)
      }
    })

    return response

  } catch (error: any) {
    console.error('Internal Server Error in RapidAPI search:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 