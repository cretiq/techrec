// Gamification Event Management System for TechRec Platform

import { PrismaClient, XPSource, PointsSource } from '@prisma/client';
import { XPCalculator } from './xpCalculator';
import { PointsManager, PointsAward } from './pointsManager';
import { BadgeEvaluator } from './badgeEvaluator';
import { StreakManager } from './streakManager';
import { validateGamificationAuth, AuthContext, GamificationAuthError } from './authMiddleware';
import { XPAward, GamificationEvent, GamificationEventType } from '@/types/gamification';
import { configService } from '@/utils/configService';

const prisma = new PrismaClient();

/**
 * Central event manager for all gamification activities
 * Handles XP awards, badge unlocks, streak tracking, and notifications
 */
export class GamificationEventManager {
  private static instance: GamificationEventManager;
  
  private eventListeners = new Map<GamificationEventType, Function[]>();
  
  /**
   * Singleton pattern for consistent event handling
   */
  static getInstance(): GamificationEventManager {
    if (!GamificationEventManager.instance) {
      GamificationEventManager.instance = new GamificationEventManager();
    }
    return GamificationEventManager.instance;
  }

  /**
   * Register event listener for specific gamification events
   */
  on(event: GamificationEventType, handler: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  /**
   * Trigger gamification event with authentication and automatic XP calculation
   */
  async trigger(event: GamificationEventType, data: any, request?: Request): Promise<void> {
    let authContext: AuthContext | null = null;
    
    try {
      // SECURITY: Validate authentication and authorization
      authContext = await validateGamificationAuth(event, data, request);
      
      console.log(`[GamificationEvents] Authenticated trigger: ${event} for user ${authContext.userId}`);

      // Execute all registered handlers for this event
      const handlers = this.eventListeners.get(event) || [];
      await Promise.all(handlers.map(handler => handler(data)));

      // Award XP based on event type
      await this.processXPAward(event, data);
      
      // Award bonus points for certain achievements
      await this.processPointsAward(event, data);

      // Update streak if applicable and get current profile
      let userProfile = null;
      if (this.isStreakEvent(event)) {
        const streakManager = StreakManager.getInstance();
        const streakResult = await streakManager.recordActivity(data.userId, event);
        
        // Get updated user profile for badge evaluation
        userProfile = await this.getUserProfile(data.userId);
        
        // Trigger streak milestone celebration if applicable
        if (streakResult.xpBonusEarned > 0) {
          await this.trigger('STREAK_MILESTONE', {
            userId: data.userId,
            streakCount: streakResult.newStreak,
            xpBonusEarned: streakResult.xpBonusEarned
          });
        }
      }

      // Check for badge unlocks with current context
      if (!userProfile) {
        userProfile = await this.getUserProfile(data.userId);
      }
      
      if (userProfile) {
        const badgeEvaluator = BadgeEvaluator.getInstance();
        const newBadges = await badgeEvaluator.evaluateAllBadges({
          userId: data.userId,
          userProfile,
          actionType: event,
          actionData: data,
          timestamp: new Date()
        });

        // Trigger badge celebrations
        for (const badgeResult of newBadges) {
          await this.trigger('BADGE_EARNED', {
            userId: data.userId,
            badge: badgeResult.badge,
            xpAwarded: badgeResult.xpAwarded
          });
        }
      }

      // Invalidate user caches when gamification data changes
      const { invalidateUserCaches } = await import('./queryOptimizer');
      await invalidateUserCaches(data.userId);

      // Publish real-time updates
      await this.publishGamificationUpdate(data.userId, event, data);

    } catch (error) {
      // Handle authentication and security errors differently
      if (error instanceof GamificationAuthError) {
        console.error(`[GamificationSecurity] ${error.code}: ${error.message}`, error.context);
        
        // Log security events for monitoring
        if (authContext) {
          const middleware = await import('./authMiddleware');
          middleware.GamificationAuthMiddleware.getInstance().logSecurityEvent(
            error.code === 'UNAUTHORIZED' ? 'AUTH_FAILURE' :
            error.code === 'RATE_LIMITED' ? 'RATE_LIMIT' :
            error.code === 'INVALID_DATA' ? 'INVALID_DATA' : 'SUSPICIOUS_ACTIVITY',
            authContext,
            { event, error: error.message, data }
          );
        }
        
        // Re-throw security errors to notify the caller
        throw error;
      } else {
        console.error(`Error processing gamification event ${event}:`, error);
        // Don't throw non-security errors - gamification failures shouldn't break core functionality
      }
    }
  }

  /**
   * Award XP for specific event with fraud prevention
   */
  async awardXP(award: XPAward): Promise<{
    success: boolean;
    xpAwarded: number;
    newLevel?: number;
    error?: string;
  }> {
    try {
      // Validate XP award
      const validation = XPCalculator.validateXPAward(
        award.source,
        award.amount,
        award.userId,
        award.sourceId
      );

      if (!validation.isValid) {
        return {
          success: false,
          xpAwarded: 0,
          error: validation.reason
        };
      }

      // Check for duplicate awards (if not repeatable)
      if (!XPCalculator.isRepeatableSource(award.source)) {
        const existingAward = await prisma.xPTransaction.findFirst({
          where: {
            developerId: award.userId,
            source: award.source,
            sourceId: award.sourceId
          }
        });

        if (existingAward) {
          return {
            success: false,
            xpAwarded: 0,
            error: 'XP already awarded for this action'
          };
        }
      }

      // Calculate time multiplier for consistency bonus
      const user = await prisma.developer.findUnique({
        where: { id: award.userId },
        select: { lastActivityDate: true, totalXP: true, currentLevel: true, subscriptionTier: true }
      });

      if (!user) {
        return {
          success: false,
          xpAwarded: 0,
          error: 'User not found'
        };
      }

      const timeMultiplier = XPCalculator.getTimeMultiplier(user.lastActivityDate);
      const finalAmount = Math.round(award.amount * timeMultiplier);

      // Perform database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Award XP to user
        const updatedUser = await tx.developer.update({
          where: { id: award.userId },
          data: { 
            totalXP: { increment: finalAmount },
            lastActivityDate: new Date()
          }
        });

        // Create transaction record
        await tx.xPTransaction.create({
          data: {
            developerId: award.userId,
            amount: finalAmount,
            source: award.source,
            sourceId: award.sourceId,
            description: award.description
          }
        });

        // Calculate new level
        const profileUpdate = XPCalculator.calculateUserProfile(
          updatedUser.totalXP,
          updatedUser.streak,
          updatedUser.lastActivityDate
        );

        // Update level if changed
        const levelChanged = profileUpdate.currentLevel !== user.currentLevel;

        if (levelChanged) {
          await tx.developer.update({
            where: { id: award.userId },
            data: {
              currentLevel: profileUpdate.currentLevel,
              levelProgress: profileUpdate.levelProgress
            }
          });
        }

        return {
          xpAwarded: finalAmount,
          newLevel: levelChanged ? profileUpdate.currentLevel : undefined,
          updatedUser
        };
      });

      // Invalidate user caches after XP award
      const { invalidateUserCaches } = await import('./queryOptimizer');
      await invalidateUserCaches(award.userId);

      return {
        success: true,
        xpAwarded: result.xpAwarded,
        newLevel: result.newLevel
      };

    } catch (error) {
      console.error('Error awarding XP:', error);
      return {
        success: false,
        xpAwarded: 0,
        error: 'Database error occurred'
      };
    }
  }

  /**
   * Award bonus points for achievements with validation
   */
  async awardPoints(award: PointsAward): Promise<{
    success: boolean;
    pointsAwarded: number;
    newBalance: number;
    error?: string;
  }> {
    try {
      // Validate points award
      const validation = PointsManager.validatePointsAward(award);

      if (!validation.isValid) {
        return {
          success: false,
          pointsAwarded: 0,
          newBalance: 0,
          error: validation.reason
        };
      }

      // Get current user points data
      const user = await prisma.developer.findUnique({
        where: { id: award.userId },
        select: { 
          monthlyPoints: true, 
          pointsUsed: true, 
          pointsEarned: true,
          subscriptionTier: true
        }
      });

      if (!user) {
        return {
          success: false,
          pointsAwarded: 0,
          newBalance: 0,
          error: 'User not found'
        };
      }

      // Get subscription tier XP multiplier for bonus calculation
      const xpMultiplier = await PointsManager.getXPMultiplier(user.subscriptionTier);
      const bonusAmount = Math.round(award.amount * xpMultiplier);

      // Perform database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Award bonus points to user
        const updatedUser = await tx.developer.update({
          where: { id: award.userId },
          data: { 
            pointsEarned: { increment: bonusAmount }
          }
        });

        // Create points transaction record
        await tx.pointsTransaction.create({
          data: {
            developerId: award.userId,
            amount: bonusAmount,
            source: award.source,
            sourceId: award.sourceId,
            description: award.description,
            metadata: award.metadata
          }
        });

        const newBalance = PointsManager.calculateAvailablePoints(
          updatedUser.monthlyPoints,
          updatedUser.pointsUsed,
          updatedUser.pointsEarned
        );

        return { pointsAwarded: bonusAmount, newBalance };
      });

      return {
        success: true,
        pointsAwarded: result.pointsAwarded,
        newBalance: result.newBalance
      };

    } catch (error) {
      console.error('Error awarding points:', error);
      return {
        success: false,
        pointsAwarded: 0,
        newBalance: 0,
        error: 'Database error occurred'
      };
    }
  }

  /**
   * Process bonus points award based on event type
   */
  private async processPointsAward(event: GamificationEventType, data: any): Promise<void> {
    let pointsSource: PointsSource;
    let pointsAmount: number;
    let sourceId: string | undefined;
    let description: string;

    // Only award bonus points for special achievements
    switch (event) {
      case 'STREAK_MILESTONE':
        if (data.streakCount >= 7) {
          pointsSource = 'STREAK_BONUS';
          pointsAmount = Math.min(Math.floor(data.streakCount / 7) * 2, 10); // 2 points per week, max 10
          description = `${data.streakCount}-day streak bonus points`;
        } else {
          return; // No points for short streaks
        }
        break;

      case 'BADGE_EARNED':
        pointsSource = 'ACHIEVEMENT_BONUS';
        pointsAmount = 5; // 5 bonus points per badge
        sourceId = data.badge?.id;
        description = `Badge achievement bonus: ${data.badge?.name}`;
        break;

      case 'CHALLENGE_COMPLETED':
        pointsSource = 'ACHIEVEMENT_BONUS';
        pointsAmount = 3; // 3 bonus points per challenge
        sourceId = data.challengeId;
        description = `Challenge completion bonus: ${data.challengeName}`;
        break;

      default:
        // Most events don't award bonus points
        return;
    }

    // Award the bonus points
    await this.awardPoints({
      userId: data.userId,
      amount: pointsAmount,
      source: pointsSource,
      sourceId,
      description,
      metadata: { event, originalData: data }
    });
  }

  /**
   * Process XP award based on event type
   */
  private async processXPAward(event: GamificationEventType, data: any): Promise<void> {
    let xpSource: XPSource;
    let xpAmount: number;
    let sourceId: string | undefined;
    let description: string;

    switch (event) {
      case 'CV_UPLOADED':
        xpSource = 'CV_UPLOAD';
        xpAmount = XPCalculator.getXPForSource('CV_UPLOAD');
        sourceId = data.cvId;
        description = 'Uploaded new CV';
        break;

      case 'CV_ANALYSIS_COMPLETED':
        xpSource = 'CV_ANALYSIS';
        xpAmount = XPCalculator.getXPForSource('CV_ANALYSIS');
        sourceId = data.analysisId;
        description = 'Completed CV analysis';
        break;

      case 'CV_IMPROVEMENT_APPLIED':
        xpSource = 'CV_IMPROVEMENT';
        xpAmount = XPCalculator.getXPForSource('CV_IMPROVEMENT');
        sourceId = data.suggestionId;
        description = 'Applied AI improvement suggestion';
        break;

      case 'APPLICATION_SUBMITTED':
        xpSource = 'APPLICATION_SUBMIT';
        xpAmount = XPCalculator.getXPForSource('APPLICATION_SUBMIT');
        sourceId = data.applicationId;
        description = `Applied to ${data.roleTitle || 'position'}`;
        break;

      case 'PROFILE_SECTION_UPDATED':
        xpSource = 'PROFILE_UPDATE';
        xpAmount = XPCalculator.getXPForSource('PROFILE_UPDATE');
        sourceId = data.sectionType;
        description = `Updated ${data.sectionType} section`;
        break;

      case 'SKILL_ADDED':
        xpSource = 'SKILL_ADD';
        xpAmount = XPCalculator.getXPForSource('SKILL_ADD');
        sourceId = data.skillId;
        description = `Added skill: ${data.skillName}`;
        break;

      case 'DAILY_LOGIN':
        xpSource = 'DAILY_LOGIN';
        xpAmount = XPCalculator.getXPForSource('DAILY_LOGIN');
        description = 'Daily login bonus';
        break;

      case 'STREAK_MILESTONE':
        xpSource = 'STREAK_BONUS';
        xpAmount = data.xpBonusEarned || XPCalculator.calculateStreakBonus(data.streakCount);
        description = `${data.streakCount}-day streak bonus`;
        break;

      case 'BADGE_EARNED':
        // XP already awarded by badge evaluator, skip
        return;

      case 'CHALLENGE_COMPLETED':
        xpSource = 'CHALLENGE_COMPLETE';
        xpAmount = data.xpReward || XPCalculator.getXPForSource('CHALLENGE_COMPLETE');
        sourceId = data.challengeId;
        description = `Completed challenge: ${data.challengeName}`;
        break;

      default:
        // Unknown event type, skip XP award
        return;
    }

    // Award the XP
    await this.awardXP({
      userId: data.userId,
      amount: xpAmount,
      source: xpSource,
      sourceId,
      description
    });
  }

  /**
   * Check if event should trigger streak updates
   */
  private isStreakEvent(event: GamificationEventType): boolean {
    const streakEvents: GamificationEventType[] = [
      'DAILY_LOGIN',
      'CV_ANALYSIS_COMPLETED',
      'APPLICATION_SUBMITTED',
      'PROFILE_SECTION_UPDATED'
    ];
    
    return streakEvents.includes(event);
  }

  /**
   * Publish real-time gamification updates to frontend
   */
  private async publishGamificationUpdate(
    userId: string, 
    event: GamificationEventType, 
    data: any
  ): Promise<void> {
    // In a real application, this would use WebSockets, Server-Sent Events, or similar
    // For now, we'll use custom browser events for client-side handling
    
    const updateData = {
      userId,
      event,
      timestamp: new Date().toISOString(),
      data
    };

    // This would typically be handled by a real-time service
    // For development, we can use Redis pub/sub or similar
    console.log('Gamification update:', updateData);
  }

  /**
   * Batch process multiple XP awards for efficiency
   */
  async batchAwardXP(awards: XPAward[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ userId: string; success: boolean; xpAwarded: number; error?: string }>;
  }> {
    const results = await Promise.allSettled(
      awards.map(award => this.awardXP(award))
    );

    const processedResults = results.map((result, index) => ({
      userId: awards[index].userId,
      success: result.status === 'fulfilled' && result.value.success,
      xpAwarded: result.status === 'fulfilled' ? result.value.xpAwarded : 0,
      error: result.status === 'fulfilled' ? result.value.error : 'Promise rejected'
    }));

    const successful = processedResults.filter(r => r.success).length;
    const failed = processedResults.length - successful;

    return { successful, failed, results: processedResults };
  }

  /**
   * Check for level up and trigger celebrations
   */
  async checkLevelUp(userId: string): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    newBenefits?: string[];
  }> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: { totalXP: true, currentLevel: true }
    });

    if (!user) return { leveledUp: false };

    const calculatedLevel = XPCalculator.calculateLevel(user.totalXP);
    
    if (calculatedLevel > user.currentLevel) {
      // User leveled up!
      const levelInfo = XPCalculator.getLevelInfo(calculatedLevel);
      
      // Update user's level in database
      await prisma.developer.update({
        where: { id: userId },
        data: { currentLevel: calculatedLevel }
      });

      // Trigger level up event
      await this.trigger('ACHIEVEMENT_UNLOCKED', {
        userId,
        achievementType: 'level_up',
        newLevel: calculatedLevel,
        benefits: levelInfo.benefits
      });

      return {
        leveledUp: true,
        newLevel: calculatedLevel,
        newBenefits: levelInfo.benefits
      };
    }

    return { leveledUp: false };
  }

  /**
   * Get user's complete gamification profile
   */
  async getUserProfile(userId: string) {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        totalXP: true,
        currentLevel: true,
        levelProgress: true,
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        pointsResetDate: true,
        streak: true,
        lastActivityDate: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        }
      }
    });

    if (!user) return null;

    // Calculate current profile state
    const profileCalc = XPCalculator.calculateUserProfile(
      user.totalXP,
      user.streak,
      user.lastActivityDate
    );

    return {
      totalXP: user.totalXP,
      currentLevel: profileCalc.currentLevel,
      levelProgress: profileCalc.levelProgress,
      subscriptionTier: user.subscriptionTier,
      points: {
        monthly: user.monthlyPoints,
        used: user.pointsUsed,
        earned: user.pointsEarned,
        available: PointsManager.calculateAvailablePoints(user.monthlyPoints, user.pointsUsed, user.pointsEarned),
        resetDate: user.pointsResetDate,
      },
      streak: user.streak,
      lastActivityDate: user.lastActivityDate,
      badges: user.userBadges,
      nextLevelXP: profileCalc.nextLevelXP,
      currentLevelXP: profileCalc.currentLevelXP
    };
  }
}

// Export singleton instance for easy access
export const gamificationEvents = GamificationEventManager.getInstance();