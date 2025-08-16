// lib/api/rapidapi-cache.ts
// Response caching and usage tracking system for RapidAPI LinkedIn Jobs API

interface ApiUsageHeaders {
  jobsLimit: number;
  jobsRemaining: number;
  requestsLimit: number;
  requestsRemaining: number;
  jobsReset: number; // seconds until reset
}

interface CacheEntry {
  data: any;
  timestamp: number;
  parameterHash: string;
  usageHeaders?: ApiUsageHeaders;
}

interface SearchParameters {
  // Core search filters
  title_filter?: string;
  advanced_title_filter?: string; // Cannot be used with title_filter
  location_filter?: string;
  description_filter?: string;
  
  // Organization filters
  organization_description_filter?: string;
  organization_specialties_filter?: string;
  organization_slug_filter?: string;
  
  // Job classification filters
  type_filter?: string;
  industry_filter?: string;
  seniority_filter?: string;
  
  // Job characteristics
  remote?: string; // 'true', 'false', or undefined for both
  agency?: string; // 'true' for agencies only, 'false' for companies only
  description_type?: string; // 'text' to include job description
  
  // Application method filters
  external_apply_url?: string; // 'true' to include only jobs with external apply URL
  directapply?: string; // 'true' for easyapply jobs, 'false' to exclude them
  
  // Company size filters
  employees_lte?: number;
  employees_gte?: number;
  
  // Date and ordering
  date_filter?: string; // ISO date string for filtering recent jobs
  order?: string; // 'asc' for ascending date order (default is descending)
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // AI features (BETA)
  include_ai?: string; // 'true' to include AI-enriched fields
  ai_work_arrangement_filter?: string; // 'On-site', 'Hybrid', 'Remote OK', 'Remote Solely'
  ai_has_salary?: string; // 'true' to include only jobs with salary info
  ai_experience_level_filter?: string; // '0-2', '2-5', '5-10', '10+'
  ai_visa_sponsorship_filter?: string; // 'true' for jobs mentioning visa sponsorship
  
  // Endpoint selection for premium features
  endpoint?: string; // '7d' (default), '24h' (premium), '1h' (premium)
  
  // Allow for any additional parameters
  [key: string]: any;
}

class RapidApiCacheManager {
  private static instance: RapidApiCacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly MAX_CACHE_SIZE = 500; // Maximum number of cached responses
  private currentUsage: ApiUsageHeaders | null = null;

  private constructor() {}

  static getInstance(): RapidApiCacheManager {
    if (!RapidApiCacheManager.instance) {
      RapidApiCacheManager.instance = new RapidApiCacheManager();
    }
    return RapidApiCacheManager.instance;
  }

  /**
   * Generates a hash key for search parameters to identify cached responses
   */
  private generateParameterHash(params: SearchParameters): string {
    // Sort parameters for consistent hashing
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as SearchParameters);

    return btoa(JSON.stringify(sortedParams)).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Public method to generate cache key for debugging purposes
   */
  generateCacheKey(params: SearchParameters): string {
    return this.generateParameterHash(params);
  }

  /**
   * Extracts usage headers from RapidAPI response
   */
  extractUsageHeaders(headers: Headers): ApiUsageHeaders | null {
    try {
      const jobsLimit = headers.get('x-ratelimit-jobs-limit');
      const jobsRemaining = headers.get('x-ratelimit-jobs-remaining');
      const requestsLimit = headers.get('x-ratelimit-requests-limit');
      const requestsRemaining = headers.get('x-ratelimit-requests-remaining');
      const jobsReset = headers.get('x-ratelimit-jobs-reset');

      if (jobsLimit && jobsRemaining && requestsLimit && requestsRemaining) {
        return {
          jobsLimit: parseInt(jobsLimit),
          jobsRemaining: parseInt(jobsRemaining),
          requestsLimit: parseInt(requestsLimit),
          requestsRemaining: parseInt(requestsRemaining),
          jobsReset: jobsReset ? parseInt(jobsReset) : 0
        };
      }
    } catch (error) {
      console.warn('Failed to parse RapidAPI usage headers:', error);
    }
    return null;
  }

  /**
   * Updates current API usage tracking
   */
  updateUsage(headers: Headers): void {
    const debugUsage = process.env.DEBUG_RAPIDAPI_USAGE === 'true';
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] updateUsage called with headers:', {
        'x-ratelimit-jobs-limit': headers.get('x-ratelimit-jobs-limit'),
        'x-ratelimit-jobs-remaining': headers.get('x-ratelimit-jobs-remaining'),
        'x-ratelimit-requests-limit': headers.get('x-ratelimit-requests-limit'),
        'x-ratelimit-requests-remaining': headers.get('x-ratelimit-requests-remaining'),
        'x-ratelimit-jobs-reset': headers.get('x-ratelimit-jobs-reset'),
      });
    }
    
    this.currentUsage = this.extractUsageHeaders(headers);
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Extracted usage data:', this.currentUsage);
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Cache manager instance ID:', this.constructor.name);
    }
    
    if (this.currentUsage) {
      console.log('RapidAPI Usage Updated:', {
        jobsRemaining: this.currentUsage.jobsRemaining,
        requestsRemaining: this.currentUsage.requestsRemaining,
        resetIn: `${Math.round(this.currentUsage.jobsReset / 3600)} hours`
      });
      
      // Persist to Redis for cross-request availability (Next.js dev mode singleton issue)
      // Only run on server-side to avoid client-side import issues
      if (typeof window === 'undefined') {
        this.persistUsageToRedisAsync(this.currentUsage);
      }
    } else if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] ❌ Failed to extract usage headers');
    }
  }

  /**
   * Gets current API usage statistics
   * Client-safe version that doesn't block on Redis operations
   */
  getCurrentUsage(): ApiUsageHeaders | null {
    const debugUsage = process.env.DEBUG_RAPIDAPI_USAGE === 'true';
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] getCurrentUsage called');
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Current in-memory state:', this.currentUsage);
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] Cache manager instance state:', {
        hasCurrentUsage: !!this.currentUsage,
        cacheSize: this.cache.size,
        instanceId: this.constructor.name
      });
    }
    
    return this.currentUsage;
  }

  /**
   * Server-side async version for getting usage with Redis sync
   */
  async getCurrentUsageAsync(): Promise<ApiUsageHeaders | null> {
    const debugUsage = process.env.DEBUG_RAPIDAPI_USAGE === 'true';
    
    if (debugUsage) {
      console.log('🔍 [DEBUG_RAPIDAPI_USAGE] getCurrentUsageAsync called');
    }
    
    // Only restore from Redis on server-side
    if (typeof window === 'undefined') {
      const restored = await this.restoreUsageFromRedisAsync();
      if (restored) {
        this.currentUsage = restored;
      }
    }
    
    return this.currentUsage;
  }

  /**
   * Calculates credit consumption for a search request
   */
  calculateCreditConsumption(params: SearchParameters): { jobs: number; requests: number } {
    const limit = params.limit || 10; // Default limit per documentation
    return {
      jobs: Math.min(limit, 100), // Max 100 jobs per request per documentation
      requests: 1 // Each API call consumes 1 request credit
    };
  }

  /**
   * Checks if we have sufficient credits for a request
   */
  canMakeRequest(params: SearchParameters): { allowed: boolean; reason?: string } {
    if (!this.currentUsage) {
      return { allowed: true }; // No usage data available, allow request
    }

    const consumption = this.calculateCreditConsumption(params);
    
    if (this.currentUsage.jobsRemaining < consumption.jobs) {
      return { 
        allowed: false, 
        reason: `Insufficient job credits. Need ${consumption.jobs}, have ${this.currentUsage.jobsRemaining}` 
      };
    }

    if (this.currentUsage.requestsRemaining < consumption.requests) {
      return { 
        allowed: false, 
        reason: `Insufficient request credits. Need ${consumption.requests}, have ${this.currentUsage.requestsRemaining}` 
      };
    }

    return { allowed: true };
  }

  /**
   * Retrieves cached response if available and valid
   */
  getCachedResponse(params: SearchParameters): any | null {
    const hash = this.generateParameterHash(params);
    const entry = this.cache.get(hash);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(hash);
      return null;
    }

    // Update current usage with cached headers if available and current usage is null
    if (entry.usageHeaders && !this.currentUsage) {
      this.currentUsage = entry.usageHeaders;
      console.log('Restored usage data from cache:', {
        jobsRemaining: this.currentUsage.jobsRemaining,
        requestsRemaining: this.currentUsage.requestsRemaining
      });
    }

    console.log('Cache hit for parameters:', params);
    return {
      data: entry.data,
      cached: true,
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
      usageHeaders: entry.usageHeaders
    };
  }

  /**
   * Caches API response with usage headers
   */
  cacheResponse(params: SearchParameters, data: any, headers?: Headers): void {
    const hash = this.generateParameterHash(params);
    
    // Enforce cache size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      parameterHash: hash,
      usageHeaders: headers ? this.extractUsageHeaders(headers) : undefined
    };

    this.cache.set(hash, entry);
    console.log('Cached response for parameters:', params);
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; entries: Array<{ hash: string; age: number; params: string }> } {
    const entries = Array.from(this.cache.entries()).map(([hash, entry]) => ({
      hash: hash.substring(0, 8),
      age: Math.round((Date.now() - entry.timestamp) / 1000 / 60), // minutes
      params: entry.parameterHash
    }));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries
    };
  }

  /**
   * Clears all cached responses
   */
  clearCache(): void {
    this.cache.clear();
    console.log('RapidAPI response cache cleared');
  }

  /**
   * Gets usage warning level based on remaining credits
   */
  getUsageWarningLevel(): 'none' | 'low' | 'critical' {
    if (!this.currentUsage) return 'none';

    const jobsPercentage = (this.currentUsage.jobsRemaining / this.currentUsage.jobsLimit) * 100;
    const requestsPercentage = (this.currentUsage.requestsRemaining / this.currentUsage.requestsLimit) * 100;
    
    const minPercentage = Math.min(jobsPercentage, requestsPercentage);

    if (minPercentage < 10) return 'critical';
    if (minPercentage < 25) return 'low';
    return 'none';
  }

  /**
   * Server-side only async wrapper for Redis persistence
   */
  private async persistUsageToRedisAsync(usage: ApiUsageHeaders): Promise<void> {
    try {
      const { persistUsageToRedis } = await import('./rapidapi-redis-utils');
      await persistUsageToRedis(usage);
    } catch (error) {
      console.error('Failed to persist usage to Redis:', error);
      // Don't throw - this is optional persistence
    }
  }

  /**
   * Server-side only async wrapper for Redis restoration
   */
  private async restoreUsageFromRedisAsync(): Promise<ApiUsageHeaders | null> {
    try {
      const { restoreUsageFromRedis } = await import('./rapidapi-redis-utils');
      return await restoreUsageFromRedis();
    } catch (error) {
      console.error('Failed to restore usage from Redis:', error);
      return null;
    }
  }
}

export default RapidApiCacheManager;
export type { ApiUsageHeaders, SearchParameters };