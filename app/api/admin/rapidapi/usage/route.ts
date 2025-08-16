import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import RapidApiCacheManager from '@/lib/api/rapidapi-cache'

/**
 * Admin RapidAPI Usage Tracking Endpoint
 * 
 * Provides comprehensive RapidAPI usage statistics for admin monitoring:
 * - Current usage limits and remaining quotas
 * - Cache performance metrics
 * - Usage warning levels
 * - Rate limit reset information
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Simple admin check - in production, you'd want proper role-based access
    const adminEmails = [
      "filipmellqvist255@gmail.com",
      "admin@techrec.com", 
      "admin@test.com",
    ]

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get RapidAPI cache manager instance
    const cacheManager = RapidApiCacheManager.getInstance()
    
    // Get current usage data
    const currentUsage = cacheManager.getCurrentUsage()
    const cacheStats = cacheManager.getCacheStats()
    const warningLevel = cacheManager.getUsageWarningLevel()

    // Calculate usage percentages
    let usageData = null
    if (currentUsage) {
      const jobsUsedPercentage = Math.round(
        ((currentUsage.jobsLimit - currentUsage.jobsRemaining) / currentUsage.jobsLimit) * 100
      )
      const requestsUsedPercentage = Math.round(
        ((currentUsage.requestsLimit - currentUsage.requestsRemaining) / currentUsage.requestsLimit) * 100
      )

      usageData = {
        // Raw usage data
        jobsLimit: currentUsage.jobsLimit,
        jobsRemaining: currentUsage.jobsRemaining,
        jobsUsed: currentUsage.jobsLimit - currentUsage.jobsRemaining,
        jobsUsedPercentage,
        
        requestsLimit: currentUsage.requestsLimit,
        requestsRemaining: currentUsage.requestsRemaining,
        requestsUsed: currentUsage.requestsLimit - currentUsage.requestsRemaining,
        requestsUsedPercentage,
        
        // Reset information
        resetInSeconds: currentUsage.jobsReset,
        resetInHours: Math.round(currentUsage.jobsReset / 3600),
        resetTime: new Date(Date.now() + currentUsage.jobsReset * 1000).toISOString(),
        
        // Warning level
        warningLevel,
        
        // Status indicators
        isLowUsage: warningLevel === 'low',
        isCriticalUsage: warningLevel === 'critical',
        isHealthy: warningLevel === 'none'
      }
    }

    // Environment configuration
    const debugMode = process.env.DEBUG_RAPIDAPI?.toLowerCase()
    const isDebugMode = debugMode === 'log' || debugMode === 'true' || debugMode === 'stop'
    
    const envConfig = {
      isDevelopment: !process.env.RAPIDAPI_KEY || process.env.RAPIDAPI_KEY.trim() === '',
      hasApiKey: !!process.env.RAPIDAPI_KEY,
      apiKeyLength: process.env.RAPIDAPI_KEY?.length || 0,
      debugMode: isDebugMode,
      mvpBetaEnabled: process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true',
      pointsPerResult: parseInt(process.env.MVP_POINTS_PER_RESULT || '1'),
      defaultAgency: process.env.RAPIDAPI_DEFAULT_AGENCY || 'FALSE',
      defaultIncludeAi: process.env.RAPIDAPI_DEFAULT_INCLUDE_AI || 'true',
      defaultDescriptionType: process.env.RAPIDAPI_DEFAULT_DESCRIPTION_TYPE || 'text'
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        usage: usageData,
        cache: {
          size: cacheStats.size,
          maxSize: cacheStats.maxSize,
          utilizationPercentage: Math.round((cacheStats.size / cacheStats.maxSize) * 100),
          entries: cacheStats.entries.map(entry => ({
            hash: entry.hash,
            ageInMinutes: entry.age,
            isExpired: entry.age > 60 // 1 hour TTL
          }))
        },
        environment: envConfig,
        warningLevel,
        status: {
          hasUsageData: !!currentUsage,
          cacheActive: cacheStats.size > 0,
          apiConfigured: envConfig.hasApiKey,
          message: !currentUsage 
            ? 'No usage data available - make a search request to populate statistics'
            : warningLevel === 'critical'
            ? 'Critical usage level - approaching API limits'
            : warningLevel === 'low'
            ? 'Low usage warning - monitor consumption'
            : envConfig.debugMode
            ? `API usage is healthy (${debugMode === 'stop' ? 'DEBUG STOP' : debugMode === 'log' ? 'DEBUG LOG' : 'DEBUG'} mode - simulated data)`
            : 'API usage is healthy (production data)',
          debugInfo: envConfig.debugMode 
            ? `Debug mode: ${debugMode}. ${debugMode === 'stop' ? 'No real API calls made' : debugMode === 'log' ? 'Real API calls with logging' : 'Debug mode active'}`
            : null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching RapidAPI usage data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch usage data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}