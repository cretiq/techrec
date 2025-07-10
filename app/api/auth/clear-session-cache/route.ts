import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GamificationQueryOptimizer } from '@/lib/gamification/queryOptimizer'
import { 
  SessionValidationError, 
  CacheOperationError, 
  UnauthorizedAccessError 
} from '@/utils/auth/errors'
import { AuthLogger } from '@/utils/auth/logger'

/**
 * API endpoint for clearing user-specific caches on sign-out
 * 
 * This endpoint is called during the logout process to ensure all user-specific
 * data is removed from both server-side (Redis) and client-side caches, providing
 * data privacy and preventing state-related bugs between user sessions.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Session validation - Ensure user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      const error = new UnauthorizedAccessError(
        'No valid session found for cache clearing',
        { endpoint: '/api/auth/clear-session-cache', timestamp: new Date().toISOString() }
      )
      AuthLogger.warn('Unauthorized cache clear attempt', { 
        error: error.message, 
        endpoint: '/api/auth/clear-session-cache' 
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          code: error.code,
          meta: error.meta
        }, 
        { status: 401 }
      )
    }
    
    // 2. Extract user ID from session
    const userId = session.user.id
    
    AuthLogger.info('Starting cache invalidation', { 
      userId, 
      operation: 'cache-clear' 
    })
    
    // 3. Cache invalidation using existing infrastructure
    let clearedKeysCount = 0
    let cacheOperationSuccess = true
    
    try {
      const optimizer = GamificationQueryOptimizer.getInstance()
      await optimizer.invalidateUserCaches(userId)
      
      // The invalidateUserCaches method clears these patterns:
      // - user_profile:${userId}
      // - cv_count:${userId}:*
      // - app_stats:${userId}
      // - badge_eval_batch:*${userId}*
      // - leaderboard:* (affects all users when any user changes)
      
      clearedKeysCount = 5 // Approximate count based on patterns cleared
      
      AuthLogger.success('Cache invalidation completed', { 
        userId, 
        clearedKeys: clearedKeysCount 
      })
      
    } catch (cacheError) {
      // 4. Error handling with graceful degradation using structured error classes
      // Cache clearing failures should not prevent logout
      cacheOperationSuccess = false
      
      const structuredError = new CacheOperationError(
        'Cache invalidation operation failed',
        {
          userId,
          originalError: cacheError instanceof Error ? cacheError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      )
      
      AuthLogger.error('Cache invalidation failed', structuredError, { 
        userId, 
        operation: 'cache-clear' 
      })
    }
    
    const operationTime = Date.now() - startTime
    
    // 5. Response with success/failure status and debug information
    const response = {
      success: true, // Always return success to not block logout
      message: cacheOperationSuccess 
        ? 'Cache cleared successfully' 
        : 'Cache clearing partially failed - user logout continues',
      cacheOperationSuccess,
      clearedKeys: cacheOperationSuccess ? clearedKeysCount : 0,
      operationTimeMs: operationTime,
      userId: process.env.NODE_ENV === 'development' ? userId : undefined, // Only include in dev
      timestamp: new Date().toISOString()
    }
    
    AuthLogger.info('Cache clear operation completed', {
      userId,
      success: cacheOperationSuccess,
      operationTimeMs: operationTime
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    // Global error handler with structured error handling - always allow logout to proceed
    const operationTime = Date.now() - startTime
    
    const structuredError = new SessionValidationError(
      'Unexpected error during cache clearing operation',
      {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        operationTimeMs: operationTime,
        timestamp: new Date().toISOString()
      }
    )
    
    AuthLogger.error('Unexpected error during cache clearing', structuredError, {
      operation: 'cache-clear',
      operationTimeMs: operationTime
    })
    
    // Return success status to prevent blocking logout
    return NextResponse.json({
      success: true, // Never block logout
      message: 'Cache clearing encountered an error - user logout continues',
      cacheOperationSuccess: false,
      clearedKeys: 0,
      operationTimeMs: operationTime,
      error: structuredError.message,
      code: structuredError.code,
      meta: process.env.NODE_ENV === 'development' ? structuredError.meta : undefined
    })
  }
}

/**
 * Handle unsupported HTTP methods with consistent error response
 */
const methodNotAllowedResponse = () => NextResponse.json(
  { 
    success: false,
    error: 'Method not allowed',
    allowedMethods: ['POST'],
    message: 'This endpoint only accepts POST requests for cache clearing operations'
  },
  { status: 405, headers: { 'Allow': 'POST' } }
)

export const GET = methodNotAllowedResponse
export const PUT = methodNotAllowedResponse  
export const DELETE = methodNotAllowedResponse
export const PATCH = methodNotAllowedResponse