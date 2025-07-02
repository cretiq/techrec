import { NextResponse } from 'next/server'
import mockJobResponse from './rapidapi_job_response_example_v4.json'
import RapidApiCacheManager, { type SearchParameters } from '@/lib/api/rapidapi-cache'
import RapidApiValidator from '@/lib/api/rapidapi-validator'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cacheManager = RapidApiCacheManager.getInstance()
  const validator = RapidApiValidator.getInstance()

  // Extract all possible parameters from URL
  const params: SearchParameters = {
    limit: parseInt(searchParams.get('limit') || '10'),
    offset: parseInt(searchParams.get('offset') || '0'),
    title_filter: searchParams.get('title') || searchParams.get('title_filter'),
    location_filter: searchParams.get('location') || searchParams.get('location_filter'),
    type_filter: searchParams.get('type_filter'),
    seniority_filter: searchParams.get('seniority_filter'),
    description_filter: searchParams.get('description_filter'),
    remote: searchParams.get('remote'),
    agency: searchParams.get('agency'),
    date_filter: searchParams.get('date_filter'),
    external_apply_url: searchParams.get('external_apply_url'),
    directapply: searchParams.get('directapply'),
    employees_lte: searchParams.get('employees_lte') ? parseInt(searchParams.get('employees_lte')!) : undefined,
    employees_gte: searchParams.get('employees_gte') ? parseInt(searchParams.get('employees_gte')!) : undefined,
    order: searchParams.get('order'),
    include_ai: searchParams.get('include_ai'),
    ai_work_arrangement_filter: searchParams.get('ai_work_arrangement_filter'),
    ai_has_salary: searchParams.get('ai_has_salary'),
    ai_experience_level_filter: searchParams.get('ai_experience_level_filter'),
    ai_visa_sponsorship_filter: searchParams.get('ai_visa_sponsorship_filter'),
    description_type: searchParams.get('description_type'),
  }

  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key as keyof SearchParameters] === undefined || params[key as keyof SearchParameters] === null) {
      delete params[key as keyof SearchParameters]
    }
  })

  try {
    // Validate parameters
    const validation = validator.validateSearchParameters(params)
    if (!validation.valid) {
      console.error('Parameter validation failed:', validation.errors)
      return NextResponse.json(
        { 
          error: 'Invalid search parameters',
          details: validation.errors,
          warnings: validation.warnings
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

    // Check cache first
    const cachedResponse = cacheManager.getCachedResponse(normalizedParams)
    if (cachedResponse) {
      console.log('Returning cached response for parameters:', normalizedParams)
      
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

    if (isDevelopment) {
      // DEVELOPMENT MODE: Return mock data with simulated headers
      console.log('Running in DEVELOPMENT mode (no RAPIDAPI_KEY found or empty)')
      
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
    
    const baseUrl = 'https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d'
    const apiHost = 'linkedin-job-search-api.p.rapidapi.com'

    // Build query string from normalized parameters
    const queryParams = new URLSearchParams()
    Object.entries(normalizedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
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