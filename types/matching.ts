// types/matching.ts
// Data structures and types for the role matching system

import { SkillLevel } from '@prisma/client';

// Matching score interfaces
export interface SkillMatch {
  skillName: string;
  userLevel: SkillLevel;
  matched: boolean;
  source: SkillSource;
  confidence: number; // 0-1 score for fuzzy matching confidence
}

export interface RoleMatchScore {
  roleId: string;
  overallScore: number; // 0-100 percentage
  skillsMatched: number;
  totalSkills: number;
  matchedSkills: SkillMatch[];
  hasSkillsListed: boolean;
  breakdown: {
    skillsScore: number; // 0-100 (only factor in initial implementation)
    // Future enhancement factors (not implemented yet):
    // experienceScore?: number;
    // locationScore?: number;
    // techStackScore?: number;
    // companyFitScore?: number;
  };
}

// User skill profile for matching
export interface UserSkillProfile {
  userId: string;
  skills: UserSkill[];
  lastUpdated: Date;
}

// Redux-serializable version for state storage
export interface SerializableUserSkillProfile {
  userId: string;
  skills: UserSkill[];
  lastUpdated: number; // timestamp instead of Date
}

export interface UserSkill {
  name: string;
  level: SkillLevel;
  categoryId?: string;
  normalized: string; // Normalized skill name for matching
}

// Role skill data sources (prioritized order)
export enum SkillSource {
  AI_KEY_SKILLS = 'ai_key_skills',
  ROLE_SKILLS = 'role_skills',
  LINKEDIN_SPECIALTIES = 'linkedin_org_specialties',
  DESCRIPTION_DERIVED = 'description_derived'
}

// Skill taxonomy for normalization
export interface SkillAlias {
  canonical: string;
  aliases: string[];
}

// Batch scoring interfaces
export interface BatchMatchRequest {
  userId: string;
  roleIds: string[];
  userSkills: UserSkill[];
}

export interface BatchMatchResponse {
  userId: string;
  roleScores: RoleMatchScore[];
  totalProcessed: number;
  processingTime: number;
  errors: MatchError[];
}

// Error handling
export interface MatchError {
  roleId: string;
  error: string;
  code: MatchErrorCode;
}

export enum MatchErrorCode {
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  NO_SKILLS_DATA = 'NO_SKILLS_DATA',
  INVALID_USER_PROFILE = 'INVALID_USER_PROFILE',
  PROCESSING_ERROR = 'PROCESSING_ERROR'
}

// Skill matching configuration
export interface MatchingConfig {
  // Skill matching weights (initial implementation: 100% skills)
  skillsWeight: number; // 1.0 (100%)
  
  // Future enhancement weights (not implemented yet):
  // experienceWeight?: number;
  // locationWeight?: number;
  // techStackWeight?: number;
  // companyFitWeight?: number;
  
  // Matching parameters
  minimumConfidence: number; // 0.7 (70% confidence threshold)
  fuzzyMatchThreshold: number; // 0.8 (80% similarity for fuzzy matching)
  
  // Score calculation
  minimumScoreThreshold: number; // 0 (show all scores, let user filter)
  bonusForHighLevelSkills: number; // 1.2 (20% bonus for ADVANCED/EXPERT skills)
}

// Redux state shape for matching
export interface MatchingState {
  userProfile: UserSkillProfile | null;
  roleScores: Map<string, RoleMatchScore>;
  loading: boolean;
  error: string | null;
  config: MatchingConfig;
  lastCalculated: Date | null;
}

// Component props interfaces
export interface MatchScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  animate?: boolean;
  hasSkillsListed: boolean;
  loading?: boolean;
}

export interface MatchScoreTooltipProps {
  matchScore: RoleMatchScore;
  isOpen: boolean;
  onClose: () => void;
}

// Sorting and filtering
export interface MatchSortOption {
  value: string;
  label: string;
  sortFn: (a: RoleMatchScore, b: RoleMatchScore) => number;
}

export interface MatchFilterOptions {
  minScore: number;
  maxScore: number;
  requireSkillsListed: boolean;
  skillCategories: string[];
}

// API endpoint interfaces
export interface CalculateMatchRequest {
  roleId: string;
  userId: string;
  userSkills?: UserSkill[]; // Optional, will fetch from DB if not provided
}

export interface CalculateMatchResponse {
  matchScore: RoleMatchScore;
  processingTime: number;
}

// Validation schemas (for runtime validation)
export interface MatchingValidationError {
  field: string;
  message: string;
  code: string;
}

export interface MatchingValidationResult {
  isValid: boolean;
  errors: MatchingValidationError[];
}