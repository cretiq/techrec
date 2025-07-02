// Database Query Optimizer for Gamification System
// Implements caching, query batching, and performance monitoring

import { PrismaClient } from '@prisma/client';
import { getReadyRedisClient } from '../redis';
import type { Redis } from 'ioredis';

const prisma = new PrismaClient();

// Use centralized Redis client instead of creating separate connection
let redis: Redis | null = null;
let redisInitialized = false;

// In-memory cache fallback
const memoryCache = new Map<string, { data: any; expiry: number }>();

export interface QueryCacheOptions {
  ttl?: number; // Time to live in seconds (default: 300)
  prefix?: string; // Cache key prefix
  useMemoryFallback?: boolean; // Use memory cache if Redis fails
}

export class GamificationQueryOptimizer {
  private static instance: GamificationQueryOptimizer;
  private queryMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  private constructor() {}

  public static getInstance(): GamificationQueryOptimizer {
    if (!GamificationQueryOptimizer.instance) {
      GamificationQueryOptimizer.instance = new GamificationQueryOptimizer();
    }
    return GamificationQueryOptimizer.instance;
  }

  /**
   * Cache-aware user profile query with optimized relations
   */
  public async getUserProfileOptimized(
    userId: string, 
    options: QueryCacheOptions = {}
  ): Promise<any> {
    const cacheKey = `${options.prefix || 'user_profile'}:${userId}`;
    const ttl = options.ttl || 300; // 5 minutes default
    
    // Try cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.recordMetric('getUserProfile', 0, true);
      return cached;
    }

    // Query with optimized selection
    const startTime = Date.now();
    const user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        id: true,
        totalXP: true,
        currentLevel: true,
        levelProgress: true,
        tier: true,
        streak: true,
        longestStreak: true,
        lastActivityDate: true,
        createdAt: true,
        // Optimize badge query with limit and ordering
        userBadges: {
          take: 50, // Limit recent badges
          orderBy: { earnedAt: 'desc' },
          select: {
            id: true,
            earnedAt: true,
            badge: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
                tier: true,
                xpReward: true
              }
            }
          }
        },
        // Optimize XP transactions
        xpTransactions: {
          take: 100, // Recent transactions only
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            source: true,
            description: true,
            createdAt: true
          }
        }
      }
    });

    const queryTime = Date.now() - startTime;
    this.recordMetric('getUserProfile', queryTime, false);

    if (user) {
      await this.setCache(cacheKey, user, ttl);
    }

    return user;
  }

  /**
   * Batch badge evaluation query to reduce N+1 problems
   */
  public async getBadgeEvaluationDataBatch(
    userIds: string[]
  ): Promise<Map<string, any>> {
    const cacheKey = `badge_eval_batch:${userIds.sort().join(',')}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.recordMetric('getBadgeEvaluationDataBatch', 0, true);
      return new Map(cached);
    }

    const startTime = Date.now();
    
    // Single optimized query for all users
    const users = await prisma.developer.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        totalXP: true,
        currentLevel: true,
        streak: true,
        lastActivityDate: true,
        // Aggregate counts for badge evaluation
        _count: {
          select: {
            cvAnalyses: { where: { status: 'COMPLETED' } },
            applications: true,
            userBadges: true,
            xpTransactions: { where: { source: 'CV_ANALYSIS' } }
          }
        },
        // Recent activity for streak evaluation
        xpTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            source: true,
            createdAt: true
          }
        }
      }
    });

    const queryTime = Date.now() - startTime;
    this.recordMetric('getBadgeEvaluationDataBatch', queryTime, false);

    const resultMap = new Map(users.map(user => [user.id, user]));
    await this.setCache(cacheKey, Array.from(resultMap.entries()), 300);

    return resultMap;
  }

  /**
   * Optimized CV analysis count query with caching
   */
  public async getCVAnalysisCount(
    userId: string,
    status?: string,
    options: QueryCacheOptions = {}
  ): Promise<number> {
    const cacheKey = `cv_count:${userId}:${status || 'all'}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached !== null) {
      this.recordMetric('getCVAnalysisCount', 0, true);
      return cached;
    }

    const startTime = Date.now();
    const whereClause: any = { developerId: userId };
    if (status) {
      whereClause.status = status;
    }

    const count = await prisma.cvAnalysis.count({
      where: whereClause
    });

    const queryTime = Date.now() - startTime;
    this.recordMetric('getCVAnalysisCount', queryTime, false);

    await this.setCache(cacheKey, count, options.ttl || 600); // 10 minute cache
    return count;
  }

  /**
   * Optimized application statistics query
   */
  public async getApplicationStats(
    userId: string,
    options: QueryCacheOptions = {}
  ): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    averageQuality?: number;
  }> {
    const cacheKey = `app_stats:${userId}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.recordMetric('getApplicationStats', 0, true);
      return cached;
    }

    const startTime = Date.now();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Use aggregation query to get all stats in one go
    const [total, todayCount, weekCount, monthCount] = await Promise.all([
      prisma.application.count({ where: { developerId: userId } }),
      prisma.application.count({ 
        where: { 
          developerId: userId,
          createdAt: { gte: today }
        }
      }),
      prisma.application.count({ 
        where: { 
          developerId: userId,
          createdAt: { gte: thisWeek }
        }
      }),
      prisma.application.count({ 
        where: { 
          developerId: userId,
          createdAt: { gte: thisMonth }
        }
      })
    ]);

    const stats = {
      total,
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount
    };

    const queryTime = Date.now() - startTime;
    this.recordMetric('getApplicationStats', queryTime, false);

    await this.setCache(cacheKey, stats, options.ttl || 300);
    return stats;
  }

  /**
   * Optimized leaderboard query with pagination
   */
  public async getLeaderboard(
    type: 'xp' | 'streak' | 'level',
    limit: number = 10,
    offset: number = 0,
    options: QueryCacheOptions = {}
  ): Promise<Array<{
    rank: number;
    userId: string;
    value: number;
    displayName?: string;
  }>> {
    const cacheKey = `leaderboard:${type}:${limit}:${offset}`;
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.recordMetric('getLeaderboard', 0, true);
      return cached;
    }

    const startTime = Date.now();
    
    let orderBy: any;
    let selectValue: string;
    
    switch (type) {
      case 'xp':
        orderBy = { totalXP: 'desc' };
        selectValue = 'totalXP';
        break;
      case 'streak':
        orderBy = { streak: 'desc' };
        selectValue = 'streak';
        break;
      case 'level':
        orderBy = { currentLevel: 'desc' };
        selectValue = 'currentLevel';
        break;
    }

    const users = await prisma.developer.findMany({
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        [selectValue]: true,
        // Optional: include display name if available
        profile: {
          select: {
            contactInfo: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const leaderboard = users.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.id,
      value: user[selectValue] || 0,
      displayName: user.profile?.contactInfo?.name || undefined
    }));

    const queryTime = Date.now() - startTime;
    this.recordMetric('getLeaderboard', queryTime, false);

    await this.setCache(cacheKey, leaderboard, options.ttl || 600); // 10 minute cache
    return leaderboard;
  }

  /**
   * Bulk invalidate related caches when user data changes
   */
  public async invalidateUserCaches(userId: string): Promise<void> {
    const patterns = [
      `user_profile:${userId}`,
      `cv_count:${userId}:*`,
      `app_stats:${userId}`,
      `badge_eval_batch:*${userId}*`,
      'leaderboard:*' // Invalidate all leaderboards when any user changes
    ];

    if (redis) {
      for (const pattern of patterns) {
        try {
          if (pattern.includes('*')) {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
              await redis.del(...keys);
            }
          } else {
            await redis.del(pattern);
          }
        } catch (error) {
          console.warn(`Failed to invalidate cache pattern ${pattern}:`, error);
        }
      }
    } else {
      // Memory cache cleanup
      for (const [key] of memoryCache.entries()) {
        for (const pattern of patterns) {
          if (this.matchesPattern(key, pattern)) {
            memoryCache.delete(key);
          }
        }
      }
    }
  }

  /**
   * Get query performance metrics
   */
  public getQueryMetrics(): Record<string, { count: number; avgTime: number; cacheHitRate: number }> {
    const metrics: Record<string, any> = {};
    
    for (const [query, data] of this.queryMetrics.entries()) {
      metrics[query] = {
        count: data.count,
        avgTime: Math.round(data.avgTime * 100) / 100,
        cacheHitRate: 0 // Would need separate tracking for cache hits
      };
    }
    
    return metrics;
  }

  // === PRIVATE HELPER METHODS ===

  private async getFromCache(key: string): Promise<any> {
    try {
      // Initialize Redis client if not already done
      if (!redisInitialized) {
        try {
          redis = await getReadyRedisClient();
          redisInitialized = true;
        } catch (error) {
          console.warn('Redis not available, falling back to in-memory cache');
          redis = null;
          redisInitialized = true; // Don't retry every time
        }
      }

      if (redis) {
        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
      } else {
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return cached.data;
        }
        if (cached) {
          memoryCache.delete(key); // Clean up expired
        }
        return null;
      }
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  private async setCache(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      // Initialize Redis client if not already done
      if (!redisInitialized) {
        try {
          redis = await getReadyRedisClient();
          redisInitialized = true;
        } catch (error) {
          console.warn('Redis not available, falling back to in-memory cache');
          redis = null;
          redisInitialized = true; // Don't retry every time
        }
      }

      if (redis) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        memoryCache.set(key, {
          data: value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        
        // Cleanup memory cache if it gets too large
        if (memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
    }
  }

  private recordMetric(queryName: string, time: number, fromCache: boolean): void {
    const current = this.queryMetrics.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
    current.count++;
    
    if (!fromCache) {
      current.totalTime += time;
      current.avgTime = current.totalTime / current.count;
    }
    
    this.queryMetrics.set(queryName, current);
  }

  private matchesPattern(key: string, pattern: string): boolean {
    if (!pattern.includes('*')) {
      return key === pattern;
    }
    
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(key);
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, value] of memoryCache.entries()) {
      if (value.expiry <= now) {
        memoryCache.delete(key);
      }
    }
    
    // If still too large, remove oldest entries
    if (memoryCache.size > 800) {
      const entries = Array.from(memoryCache.entries());
      entries.sort((a, b) => a[1].expiry - b[1].expiry);
      
      const toRemove = entries.slice(0, memoryCache.size - 800);
      for (const [key] of toRemove) {
        memoryCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const queryOptimizer = GamificationQueryOptimizer.getInstance();

// Utility functions for common queries
export const getCachedUserProfile = (userId: string) => 
  queryOptimizer.getUserProfileOptimized(userId);

export const getCachedCVAnalysisCount = (userId: string, status?: string) => 
  queryOptimizer.getCVAnalysisCount(userId, status);

export const getCachedApplicationStats = (userId: string) => 
  queryOptimizer.getApplicationStats(userId);

export const getCachedLeaderboard = (type: 'xp' | 'streak' | 'level', limit?: number) => 
  queryOptimizer.getLeaderboard(type, limit);

export const invalidateUserCaches = (userId: string) => 
  queryOptimizer.invalidateUserCaches(userId);