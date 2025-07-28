// Server-Side Cache Wrapper for Project Enhancement System
// Provides Redis caching for API routes while keeping client-side code safe

import { getCache, setCache } from '@/lib/redis';

// Cache configuration for different data types
export const CACHE_TTL = {
  CV_DESCRIPTION: 3600,        // 1 hour for CV descriptions
  README_ANALYSIS: 7200,       // 2 hours for README analysis  
  PROJECT_IDEAS: 3600,         // 1 hour for project ideas
  EXPERIENCE_CALCULATION: 86400, // 24 hours for experience calculations
  GITHUB_REPOSITORIES: 3600,   // 1 hour for GitHub repo lists
  GITHUB_README: 7200,         // 2 hours for README content
  POINTS_COSTS: 300,           // 5 minutes for points configuration
  SUBSCRIPTION_TIERS: 300      // 5 minutes for subscription config
};

/**
 * Server-side cache wrapper with semantic key generation
 */
export class ServerCache {
  
  /**
   * Generate semantic cache key for CV descriptions
   */
  static generateCVDescriptionKey(
    userId: string,
    projectInput: any,
    options: any = {}
  ): string {
    const baseKey = 'cv-description';
    const projectType = projectInput.type;
    const projectId = projectInput.repository?.id || 
                     projectInput.projectIdea?.id || 
                     projectInput.projectData?.name?.toLowerCase().replace(/\s+/g, '-') || 
                     'unknown';
    
    const optionsKey = JSON.stringify({
      style: options.style || 'professional',
      length: options.length || 'detailed',
      focus: options.focus || 'technical'
    });
    
    return `${baseKey}:${userId}:${projectType}:${projectId}:${Buffer.from(optionsKey).toString('base64')}`;
  }
  
  /**
   * Generate semantic cache key for README analysis
   */
  static generateReadmeAnalysisKey(
    owner: string,
    repo: string,
    readmeContent: string
  ): string {
    const contentHash = Buffer.from(readmeContent).toString('base64').slice(0, 16);
    return `readme-analysis:${owner}:${repo}:${contentHash}`;
  }
  
  /**
   * Generate semantic cache key for project ideas
   */
  static generateProjectIdeasKey(request: {
    skills: string[];
    experienceLevel: string;
    focusArea?: string;
    timeCommitment?: string;
  }): string {
    const normalizedRequest = {
      skills: request.skills.sort().join(','),
      experienceLevel: request.experienceLevel,
      focusArea: request.focusArea || 'fullstack',
      timeCommitment: request.timeCommitment || 'week'
    };
    
    const requestHash = Buffer.from(JSON.stringify(normalizedRequest)).toString('base64').slice(0, 16);
    return `project-ideas:${requestHash}`;
  }
  
  /**
   * Generate semantic cache key for experience calculations
   */
  static generateExperienceKey(experiences: any[]): string {
    const experienceHash = Buffer.from(JSON.stringify(experiences)).toString('base64').slice(0, 16);
    return `experience-calculation:${experienceHash}`;
  }
  
  /**
   * Generate semantic cache key for GitHub repositories
   */
  static generateGitHubReposKey(
    userId: string,
    options: any = {}
  ): string {
    const optionsKey = JSON.stringify({
      includePrivate: options.includePrivate || false,
      includeForks: options.includeForks || false,
      sortBy: options.sortBy || 'updated',
      limit: options.limit || 30
    });
    
    return `github-repos:${userId}:${Buffer.from(optionsKey).toString('base64')}`;
  }
  
  /**
   * Cached wrapper for CV description generation
   */
  static async withCVDescriptionCache<T>(
    key: string,
    generator: () => Promise<T>,
    ttl: number = CACHE_TTL.CV_DESCRIPTION
  ): Promise<T> {
    try {
      // Try cache first
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed for CV description:', error);
    }
    
    // Generate fresh data
    const result = await generator();
    
    // Cache the result
    try {
      await setCache(key, result, ttl);
    } catch (error) {
      console.warn('Cache write failed for CV description:', error);
    }
    
    return result;
  }
  
  /**
   * Cached wrapper for README analysis
   */
  static async withReadmeAnalysisCache<T>(
    key: string,
    analyzer: () => Promise<T>,
    ttl: number = CACHE_TTL.README_ANALYSIS
  ): Promise<T> {
    try {
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed for README analysis:', error);
    }
    
    const result = await analyzer();
    
    try {
      await setCache(key, result, ttl);
    } catch (error) {
      console.warn('Cache write failed for README analysis:', error);
    }
    
    return result;
  }
  
  /**
   * Cached wrapper for project ideas generation
   */
  static async withProjectIdeasCache<T>(
    key: string,
    generator: () => Promise<T>,
    ttl: number = CACHE_TTL.PROJECT_IDEAS
  ): Promise<T> {
    try {
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed for project ideas:', error);
    }
    
    const result = await generator();
    
    try {
      await setCache(key, result, ttl);
    } catch (error) {
      console.warn('Cache write failed for project ideas:', error);
    }
    
    return result;
  }
  
  /**
   * Cached wrapper for experience calculations
   */
  static async withExperienceCache<T>(
    key: string,
    calculator: () => Promise<T>,
    ttl: number = CACHE_TTL.EXPERIENCE_CALCULATION
  ): Promise<T> {
    try {
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed for experience calculation:', error);
    }
    
    const result = await calculator();
    
    try {
      await setCache(key, result, ttl);
    } catch (error) {
      console.warn('Cache write failed for experience calculation:', error);
    }
    
    return result;
  }
  
  /**
   * Cached wrapper for GitHub operations
   */
  static async withGitHubCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = CACHE_TTL.GITHUB_REPOSITORIES
  ): Promise<T> {
    try {
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn('Cache read failed for GitHub operation:', error);
    }
    
    const result = await operation();
    
    try {
      await setCache(key, result, ttl);
    } catch (error) {
      console.warn('Cache write failed for GitHub operation:', error);
    }
    
    return result;
  }
  
  /**
   * Generic cached wrapper with fallback
   */
  static async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = 300,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      const cached = await getCache<T>(key);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn(`Cache read failed for key ${key}:`, error);
    }
    
    try {
      const result = await operation();
      
      try {
        await setCache(key, result, ttl);
      } catch (cacheError) {
        console.warn(`Cache write failed for key ${key}:`, cacheError);
      }
      
      return result;
    } catch (error) {
      if (fallback) {
        console.warn(`Primary operation failed for key ${key}, trying fallback:`, error);
        return await fallback();
      }
      throw error;
    }
  }
  
  /**
   * Bulk cache operations for batch processing
   */
  static async withBulkCache<T>(
    operations: Array<{
      key: string;
      operation: () => Promise<T>;
      ttl?: number;
    }>
  ): Promise<T[]> {
    return await Promise.all(
      operations.map(({ key, operation, ttl = 300 }) =>
        this.withCache(key, operation, ttl)
      )
    );
  }
  
  /**
   * Cache invalidation for specific patterns
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      // This would require Redis SCAN or similar - implement if needed
      console.warn(`Cache invalidation for pattern ${pattern} not implemented`);
    } catch (error) {
      console.warn(`Cache invalidation failed for pattern ${pattern}:`, error);
    }
  }
  
  /**
   * Cache warming for commonly accessed data
   */
  static async warmCache(operations: Array<{
    key: string;
    operation: () => Promise<any>;
    ttl?: number;
  }>): Promise<void> {
    try {
      await Promise.allSettled(
        operations.map(({ key, operation, ttl = 300 }) =>
          this.withCache(key, operation, ttl)
        )
      );
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }
}

export default ServerCache;