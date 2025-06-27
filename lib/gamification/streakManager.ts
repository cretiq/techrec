// Streak Management System for TechRec Gamification

import { PrismaClient } from '@prisma/client';
import { XPCalculator } from './xpCalculator';

const prisma = new PrismaClient();

/**
 * Streak management system with gentle pressure and safety nets
 * Encourages consistency without creating unhealthy pressure
 */
export class StreakManager {
  
  /**
   * Update user's daily streak with smart logic
   * Handles consecutive days, same day, and streak breaks gracefully
   */
  static async updateDailyStreak(userId: string): Promise<{
    streak: number;
    streakBroken: boolean;
    bonusAwarded: boolean;
    bonusXP: number;
  }> {
    try {
      const user = await prisma.developer.findUnique({
        where: { id: userId },
        select: { streak: true, lastActivityDate: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const today = this.getDateOnly(now);
      const lastActivity = user.lastActivityDate ? this.getDateOnly(user.lastActivityDate) : null;
      
      let newStreak = 1;
      let streakBroken = false;
      let bonusAwarded = false;
      let bonusXP = 0;

      if (lastActivity) {
        const daysDiff = this.getDaysDifference(lastActivity, today);

        if (daysDiff === 0) {
          // Same day - maintain current streak
          newStreak = user.streak;
        } else if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreak = user.streak + 1;
        } else if (daysDiff === 2) {
          // One day missed - apply "grace period" for weekends/busy days
          newStreak = Math.max(1, user.streak - 1); // Soft reset, don't go below 1
          streakBroken = daysDiff > 2; // Only mark as broken if more than 1 day gap
        } else {
          // Multiple days missed - reset streak
          newStreak = 1;
          streakBroken = true;
        }
      }

      // Award streak milestone bonuses
      if (newStreak > user.streak && this.isStreakMilestone(newStreak)) {
        bonusXP = XPCalculator.calculateStreakBonus(newStreak);
        bonusAwarded = bonusXP > 0;
      }

      // Update user's streak and last activity
      await prisma.developer.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          lastActivityDate: now
        }
      });

      // Award bonus XP if milestone reached
      if (bonusAwarded) {
        await prisma.$transaction(async (tx) => {
          await tx.developer.update({
            where: { id: userId },
            data: { totalXP: { increment: bonusXP } }
          });

          await tx.xPTransaction.create({
            data: {
              developerId: userId,
              amount: bonusXP,
              source: 'STREAK_BONUS',
              description: `${newStreak}-day streak milestone bonus`
            }
          });
        });
      }

      return {
        streak: newStreak,
        streakBroken,
        bonusAwarded,
        bonusXP
      };

    } catch (error) {
      console.error('Error updating daily streak:', error);
      return {
        streak: 1,
        streakBroken: false,
        bonusAwarded: false,
        bonusXP: 0
      };
    }
  }

  /**
   * Check if streak number is a milestone worthy of bonus
   */
  private static isStreakMilestone(streak: number): boolean {
    // Award bonuses at: 3, 7, 14, 30, 60, 90 days, then every 30 days
    if (streak === 3 || streak === 7 || streak === 14 || streak === 30 || 
        streak === 60 || streak === 90) {
      return true;
    }
    
    // Every 30 days after 90
    if (streak > 90 && streak % 30 === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Get date only (without time) for accurate day comparison
   */
  private static getDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  /**
   * Calculate difference in days between two dates
   */
  private static getDaysDifference(date1: Date, date2: Date): number {
    const timeDiff = date2.getTime() - date1.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get streak statistics for a user
   */
  static async getStreakStats(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    streakRank: number;
    nextMilestone: { days: number; bonus: number } | null;
  }> {
    try {
      const user = await prisma.developer.findUnique({
        where: { id: userId },
        select: { streak: true }
      });

      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
          streakRank: 0,
          nextMilestone: null
        };
      }

      // Calculate longest streak from XP transactions (login history)
      const longestStreak = await this.calculateLongestStreak(userId);
      
      // Count total days with activity
      const totalActiveDays = await this.countTotalActiveDays(userId);
      
      // Get user's streak rank compared to other users
      const streakRank = await this.calculateStreakRank(userId, user.streak);
      
      // Calculate next milestone
      const nextMilestone = this.getNextStreakMilestone(user.streak);

      return {
        currentStreak: user.streak,
        longestStreak,
        totalActiveDays,
        streakRank,
        nextMilestone
      };

    } catch (error) {
      console.error('Error getting streak stats:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        streakRank: 0,
        nextMilestone: null
      };
    }
  }

  /**
   * Calculate user's longest streak from activity history
   */
  private static async calculateLongestStreak(userId: string): Promise<number> {
    // Get all daily login transactions
    const loginTransactions = await prisma.xPTransaction.findMany({
      where: {
        developerId: userId,
        source: 'DAILY_LOGIN'
      },
      orderBy: { earnedAt: 'asc' },
      select: { earnedAt: true }
    });

    if (loginTransactions.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < loginTransactions.length; i++) {
      const prevDate = this.getDateOnly(loginTransactions[i - 1].earnedAt);
      const currDate = this.getDateOnly(loginTransactions[i].earnedAt);
      const daysDiff = this.getDaysDifference(prevDate, currDate);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  /**
   * Count total days with any activity
   */
  private static async countTotalActiveDays(userId: string): Promise<number> {
    const uniqueDays = await prisma.xPTransaction.findMany({
      where: { developerId: userId },
      select: { earnedAt: true },
      distinct: ['earnedAt']
    });

    // Group by date to count unique days
    const uniqueDates = new Set(
      uniqueDays.map(transaction => 
        this.getDateOnly(transaction.earnedAt).toDateString()
      )
    );

    return uniqueDates.size;
  }

  /**
   * Calculate user's streak rank among all users
   */
  private static async calculateStreakRank(userId: string, userStreak: number): Promise<number> {
    const usersWithHigherStreak = await prisma.developer.count({
      where: { 
        streak: { gt: userStreak },
        isDeleted: false
      }
    });

    return usersWithHigherStreak + 1;
  }

  /**
   * Get next streak milestone and bonus
   */
  private static getNextStreakMilestone(currentStreak: number): { days: number; bonus: number } | null {
    const milestones = [3, 7, 14, 30, 60, 90];
    
    // Find next milestone
    for (const milestone of milestones) {
      if (currentStreak < milestone) {
        return {
          days: milestone,
          bonus: XPCalculator.calculateStreakBonus(milestone)
        };
      }
    }
    
    // For streaks beyond 90 days, next milestone is every 30 days
    if (currentStreak >= 90) {
      const nextMilestone = Math.ceil((currentStreak + 1) / 30) * 30;
      return {
        days: nextMilestone,
        bonus: XPCalculator.calculateStreakBonus(nextMilestone)
      };
    }
    
    return null;
  }

  /**
   * Get streak leaderboard (top 10 users)
   */
  static async getStreakLeaderboard(): Promise<Array<{
    rank: number;
    streak: number;
    isCurrentUser: boolean;
    anonymousId: string;
  }>> {
    const topUsers = await prisma.developer.findMany({
      where: { 
        isDeleted: false,
        streak: { gt: 0 }
      },
      orderBy: { streak: 'desc' },
      take: 10,
      select: { id: true, streak: true }
    });

    return topUsers.map((user, index) => ({
      rank: index + 1,
      streak: user.streak,
      isCurrentUser: false, // Will be set by caller
      anonymousId: this.generateAnonymousId(user.id)
    }));
  }

  /**
   * Generate anonymous identifier for leaderboards
   */
  private static generateAnonymousId(userId: string): string {
    // Generate consistent but anonymous identifier
    const hash = userId.slice(-6).toUpperCase();
    return `DEV${hash}`;
  }

  /**
   * Check if user should receive streak freeze (grace period)
   * Helps maintain streaks during weekends or holidays
   */
  static async checkStreakFreeze(userId: string): Promise<{
    hasFreeze: boolean;
    freezesRemaining: number;
    canUseFreeze: boolean;
  }> {
    // In a full implementation, you might track freeze usage
    // For now, provide a simple weekend grace period
    
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: { lastActivityDate: true, streak: true }
    });

    if (!user?.lastActivityDate) {
      return { hasFreeze: false, freezesRemaining: 0, canUseFreeze: false };
    }

    const lastActivity = user.lastActivityDate;
    const dayOfWeek = lastActivity.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Weekend grace period (Friday-Sunday)
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
    
    return {
      hasFreeze: isWeekend,
      freezesRemaining: isWeekend ? 1 : 0,
      canUseFreeze: isWeekend && user.streak >= 7 // Only for established streaks
    };
  }

  /**
   * Reset streak manually (for testing or admin purposes)
   */
  static async resetStreak(userId: string): Promise<void> {
    await prisma.developer.update({
      where: { id: userId },
      data: { 
        streak: 0,
        lastActivityDate: null
      }
    });
  }

  /**
   * Get streak motivation message based on current streak
   */
  static getStreakMotivation(streak: number): {
    message: string;
    nextGoal: string;
    emoji: string;
  } {
    if (streak === 0) {
      return {
        message: "Start your career development streak today!",
        nextGoal: "Complete any activity to begin",
        emoji: "🚀"
      };
    } else if (streak < 3) {
      return {
        message: `${streak} day${streak > 1 ? 's' : ''} strong! Keep building momentum.`,
        nextGoal: "Reach 3 days for your first streak bonus",
        emoji: "💪"
      };
    } else if (streak < 7) {
      return {
        message: `${streak} days of consistent growth! You're developing great habits.`,
        nextGoal: "Reach 7 days for a bigger bonus",
        emoji: "🔥"
      };
    } else if (streak < 30) {
      return {
        message: `${streak} day streak! You're on fire! Your consistency is paying off.`,
        nextGoal: "Reach 30 days for a major milestone",
        emoji: "⚡"
      };
    } else {
      return {
        message: `${streak} day streak! You're a consistency champion!`,
        nextGoal: "Keep going - you're building career-changing habits",
        emoji: "🏆"
      };
    }
  }
}