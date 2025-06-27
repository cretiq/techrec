// Badge Tracking System for TechRec Gamification

import { PrismaClient, BadgeCategory, BadgeTier } from '@prisma/client';
import { BadgeDefinition, BadgeCriteria, GamificationEventType } from '@/types/gamification';

const prisma = new PrismaClient();

/**
 * Badge tracking and unlock system
 * Monitors user progress and automatically awards badges when criteria are met
 */
export class BadgeTracker {
  
  /**
   * Check badge progress for a user after a specific event
   */
  static async checkProgress(
    userId: string, 
    eventType: GamificationEventType, 
    data: any
  ): Promise<{ newBadges: BadgeDefinition[]; updatedProgress: Array<{ badgeId: string; progress: number }> }> {
    try {
      // Get all badges that could be affected by this event
      const relevantBadges = await this.getRelevantBadges(eventType);
      
      const newBadges: BadgeDefinition[] = [];
      const updatedProgress: Array<{ badgeId: string; progress: number }> = [];

      for (const badge of relevantBadges) {
        // Check if user already has this badge
        const existingUserBadge = await prisma.userBadge.findUnique({
          where: {
            developerId_badgeId: {
              developerId: userId,
              badgeId: badge.id
            }
          }
        });

        if (existingUserBadge && existingUserBadge.progress >= 1.0) {
          // User already has this badge
          continue;
        }

        // Calculate current progress
        const progress = await this.calculateProgress(userId, badge, data);
        
        if (progress >= 1.0 && !existingUserBadge) {
          // Award new badge
          await this.awardBadge(userId, badge);
          newBadges.push(badge);
        } else if (existingUserBadge && progress > existingUserBadge.progress) {
          // Update progress for progressive badges
          await prisma.userBadge.update({
            where: { id: existingUserBadge.id },
            data: { progress }
          });
          updatedProgress.push({ badgeId: badge.id, progress });
        } else if (!existingUserBadge && progress > 0) {
          // Create progress tracking for new badge
          await prisma.userBadge.create({
            data: {
              developerId: userId,
              badgeId: badge.id,
              progress,
              earnedAt: progress >= 1.0 ? new Date() : new Date(0) // Use epoch for incomplete badges
            }
          });
          updatedProgress.push({ badgeId: badge.id, progress });
        }
      }

      return { newBadges, updatedProgress };
      
    } catch (error) {
      console.error('Error checking badge progress:', error);
      return { newBadges: [], updatedProgress: [] };
    }
  }

  /**
   * Award a badge to a user
   */
  private static async awardBadge(userId: string, badge: BadgeDefinition): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Create user badge record
        await tx.userBadge.create({
          data: {
            developerId: userId,
            badgeId: badge.id,
            progress: 1.0,
            earnedAt: new Date()
          }
        });

        // Award XP bonus for earning badge
        if (badge.xpReward > 0) {
          await tx.developer.update({
            where: { id: userId },
            data: { totalXP: { increment: badge.xpReward } }
          });

          // Create XP transaction record
          await tx.xPTransaction.create({
            data: {
              developerId: userId,
              amount: badge.xpReward,
              source: 'ACHIEVEMENT_ADD',
              sourceId: badge.id,
              description: `Earned badge: ${badge.name}`
            }
          });
        }
      });

      console.log(`Badge awarded: ${badge.name} to user ${userId}`);
      
    } catch (error) {
      console.error(`Error awarding badge ${badge.id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate progress towards a specific badge
   */
  private static async calculateProgress(
    userId: string, 
    badge: BadgeDefinition, 
    eventData: any
  ): Promise<number> {
    const criteria = badge.criteria;
    
    switch (criteria.type) {
      case 'profile_completeness':
        return await this.calculateProfileCompleteness(userId) / 100;
        
      case 'suggestions_accepted':
        const suggestionsCount = await prisma.xPTransaction.count({
          where: {
            developerId: userId,
            source: 'CV_IMPROVEMENT'
          }
        });
        return Math.min(suggestionsCount / criteria.threshold, 1.0);
        
      case 'applications_submitted':
        const applicationCount = await prisma.application.count({
          where: { developerId: userId }
        });
        return Math.min(applicationCount / criteria.threshold, 1.0);
        
      case 'cv_analyses_completed':
        const analysisCount = await prisma.cvAnalysis.count({
          where: {
            developerId: userId,
            status: 'COMPLETED'
          }
        });
        return Math.min(analysisCount / criteria.threshold, 1.0);
        
      case 'login_streak':
        const user = await prisma.developer.findUnique({
          where: { id: userId },
          select: { streak: true }
        });
        return Math.min((user?.streak || 0) / criteria.threshold, 1.0);
        
      case 'skill_count':
        const skillCount = await prisma.developerSkill.count({
          where: { developerId: userId }
        });
        return Math.min(skillCount / criteria.threshold, 1.0);
        
      case 'custom':
        // Handle custom criteria based on event data
        return await this.calculateCustomCriteria(userId, criteria, eventData);
        
      default:
        return 0;
    }
  }

  /**
   * Calculate profile completeness percentage
   */
  private static async calculateProfileCompleteness(userId: string): Promise<number> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      include: {
        contactInfo: true,
        experience: true,
        education: true,
        developerSkills: true
      }
    });

    if (!user) return 0;

    let score = 0;
    const maxScore = 100;

    // Basic info (20 points)
    if (user.name) score += 5;
    if (user.title) score += 5;
    if (user.about && user.about.length > 50) score += 10;

    // Contact info (20 points)
    if (user.contactInfo) {
      if (user.contactInfo.phone) score += 3;
      if (user.contactInfo.address) score += 2;
      if (user.contactInfo.linkedin) score += 5;
      if (user.contactInfo.github) score += 5;
      if (user.contactInfo.website) score += 3;
      if (user.contactInfo.city) score += 2;
    }

    // Experience (30 points)
    if (user.experience.length > 0) {
      score += 15; // Base for having experience
      if (user.experience.length >= 3) score += 10; // Multiple positions
      const hasDetailedExperience = user.experience.some(exp => 
        exp.achievements.length > 0 && exp.responsibilities.length > 0
      );
      if (hasDetailedExperience) score += 5;
    }

    // Skills (20 points)
    if (user.developerSkills.length >= 5) score += 10;
    if (user.developerSkills.length >= 10) score += 5;
    if (user.developerSkills.length >= 15) score += 5;

    // Education (10 points)
    if (user.education.length > 0) score += 10;

    return Math.min(score, maxScore);
  }

  /**
   * Handle custom badge criteria
   */
  private static async calculateCustomCriteria(
    userId: string, 
    criteria: BadgeCriteria, 
    eventData: any
  ): Promise<number> {
    // Custom logic based on criteria.conditions
    const conditions = criteria.conditions || {};
    
    // Example: Time-based achievements
    if (conditions.timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Count relevant activities in the past week
      const count = await prisma.xPTransaction.count({
        where: {
          developerId: userId,
          earnedAt: { gte: weekAgo },
          source: conditions.source || 'CV_ANALYSIS'
        }
      });
      
      return Math.min(count / criteria.threshold, 1.0);
    }
    
    // Example: Quality-based achievements
    if (conditions.quality === 'high') {
      // Check for high-quality activities (e.g., detailed profile sections)
      const qualityScore = await this.calculateQualityMetrics(userId, conditions);
      return Math.min(qualityScore / criteria.threshold, 1.0);
    }
    
    return 0;
  }

  /**
   * Calculate quality metrics for custom badges
   */
  private static async calculateQualityMetrics(userId: string, conditions: any): Promise<number> {
    let qualityScore = 0;
    
    // Check experience quality
    const experiences = await prisma.experience.findMany({
      where: { developerId: userId }
    });
    
    experiences.forEach(exp => {
      if (exp.achievements.length >= 3) qualityScore += 2;
      if (exp.responsibilities.length >= 3) qualityScore += 2;
      if (exp.techStack.length >= 3) qualityScore += 1;
    });
    
    return qualityScore;
  }

  /**
   * Get badges relevant to a specific event type
   */
  private static async getRelevantBadges(eventType: GamificationEventType): Promise<BadgeDefinition[]> {
    // Map event types to relevant badge categories
    const eventToBadgeCategories: Record<GamificationEventType, BadgeCategory[]> = {
      'CV_UPLOADED': ['CV_IMPROVEMENT'],
      'CV_ANALYSIS_COMPLETED': ['CV_IMPROVEMENT', 'ENGAGEMENT'],
      'CV_IMPROVEMENT_APPLIED': ['CV_IMPROVEMENT'],
      'APPLICATION_SUBMITTED': ['APPLICATION_SUCCESS'],
      'PROFILE_SECTION_UPDATED': ['PROFILE_COMPLETION', 'ENGAGEMENT'],
      'SKILL_ADDED': ['SKILL_MASTERY', 'PROFILE_COMPLETION'],
      'DAILY_LOGIN': ['ENGAGEMENT'],
      'ACHIEVEMENT_UNLOCKED': ['SPECIAL_EVENT'],
      'CHALLENGE_COMPLETED': ['ENGAGEMENT'],
      'STREAK_MILESTONE': ['ENGAGEMENT']
    };

    const categories = eventToBadgeCategories[eventType] || [];
    
    // Get badges from database (in real implementation)
    // For now, return predefined badges that match categories
    const allBadges = await this.getAllBadgeDefinitions();
    
    return allBadges.filter(badge => categories.includes(badge.category));
  }

  /**
   * Get all badge definitions (would typically come from database)
   */
  private static async getAllBadgeDefinitions(): Promise<BadgeDefinition[]> {
    // In production, this would query the Badge table
    // For now, return the predefined badges from types
    const { BADGE_DEFINITIONS } = await import('@/types/gamification');
    return BADGE_DEFINITIONS;
  }

  /**
   * Get user's badge collection with progress
   */
  static async getUserBadges(userId: string): Promise<{
    earned: Array<{ badge: BadgeDefinition; earnedAt: Date }>;
    inProgress: Array<{ badge: BadgeDefinition; progress: number }>;
    available: BadgeDefinition[];
  }> {
    const userBadges = await prisma.userBadge.findMany({
      where: { developerId: userId },
      include: { badge: true }
    });

    const allBadges = await this.getAllBadgeDefinitions();
    
    const earned = userBadges
      .filter(ub => ub.progress >= 1.0)
      .map(ub => ({
        badge: ub.badge as any as BadgeDefinition, // Type conversion for demo
        earnedAt: ub.earnedAt
      }));

    const inProgress = userBadges
      .filter(ub => ub.progress < 1.0 && ub.progress > 0)
      .map(ub => ({
        badge: ub.badge as any as BadgeDefinition,
        progress: ub.progress
      }));

    const earnedIds = new Set(userBadges.map(ub => ub.badgeId));
    const available = allBadges.filter(badge => !earnedIds.has(badge.id));

    return { earned, inProgress, available };
  }

  /**
   * Force recalculate all badge progress for a user
   */
  static async recalculateUserBadges(userId: string): Promise<void> {
    const allBadges = await this.getAllBadgeDefinitions();
    
    for (const badge of allBadges) {
      const progress = await this.calculateProgress(userId, badge, {});
      
      const existingBadge = await prisma.userBadge.findUnique({
        where: {
          developerId_badgeId: {
            developerId: userId,
            badgeId: badge.id
          }
        }
      });

      if (existingBadge) {
        // Update existing progress
        await prisma.userBadge.update({
          where: { id: existingBadge.id },
          data: { 
            progress,
            earnedAt: progress >= 1.0 ? new Date() : existingBadge.earnedAt
          }
        });
      } else if (progress > 0) {
        // Create new progress tracking
        await prisma.userBadge.create({
          data: {
            developerId: userId,
            badgeId: badge.id,
            progress,
            earnedAt: progress >= 1.0 ? new Date() : new Date(0)
          }
        });
      }

      // Award badge if criteria met and not already awarded
      if (progress >= 1.0 && (!existingBadge || existingBadge.progress < 1.0)) {
        await this.awardBadge(userId, badge);
      }
    }
  }
}