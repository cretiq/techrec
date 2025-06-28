// Gamification Authentication Middleware
// Prevents unauthorized gamification event triggering and XP farming

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GamificationEventType } from '@/types/gamification';

export interface AuthContext {
  userId: string;
  sessionId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface GamificationEventData {
  userId: string;
  [key: string]: any;
}

export class GamificationAuthError extends Error {
  constructor(
    message: string, 
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'INVALID_DATA',
    public context?: any
  ) {
    super(message);
    this.name = 'GamificationAuthError';
  }
}

/**
 * Authentication middleware for gamification events
 */
export class GamificationAuthMiddleware {
  private static instance: GamificationAuthMiddleware;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  private constructor() {}

  public static getInstance(): GamificationAuthMiddleware {
    if (!GamificationAuthMiddleware.instance) {
      GamificationAuthMiddleware.instance = new GamificationAuthMiddleware();
    }
    return GamificationAuthMiddleware.instance;
  }

  /**
   * Validate authentication context for gamification events
   */
  public async validateEventAuth(
    eventType: GamificationEventType,
    eventData: GamificationEventData,
    request?: Request
  ): Promise<AuthContext> {
    // 1. Get and validate session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new GamificationAuthError(
        'Authentication required for gamification events',
        'UNAUTHORIZED'
      );
    }

    const authContext: AuthContext = {
      userId: session.user.id,
      sessionId: session.user.id, // Using user ID as session identifier
      timestamp: new Date(),
      userAgent: request?.headers.get('user-agent') || undefined,
      ipAddress: this.extractIpAddress(request)
    };

    // 2. Validate user authorization for the target user
    if (eventData.userId !== session.user.id) {
      throw new GamificationAuthError(
        `User ${session.user.id} cannot trigger events for user ${eventData.userId}`,
        'FORBIDDEN',
        { requestedUserId: eventData.userId, actualUserId: session.user.id }
      );
    }

    // 3. Check rate limiting
    await this.checkRateLimit(authContext.userId, eventType);

    // 4. Validate event data integrity
    this.validateEventData(eventType, eventData);

    return authContext;
  }

  /**
   * Rate limiting to prevent XP farming
   */
  private async checkRateLimit(userId: string, eventType: GamificationEventType): Promise<void> {
    const rateLimitKey = `${userId}:${eventType}`;
    const now = Date.now();
    const windowMs = this.getRateLimitWindow(eventType);
    const maxRequests = this.getRateLimitMax(eventType);

    let userLimit = this.rateLimitStore.get(rateLimitKey);
    
    // Reset window if expired
    if (!userLimit || now > userLimit.resetTime) {
      userLimit = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Check if limit exceeded
    if (userLimit.count >= maxRequests) {
      const resetInMs = userLimit.resetTime - now;
      throw new GamificationAuthError(
        `Rate limit exceeded for ${eventType}. Try again in ${Math.ceil(resetInMs / 1000)} seconds.`,
        'RATE_LIMITED',
        { 
          eventType, 
          currentCount: userLimit.count, 
          maxRequests, 
          resetInMs 
        }
      );
    }

    // Increment counter
    userLimit.count++;
    this.rateLimitStore.set(rateLimitKey, userLimit);
  }

  /**
   * Get rate limit window in milliseconds for different event types
   */
  private getRateLimitWindow(eventType: GamificationEventType): number {
    const windows = {
      'CV_UPLOADED': 60 * 1000,           // 1 minute
      'CV_ANALYSIS_COMPLETED': 60 * 1000, // 1 minute  
      'CV_IMPROVEMENT_APPLIED': 60 * 1000, // 1 minute
      'APPLICATION_SUBMITTED': 60 * 1000,  // 1 minute
      'PROFILE_SECTION_UPDATED': 60 * 1000, // 1 minute
      'SKILL_ADDED': 60 * 1000,           // 1 minute
      'DAILY_LOGIN': 24 * 60 * 60 * 1000, // 24 hours
      'ACHIEVEMENT_UNLOCKED': 60 * 1000,   // 1 minute
      'CHALLENGE_COMPLETED': 60 * 1000,    // 1 minute
      'STREAK_MILESTONE': 60 * 1000,       // 1 minute
      'BADGE_EARNED': 60 * 1000,           // 1 minute
      'LEVEL_UP': 60 * 1000                // 1 minute
    };
    
    return windows[eventType] || 60 * 1000; // Default 1 minute
  }

  /**
   * Get maximum requests per window for different event types
   */
  private getRateLimitMax(eventType: GamificationEventType): number {
    const limits = {
      'CV_UPLOADED': 5,                    // 5 CVs per minute
      'CV_ANALYSIS_COMPLETED': 10,        // 10 analyses per minute
      'CV_IMPROVEMENT_APPLIED': 20,       // 20 improvements per minute
      'APPLICATION_SUBMITTED': 10,        // 10 applications per minute
      'PROFILE_SECTION_UPDATED': 10,      // 10 updates per minute
      'SKILL_ADDED': 20,                  // 20 skills per minute
      'DAILY_LOGIN': 1,                   // 1 login per day
      'ACHIEVEMENT_UNLOCKED': 50,         // 50 achievements per minute
      'CHALLENGE_COMPLETED': 10,          // 10 challenges per minute
      'STREAK_MILESTONE': 5,              // 5 milestones per minute
      'BADGE_EARNED': 50,                 // 50 badges per minute
      'LEVEL_UP': 10                      // 10 level ups per minute
    };
    
    return limits[eventType] || 10; // Default 10 per minute
  }

  /**
   * Validate event data structure and content
   */
  private validateEventData(eventType: GamificationEventType, eventData: GamificationEventData): void {
    // Basic validation
    if (!eventData.userId || typeof eventData.userId !== 'string') {
      throw new GamificationAuthError(
        'Invalid event data: userId is required and must be a string',
        'INVALID_DATA'
      );
    }

    // Event-specific validation
    switch (eventType) {
      case 'CV_UPLOADED':
        if (!eventData.cvId || typeof eventData.cvId !== 'string') {
          throw new GamificationAuthError(
            'CV_UPLOADED event requires valid cvId',
            'INVALID_DATA'
          );
        }
        break;

      case 'CV_ANALYSIS_COMPLETED':
        if (!eventData.analysisId || typeof eventData.analysisId !== 'string') {
          throw new GamificationAuthError(
            'CV_ANALYSIS_COMPLETED event requires valid analysisId',
            'INVALID_DATA'
          );
        }
        break;

      case 'APPLICATION_SUBMITTED':
        if (!eventData.applicationId || typeof eventData.applicationId !== 'string') {
          throw new GamificationAuthError(
            'APPLICATION_SUBMITTED event requires valid applicationId',
            'INVALID_DATA'
          );
        }
        break;

      case 'SKILL_ADDED':
        if (!eventData.skillName || typeof eventData.skillName !== 'string') {
          throw new GamificationAuthError(
            'SKILL_ADDED event requires valid skillName',
            'INVALID_DATA'
          );
        }
        break;

      case 'CHALLENGE_COMPLETED':
        if (!eventData.challengeId || typeof eventData.challengeId !== 'string') {
          throw new GamificationAuthError(
            'CHALLENGE_COMPLETED event requires valid challengeId',
            'INVALID_DATA'
          );
        }
        break;
    }
  }

  /**
   * Extract IP address from request for security logging
   */
  private extractIpAddress(request?: Request): string | undefined {
    if (!request) return undefined;

    // Check common headers for IP address
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    return undefined;
  }

  /**
   * Log security events for monitoring
   */
  public logSecurityEvent(
    eventType: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'INVALID_DATA' | 'SUSPICIOUS_ACTIVITY',
    context: AuthContext,
    details: any
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: context.userId,
      sessionId: context.sessionId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      details
    };

    // In production, send to security monitoring system
    console.warn('[GamificationSecurity]', JSON.stringify(logEntry));
  }

  /**
   * Clean up expired rate limit entries (call periodically)
   */
  public cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now > value.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Convenience function for API route usage
 */
export async function validateGamificationAuth(
  eventType: GamificationEventType,
  eventData: GamificationEventData,
  request?: Request
): Promise<AuthContext> {
  const middleware = GamificationAuthMiddleware.getInstance();
  return await middleware.validateEventAuth(eventType, eventData, request);
}