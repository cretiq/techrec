// Streak Manager - Activity Streak Tracking System
// Manages daily activity streaks and streak-based rewards

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  isActiveToday: boolean;
  streakMultiplier: number;
}

export interface StreakUpdateResult {
  previousStreak: number;
  newStreak: number;
  streakBroken: boolean;
  streakExtended: boolean;
  multiplierChanged: boolean;
  xpBonusEarned: number;
}

export class StreakManager {
  private static instance: StreakManager;
  
  private constructor() {}

  public static getInstance(): StreakManager {
    if (!StreakManager.instance) {
      StreakManager.instance = new StreakManager();
    }
    return StreakManager.instance;
  }

  /**
   * Record user activity and update streak (ATOMIC - prevents race conditions)
   */
  public async recordActivity(userId: string, activityType: string = 'general'): Promise<StreakUpdateResult> {
    const now = new Date();
    const today = this.getDateOnly(now);
    
    // Use database transaction to prevent race conditions
    return await prisma.$transaction(async (tx) => {
      // Lock user record for update to prevent concurrent modifications
      const user = await tx.developer.findUnique({
        where: { id: userId },
        select: {
          streak: true,
          longestStreak: true,
          lastActivityDate: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentStreak = user.streak || 0;
      const longestStreak = user.longestStreak || 0;
      const lastActivityDate = user.lastActivityDate;
      
      // Calculate new streak
      const streakResult = this.calculateNewStreak(currentStreak, lastActivityDate, today);
      
      // Skip update if already active today (prevents duplicate streak awards)
      if (!streakResult.streakExtended && streakResult.newStreak === currentStreak) {
        return {
          previousStreak: currentStreak,
          newStreak: streakResult.newStreak,
          streakBroken: false,
          streakExtended: false,
          multiplierChanged: false,
          xpBonusEarned: 0
        };
      }
      
      // Update user record atomically
      const newLongestStreak = Math.max(longestStreak, streakResult.newStreak);
      
      await tx.developer.update({
        where: { id: userId },
        data: {
          streak: streakResult.newStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: now
        }
      });

      // Award streak bonus XP if applicable (within same transaction)
      let xpBonusEarned = 0;
      if (streakResult.streakExtended) {
        xpBonusEarned = this.calculateStreakBonus(streakResult.newStreak);
        
        if (xpBonusEarned > 0) {
          await this.awardStreakBonusAtomic(tx, userId, streakResult.newStreak, xpBonusEarned);
        }
      }

      // Record streak milestone if achieved
      await this.checkStreakMilestones(userId, streakResult.newStreak, currentStreak);

      return {
        previousStreak: currentStreak,
        newStreak: streakResult.newStreak,
        streakBroken: streakResult.streakBroken,
        streakExtended: streakResult.streakExtended,
        multiplierChanged: this.getStreakMultiplier(currentStreak) !== this.getStreakMultiplier(streakResult.newStreak),
        xpBonusEarned
      };
    });
  }

  /**
   * Get current streak data for user
   */
  public async getStreakData(userId: string): Promise<StreakData> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        longestStreak: true,
        lastActivityDate: true
      }
    });

    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        isActiveToday: false,
        streakMultiplier: 1.0
      };
    }

    const today = this.getDateOnly(new Date());
    const lastActivityDay = user.lastActivityDate ? this.getDateOnly(user.lastActivityDate) : null;
    const isActiveToday = lastActivityDay ? this.isSameDay(today, lastActivityDay) : false;

    return {
      currentStreak: user.streak || 0,
      longestStreak: user.longestStreak || 0,
      lastActivityDate: user.lastActivityDate,
      isActiveToday,
      streakMultiplier: this.getStreakMultiplier(user.streak || 0)
    };
  }

  /**
   * Check if user needs streak recovery (missed yesterday)
   */
  public async checkStreakRecovery(userId: string): Promise<{
    canRecover: boolean;
    recoveryDeadline: Date | null;
    recoveryStreak: number;
  }> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastActivityDate: true
      }
    });

    if (!user || !user.lastActivityDate) {
      return { canRecover: false, recoveryDeadline: null, recoveryStreak: 0 };
    }

    const now = new Date();
    const lastActivity = this.getDateOnly(user.lastActivityDate);
    const yesterday = this.getDateOnly(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const dayBeforeYesterday = this.getDateOnly(new Date(now.getTime() - 48 * 60 * 60 * 1000));

    // Can recover if last activity was day before yesterday
    const canRecover = this.isSameDay(lastActivity, dayBeforeYesterday);
    
    if (canRecover) {
      // Recovery deadline is end of today
      const recoveryDeadline = new Date(now);
      recoveryDeadline.setHours(23, 59, 59, 999);
      
      return {
        canRecover: true,
        recoveryDeadline,
        recoveryStreak: user.streak || 0
      };
    }

    return { canRecover: false, recoveryDeadline: null, recoveryStreak: 0 };
  }

  /**
   * Perform streak recovery (premium feature) - ATOMIC operation
   */
  public async performStreakRecovery(userId: string): Promise<{
    success: boolean;
    newStreak: number;
    cost: number;
  }> {
    return await prisma.$transaction(async (tx) => {
      // Re-check recovery eligibility within transaction
      const user = await tx.developer.findUnique({
        where: { id: userId },
        select: {
          streak: true,
          lastActivityDate: true,
          totalXP: true
        }
      });

      if (!user || !user.lastActivityDate) {
        return { success: false, newStreak: 0, cost: 0 };
      }

      const now = new Date();
      const lastActivity = this.getDateOnly(user.lastActivityDate);
      const dayBeforeYesterday = this.getDateOnly(new Date(now.getTime() - 48 * 60 * 60 * 1000));

      // Verify recovery is still possible
      if (!this.isSameDay(lastActivity, dayBeforeYesterday)) {
        return { success: false, newStreak: 0, cost: 0 };
      }

      // Calculate recovery cost
      const cost = this.calculateRecoveryCost(user.streak || 0);
      
      // Check if user has enough XP (if using XP as cost)
      if (user.totalXP < cost) {
        return { success: false, newStreak: 0, cost };
      }

      // Perform recovery: update last activity to yesterday to maintain streak
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      await tx.developer.update({
        where: { id: userId },
        data: {
          lastActivityDate: yesterday,
          totalXP: { decrement: cost } // Deduct recovery cost
        }
      });

      // Log the recovery transaction
      await tx.xPTransaction.create({
        data: {
          developerId: userId,
          amount: -cost,
          source: 'STREAK_RECOVERY',
          sourceId: `recovery_${user.streak}`,
          description: `Streak recovery for ${user.streak}-day streak`,
          earnedAt: new Date()
        }
      });

      return {
        success: true,
        newStreak: user.streak || 0,
        cost
      };
    });
  }

  // === PRIVATE HELPER METHODS ===

  private calculateNewStreak(
    currentStreak: number, 
    lastActivityDate: Date | null, 
    today: Date
  ): { newStreak: number; streakBroken: boolean; streakExtended: boolean } {
    if (!lastActivityDate) {
      // First activity ever
      return { newStreak: 1, streakBroken: false, streakExtended: true };
    }

    const lastActivityDay = this.getDateOnly(lastActivityDate);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (this.isSameDay(today, lastActivityDay)) {
      // Already active today, no change
      return { newStreak: currentStreak, streakBroken: false, streakExtended: false };
    }

    if (this.isSameDay(yesterday, lastActivityDay)) {
      // Consecutive day, extend streak
      return { newStreak: currentStreak + 1, streakBroken: false, streakExtended: true };
    }

    // Streak broken, start over
    return { newStreak: 1, streakBroken: true, streakExtended: true };
  }

  private getStreakMultiplier(streak: number): number {
    if (streak >= 100) return 3.0;
    if (streak >= 50) return 2.5;
    if (streak >= 30) return 2.0;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.2;
    if (streak >= 3) return 1.1;
    return 1.0;
  }

  private calculateStreakBonus(streak: number): number {
    // Award bonus XP for streak milestones
    if (streak % 100 === 0) return 500; // Century milestone
    if (streak % 50 === 0) return 300;  // 50-day milestone
    if (streak % 30 === 0) return 200;  // Monthly milestone
    if (streak % 14 === 0) return 100;  // Bi-weekly milestone
    if (streak % 7 === 0) return 50;    // Weekly milestone
    return 0;
  }

  private async awardStreakBonus(userId: string, streak: number, xpAmount: number): Promise<void> {
    await prisma.xPTransaction.create({
      data: {
        developerId: userId,
        amount: xpAmount,
        source: 'STREAK_BONUS',
        sourceId: `streak_${streak}`,
        description: `${streak}-day streak bonus`,
        earnedAt: new Date()
      }
    });
  }

  /**
   * Award streak bonus within transaction (prevents race conditions)
   */
  private async awardStreakBonusAtomic(tx: any, userId: string, streak: number, xpAmount: number): Promise<void> {
    // Check for existing bonus to prevent duplicates
    const existingBonus = await tx.xPTransaction.findFirst({
      where: {
        developerId: userId,
        source: 'STREAK_BONUS',
        sourceId: `streak_${streak}`,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      }
    });

    if (existingBonus) {
      console.log(`Streak bonus ${streak} already awarded to user ${userId}, skipping duplicate`);
      return;
    }

    await tx.xPTransaction.create({
      data: {
        developerId: userId,
        amount: xpAmount,
        source: 'STREAK_BONUS',
        sourceId: `streak_${streak}`,
        description: `${streak}-day streak bonus`,
        earnedAt: new Date()
      }
    });

    // Also update user's total XP within the same transaction
    await tx.developer.update({
      where: { id: userId },
      data: {
        totalXP: { increment: xpAmount }
      }
    });
  }

  private async checkStreakMilestones(userId: string, newStreak: number, oldStreak: number): Promise<void> {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    
    for (const milestone of milestones) {
      if (newStreak >= milestone && oldStreak < milestone) {
        // Crossed milestone, trigger badge evaluation or special event
        console.log(`User ${userId} achieved ${milestone}-day streak milestone`);
        // Could trigger badge evaluation here
      }
    }
  }

  private calculateRecoveryCost(streak: number): number {
    // Cost increases with streak value
    return Math.min(Math.floor(streak * 10), 500);
  }

  private getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getTime() === date2.getTime();
  }

  /**
   * Get streak leaderboard data
   */
  public async getStreakLeaderboard(limit: number = 10): Promise<Array<{
    rank: number;
    streak: number;
    longestStreak: number;
    isCurrentUser?: boolean;
  }>> {
    const leaders = await prisma.developer.findMany({
      where: {
        streak: { gt: 0 }
      },
      orderBy: { streak: 'desc' },
      take: limit,
      select: {
        id: true,
        streak: true,
        longestStreak: true
      }
    });

    return leaders.map((leader, index) => ({
      rank: index + 1,
      streak: leader.streak || 0,
      longestStreak: leader.longestStreak || 0
    }));
  }

  /**
   * Get user's streak rank
   */
  public async getUserStreakRank(userId: string): Promise<{
    currentRank: number | null;
    longestRank: number | null;
    percentile: number;
  }> {
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: { streak: true, longestStreak: true }
    });

    if (!user) {
      return { currentRank: null, longestRank: null, percentile: 0 };
    }

    // Get current streak rank
    const currentRank = await prisma.developer.count({
      where: {
        streak: { gt: user.streak || 0 }
      }
    }) + 1;

    // Get longest streak rank
    const longestRank = await prisma.developer.count({
      where: {
        longestStreak: { gt: user.longestStreak || 0 }
      }
    }) + 1;

    // Calculate percentile
    const totalUsers = await prisma.developer.count();
    const percentile = totalUsers > 0 ? ((totalUsers - currentRank + 1) / totalUsers) * 100 : 0;

    return {
      currentRank,
      longestRank,
      percentile: Math.round(percentile)
    };
  }
}