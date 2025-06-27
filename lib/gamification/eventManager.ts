// Gamification Event Management System for TechRec Platform

import { PrismaClient, XPSource } from '@prisma/client';
import { XPCalculator } from './xpCalculator';
import { BadgeTracker } from './badgeTracker';
import { StreakManager } from './streakManager';
import { XPAward, GamificationEvent, GamificationEventType } from '@/types/gamification';

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
   * Trigger gamification event with automatic XP calculation and badge checking
   */
  async trigger(event: GamificationEventType, data: any): Promise<void> {
    try {
      // Execute all registered handlers for this event
      const handlers = this.eventListeners.get(event) || [];
      await Promise.all(handlers.map(handler => handler(data)));

      // Award XP based on event type
      await this.processXPAward(event, data);

      // Check for badge unlocks
      await BadgeTracker.checkProgress(data.userId, event, data);

      // Update streak if applicable
      if (this.isStreakEvent(event)) {
        await StreakManager.updateDailyStreak(data.userId);
      }

      // Publish real-time updates
      await this.publishGamificationUpdate(data.userId, event, data);

    } catch (error) {
      console.error(`Error processing gamification event ${event}:`, error);
      // Don't throw - gamification failures shouldn't break core functionality
    }
  }

  /**
   * Award XP for specific event with fraud prevention
   */
  async awardXP(award: XPAward): Promise<{
    success: boolean;
    xpAwarded: number;
    newLevel?: number;
    newTier?: string;
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
        select: { lastActivityDate: true, totalXP: true, currentLevel: true, tier: true }
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

        // Calculate new level and tier
        const profileUpdate = XPCalculator.calculateUserProfile(
          updatedUser.totalXP,
          updatedUser.streak,
          updatedUser.lastActivityDate
        );

        // Update level and tier if changed
        const levelChanged = profileUpdate.currentLevel !== user.currentLevel;
        const tierChanged = profileUpdate.tier !== user.tier;

        if (levelChanged || tierChanged) {
          await tx.developer.update({
            where: { id: award.userId },
            data: {
              currentLevel: profileUpdate.currentLevel,
              levelProgress: profileUpdate.levelProgress,
              tier: profileUpdate.tier
            }
          });
        }

        return {
          xpAwarded: finalAmount,
          newLevel: levelChanged ? profileUpdate.currentLevel : undefined,
          newTier: tierChanged ? profileUpdate.tier : undefined,
          updatedUser
        };
      });

      return {
        success: true,
        xpAwarded: result.xpAwarded,
        newLevel: result.newLevel,
        newTier: result.newTier
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
        xpAmount = XPCalculator.calculateStreakBonus(data.streak);
        description = `${data.streak}-day streak bonus`;
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
        tier: true,
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
      tier: profileCalc.tier,
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