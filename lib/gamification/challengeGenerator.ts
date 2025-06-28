// Daily Challenge Generation System
// Creates personalized daily challenges based on user activity and progress

import { PrismaClient } from '@prisma/client';
import { DailyChallenge } from '@/types/gamification';

const prisma = new PrismaClient();

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  targetValue: number;
  xpReward: number;
  requirements?: {
    minLevel?: number;
    maxLevel?: number;
    hasPreviousActivity?: boolean;
    minimumStreak?: number;
  };
  weight: number; // Higher weight = more likely to be selected
}

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  // Profile Enhancement Challenges
  {
    id: 'profile_polish_basic',
    title: 'Profile Polish',
    description: 'Update 2 sections of your profile',
    type: 'PROFILE_UPDATE',
    difficulty: 'Easy',
    targetValue: 2,
    xpReward: 50,
    weight: 10
  },
  {
    id: 'profile_polish_advanced',
    title: 'Profile Perfectionist',
    description: 'Complete 5 profile sections with detailed information',
    type: 'PROFILE_UPDATE',
    difficulty: 'Hard',
    targetValue: 5,
    xpReward: 150,
    requirements: { minLevel: 5 },
    weight: 5
  },
  {
    id: 'skill_showcase',
    title: 'Skill Showcase',
    description: 'Add 3 new skills to your profile',
    type: 'SKILL_ADD',
    difficulty: 'Easy',
    targetValue: 3,
    xpReward: 40,
    weight: 8
  },

  // AI Interaction Challenges
  {
    id: 'ai_collaborator_basic',
    title: 'AI Assistant',
    description: 'Accept 3 AI suggestions',
    type: 'AI_INTERACTION',
    difficulty: 'Medium',
    targetValue: 3,
    xpReward: 75,
    weight: 7
  },
  {
    id: 'ai_power_user',
    title: 'AI Power User',
    description: 'Generate and review 10 AI suggestions',
    type: 'AI_INTERACTION',
    difficulty: 'Hard',
    targetValue: 10,
    xpReward: 200,
    requirements: { minLevel: 10 },
    weight: 4
  },

  // CV Improvement Challenges
  {
    id: 'cv_analyzer',
    title: 'CV Analyzer',
    description: 'Complete 1 CV analysis',
    type: 'CV_ANALYSIS',
    difficulty: 'Easy',
    targetValue: 1,
    xpReward: 60,
    weight: 9
  },
  {
    id: 'cv_optimizer',
    title: 'CV Optimizer',
    description: 'Achieve 85+ score on CV analysis',
    type: 'CV_SCORE_TARGET',
    difficulty: 'Medium',
    targetValue: 85,
    xpReward: 100,
    requirements: { hasPreviousActivity: true },
    weight: 6
  },

  // Application Activity Challenges
  {
    id: 'job_hunter',
    title: 'Job Hunt Focus',
    description: 'Apply to 2 relevant positions',
    type: 'APPLICATION_ACTIVITY',
    difficulty: 'Hard',
    targetValue: 2,
    xpReward: 120,
    weight: 6
  },
  {
    id: 'application_quality',
    title: 'Quality Applications',
    description: 'Submit 1 high-quality application',
    type: 'APPLICATION_ACTIVITY',
    difficulty: 'Medium',
    targetValue: 1,
    xpReward: 80,
    weight: 7
  },

  // Engagement Challenges
  {
    id: 'consistency_builder',
    title: 'Consistency Builder',
    description: 'Log in and complete 1 action',
    type: 'DAILY_ENGAGEMENT',
    difficulty: 'Easy',
    targetValue: 1,
    xpReward: 30,
    weight: 12
  },
  {
    id: 'exploration_mode',
    title: 'Platform Explorer',
    description: 'Visit 4 different sections of the platform',
    type: 'PLATFORM_EXPLORATION',
    difficulty: 'Easy',
    targetValue: 4,
    xpReward: 40,
    weight: 8
  },

  // Advanced Challenges
  {
    id: 'networking_ninja',
    title: 'Networking Ninja',
    description: 'Connect your LinkedIn and GitHub profiles',
    type: 'SOCIAL_CONNECTION',
    difficulty: 'Medium',
    targetValue: 2,
    xpReward: 90,
    weight: 5
  },
  {
    id: 'feedback_contributor',
    title: 'Feedback Hero',
    description: 'Provide feedback on 1 feature',
    type: 'FEEDBACK_SUBMISSION',
    difficulty: 'Medium',
    targetValue: 1,
    xpReward: 70,
    weight: 4
  },

  // Weekend Challenges
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Complete 3 activities on the weekend',
    type: 'WEEKEND_ACTIVITY',
    difficulty: 'Medium',
    targetValue: 3,
    xpReward: 85,
    weight: 6
  },

  // Streak-Based Challenges
  {
    id: 'streak_maintainer',
    title: 'Streak Keeper',
    description: 'Maintain your current streak',
    type: 'STREAK_MAINTENANCE',
    difficulty: 'Easy',
    targetValue: 1,
    xpReward: 35,
    requirements: { minimumStreak: 3 },
    weight: 8
  }
];

export class ChallengeGenerator {
  private static instance: ChallengeGenerator;

  private constructor() {}

  public static getInstance(): ChallengeGenerator {
    if (!ChallengeGenerator.instance) {
      ChallengeGenerator.instance = new ChallengeGenerator();
    }
    return ChallengeGenerator.instance;
  }

  /**
   * Generate daily challenges for a user
   */
  async generateDailyChallenges(userId: string, count: number = 3): Promise<DailyChallenge[]> {
    const userContext = await this.getUserContext(userId);
    const availableTemplates = this.filterTemplatesByUser(userContext);
    const selectedTemplates = this.selectTemplates(availableTemplates, count);
    
    const challenges: DailyChallenge[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const template of selectedTemplates) {
      const challenge: DailyChallenge = {
        id: this.generateChallengeId(userId, template.id),
        developerId: userId,
        title: template.title,
        description: this.personalizeDescription(template.description, userContext),
        type: template.type,
        targetValue: template.targetValue,
        currentProgress: 0,
        xpReward: this.calculateDynamicXP(template.xpReward, userContext),
        difficulty: template.difficulty,
        completedAt: null,
        expiresAt: tomorrow,
        createdAt: new Date()
      };

      challenges.push(challenge);
    }

    return challenges;
  }

  /**
   * Get user context for personalized challenge generation
   */
  private async getUserContext(userId: string) {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        totalXP: true,
        currentLevel: true,
        tier: true,
        streak: true,
        lastActivityDate: true,
        cvAnalyses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { 
            status: true, 
            analysisResult: true,
            createdAt: true
          }
        },
        applications: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        },
        xpTransactions: {
          take: 20,
          orderBy: { earnedAt: 'desc' },
          select: { 
            source: true, 
            earnedAt: true 
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate activity patterns
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivities = user.xpTransactions.filter(
      tx => new Date(tx.earnedAt) > weekAgo
    );

    const activityFrequency = {
      CV_ANALYSIS: recentActivities.filter(tx => tx.source === 'CV_ANALYSIS').length,
      APPLICATION_SUBMIT: recentActivities.filter(tx => tx.source === 'APPLICATION_SUBMIT').length,
      PROFILE_UPDATE: recentActivities.filter(tx => tx.source === 'PROFILE_UPDATE').length,
      AI_INTERACTION: recentActivities.filter(tx => tx.source === 'CV_IMPROVEMENT').length
    };

    const lastCVScore = this.extractLastCVScore(user.cvAnalyses);
    const isWeekend = [0, 6].includes(today.getDay());
    
    return {
      userId,
      level: user.currentLevel || 1,
      totalXP: user.totalXP || 0,
      tier: user.tier || 'BRONZE',
      streak: user.streak || 0,
      lastActivityDate: user.lastActivityDate,
      recentActivities: activityFrequency,
      lastCVScore,
      isWeekend,
      daysSinceLastActivity: this.calculateDaysSinceLastActivity(user.lastActivityDate),
      hasRecentActivity: recentActivities.length > 0
    };
  }

  /**
   * Filter challenge templates based on user eligibility
   */
  private filterTemplatesByUser(userContext: any): ChallengeTemplate[] {
    return CHALLENGE_TEMPLATES.filter(template => {
      const req = template.requirements || {};

      // Level requirements
      if (req.minLevel && userContext.level < req.minLevel) return false;
      if (req.maxLevel && userContext.level > req.maxLevel) return false;

      // Activity requirements
      if (req.hasPreviousActivity && !userContext.hasRecentActivity) return false;
      if (req.minimumStreak && userContext.streak < req.minimumStreak) return false;

      // Weekend-specific challenges
      if (template.type === 'WEEKEND_ACTIVITY' && !userContext.isWeekend) return false;

      // Don't repeat similar challenges from recent activity
      if (this.isRecentlyCompleted(template, userContext)) return false;

      return true;
    });
  }

  /**
   * Select challenge templates using weighted random selection
   */
  private selectTemplates(templates: ChallengeTemplate[], count: number): ChallengeTemplate[] {
    if (templates.length <= count) return templates;

    const selected: ChallengeTemplate[] = [];
    const usedTypes = new Set<string>();

    // Ensure variety by avoiding duplicate types
    const sortedTemplates = [...templates].sort((a, b) => b.weight - a.weight);

    for (const template of sortedTemplates) {
      if (selected.length >= count) break;
      
      // Prefer templates with different types for variety
      if (!usedTypes.has(template.type)) {
        selected.push(template);
        usedTypes.add(template.type);
      }
    }

    // Fill remaining slots with highest weighted templates
    while (selected.length < count && selected.length < templates.length) {
      const remaining = templates.filter(t => !selected.includes(t));
      if (remaining.length === 0) break;
      
      const best = remaining.reduce((prev, curr) => 
        curr.weight > prev.weight ? curr : prev
      );
      selected.push(best);
    }

    return selected;
  }

  /**
   * Personalize challenge descriptions based on user context
   */
  private personalizeDescription(description: string, userContext: any): string {
    let personalized = description;

    // Add user-specific context
    if (userContext.streak > 0) {
      personalized = personalized.replace(
        'your profile', 
        `your profile (current streak: ${userContext.streak} days)`
      );
    }

    if (userContext.lastCVScore && userContext.lastCVScore < 80) {
      personalized = personalized.replace(
        'CV analysis',
        `CV analysis (improve your ${userContext.lastCVScore}% score)`
      );
    }

    return personalized;
  }

  /**
   * Calculate dynamic XP rewards based on user level and activity
   */
  private calculateDynamicXP(baseXP: number, userContext: any): number {
    let multiplier = 1.0;

    // Level-based multiplier
    if (userContext.level >= 20) multiplier += 0.5;
    else if (userContext.level >= 10) multiplier += 0.3;
    else if (userContext.level >= 5) multiplier += 0.1;

    // Streak bonus
    if (userContext.streak >= 7) multiplier += 0.2;

    // Activity gap compensation (encourage return)
    if (userContext.daysSinceLastActivity > 7) multiplier += 0.3;

    return Math.round(baseXP * multiplier);
  }

  /**
   * Generate unique challenge ID
   */
  private generateChallengeId(userId: string, templateId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${templateId}_${userId}_${today}`;
  }

  /**
   * Check if a similar challenge was recently completed
   */
  private isRecentlyCompleted(template: ChallengeTemplate, userContext: any): boolean {
    // Check if user has been very active in this area recently
    const recentActivity = userContext.recentActivities[template.type] || 0;
    
    // If user has done this type of activity 3+ times this week, skip similar challenges
    if (recentActivity >= 3) return true;

    return false;
  }

  /**
   * Extract last CV analysis score
   */
  private extractLastCVScore(cvAnalyses: any[]): number | null {
    if (!cvAnalyses || cvAnalyses.length === 0) return null;
    
    const lastAnalysis = cvAnalyses[0];
    if (!lastAnalysis.analysisResult) return null;

    // Try to extract overall score from analysis result
    try {
      const result = typeof lastAnalysis.analysisResult === 'string' 
        ? JSON.parse(lastAnalysis.analysisResult)
        : lastAnalysis.analysisResult;
      
      return result.summary?.overallScore || null;
    } catch {
      return null;
    }
  }

  /**
   * Calculate days since last activity
   */
  private calculateDaysSinceLastActivity(lastActivityDate: Date | null): number {
    if (!lastActivityDate) return 999; // Very large number for new users
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivityDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Create challenges in database
   */
  async createDailyChallengesForUser(userId: string): Promise<DailyChallenge[]> {
    // Check if user already has challenges for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingChallenges = await prisma.dailyChallenge.findMany({
      where: {
        developerId: userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingChallenges.length > 0) {
      return existingChallenges as DailyChallenge[];
    }

    // Generate new challenges
    const challengeData = await this.generateDailyChallenges(userId);
    
    // Create in database
    const createdChallenges = await Promise.all(
      challengeData.map(challenge =>
        prisma.dailyChallenge.create({
          data: {
            id: challenge.id,
            developerId: challenge.developerId,
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            targetValue: challenge.targetValue,
            currentProgress: challenge.currentProgress,
            xpReward: challenge.xpReward,
            difficulty: challenge.difficulty,
            expiresAt: challenge.expiresAt
          }
        })
      )
    );

    return createdChallenges as DailyChallenge[];
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(
    userId: string, 
    challengeType: string, 
    increment: number = 1
  ): Promise<DailyChallenge[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find active challenges of this type
    const challenges = await prisma.dailyChallenge.findMany({
      where: {
        developerId: userId,
        type: challengeType,
        completedAt: null,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const updatedChallenges: DailyChallenge[] = [];

    for (const challenge of challenges) {
      const newProgress = Math.min(
        challenge.currentProgress + increment,
        challenge.targetValue
      );

      const isCompleted = newProgress >= challenge.targetValue;

      const updated = await prisma.dailyChallenge.update({
        where: { id: challenge.id },
        data: {
          currentProgress: newProgress,
          completedAt: isCompleted ? new Date() : null
        }
      });

      updatedChallenges.push(updated as DailyChallenge);

      // Trigger challenge completion event
      if (isCompleted && !challenge.completedAt) {
        // Import here to avoid circular dependency
        const { gamificationEvents } = await import('./eventManager');
        await gamificationEvents.trigger('CHALLENGE_COMPLETED', {
          userId,
          challengeId: challenge.id,
          challengeName: challenge.title,
          xpReward: challenge.xpReward
        });
      }
    }

    return updatedChallenges;
  }
}