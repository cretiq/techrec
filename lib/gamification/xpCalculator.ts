// XP Calculation Engine for TechRec Gamification System

import { XPSource } from '@prisma/client';
import { 
  XP_REWARDS, 
  LEVEL_SYSTEM, 
  UserGamificationProfile 
} from '@/types/gamification';

/**
 * Core XP calculation and level progression engine
 * Based on exponential growth curve to maintain engagement over time
 */
export class XPCalculator {
  
  /**
   * Calculate user's level based on total XP
   * Uses exponential growth: Level n requires roughly n^2 * 50 XP
   */
  static calculateLevel(totalXP: number): number {
    // Find the highest level where requiredXP <= totalXP
    for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
      if (totalXP >= LEVEL_SYSTEM[i].requiredXP) {
        return LEVEL_SYSTEM[i].level;
      }
    }
    
    // If XP is beyond defined levels, calculate dynamically
    // Formula: level = floor(sqrt(totalXP / 50)) + 1
    return Math.floor(Math.sqrt(totalXP / 50)) + 1;
  }

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    const levelData = LEVEL_SYSTEM.find(l => l.level === level);
    if (levelData) {
      return levelData.requiredXP;
    }
    
    // For levels beyond defined system, use exponential formula
    // Formula: XP = (level - 1)^2 * 50
    return Math.pow(level - 1, 2) * 50;
  }

  /**
   * Calculate progress within current level (0.0 to 1.0)
   */
  static calculateLevelProgress(totalXP: number, currentLevel: number): number {
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    
    if (nextLevelXP === currentLevelXP) return 1.0; // Max level reached
    
    const progressXP = totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    return Math.min(Math.max(progressXP / requiredXP, 0), 1);
  }

  // Tier calculation removed - using subscription tiers instead

  /**
   * Get XP award amount for a specific source
   */
  static getXPForSource(source: string): number {
    return XP_REWARDS[source] || 0;
  }

  /**
   * Calculate streak bonus XP
   * Provides increasing rewards for consecutive days, capped at 50 XP
   */
  static calculateStreakBonus(streak: number): number {
    if (streak < 3) return 0; // No bonus for short streaks
    
    // Exponential growth: 5, 10, 15, 25, 35, 50 (max)
    const bonus = Math.min(Math.floor(streak / 2) * 5, 50);
    return bonus;
  }

  /**
   * Calculate time-based XP multiplier
   * Provides small bonuses for consistent activity patterns
   */
  static getTimeMultiplier(lastActivity: Date | null): number {
    if (!lastActivity) return 1.0;
    
    const hoursSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // Small bonus for returning after 1-24 hours (consistency reward)
    if (hoursSinceLastActivity >= 1 && hoursSinceLastActivity <= 24) {
      return 1.1; // 10% bonus
    }
    
    // Standard rate for all other cases
    return 1.0;
  }

  /**
   * Calculate comprehensive user gamification profile
   */
  static calculateUserProfile(
    totalXP: number,
    streak: number,
    lastActivityDate: Date | null
  ): Pick<UserGamificationProfile, 'currentLevel' | 'levelProgress' | 'nextLevelXP' | 'currentLevelXP'> {
    const currentLevel = this.calculateLevel(totalXP);
    const levelProgress = this.calculateLevelProgress(totalXP, currentLevel);
    const currentLevelXP = this.getXPForLevel(currentLevel);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    
    return {
      currentLevel,
      levelProgress,
      currentLevelXP,
      nextLevelXP
    };
  }

  /**
   * Validate XP award legitimacy
   * Prevents exploitation and ensures fair progression
   */
  static validateXPAward(
    source: XPSource, 
    amount: number, 
    userId: string,
    sourceId?: string
  ): { isValid: boolean; reason?: string } {
    // Admin awards bypass standard validation
    if (source === 'ADMIN_AWARD') {
      return { isValid: true };
    }
  
    const maxAmount = this.getXPForSource(source);
    
    // Check if amount exceeds maximum for source (STRICT validation - no flexibility)
    if (amount > maxAmount) {
      return {
        isValid: false,
        reason: `XP amount ${amount} exceeds maximum ${maxAmount} for source ${source}`
      };
    }
    
    // Check for negative amounts
    if (amount < 0) {
      return {
        isValid: false,
        reason: 'XP amount cannot be negative'
      };
    }
    
    // Additional validation for specific sources
    switch (source) {
      case 'DAILY_LOGIN':
        // Should only be awarded once per day
        if (amount > XP_REWARDS.DAILY_LOGIN) {
          return {
            isValid: false,
            reason: 'Daily login XP can only be awarded once per day'
          };
        }
        break;
        
      case 'CV_ANALYSIS_COMPLETED':
        // Requires a sourceId (analysis ID)
        if (!sourceId) {
          return {
            isValid: false,
            reason: 'CV analysis XP requires analysis ID'
          };
        }
        break;
        
      case 'APPLICATION_SUBMITTED':
        // Requires a sourceId (application ID)
        if (!sourceId) {
          return {
            isValid: false,
            reason: 'Application XP requires application ID'
          };
        }
        break;
    }
    
    return { isValid: true };
  }

  /**
   * Check if XP source allows repeat awards
   */
  static isRepeatableSource(source: XPSource): boolean {
    const repeatableSources: XPSource[] = [
      'PROFILE_SECTION_UPDATED',
      'SKILL_ADDED',
      'DAILY_LOGIN',
      'STREAK_MILESTONE'
    ];
    
    return repeatableSources.includes(source);
  }

  /**
   * Calculate next milestone information
   */
  static getNextMilestone(totalXP: number): {
    type: 'level';
    target: number;
    xpNeeded: number;
    description: string;
  } {
    const currentLevel = this.calculateLevel(totalXP);
    const nextLevelXP = this.getXPForLevel(currentLevel + 1);
    
    return {
      type: 'level',
      target: nextLevelXP,
      xpNeeded: nextLevelXP - totalXP,
      description: `Reach level ${currentLevel + 1}`
    };
  }

  // Tier-related methods removed - using subscription tiers instead

  /**
   * Get level title and benefits
   */
  static getLevelInfo(level: number): { title: string; benefits: string[] } {
    const levelData = LEVEL_SYSTEM.find(l => l.level === level);
    
    if (levelData) {
      return {
        title: levelData.title,
        benefits: levelData.benefits
      };
    }
    
    // For levels beyond defined system, generate generic info
    return {
      title: `Level ${level} Master`,
      benefits: ['Advanced platform features', 'Exclusive recognition']
    };
  }

  /**
   * Calculate daily XP earning potential
   * Helps users understand max XP they can earn per day
   */
  static getDailyXPPotential(): {
    activities: Array<{ activity: string; xp: number; source: XPSource }>;
    maxDaily: number;
  } {
    const activities = [
      { activity: 'Daily login', xp: XP_REWARDS.DAILY_LOGIN, source: 'DAILY_LOGIN' as XPSource },
      { activity: 'Update profile sections (3)', xp: XP_REWARDS.PROFILE_SECTION_UPDATED * 3, source: 'PROFILE_SECTION_UPDATED' as XPSource },
      { activity: 'Add new skills (5)', xp: XP_REWARDS.SKILL_ADDED * 5, source: 'SKILL_ADDED' as XPSource },
      { activity: 'Upload new CV', xp: XP_REWARDS.CV_UPLOADED, source: 'CV_UPLOADED' as XPSource },
      { activity: 'Complete CV analysis', xp: XP_REWARDS.CV_ANALYSIS_COMPLETED, source: 'CV_ANALYSIS_COMPLETED' as XPSource },
      { activity: 'Apply AI improvements (3)', xp: XP_REWARDS.CV_IMPROVEMENT_APPLIED * 3, source: 'CV_IMPROVEMENT_APPLIED' as XPSource },
      { activity: 'Submit job applications (5)', xp: XP_REWARDS.APPLICATION_SUBMITTED * 5, source: 'APPLICATION_SUBMITTED' as XPSource },
      { activity: 'Streak bonus (7+ days)', xp: 25, source: 'STREAK_MILESTONE' as XPSource }
    ];
    
    const maxDaily = activities.reduce((sum, activity) => sum + activity.xp, 0);
    
    return { activities, maxDaily };
  }
}