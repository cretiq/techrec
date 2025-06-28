// Badge Evaluator - Automatic Badge Award System
// Evaluates user actions and awards badges based on achievements

import { BadgeDefinition, UserGamificationProfile, BadgeRequirement } from '@/types/gamification';
import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { getContextualBadgeIds } from './eventBadgeMapping';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BadgeEvaluationContext {
  userId: string;
  userProfile: UserGamificationProfile;
  actionType: string;
  actionData: any;
  timestamp: Date;
}

export interface BadgeAwardResult {
  badgeId: string;
  badge: BadgeDefinition;
  isNewlyEarned: boolean;
  xpAwarded: number;
}

export class BadgeEvaluator {
  private static instance: BadgeEvaluator;
  private evaluationCache: Map<string, Date> = new Map();

  private constructor() {}

  public static getInstance(): BadgeEvaluator {
    if (!BadgeEvaluator.instance) {
      BadgeEvaluator.instance = new BadgeEvaluator();
    }
    return BadgeEvaluator.instance;
  }

  /**
   * Evaluate relevant badges for a user after an action (PERFORMANCE OPTIMIZED)
   */
  public async evaluateAllBadges(context: BadgeEvaluationContext): Promise<BadgeAwardResult[]> {
    const results: BadgeAwardResult[] = [];
    
    // Get user's existing badges to avoid duplicates
    const existingBadges = await this.getUserBadges(context.userId);
    const existingBadgeIds = new Set(existingBadges.map(b => b.badgeId));

    // PERFORMANCE OPTIMIZATION: Only evaluate badges relevant to this event
    const relevantBadgeIds = getContextualBadgeIds(context.actionType as any, {
      isWeekend: this.isWeekend(),
      hasRecentActivity: this.hasRecentActivity(context),
      currentLevel: context.userProfile.currentLevel,
      currentStreak: context.userProfile.streak
    });

    // Filter badge definitions to only relevant ones
    const relevantBadges = BADGE_DEFINITIONS.filter(badge => 
      relevantBadgeIds.includes(badge.id)
    );

    console.log(`[BadgeEvaluator] Evaluating ${relevantBadges.length} relevant badges (${relevantBadgeIds.join(', ')}) instead of ${BADGE_DEFINITIONS.length} total badges`);

    // Check each relevant badge definition
    for (const badgeDefinition of relevantBadges) {
      // Skip if user already has this badge
      if (existingBadgeIds.has(badgeDefinition.id)) continue;

      // Skip hidden badges unless specifically triggered
      if (badgeDefinition.isHidden && !this.isHiddenBadgeTriggered(badgeDefinition, context)) {
        continue;
      }

      // Evaluate badge requirements
      const isEligible = await this.evaluateBadgeRequirements(badgeDefinition, context);
      
      if (isEligible) {
        // Award the badge
        const result = await this.awardBadge(context.userId, badgeDefinition);
        if (result) {
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Evaluate specific badge requirements
   */
  private async evaluateBadgeRequirements(
    badge: BadgeDefinition, 
    context: BadgeEvaluationContext
  ): Promise<boolean> {
    const req = badge.requirements;

    switch (req.type) {
      case 'profile_completion':
        return this.evaluateProfileCompletion(context, req.threshold);
      
      case 'contact_info_complete':
        return this.evaluateContactInfoComplete(context);
      
      case 'cv_analysis_count':
        return await this.evaluateCVAnalysisCount(context.userId, req.threshold);
      
      case 'cv_score_threshold':
        return await this.evaluateCVScoreThreshold(context.userId, req.threshold);
      
      case 'suggestions_accepted':
        return await this.evaluateSuggestionsAccepted(context.userId, req.threshold);
      
      case 'suggestions_generated':
        return await this.evaluateSuggestionsGenerated(context.userId, req.threshold);
      
      case 'applications_submitted':
        return await this.evaluateApplicationsSubmitted(context.userId, req.threshold);
      
      case 'daily_applications':
        return await this.evaluateDailyApplications(context.userId, req.threshold);
      
      case 'application_quality':
        return await this.evaluateApplicationQuality(context.userId, req.threshold, req.data.min_applications);
      
      case 'activity_streak':
        return this.evaluateActivityStreak(context, req.threshold);
      
      case 'challenges_completed':
        return await this.evaluateChallengesCompleted(context.userId, req.threshold);
      
      case 'perfect_challenge_streak':
        return await this.evaluatePerfectChallengeStreak(context.userId, req.threshold);
      
      case 'level_reached':
        return this.evaluateLevelReached(context, req.threshold);
      
      case 'early_adopter':
        return await this.evaluateEarlyAdopter(context.userId, req.threshold);
      
      case 'beta_participation':
        return await this.evaluateBetaParticipation(context.userId);
      
      case 'feedback_submitted':
        return await this.evaluateFeedbackSubmitted(context.userId, req.threshold);
      
      case 'seasonal_activity':
        return await this.evaluateSeasonalActivity(context, req.threshold, req.data);
      
      case 'weekend_activity':
        return await this.evaluateWeekendActivity(context.userId, req.threshold);
      
      default:
        console.warn(`Unknown badge requirement type: ${req.type}`);
        return false;
    }
  }

  // === BADGE EVALUATION METHODS ===

  private evaluateProfileCompletion(context: BadgeEvaluationContext, threshold: number): boolean {
    // Calculate profile completion percentage
    const profile = context.userProfile;
    let completedFields = 0;
    let totalFields = 0;

    // Count contact info fields
    if (profile.contactInfo) {
      const contactFields = ['name', 'email', 'phone', 'location', 'linkedin', 'github', 'website'];
      contactFields.forEach(field => {
        totalFields++;
        if (profile.contactInfo[field]) completedFields++;
      });
    }

    // Count other profile sections
    if (profile.about) { completedFields++; totalFields++; }
    if (profile.skills?.length > 0) { completedFields++; totalFields++; }
    if (profile.experience?.length > 0) { completedFields++; totalFields++; }
    if (profile.education?.length > 0) { completedFields++; totalFields++; }

    const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    return completionPercentage >= threshold;
  }

  private evaluateContactInfoComplete(context: BadgeEvaluationContext): boolean {
    const contact = context.userProfile.contactInfo;
    if (!contact) return false;

    const requiredFields = ['name', 'email', 'phone', 'location', 'linkedin', 'github'];
    return requiredFields.every(field => contact[field]);
  }

  private async evaluateCVAnalysisCount(userId: string, threshold: number): Promise<boolean> {
    // Use query optimizer for cached CV analysis count
    const { getCachedCVAnalysisCount } = await import('./queryOptimizer');
    const count = await getCachedCVAnalysisCount(userId, 'COMPLETED');
    return count >= threshold;
  }

  private async evaluateCVScoreThreshold(userId: string, threshold: number): Promise<boolean> {
    const bestAnalysis = await prisma.cVAnalysis.findFirst({
      where: { 
        developerId: userId,
        status: 'COMPLETED'
      },
      orderBy: { 
        // Assuming we store overall score in analysisResult
        createdAt: 'desc'
      },
      take: 1
    });

    if (!bestAnalysis?.analysisResult) return false;
    
    // Extract score from analysis result
    const score = this.extractOverallScore(bestAnalysis.analysisResult);
    return score >= threshold;
  }

  private async evaluateSuggestionsAccepted(userId: string, threshold: number): Promise<boolean> {
    // This would need to be implemented when suggestion tracking is added
    // For now, return false
    return false;
  }

  private async evaluateSuggestionsGenerated(userId: string, threshold: number): Promise<boolean> {
    // This would need to be implemented when suggestion tracking is added
    // For now, return false
    return false;
  }

  private async evaluateApplicationsSubmitted(userId: string, threshold: number): Promise<boolean> {
    // Use query optimizer for cached application stats
    const { getCachedApplicationStats } = await import('./queryOptimizer');
    const stats = await getCachedApplicationStats(userId);
    return stats.total >= threshold;
  }

  private async evaluateDailyApplications(userId: string, threshold: number): Promise<boolean> {
    // Use query optimizer for cached application stats
    const { getCachedApplicationStats } = await import('./queryOptimizer');
    const stats = await getCachedApplicationStats(userId);
    return stats.today >= threshold;
  }

  private async evaluateApplicationQuality(userId: string, threshold: number, minApplications: number): Promise<boolean> {
    // This would need application quality scoring to be implemented
    // For now, return false
    return false;
  }

  private evaluateActivityStreak(context: BadgeEvaluationContext, threshold: number): boolean {
    return context.userProfile.streak >= threshold;
  }

  private async evaluateChallengesCompleted(userId: string, threshold: number): Promise<boolean> {
    const count = await prisma.dailyChallenge.count({
      where: {
        developerId: userId,
        isNot: { completedAt: null }
      }
    });
    return count >= threshold;
  }

  private async evaluatePerfectChallengeStreak(userId: string, threshold: number): Promise<boolean> {
    // This would need more complex logic to track consecutive perfect days
    // For now, return false
    return false;
  }

  private evaluateLevelReached(context: BadgeEvaluationContext, threshold: number): boolean {
    return context.userProfile.currentLevel >= threshold;
  }

  private async evaluateEarlyAdopter(userId: string, threshold: number): Promise<boolean> {
    // Check if user is among first N users to complete profile
    const userRank = await prisma.developer.count({
      where: {
        createdAt: {
          lte: await this.getUserCreationDate(userId)
        }
      }
    });
    return userRank <= threshold;
  }

  private async evaluateBetaParticipation(userId: string): Promise<boolean> {
    // This would need beta tester tracking
    // For now, return false
    return false;
  }

  private async evaluateFeedbackSubmitted(userId: string, threshold: number): Promise<boolean> {
    // This would need feedback tracking
    // For now, return false
    return false;
  }

  private async evaluateSeasonalActivity(context: BadgeEvaluationContext, threshold: number, data: any): Promise<boolean> {
    // This would need seasonal activity tracking
    // For now, return false
    return false;
  }

  private async evaluateWeekendActivity(userId: string, threshold: number): Promise<boolean> {
    // This would need weekend activity tracking
    // For now, return false
    return false;
  }

  // === HELPER METHODS ===

  private isHiddenBadgeTriggered(badge: BadgeDefinition, context: BadgeEvaluationContext): boolean {
    // Special logic for hidden badges that should be revealed
    // For now, return false
    return false;
  }

  private async getUserBadges(userId: string) {
    return await prisma.userBadge.findMany({
      where: { developerId: userId },
      include: { badge: true }
    });
  }

  private async awardBadge(userId: string, badge: BadgeDefinition): Promise<BadgeAwardResult | null> {
    try {
      // Create badge if it doesn't exist
      const badgeRecord = await prisma.badge.upsert({
        where: { id: badge.id },
        update: {},
        create: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          tier: badge.tier,
          xpReward: badge.xpReward
        }
      });

      // Award badge to user
      const userBadge = await prisma.userBadge.create({
        data: {
          developerId: userId,
          badgeId: badge.id,
          earnedAt: new Date()
        }
      });

      // Award XP
      await prisma.xPTransaction.create({
        data: {
          developerId: userId,
          amount: badge.xpReward,
          source: 'BADGE_EARNED',
          sourceId: badge.id,
          description: `Earned badge: ${badge.name}`,
          earnedAt: new Date()
        }
      });

      return {
        badgeId: badge.id,
        badge: badge,
        isNewlyEarned: true,
        xpAwarded: badge.xpReward
      };
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  private extractOverallScore(analysisResult: any): number {
    // Extract overall score from analysis result
    if (analysisResult?.summary?.overallScore) {
      return analysisResult.summary.overallScore;
    }
    return 0;
  }

  private async getUserCreationDate(userId: string): Promise<Date> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    });
    return user?.createdAt || new Date();
  }

  /**
   * Manual badge award for special cases
   */
  public async awardSpecialBadge(userId: string, badgeId: string): Promise<BadgeAwardResult | null> {
    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badge) return null;

    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        developerId: userId,
        badgeId: badgeId
      }
    });

    if (existingBadge) return null;

    return await this.awardBadge(userId, badge);
  }

  /**
   * Get badges a user is close to earning
   */
  public async getNearbyBadges(userId: string, limit: number = 5): Promise<Array<{
    badge: BadgeDefinition;
    progress: number;
    requirement: string;
  }>> {
    // This would implement logic to show progress toward badges
    // For now, return empty array
    return [];
  }

  // === HELPER METHODS FOR CONTEXT EVALUATION ===

  /**
   * Check if current time is weekend
   */
  private isWeekend(): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Check if user has recent activity (within last 7 days)
   */
  private hasRecentActivity(context: BadgeEvaluationContext): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return context.userProfile.lastActivityDate ? 
      new Date(context.userProfile.lastActivityDate) > sevenDaysAgo : 
      false;
  }
}