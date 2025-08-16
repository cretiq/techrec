// lib/api/rapidapi-redis-utils.ts
// Server-only Redis utilities for RapidAPI cache management

import { type ApiUsageHeaders } from './rapidapi-cache';

/**
 * Server-side only utility for persisting usage data to Redis
 * This module should NEVER be imported on the client side
 */
export async function persistUsageToRedis(usage: ApiUsageHeaders): Promise<void> {
  const debugUsage = process.env.DEBUG_RAPIDAPI_USAGE === 'true';
  
  try {
    const { getRedisClient } = await import('@/lib/redis');
    const redis = await getRedisClient();
    
    const key = 'rapidapi:usage:current';
    const data = JSON.stringify({
      ...usage,
      timestamp: Date.now()
    });
    
    // Store with 24 hour expiry (usage resets every 30 days, but this ensures freshness)
    await redis.set(key, data, 'EX', 24 * 60 * 60);
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] ✅ Persisted usage to Redis:', key, usage);
    }
  } catch (error) {
    console.error('Failed to persist usage to Redis:', error);
    // Don't throw - this is optional persistence
  }
}

/**
 * Server-side only utility for restoring usage data from Redis
 * This module should NEVER be imported on the client side
 */
export async function restoreUsageFromRedis(): Promise<ApiUsageHeaders | null> {
  const debugUsage = process.env.DEBUG_RAPIDAPI_USAGE === 'true';
  
  try {
    const { getRedisClient } = await import('@/lib/redis');
    const redis = await getRedisClient();
    
    const key = 'rapidapi:usage:current';
    const data = await redis.get(key);
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Redis GET result:', { key, hasData: !!data, dataLength: data?.length });
    }
    
    if (data) {
      const parsed = JSON.parse(data);
      
      if (debugUsage) {
        console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Parsed Redis data:', parsed);
      }
      
      // Remove timestamp before returning
      const { timestamp, ...usage } = parsed;
      
      // Validate the data structure
      if (usage.jobsLimit && usage.jobsRemaining !== undefined && usage.requestsLimit && usage.requestsRemaining !== undefined) {
        if (debugUsage) {
          console.log('🔍 [DEBUG_RAPIDAPI_USAGE] ✅ Restored usage from Redis:', usage);
          console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Data age:', Math.round((Date.now() - timestamp) / 1000 / 60), 'minutes');
        }
        return usage as ApiUsageHeaders;
      } else {
        if (debugUsage) {
          console.log('🔍 [DEBUG_RAPIDAPI_USAGE] ❌ Invalid usage data structure in Redis:', usage);
        }
      }
    } else if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] ❌ No usage data found in Redis for key:', key);
    }
  } catch (error) {
    if (debugUsage) {
      console.error('🔍 [DEBUG_RAPIDAPI_USAGE] Failed to restore usage from Redis:', error);
    }
    // Don't throw - graceful degradation
  }
  
  return null;
}