/**
 * Feature Flags System
 * Centralized feature flag management for TechRec application
 */

/**
 * Check if the application is running in MVP mode
 * When MVP mode is enabled, the CV analysis system is simplified:
 * - No complex JSON validation
 * - No structured data parsing 
 * - No complex profile sync operations
 * - Simple dual-format extraction (text + basic JSON)
 * - Faster processing times (<5s vs 15s+)
 */
export const isInMvpMode = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_MVP_MODE === 'true';
};

/**
 * Check if direct Gemini upload is enabled
 * This is separate from MVP mode and can be used with or without it
 */
export const isDirectUploadEnabled = (): boolean => {
  return process.env.ENABLE_DIRECT_GEMINI_UPLOAD === 'true';
};

/**
 * Check if debug logging is enabled
 * Used for CV upload debugging and analysis
 */
export const isDebugEnabled = (): boolean => {
  return process.env.DEBUG_CV_UPLOAD === 'true' && process.env.NODE_ENV === 'development';
};

/**
 * Get the appropriate CV management route based on feature flags
 * Currently both modes use the same route but with different behavior
 */
export const getCvManagementRoute = (): string => {
  return '/developer/cv-management';
};

/**
 * Feature flag configuration object for easy reference
 */
export const featureFlags = {
  mvpMode: isInMvpMode(),
  directUpload: isDirectUploadEnabled(), 
  debug: isDebugEnabled(),
} as const;

/**
 * Log current feature flag state (development only)
 */
export const logFeatureFlags = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🏁 [FEATURE-FLAGS] Current configuration:', {
      NEXT_PUBLIC_ENABLE_MVP_MODE: process.env.NEXT_PUBLIC_ENABLE_MVP_MODE,
      ENABLE_DIRECT_GEMINI_UPLOAD: process.env.ENABLE_DIRECT_GEMINI_UPLOAD,
      DEBUG_CV_UPLOAD: process.env.DEBUG_CV_UPLOAD,
      NODE_ENV: process.env.NODE_ENV,
      computed: featureFlags
    });
  }
};

/**
 * Validate feature flag environment
 * Ensures required environment variables are set correctly
 */
export const validateFeatureFlags = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // MVP mode requires certain AI keys
  if (isInMvpMode() && !process.env.GOOGLE_AI_API_KEY) {
    errors.push('MVP mode requires GOOGLE_AI_API_KEY environment variable');
  }
  
  // Direct upload mode requires Gemini API
  if (isDirectUploadEnabled() && !process.env.GOOGLE_AI_API_KEY) {
    errors.push('Direct upload mode requires GOOGLE_AI_API_KEY environment variable');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};