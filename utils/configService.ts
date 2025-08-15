import { PrismaClient } from '@prisma/client';
import { getReadyRedisClient } from '../lib/redis';
import type { Redis } from 'ioredis';

// Types for configuration
export interface PointsCosts {
  JOB_QUERY: number;
  COVER_LETTER: number;
  OUTREACH_MESSAGE: number;
  CV_SUGGESTION: number;
  BULK_APPLICATION: number;
  PREMIUM_ANALYSIS: number;
  ADVANCED_SEARCH: number;
}

export interface XPRewards {
  CV_UPLOADED: number;
  CV_ANALYSIS_COMPLETED: number;
  APPLICATION_SUBMITTED: number;
  PROFILE_COMPLETED: number;
  SKILL_ADDED: number;
  DAILY_LOGIN: number;
  STREAK_BONUS_7: number;
  STREAK_BONUS_30: number;
  BADGE_EARNED: number;
  REFERRAL_SIGNUP: number;
  CV_IMPROVEMENT_ACCEPTED: number;
  CHALLENGE_COMPLETED: number;
}

export interface SubscriptionTierConfig {
  monthlyPoints: number;
  xpMultiplier: number;
  price: number;
  features: string[];
}

export interface SubscriptionTiers {
  FREE: SubscriptionTierConfig;
  BASIC: SubscriptionTierConfig;
  STARTER: SubscriptionTierConfig;
  PRO: SubscriptionTierConfig;
  EXPERT: SubscriptionTierConfig;
}

// Default configurations
const DEFAULT_POINTS_COSTS: PointsCosts = {
  JOB_QUERY: 3, // In MVP Beta mode, this becomes dynamic (1 point per result)
  COVER_LETTER: 1,
  OUTREACH_MESSAGE: 1,
  CV_SUGGESTION: 1,
  BULK_APPLICATION: 8, // 3 queries + 5 cover letters
  PREMIUM_ANALYSIS: 5,
  ADVANCED_SEARCH: 5, // Premium search endpoints (24h, 1h)
};

// MVP Beta Configuration
export const MVP_BETA_CONFIG = {
  enabled: process.env.ENABLE_MVP_MODE === 'true',
  initialPoints: parseInt(process.env.MVP_INITIAL_POINTS || '300'),
  pointsPerResult: parseInt(process.env.MVP_POINTS_PER_RESULT || '1'),
  warningThreshold: parseInt(process.env.MVP_WARNING_THRESHOLD || '50'),
  criticalThreshold: parseInt(process.env.MVP_CRITICAL_THRESHOLD || '10'),
};

const DEFAULT_XP_REWARDS: XPRewards = {
  CV_UPLOADED: 25,
  CV_ANALYSIS_COMPLETED: 50,
  APPLICATION_SUBMITTED: 100,
  PROFILE_COMPLETED: 15,
  SKILL_ADDED: 10,
  DAILY_LOGIN: 5,
  STREAK_BONUS_7: 35,
  STREAK_BONUS_30: 150,
  BADGE_EARNED: 100,
  REFERRAL_SIGNUP: 200,
  CV_IMPROVEMENT_ACCEPTED: 75,
  CHALLENGE_COMPLETED: 50,
};

const DEFAULT_SUBSCRIPTION_TIERS: SubscriptionTiers = {
  FREE: {
    monthlyPoints: 0, // MVP Beta: Free users get 0 points by default
    xpMultiplier: 1.0,
    price: 0,
    features: ['Basic CV analysis', 'Limited job queries', 'Standard support'],
  },
  BASIC: {
    monthlyPoints: 30,
    xpMultiplier: 1.2,
    price: 4.99,
    features: ['Enhanced CV analysis', 'More job queries', 'Email support'],
  },
  STARTER: {
    monthlyPoints: 75,
    xpMultiplier: 1.5,
    price: 9.99,
    features: ['Premium CV analysis', 'Bulk applications', 'Priority support'],
  },
  PRO: {
    monthlyPoints: 200,
    xpMultiplier: 1.75,
    price: 19.99,
    features: ['Advanced AI models', 'Unlimited cover letters', 'Analytics dashboard'],
  },
  EXPERT: {
    monthlyPoints: 500,
    xpMultiplier: 2.0,
    price: 39.99,
    features: ['All features', 'Early access', 'Personal consultation'],
  },
};

export class ConfigService {
  private static instance: ConfigService;
  private prisma: PrismaClient;
  private redis: Redis | null = null;
  private redisInitialized = false;
  private readonly CACHE_TTL = 300; // 5 minutes cache
  private readonly CACHE_PREFIX = 'config:';

  private constructor() {
    this.prisma = new PrismaClient();
    // Redis will be initialized on first use via getRedisClient()
  }

  private async getRedisClient(): Promise<Redis | null> {
    if (!this.redisInitialized) {
      try {
        this.redis = await getReadyRedisClient();
        this.redisInitialized = true;
      } catch (error) {
        console.warn('Redis connection failed, falling back to database only:', error);
        this.redis = null;
        this.redisInitialized = true; // Don't retry every time
      }
    }
    return this.redis;
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Points Costs Management
  public async getPointsCosts(): Promise<PointsCosts> {
    const cacheKey = `${this.CACHE_PREFIX}points-costs`;
    
    try {
      // Try cache first
      const redis = await this.getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fetch from database
      const config = await this.prisma.configurationSettings.findFirst({
        where: {
          key: 'points-costs',
          isActive: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      });

      const costs = (config?.config as unknown as PointsCosts) || DEFAULT_POINTS_COSTS;
      
      // Cache the result
      if (redis) {
        await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(costs));
      }

      return costs;
    } catch (error) {
      console.error('Failed to get points costs, using defaults:', error);
      return DEFAULT_POINTS_COSTS;
    }
  }

  public async updatePointsCosts(newCosts: Partial<PointsCosts>, description?: string): Promise<void> {
    try {
      const currentCosts = await this.getPointsCosts();
      const updatedCosts = { ...currentCosts, ...newCosts };

      // Deactivate current configuration
      await this.prisma.configurationSettings.updateMany({
        where: {
          key: 'points-costs',
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new configuration
      await this.prisma.configurationSettings.create({
        data: {
          key: 'points-costs',
          version: `v${Date.now()}`,
          config: updatedCosts,
          description: description || 'Points costs updated',
          effectiveDate: new Date(),
        },
      });

      // Clear cache
      const redis = await this.getRedisClient();
      if (redis) {
        await redis.del(`${this.CACHE_PREFIX}points-costs`);
      }
    } catch (error) {
      console.error('Failed to update points costs:', error);
      throw error;
    }
  }

  // XP Rewards Management
  public async getXPRewards(): Promise<XPRewards> {
    const cacheKey = `${this.CACHE_PREFIX}xp-rewards`;
    
    try {
      // Try cache first
      const redis = await this.getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fetch from database
      const config = await this.prisma.configurationSettings.findFirst({
        where: {
          key: 'xp-rewards',
          isActive: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      });

      const rewards = (config?.config as unknown as XPRewards) || DEFAULT_XP_REWARDS;
      
      // Cache the result
      if (redis) {
        await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(rewards));
      }

      return rewards;
    } catch (error) {
      console.error('Failed to get XP rewards, using defaults:', error);
      return DEFAULT_XP_REWARDS;
    }
  }

  public async updateXPRewards(newRewards: Partial<XPRewards>, description?: string): Promise<void> {
    try {
      const currentRewards = await this.getXPRewards();
      const updatedRewards = { ...currentRewards, ...newRewards };

      // Deactivate current configuration
      await this.prisma.configurationSettings.updateMany({
        where: {
          key: 'xp-rewards',
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new configuration
      await this.prisma.configurationSettings.create({
        data: {
          key: 'xp-rewards',
          version: `v${Date.now()}`,
          config: updatedRewards,
          description: description || 'XP rewards updated',
          effectiveDate: new Date(),
        },
      });

      // Clear cache
      const redis = await this.getRedisClient();
      if (redis) {
        await redis.del(`${this.CACHE_PREFIX}xp-rewards`);
      }
    } catch (error) {
      console.error('Failed to update XP rewards:', error);
      throw error;
    }
  }

  // Subscription Tiers Management
  public async getSubscriptionTiers(): Promise<SubscriptionTiers> {
    const cacheKey = `${this.CACHE_PREFIX}subscription-tiers`;
    
    try {
      // Try cache first
      const redis = await this.getRedisClient();
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fetch from database
      const config = await this.prisma.configurationSettings.findFirst({
        where: {
          key: 'subscription-tiers',
          isActive: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      });

      const tiers = (config?.config as unknown as SubscriptionTiers) || DEFAULT_SUBSCRIPTION_TIERS;
      
      // Cache the result
      if (redis) {
        await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(tiers));
      }

      return tiers;
    } catch (error) {
      console.error('Failed to get subscription tiers, using defaults:', error);
      return DEFAULT_SUBSCRIPTION_TIERS;
    }
  }

  public async updateSubscriptionTiers(newTiers: Partial<SubscriptionTiers>, description?: string): Promise<void> {
    try {
      const currentTiers = await this.getSubscriptionTiers();
      const updatedTiers = { ...currentTiers, ...newTiers };

      // Deactivate current configuration
      await this.prisma.configurationSettings.updateMany({
        where: {
          key: 'subscription-tiers',
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new configuration
      await this.prisma.configurationSettings.create({
        data: {
          key: 'subscription-tiers',
          version: `v${Date.now()}`,
          config: updatedTiers as any,
          description: description || 'Subscription tiers updated',
          effectiveDate: new Date(),
        },
      });

      // Clear cache
      const redis = await this.getRedisClient();
      if (redis) {
        await redis.del(`${this.CACHE_PREFIX}subscription-tiers`);
      }
    } catch (error) {
      console.error('Failed to update subscription tiers:', error);
      throw error;
    }
  }

  // Utility methods
  public async getPointsCost(action: keyof PointsCosts): Promise<number> {
    const costs = await this.getPointsCosts();
    return costs[action];
  }

  public async getXPReward(action: keyof XPRewards): Promise<number> {
    const rewards = await this.getXPRewards();
    return rewards[action];
  }

  public async getSubscriptionTier(tier: keyof SubscriptionTiers): Promise<SubscriptionTierConfig> {
    const tiers = await this.getSubscriptionTiers();
    return tiers[tier];
  }

  // Initialize default configurations
  public async initializeDefaultConfigs(): Promise<void> {
    try {
      // Check if configurations exist
      const existingConfigs = await this.prisma.configurationSettings.findMany({
        where: {
          key: { in: ['points-costs', 'xp-rewards', 'subscription-tiers'] },
          isActive: true,
        },
      });

      const existingKeys = existingConfigs.map(c => c.key);

      // Create missing configurations
      const configs = [
        {
          key: 'points-costs',
          config: DEFAULT_POINTS_COSTS,
          description: 'Default points costs for platform actions',
        },
        {
          key: 'xp-rewards',
          config: DEFAULT_XP_REWARDS,
          description: 'Default XP rewards for platform actions',
        },
        {
          key: 'subscription-tiers',
          config: DEFAULT_SUBSCRIPTION_TIERS,
          description: 'Default subscription tier configurations',
        },
      ];

      for (const config of configs) {
        if (!existingKeys.includes(config.key)) {
          await this.prisma.configurationSettings.create({
            data: {
              key: config.key,
              version: 'v1.0',
              config: config.config as any,
              description: config.description,
              effectiveDate: new Date(),
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize default configurations:', error);
      throw error;
    }
  }

  // Cleanup method
  public async disconnect(): Promise<void> {
    // No need to disconnect Redis here since we're using the centralized client
    // The main Redis client will handle its own lifecycle
    await this.prisma.$disconnect();
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();