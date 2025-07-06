// utils/matching/index.ts
// Exports for the skill matching system

export * from './skillTaxonomy';
export * from './skillMatchingService';

// Re-export types for convenience
export type {
  SkillMatch,
  RoleMatchScore,
  UserSkill,
  UserSkillProfile,
  SkillSource,
  MatchingConfig,
  BatchMatchRequest,
  BatchMatchResponse,
  MatchError,
  MatchErrorCode
} from '@/types/matching';