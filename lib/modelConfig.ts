/**
 * Centralized Model Configuration Service
 * 
 * This service provides standardized model selection for all AI operations
 * across the TechRec platform. All model versions are configurable via
 * environment variables with sensible defaults.
 */

export type ModelUseCase = 
  | 'cv-analysis'         // Core CV parsing and profile extraction
  | 'cv-improvement'      // CV improvement suggestions
  | 'cv-optimization'     // CV optimization against job descriptions
  | 'cover-letter'        // Cover letter generation
  | 'outreach'           // Outreach message generation
  | 'project-description' // Project description generation
  | 'project-ideas'      // Project idea generation
  | 'readme-analysis'    // README file analysis
  | 'direct-upload'      // Direct PDF upload processing
  | 'general';           // General purpose/fallback

/**
 * Model configuration with environment variable support
 */
const MODEL_CONFIG = {
  'cv-analysis': process.env.GEMINI_CV_ANALYSIS_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'cv-improvement': process.env.GEMINI_CV_IMPROVEMENT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'cv-optimization': process.env.GEMINI_CV_OPTIMIZATION_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'cover-letter': process.env.GEMINI_COVER_LETTER_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'outreach': process.env.GEMINI_OUTREACH_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'project-description': process.env.GEMINI_PROJECT_DESC_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'project-ideas': process.env.GEMINI_PROJECT_IDEAS_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'readme-analysis': process.env.GEMINI_README_ANALYSIS_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'direct-upload': process.env.GEMINI_DIRECT_UPLOAD_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'general': process.env.GEMINI_MODEL || 'gemini-2.5-flash',
} as const;

/**
 * Get the appropriate Gemini model for a specific use case
 * 
 * @param useCase - The specific use case for model selection
 * @returns The model string to use with Google Generative AI
 * 
 * @example
 * ```typescript
 * import { getGeminiModel } from '@/lib/modelConfig';
 * 
 * const model = genAI.getGenerativeModel({ 
 *   model: getGeminiModel('cv-analysis'),
 *   generationConfig: { ... }
 * });
 * ```
 */
export function getGeminiModel(useCase: ModelUseCase): string {
  const model = MODEL_CONFIG[useCase];
  
  // Log model selection for debugging/monitoring
  if (process.env.NODE_ENV === 'development') {
    console.log(`📋 [ModelConfig] Selected model for "${useCase}": ${model}`);
  }
  
  return model;
}

/**
 * Get all current model configurations for debugging/monitoring
 * 
 * @returns Object mapping use cases to their configured models
 */
export function getAllModelConfigurations(): Record<ModelUseCase, string> {
  return { ...MODEL_CONFIG };
}

/**
 * Check if a specific environment variable is set for model configuration
 * 
 * @param useCase - The use case to check
 * @returns Boolean indicating if a specific env var is set (vs using fallback)
 */
export function hasSpecificModelConfig(useCase: ModelUseCase): boolean {
  const envVarMap: Record<ModelUseCase, string> = {
    'cv-analysis': 'GEMINI_CV_ANALYSIS_MODEL',
    'cv-improvement': 'GEMINI_CV_IMPROVEMENT_MODEL', 
    'cv-optimization': 'GEMINI_CV_OPTIMIZATION_MODEL',
    'cover-letter': 'GEMINI_COVER_LETTER_MODEL',
    'outreach': 'GEMINI_OUTREACH_MODEL',
    'project-description': 'GEMINI_PROJECT_DESC_MODEL',
    'project-ideas': 'GEMINI_PROJECT_IDEAS_MODEL',
    'readme-analysis': 'GEMINI_README_ANALYSIS_MODEL',
    'direct-upload': 'GEMINI_DIRECT_UPLOAD_MODEL',
    'general': 'GEMINI_MODEL',
  };
  
  return !!process.env[envVarMap[useCase]];
}

/**
 * Environment variable documentation for easy reference
 */
export const ENV_VARS_DOCUMENTATION = {
  'GEMINI_MODEL': 'Global fallback model for all Gemini operations',
  'GEMINI_CV_ANALYSIS_MODEL': 'Model for CV parsing and profile extraction', 
  'GEMINI_CV_IMPROVEMENT_MODEL': 'Model for CV improvement suggestions',
  'GEMINI_CV_OPTIMIZATION_MODEL': 'Model for CV optimization against job descriptions',
  'GEMINI_COVER_LETTER_MODEL': 'Model for cover letter generation',
  'GEMINI_OUTREACH_MODEL': 'Model for outreach message generation',
  'GEMINI_PROJECT_DESC_MODEL': 'Model for project description generation',
  'GEMINI_PROJECT_IDEAS_MODEL': 'Model for project idea generation', 
  'GEMINI_README_ANALYSIS_MODEL': 'Model for README file analysis',
  'GEMINI_DIRECT_UPLOAD_MODEL': 'Model for direct PDF upload processing',
} as const;

/**
 * Default model used across the platform
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Legacy compatibility - for files that still expect a simple string
 * @deprecated Use getGeminiModel() with specific use case instead
 */
export const geminiModel = getGeminiModel('general');