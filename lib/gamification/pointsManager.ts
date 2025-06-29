// Points Management Engine for TechRec Subscription System

import { PointsSource, PointsSpendType, SubscriptionTier } from '@prisma/client';
import { configService } from '@/utils/configService';

export interface PointsAward {
  userId: string;
  amount: number;
  source: PointsSource;
  sourceId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PointsSpend {
  userId: string;
  amount: number;
  spendType: PointsSpendType;
  sourceId?: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface PointsAwardResult {
  success: boolean;
  newBalance: number;
  transaction?: any;
  error?: string;
}

export interface PointsSpendResult {
  success: boolean;
  newBalance: number;
  transaction?: any;
  error?: string;
}

export interface PointsBalance {
  monthly: number;
  used: number;
  earned: number;
  available: number;
  resetDate: Date | null;
  tier: SubscriptionTier;
}

/**
 * Core Points calculation and tracking engine
 * Manages subscription-based points allocation and spending
 */
export class PointsManager {
  
  /**
   * Calculate available points for a user
   */
  static calculateAvailablePoints(
    monthlyPoints: number,
    pointsUsed: number,
    pointsEarned: number
  ): number {
    return Math.max(0, monthlyPoints + pointsEarned - pointsUsed);
  }

  /**
   * Get points cost for a specific action
   */
  static async getPointsCost(action: PointsSpendType): Promise<number> {
    return await configService.getPointsCost(action);
  }

  /**
   * Check if user has sufficient points for an action
   */
  static async canAffordAction(
    action: PointsSpendType,
    currentBalance: PointsBalance
  ): Promise<{ canAfford: boolean; cost: number; shortfall?: number }> {
    const cost = await this.getPointsCost(action);
    const canAfford = currentBalance.available >= cost;
    
    return {
      canAfford,
      cost,
      shortfall: canAfford ? undefined : cost - currentBalance.available,
    };
  }

  /**
   * Atomic points spending with race condition protection
   */
  static async spendPointsAtomic(
    prisma: any,
    userId: string,
    spendType: PointsSpendType,
    sourceId?: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    pointsSpent?: number;
    newBalance?: number;
    transaction?: any;
    error?: string;
  }> {
    try {
      return await prisma.$transaction(async (tx: any) => {
        // Get current user state inside transaction
        const user = await tx.developer.findUnique({
          where: { id: userId },
          select: {
            subscriptionTier: true,
            monthlyPoints: true,
            pointsUsed: true,
            pointsEarned: true,
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Calculate effective cost
        const effectiveCost = await this.getEffectiveCost(spendType, user.subscriptionTier);
        
        // Check balance
        const available = this.calculateAvailablePoints(
          user.monthlyPoints,
          user.pointsUsed,
          user.pointsEarned
        );

        if (available < effectiveCost) {
          throw new Error(`Insufficient points: need ${effectiveCost}, have ${available}`);
        }

        // Atomically spend points
        const updatedUser = await tx.developer.update({
          where: { id: userId },
          data: { pointsUsed: { increment: effectiveCost } },
        });

        // Create transaction record
        const transaction = await tx.pointsTransaction.create({
          data: {
            developerId: userId,
            amount: -effectiveCost,
            spendType,
            sourceId,
            description: `${spendType.toLowerCase().replace('_', ' ')} action`,
            metadata,
          },
        });

        const newBalance = this.calculateAvailablePoints(
          updatedUser.monthlyPoints,
          updatedUser.pointsUsed,
          updatedUser.pointsEarned
        );

        return {
          success: true,
          pointsSpent: effectiveCost,
          newBalance,
          transaction,
        };
      }, {
        isolationLevel: 'Serializable',
        timeout: 10000,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate points spending attempt
   */
  static async validatePointsSpend(spend: PointsSpend): Promise<{ isValid: boolean; reason?: string }> {
    // Check for negative amounts
    if (spend.amount < 0) {
      return {
        isValid: false,
        reason: 'Points spend amount cannot be negative'
      };
    }

    // Get expected cost for the action
    const expectedCost = await this.getPointsCost(spend.spendType);
    
    // Check if amount matches expected cost (prevent manipulation)
    if (spend.amount !== expectedCost) {
      return {
        isValid: false,
        reason: `Points amount ${spend.amount} does not match expected cost ${expectedCost} for ${spend.spendType}`
      };
    }

    // Additional validation for specific spend types
    switch (spend.spendType) {
      case 'JOB_QUERY':
        // Could add rate limiting here (e.g., max queries per hour)
        break;
        
      case 'COVER_LETTER':
      case 'OUTREACH_MESSAGE':
        // Requires a sourceId (role ID)
        if (!spend.sourceId) {
          return {
            isValid: false,
            reason: `${spend.spendType} requires role ID`
          };
        }
        break;
        
      case 'CV_SUGGESTION':
        // Requires a sourceId (analysis ID or suggestion ID)
        if (!spend.sourceId) {
          return {
            isValid: false,
            reason: 'CV suggestion requires analysis or suggestion ID'
          };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Validate points award
   */
  static validatePointsAward(award: PointsAward): { isValid: boolean; reason?: string } {
    // Check for negative amounts
    if (award.amount < 0) {
      return {
        isValid: false,
        reason: 'Points award amount cannot be negative'
      };
    }

    // Points awards should be reasonable (prevent exploitation)
    const maxBonusPoints = 100; // Maximum bonus points per award
    if (award.amount > maxBonusPoints) {
      return {
        isValid: false,
        reason: `Points award ${award.amount} exceeds maximum bonus ${maxBonusPoints}`
      };
    }

    // Validate source-specific rules
    switch (award.source) {
      case 'ACHIEVEMENT_BONUS':
        // Requires sourceId (badge or achievement ID)
        if (!award.sourceId) {
          return {
            isValid: false,
            reason: 'Achievement bonus requires achievement ID'
          };
        }
        break;
        
      case 'STREAK_BONUS':
        // Reasonable streak bonus limits
        if (award.amount > 50) {
          return {
            isValid: false,
            reason: 'Streak bonus cannot exceed 50 points'
          };
        }
        break;
        
      case 'LEVEL_BONUS':
        // Level bonuses should be proportional
        if (award.amount > 25) {
          return {
            isValid: false,
            reason: 'Level bonus cannot exceed 25 points'
          };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Calculate monthly points allocation based on subscription tier
   */
  static async getMonthlyAllocation(tier: SubscriptionTier): Promise<number> {
    const tierConfig = await configService.getSubscriptionTier(tier);
    return tierConfig.monthlyPoints;
  }

  /**
   * Calculate subscription tier XP multiplier
   */
  static async getXPMultiplier(tier: SubscriptionTier): Promise<number> {
    const tierConfig = await configService.getSubscriptionTier(tier);
    return tierConfig.xpMultiplier;
  }

  /**
   * Check if points reset is needed (new billing period)
   */
  static isPointsResetNeeded(resetDate: Date | null): boolean {
    if (!resetDate) return true;
    return new Date() >= resetDate;
  }

  /**
   * Calculate next reset date (30 days from now)
   */
  static getNextResetDate(): Date {
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Calculate points efficiency bonus based on subscription tier
   * Higher tiers get better point efficiency (effectively more value per point)
   */
  static async getPointsEfficiencyMultiplier(tier: SubscriptionTier): Promise<number> {
    switch (tier) {
      case 'FREE': return 1.0;
      case 'BASIC': return 0.95; // 5% savings
      case 'STARTER': return 0.90; // 10% savings
      case 'PRO': return 0.85; // 15% savings
      case 'EXPERT': return 0.80; // 20% savings
      default: return 1.0;
    }
  }

  /**
   * Calculate effective cost with tier efficiency bonus
   */
  static async getEffectiveCost(
    spendType: PointsSpendType,
    tier: SubscriptionTier
  ): Promise<number> {
    const baseCost = await this.getPointsCost(spendType);
    const efficiency = await this.getPointsEfficiencyMultiplier(tier);
    return Math.ceil(baseCost * efficiency); // Round up to prevent fractional points
  }

  /**
   * Get daily points earning potential through bonuses
   */
  static getDailyPointsPotential(): {
    activities: Array<{ activity: string; points: number; source: PointsSource }>;
    maxDaily: number;
  } {
    const activities = [
      { activity: 'Daily login streak (7+ days)', points: 2, source: 'STREAK_BONUS' as PointsSource },
      { activity: 'Level up bonus', points: 5, source: 'LEVEL_BONUS' as PointsSource },
      { activity: 'Badge achievement', points: 10, source: 'ACHIEVEMENT_BONUS' as PointsSource },
      { activity: 'Weekly challenge completion', points: 15, source: 'PROMOTIONAL' as PointsSource },
      { activity: 'Referral signup bonus', points: 25, source: 'PROMOTIONAL' as PointsSource },
    ];
    
    const maxDaily = activities.reduce((sum, activity) => sum + activity.points, 0);
    
    return { activities, maxDaily };
  }

  /**
   * Calculate subscription upgrade incentive
   * Shows how much more points user would get with upgrade
   */
  static async getUpgradeIncentive(
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier
  ): Promise<{
    additionalPoints: number;
    betterEfficiency: number;
    xpMultiplierIncrease: number;
  }> {
    const currentConfig = await configService.getSubscriptionTier(currentTier);
    const targetConfig = await configService.getSubscriptionTier(targetTier);
    
    const currentEfficiency = await this.getPointsEfficiencyMultiplier(currentTier);
    const targetEfficiency = await this.getPointsEfficiencyMultiplier(targetTier);
    
    return {
      additionalPoints: targetConfig.monthlyPoints - currentConfig.monthlyPoints,
      betterEfficiency: ((currentEfficiency - targetEfficiency) / currentEfficiency) * 100,
      xpMultiplierIncrease: targetConfig.xpMultiplier - currentConfig.xpMultiplier,
    };
  }

  /**
   * Calculate usage analytics for admin dashboard
   */
  static calculateUsageStats(transactions: Array<{ amount: number; spendType?: PointsSpendType; source?: PointsSource }>): {
    totalSpent: number;
    totalEarned: number;
    spendingByType: Record<string, number>;
    earningBySource: Record<string, number>;
  } {
    const stats = {
      totalSpent: 0,
      totalEarned: 0,
      spendingByType: {} as Record<string, number>,
      earningBySource: {} as Record<string, number>,
    };

    transactions.forEach(tx => {
      if (tx.amount < 0) {
        // Spending transaction
        stats.totalSpent += Math.abs(tx.amount);
        if (tx.spendType) {
          stats.spendingByType[tx.spendType] = (stats.spendingByType[tx.spendType] || 0) + Math.abs(tx.amount);
        }
      } else {
        // Earning transaction
        stats.totalEarned += tx.amount;
        if (tx.source) {
          stats.earningBySource[tx.source] = (stats.earningBySource[tx.source] || 0) + tx.amount;
        }
      }
    });

    return stats;
  }
}