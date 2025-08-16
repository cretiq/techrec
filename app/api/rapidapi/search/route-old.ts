import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import mockJobResponse from './rapidapi_job_response_enhanced.json'
import RapidApiCacheManager, { type SearchParameters } from '@/lib/api/rapidapi-cache'
import RapidApiValidator from '@/lib/api/rapidapi-validator'
import { RapidApiEndpointLogger, isPremiumEndpoint, isValidEndpoint, isEligibleSubscriptionTier } from '@/utils/rapidApiEndpointLogger'
import { RapidApiDebugLogger } from '@/utils/rapidApiDebugLogger'

const prisma = new PrismaClient()

// High-fidelity RapidAPI parameter defaults for enhanced data quality
const DEFAULT_AGENCY = process.env.RAPIDAPI_DEFAULT_AGENCY || 'FALSE' // Direct employers only
const DEFAULT_INCLUDE_AI = process.env.RAPIDAPI_DEFAULT_INCLUDE_AI || 'true' // Enable AI-enriched fields
const DEFAULT_DESCRIPTION_TYPE = process.env.RAPIDAPI_DEFAULT_DESCRIPTION_TYPE || 'text' // Full job descriptions

// Helper function to apply high-fidelity defaults
function getParamWithDefault(value: string | null, defaultValue: string): string {
  if (!value || value.trim() === '') {
    return defaultValue;
  }
  return value.trim();
}

// Force high-fidelity parameters regardless of frontend input
function enforceHighFidelityDefaults(params: SearchParameters): SearchParameters {
  return {
    ...params,
    // ENFORCE high-fidelity defaults - these override any frontend values
    agency: DEFAULT_AGENCY,           // Always FALSE (direct employers only)
    include_ai: DEFAULT_INCLUDE_AI,   // Always true (AI-enriched fields)
    description_type: DEFAULT_DESCRIPTION_TYPE, // Always text (full descriptions)
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cacheManager = RapidApiCacheManager.getInstance()
  const validator = RapidApiValidator.getInstance()

  const requestId = RapidApiEndpointLogger.generateRequestId()
  
  // Check if MVP beta mode is enabled
  const isMvpBetaEnabled = process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true'
  const pointsPerResult = parseInt(process.env.MVP_POINTS_PER_RESULT || '1')
  
  // Check if this is a forced refresh (bypasses all caching)
  const forceRefresh = searchParams.get('forceRefresh') === 'true'
  
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
    // Endpoint selection (defaults to '7d' if not specified)
    endpoint: searchParams.get('endpoint') || '7d',
  }

  // ENFORCE high-fidelity defaults regardless of frontend input
  const paramsWithDefaults = enforceHighFidelityDefaults(params);
  
  // Add default job title if none provided
  if (!paramsWithDefaults.title_filter || paramsWithDefaults.title_filter.trim() === '') {
    paramsWithDefaults.title_filter = 'Software Engineer';
  }

  // Log high-fidelity parameter usage for monitoring
  console.log('🚀 High-fidelity RapidAPI parameters:', {
    forceRefresh,
    agency: paramsWithDefaults.agency,
    include_ai: paramsWithDefaults.include_ai,
    description_type: paramsWithDefaults.description_type,
    title_filter: paramsWithDefaults.title_filter,
    fromURL: {
      agency: searchParams.get('agency'),
      include_ai: searchParams.get('include_ai'),
      description_type: searchParams.get('description_type'),
      title_filter: searchParams.get('title_filter')
    },
    defaultsApplied: {
      agency: paramsWithDefaults.agency === DEFAULT_AGENCY,
      include_ai: paramsWithDefaults.include_ai === DEFAULT_INCLUDE_AI,
      description_type: paramsWithDefaults.description_type === DEFAULT_DESCRIPTION_TYPE,
      title_filter: paramsWithDefaults.title_filter === 'Software Engineer'
    }
  });

  // Remove undefined values
  Object.keys(paramsWithDefaults).forEach(key => {
    if (paramsWithDefaults[key as keyof SearchParameters] === undefined || paramsWithDefaults[key as keyof SearchParameters] === null) {
      delete paramsWithDefaults[key as keyof SearchParameters]
    }
  })

  try {
    // Validate endpoint parameter
    if (!isValidEndpoint(paramsWithDefaults.endpoint)) {
      RapidApiEndpointLogger.logError('Invalid Endpoint', `Invalid endpoint: ${paramsWithDefaults.endpoint}`, { requestId })
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
      endpoint: paramsWithDefaults.endpoint,
      isPremium: isPremiumEndpoint(paramsWithDefaults.endpoint),
      requestId,
      timestamp: new Date().toISOString()
    })

    // Validate parameters
    const validation = validator.validateSearchParameters(paramsWithDefaults)
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

    // Use parameters with high-fidelity defaults applied
    // Note: validation.normalizedParams is now the same as paramsWithDefaults since we validate after applying defaults
    
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
      const maxPossibleCost = (paramsWithDefaults.limit || 10) * pointsPerResult

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

    // Check cache first (unless forceRefresh is true)
    const cachedResponse = (!forceRefresh) ? cacheManager.getCachedResponse(paramsWithDefaults) : null
    
    if (forceRefresh) {
      console.log('🔄 ForceRefresh=true: Bypassing all caches, making fresh API call')
    }
    
    if (cachedResponse) {
      console.log('💾 Using cached response for parameters:', paramsWithDefaults)
      
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
                  searchParams: paramsWithDefaults,
                  resultsCount,
                  cached: true,
                  pointsPerResult,
                },
              }),
            })

            if (pointsResponse.ok) {
              const pointsResult = await pointsResponse.json()
              console.log(`[MVP Beta] ✅ Successfully deducted ${pointsToDeduct} points for ${resultsCount} cached results`)
              console.log(`[MVP Beta] Points API response:`, pointsResult)
              
              // Store the actual new balance for response
              cachedResponse.pointsInfo = {
                pointsSpent: pointsResult.pointsSpent,
                newBalance: pointsResult.newBalance,
                resultsCount,
              }
            } else {
              const errorText = await pointsResponse.text()
              console.error(`[MVP Beta] ❌ Failed to deduct points: ${pointsResponse.status} - ${errorText}`)
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
      
      // Add points info to headers if available
      if (cachedResponse.pointsInfo) {
        response.headers.set('X-Points-Spent', cachedResponse.pointsInfo.pointsSpent.toString())
        response.headers.set('X-Points-New-Balance', cachedResponse.pointsInfo.newBalance.toString())
        response.headers.set('X-Points-Results-Count', cachedResponse.pointsInfo.resultsCount.toString())
      }
      
      return response
    }

    // Check if we can make a request (credit limits)
    const creditCheck = cacheManager.canMakeRequest(paramsWithDefaults)
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
    const consumption = cacheManager.calculateCreditConsumption(paramsWithDefaults)
    
    console.log('Making API request with high-fidelity parameters:', paramsWithDefaults)
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

    RapidApiEndpointLogger.logModeDetection(isDevelopment, !!apiKey, false)

    if (isDevelopment) {
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
                  searchParams: paramsWithDefaults,
                  resultsCount,
                  mockData: true,
                  pointsPerResult,
                },
              }),
            })

            let pointsInfo = null
            if (pointsResponse.ok) {
              const pointsResult = await pointsResponse.json()
              console.log(`[MVP Beta] ✅ Successfully deducted ${pointsToDeduct} points for ${resultsCount} mock results`)
              console.log(`[MVP Beta] Points API response:`, pointsResult)
              
              pointsInfo = {
                pointsSpent: pointsResult.pointsSpent,
                newBalance: pointsResult.newBalance,
                resultsCount,
              }
            } else {
              const errorText = await pointsResponse.text()
              console.error(`[MVP Beta] ❌ Failed to deduct points: ${pointsResponse.status} - ${errorText}`)
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

      // Update usage tracking with mock headers (ALWAYS store usage regardless of environment)
      cacheManager.updateUsage(mockHeaders)

      // Cache the mock response
      cacheManager.cacheResponse(paramsWithDefaults, mockJobResponse, mockHeaders)

      // Create response with usage headers
      const response = NextResponse.json(mockJobResponse)
      response.headers.set('X-Cache-Status', 'MISS')
      response.headers.set('X-API-Mode', 'DEVELOPMENT')
      
      // Add points info to headers if available
      if (pointsInfo) {
        response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
        response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
        response.headers.set('X-Points-Results-Count', pointsInfo.resultsCount.toString())
      }
      
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
    const endpointSuffix = endpointMap[paramsWithDefaults.endpoint as keyof typeof endpointMap] || 'active-jb-7d'
    const baseUrl = `https://linkedin-job-search-api.p.rapidapi.com/${endpointSuffix}`
    const apiHost = 'linkedin-job-search-api.p.rapidapi.com'
    
    RapidApiEndpointLogger.logApiCall({
      endpoint: paramsWithDefaults.endpoint,
      originalUrl: 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d',
      constructedUrl: baseUrl,
      parameters: paramsWithDefaults,
      success: true // Will be updated based on actual response
    })

    // Build query string from high-fidelity parameters (excluding our internal endpoint parameter)
    const queryParams = new URLSearchParams()
    Object.entries(paramsWithDefaults).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'endpoint') {
        queryParams.append(key, value.toString())
      }
    })

    const apiUrl = `${baseUrl}?${queryParams.toString()}`
    
    console.log('Making PRODUCTION API call to:', apiUrl)
    console.log('Estimated credit consumption:', consumption)

    // STOP API CALL MODE: Log request details but don't make actual API call (cost-free debugging)
    const stopApiCall = process.env.STOP_RAPIDAPI_CALL === 'true'
    
    if (stopApiCall) {
      console.log('\n🛑 STOP_RAPIDAPI_CALL=true - Request details without actual API call:')
      console.log('═'.repeat(80))
      console.log('📡 REQUEST DETAILS:')
      console.log('  Method: GET')
      console.log('  URL:', apiUrl)
      console.log('  Host:', apiHost)
      console.log('  API Key Length:', apiKey?.length || 0, 'characters')
      console.log('  API Key Preview:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'undefined')
      
      console.log('\n📋 HEADERS:')
      console.log('  x-rapidapi-key:', apiKey ? '[REDACTED]' : 'undefined')
      console.log('  x-rapidapi-host:', apiHost)
      
      console.log('\n🎯 QUERY PARAMETERS:')
      const allParams = Object.fromEntries(queryParams.entries())
      Object.entries(allParams).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
      
      console.log('\n⚡ HIGH-FIDELITY DEFAULTS (Your Quality Enhancement):')
      console.log('  agency:', allParams.agency || 'NOT SET', '← Direct employers only')
      console.log('  include_ai:', allParams.include_ai || 'NOT SET', '← AI-enriched fields') 
      console.log('  description_type:', allParams.description_type || 'NOT SET', '← Full job descriptions')
      
      console.log('\n💰 CREDIT IMPACT:')
      console.log('  Estimated job consumption:', consumption.jobs)
      console.log('  Estimated request consumption:', consumption.requests)
      console.log('  MVP Beta points per result:', pointsPerResult)
      
      console.log('\n🌐 ENDPOINT DETAILS:')
      console.log('  Selected endpoint:', paramsWithDefaults.endpoint)
      console.log('  Base URL:', baseUrl)
      console.log('  Full constructed URL:', apiUrl)
      
      console.log('═'.repeat(80))
      console.log('🛑 STOP: Request inspection complete - NO API CALL MADE')
      console.log('💡 To make real API calls, set STOP_RAPIDAPI_CALL=false or remove it\n')
      
      // Return debug response that matches expected structure
      const debugResponse = [
        {
          id: 'debug-job-1',
          title: '[STOP MODE] Software Engineer',
          organization: '[STOP MODE] Tech Company',
          date_posted: new Date().toISOString(),
          location: '[STOP MODE] Debug City',
          description_text: '[STOP MODE] This is a debug job entry showing the structure of real API responses.',
          url: 'https://debug-job-url.example.com',
          agency: allParams.agency,
          include_ai: allParams.include_ai,
          description_type: allParams.description_type,
          debug_mode: true,
          debug_timestamp: new Date().toISOString(),
          debug_message: 'This is a debug response - no real API call was made (STOP_RAPIDAPI_CALL=true)'
        }
      ]

      // Create debug response with simulated headers
      const debugHeaders = new Headers()
      debugHeaders.set('x-ratelimit-jobs-limit', '10000')
      debugHeaders.set('x-ratelimit-jobs-remaining', '9999')
      debugHeaders.set('x-ratelimit-requests-limit', '1000')
      debugHeaders.set('x-ratelimit-requests-remaining', '999')
      debugHeaders.set('x-ratelimit-jobs-reset', '86400')
      debugHeaders.set('x-debug-mode', 'true')

      // Update usage tracking with debug headers (ALWAYS store usage regardless of environment)
      cacheManager.updateUsage(debugHeaders)

      // Cache the debug response (with debug flag)
      cacheManager.cacheResponse(paramsWithDefaults, debugResponse, debugHeaders)

      // Create response with debug indicators
      const response = NextResponse.json(debugResponse)
      response.headers.set('X-Cache-Status', 'STOPPED')
      response.headers.set('X-API-Mode', 'STOP_DEBUG')
      response.headers.set('X-Debug-Request-URL', apiUrl)
      
      // Forward the debug usage headers
      debugHeaders.forEach((value, key) => {
        if (key.startsWith('x-ratelimit-') || key.startsWith('x-debug-')) {
          response.headers.set(key, value)
        }
      })

      console.log('📤 STOP: Returning debug response with', debugResponse.length, 'mock jobs')
      return response
    }

    // DEBUG LOGGING: Check if we should enable comprehensive logging for REAL API calls
    const debugLogging = process.env.DEBUG_RAPIDAPI_CALL === 'true'
    const requestStartTime = Date.now()
    
    // Get session for debug logging (reuse if already available from MVP mode)
    const sessionForLogging = isMvpBetaEnabled ? 
      (await getServerSession()) : 
      (debugLogging ? await getServerSession() : null)
    
    if (debugLogging) {
      RapidApiDebugLogger.logRequest({
        userId: sessionForLogging?.user?.email || 'anonymous',
        sessionId: requestId,
        originalParams: params,
        normalizedParams: paramsWithDefaults,
        apiUrl,
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost,
        },
        estimatedCredits: consumption,
        cacheInfo: {
          key: cacheManager.generateCacheKey(paramsWithDefaults),
          hit: false, // We're making a real call, so cache was missed
        },
        endpoint: paramsWithDefaults.endpoint || '7d',
        timestamp: new Date().toISOString(),
      })
    }

    // REAL API CALL (only when not in debug mode)
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

    // DEBUG LOGGING: Log response details after real API call
    if (process.env.DEBUG_RAPIDAPI_CALL === 'true') {
      const requestDuration = Date.now() - requestStartTime
      
      // Calculate data quality metrics
      const dataQuality = {
        jobCount: result.length,
        aiFieldsCoverage: result.length > 0 ? 
          result.filter(job => job.ai_key_skills || job.ai_work_arrangement || job.ai_salary_currency).length / result.length : 0,
        linkedInOrgCoverage: result.length > 0 ?
          result.filter(job => job.linkedin_org_industry || job.linkedin_org_type).length / result.length : 0,
        descriptionCoverage: result.length > 0 ?
          result.filter(job => job.description_text).length / result.length : 0,
        avgSkillsPerJob: result.length > 0 ?
          result.reduce((sum, job) => sum + (job.ai_key_skills?.length || 0), 0) / result.length : 0,
        salaryDataCoverage: result.length > 0 ?
          result.filter(job => job.ai_salary_currency || job.salary_raw).length / result.length : 0,
      }

      // Convert response headers to plain object
      const responseHeaders: Record<string, string> = {}
      apiResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      RapidApiDebugLogger.logResponse({
        duration: requestDuration,
        statusCode: apiResponse.status,
        success: true,
        responseHeaders,
        responseData: result,
        error: null,
        cacheStored: true, // Will be stored by cache manager
        dataQuality,
      })
    }

    // Deduct points for MVP Beta (production results)
    let pointsInfo = null
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
                searchParams: paramsWithDefaults,
                resultsCount,
                production: true,
                pointsPerResult,
              },
            }),
          })

          if (pointsResponse.ok) {
            const pointsResult = await pointsResponse.json()
            console.log(`[MVP Beta] ✅ Successfully deducted ${pointsToDeduct} points for ${resultsCount} production results`)
            console.log(`[MVP Beta] Points API response:`, pointsResult)
            
            pointsInfo = {
              pointsSpent: pointsResult.pointsSpent,
              newBalance: pointsResult.newBalance,
              resultsCount,
            }
          } else {
            const errorText = await pointsResponse.text()
            console.error(`[MVP Beta] ❌ Failed to deduct points: ${pointsResponse.status} - ${errorText}`)
          }
        } catch (error) {
          console.error('[MVP Beta] Failed to deduct points for production results:', error)
        }
      } else {
        console.log(`[MVP Beta] No points deducted - search returned 0 results`)
      }
    }

    // Update usage tracking (ALWAYS store usage regardless of environment)
    cacheManager.updateUsage(apiResponse.headers)

    // Cache the response
    cacheManager.cacheResponse(paramsWithDefaults, result, apiResponse.headers)

    // Create response with usage headers
    const response = NextResponse.json(result)
    
    // Add points info to headers if available
    if (pointsInfo) {
      response.headers.set('X-Points-Spent', pointsInfo.pointsSpent.toString())
      response.headers.set('X-Points-New-Balance', pointsInfo.newBalance.toString())
      response.headers.set('X-Points-Results-Count', pointsInfo.resultsCount.toString())
    }
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