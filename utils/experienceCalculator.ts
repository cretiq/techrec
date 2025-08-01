// Experience Calculation Engine with Redis Caching
// Used for detecting junior developers (≤2 years) to trigger project enhancement recommendations

import { Experience } from '@prisma/client';
import { ServerCache } from '@/lib/serverCache';

// Cache configuration - use ServerCache constants
const EXPERIENCE_CACHE_TTL = 86400; // 24 hours
const EXPERIENCE_CACHE_PREFIX = 'experience:';

// Debug logging based on environment
const DEBUG_EXPERIENCE = process.env.NODE_ENV === 'development' || process.env.DEBUG_EXPERIENCE === 'true';

const debugLog = (message: string, data?: any) => {
  if (DEBUG_EXPERIENCE) {
    console.log(`[ExperienceCalculator] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Interface for experience cache data
export interface ExperienceCache {
  totalYears: number;
  isJuniorDeveloper: boolean;
  calculatedAt: number; // timestamp
  experienceItems: number; // count of experience items
}

// Interface for experience calculation result
export interface ExperienceCalculationResult {
  totalYears: number;
  isJuniorDeveloper: boolean;
  experienceItems: number;
  fromCache: boolean;
  cacheKey?: string;
}

/**
 * Calculate total years of experience from experience items
 * Handles overlapping experiences, current roles, and edge cases
 */
export const calculateTotalExperience = (experiences: Experience[]): number => {
  if (!experiences || experiences.length === 0) {
    debugLog('No experience items provided');
    return 0;
  }

  debugLog(`Calculating experience for ${experiences.length} items`);

  // Convert experience items to date ranges
  const dateRanges: Array<{ start: Date; end: Date }> = [];
  const currentDate = new Date();

  experiences.forEach((exp, index) => {
    try {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? currentDate : (exp.endDate ? new Date(exp.endDate) : currentDate);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        debugLog(`Invalid date for experience ${index}: ${exp.title} at ${exp.company}`);
        return;
      }

      // Ensure end date is after start date
      if (endDate < startDate) {
        debugLog(`End date before start date for experience ${index}: ${exp.title} at ${exp.company}`);
        return;
      }

      dateRanges.push({ start: startDate, end: endDate });
      debugLog(`Added date range for ${exp.title} at ${exp.company}: ${startDate.toISOString()} - ${endDate.toISOString()}`);
    } catch (error) {
      debugLog(`Error processing experience ${index}: ${exp.title} at ${exp.company}`, error);
    }
  });

  if (dateRanges.length === 0) {
    debugLog('No valid date ranges found');
    return 0;
  }

  // Sort by start date
  dateRanges.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping ranges to avoid double-counting
  const mergedRanges: Array<{ start: Date; end: Date }> = [];
  let currentRange = dateRanges[0];

  for (let i = 1; i < dateRanges.length; i++) {
    const nextRange = dateRanges[i];
    
    // Check if ranges overlap or are adjacent
    if (nextRange.start <= currentRange.end) {
      // Merge ranges - extend end date if necessary
      currentRange.end = new Date(Math.max(currentRange.end.getTime(), nextRange.end.getTime()));
      debugLog(`Merged overlapping ranges ending at ${currentRange.end.toISOString()}`);
    } else {
      // No overlap, add current range and start new one
      mergedRanges.push(currentRange);
      currentRange = nextRange;
    }
  }
  
  // Add the last range
  mergedRanges.push(currentRange);

  // Calculate total experience in years
  let totalMilliseconds = 0;
  mergedRanges.forEach(range => {
    const duration = range.end.getTime() - range.start.getTime();
    totalMilliseconds += duration;
    debugLog(`Range duration: ${(duration / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2)} years`);
  });

  const totalYears = totalMilliseconds / (1000 * 60 * 60 * 24 * 365.25); // Convert to years
  debugLog(`Total calculated experience: ${totalYears.toFixed(2)} years`);

  return Math.round(totalYears * 100) / 100; // Round to 2 decimal places
};

/**
 * Get cached experience data or calculate and cache it
 */
export const getCachedExperienceData = async (
  developerId: string,
  experiences: Experience[]
): Promise<ExperienceCalculationResult> => {
  const cacheKey = `${EXPERIENCE_CACHE_PREFIX}${developerId}`;
  
  debugLog(`Looking up cached experience for developer ${developerId}`);

  // Check cache (server-side only)  
  if (typeof window === 'undefined') {
    try {
      // Try to get from cache first
      const { getCache } = await import('@/lib/redis');
      const cachedData = await getCache<ExperienceCache>(cacheKey);
      
      if (cachedData) {
        debugLog(`Cache HIT for developer ${developerId}`, cachedData);
        return {
          totalYears: cachedData.totalYears,
          isJuniorDeveloper: cachedData.isJuniorDeveloper,
          experienceItems: cachedData.experienceItems,
          fromCache: true,
          cacheKey
        };
      }
    } catch (error) {
      debugLog(`Cache error for developer ${developerId}:`, error);
    }
  }

  debugLog(`Cache MISS for developer ${developerId}, calculating...`);
    
    // Calculate fresh data
    const totalYears = calculateTotalExperience(experiences);
    const isJuniorDeveloper = totalYears <= 2;
    const experienceItems = experiences.length;

    const cacheData: ExperienceCache = {
      totalYears,
      isJuniorDeveloper,
      calculatedAt: Date.now(),
      experienceItems
    };

    // Cache the result (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { setCache } = await import('@/lib/redis');
        await setCache(cacheKey, cacheData, EXPERIENCE_CACHE_TTL);
        debugLog(`Cached experience data for developer ${developerId}`, cacheData);
      } catch (cacheError) {
        debugLog('Failed to cache experience data', cacheError);
      }
    }

    return {
      totalYears,
      isJuniorDeveloper,
      experienceItems,
      fromCache: false,
      cacheKey
    };
};

/**
 * Force refresh experience cache for a developer
 */
export const refreshExperienceCache = async (
  developerId: string,
  experiences: Experience[]
): Promise<ExperienceCalculationResult> => {
  const cacheKey = `${EXPERIENCE_CACHE_PREFIX}${developerId}`;
  
  debugLog(`Force refreshing experience cache for developer ${developerId}`);

  try {
    // Calculate fresh data
    const totalYears = calculateTotalExperience(experiences);
    const isJuniorDeveloper = totalYears <= 2;
    const experienceItems = experiences.length;

    const cacheData: ExperienceCache = {
      totalYears,
      isJuniorDeveloper,
      calculatedAt: Date.now(),
      experienceItems
    };

    // Update cache (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { setCache } = await import('@/lib/redis');
        await setCache(cacheKey, cacheData, EXPERIENCE_CACHE_TTL);
        debugLog(`Refreshed experience cache for developer ${developerId}`, cacheData);
      } catch (cacheError) {
        debugLog('Failed to update experience cache', cacheError);
      }
    }

    return {
      totalYears,
      isJuniorDeveloper,
      experienceItems,
      fromCache: false,
      cacheKey
    };

  } catch (error) {
    debugLog(`Error refreshing experience cache for developer ${developerId}`, error);
    
    // Fallback to calculation without caching
    const totalYears = calculateTotalExperience(experiences);
    const isJuniorDeveloper = totalYears <= 2;
    const experienceItems = experiences.length;

    return {
      totalYears,
      isJuniorDeveloper,
      experienceItems,
      fromCache: false
    };
  }
};

/**
 * Check if a developer qualifies for project enhancement recommendations
 */
export const shouldShowProjectRecommendation = async (
  developerId: string,
  experiences: Experience[]
): Promise<boolean> => {
  const result = await getCachedExperienceData(developerId, experiences);
  debugLog(`Project recommendation check for developer ${developerId}: ${result.isJuniorDeveloper}`);
  return result.isJuniorDeveloper;
};

/**
 * Get experience statistics for admin/debugging
 */
export const getExperienceStats = async (
  developerId: string,
  experiences: Experience[]
): Promise<{
  totalYears: number;
  isJuniorDeveloper: boolean;
  experienceItems: number;
  fromCache: boolean;
  cacheAge?: number;
}> => {
  const result = await getCachedExperienceData(developerId, experiences);
  
  let cacheAge: number | undefined;
  if (result.fromCache && result.cacheKey) {
    try {
      const cachedData = await getCache<ExperienceCache>(result.cacheKey);
      if (cachedData) {
        cacheAge = Date.now() - cachedData.calculatedAt;
      }
    } catch (error) {
      debugLog(`Error getting cache age for developer ${developerId}`, error);
    }
  }

  return {
    totalYears: result.totalYears,
    isJuniorDeveloper: result.isJuniorDeveloper,
    experienceItems: result.experienceItems,
    fromCache: result.fromCache,
    cacheAge
  };
};