// utils/matching/skillMatchingService.ts
// Core skill matching engine for role compatibility scoring

import { SkillLevel } from '@prisma/client';
import {
  SkillMatch,
  RoleMatchScore,
  UserSkill,
  SkillSource,
  MatchingConfig,
  MatchError,
  MatchErrorCode,
  BatchMatchRequest,
  BatchMatchResponse
} from '@/types/matching';
import { RapidApiJob } from '@/types/rapidapi';
import { Role } from '@/types/role';
import {
  normalizeSkillName,
  fuzzyMatchSkills,
  isValidSkillName,
  cleanSkillName
} from './skillTaxonomy';

// Default matching configuration
export const defaultMatchingConfig: MatchingConfig = {
  skillsWeight: 1.0, // 100% weight for skills in initial implementation
  minimumConfidence: 0.7,
  fuzzyMatchThreshold: 0.8,
  minimumScoreThreshold: 0,
  bonusForHighLevelSkills: 1.2
};

/**
 * Extract skills from role data sources in priority order
 * @param roleData - Role data (can be RapidApiJob or Role)
 * @returns Array of extracted skills with source information
 */
export function extractRoleSkills(roleData: RapidApiJob | Role): {
  skills: string[];
  source: SkillSource;
  hasSkillsListed: boolean;
} {
  // Check if this is a RapidApiJob (has ai_key_skills)
  const rapidApiJob = roleData as RapidApiJob;
  
  // Priority 1: AI-extracted key skills
  if (rapidApiJob.ai_key_skills && rapidApiJob.ai_key_skills.length > 0) {
    const validSkills = rapidApiJob.ai_key_skills
      .filter(skill => isValidSkillName(skill))
      .map(skill => cleanSkillName(skill));
    
    if (validSkills.length > 0) {
      return {
        skills: validSkills,
        source: SkillSource.AI_KEY_SKILLS,
        hasSkillsListed: true
      };
    }
  }
  
  // Priority 2: Role skills (structured skills array)
  if (roleData.skills && roleData.skills.length > 0) {
    const validSkills = roleData.skills
      .map(skill => typeof skill === 'string' ? skill : skill.name)
      .filter(skill => isValidSkillName(skill))
      .map(skill => cleanSkillName(skill));
    
    if (validSkills.length > 0) {
      return {
        skills: validSkills,
        source: SkillSource.ROLE_SKILLS,
        hasSkillsListed: true
      };
    }
  }
  
  // Priority 3: LinkedIn organization specialties
  if (rapidApiJob.linkedin_org_specialties && rapidApiJob.linkedin_org_specialties.length > 0) {
    const validSkills = rapidApiJob.linkedin_org_specialties
      .filter(skill => isValidSkillName(skill))
      .map(skill => cleanSkillName(skill));
    
    if (validSkills.length > 0) {
      return {
        skills: validSkills,
        source: SkillSource.LINKEDIN_SPECIALTIES,
        hasSkillsListed: true
      };
    }
  }
  
  // No valid skills found
  return {
    skills: [],
    source: SkillSource.AI_KEY_SKILLS,
    hasSkillsListed: false
  };
}

/**
 * Calculate skill level multiplier for scoring
 * @param skillLevel - User's skill level
 * @param config - Matching configuration
 * @returns Multiplier for skill score
 */
export function getSkillLevelMultiplier(
  skillLevel: SkillLevel,
  config: MatchingConfig = defaultMatchingConfig
): number {
  switch (skillLevel) {
    case SkillLevel.EXPERT:
      return config.bonusForHighLevelSkills;
    case SkillLevel.ADVANCED:
      return config.bonusForHighLevelSkills;
    case SkillLevel.INTERMEDIATE:
      return 1.0;
    case SkillLevel.BEGINNER:
      return 0.8;
    default:
      return 1.0;
  }
}

/**
 * Match user skills against role skills
 * @param userSkills - User's skills array
 * @param roleSkills - Role's skills array
 * @param config - Matching configuration
 * @returns Array of skill matches with confidence scores
 */
export function matchSkills(
  userSkills: UserSkill[],
  roleSkills: string[],
  config: MatchingConfig = defaultMatchingConfig
): SkillMatch[] {
  const skillMatches: SkillMatch[] = [];
  
  // Track which role skills have been matched to avoid duplicates
  const matchedRoleSkills = new Set<string>();
  
  // For each user skill, find the best match in role skills
  for (const userSkill of userSkills) {
    let bestMatch: SkillMatch | null = null;
    let bestConfidence = 0;
    
    for (const roleSkill of roleSkills) {
      // Skip if this role skill was already matched
      if (matchedRoleSkills.has(roleSkill)) {
        continue;
      }
      
      const matchResult = fuzzyMatchSkills(
        userSkill.name,
        roleSkill,
        config.fuzzyMatchThreshold
      );
      
      if (matchResult.matched && matchResult.confidence > bestConfidence) {
        bestMatch = {
          skillName: roleSkill,
          userLevel: userSkill.level,
          matched: true,
          source: SkillSource.AI_KEY_SKILLS, // Will be set by caller
          confidence: matchResult.confidence
        };
        bestConfidence = matchResult.confidence;
      }
    }
    
    if (bestMatch) {
      skillMatches.push(bestMatch);
      matchedRoleSkills.add(bestMatch.skillName);
    }
  }
  
  return skillMatches;
}

/**
 * Calculate overall role match score
 * @param userSkills - User's skills
 * @param roleData - Role data
 * @param config - Matching configuration
 * @returns Complete role match score
 */
export function calculateRoleMatchScore(
  userSkills: UserSkill[],
  roleData: RapidApiJob | Role,
  config: MatchingConfig = defaultMatchingConfig
): RoleMatchScore {
  // Extract skills from role data
  const { skills: roleSkills, source, hasSkillsListed } = extractRoleSkills(roleData);
  
  // If no skills listed, return zero score
  if (!hasSkillsListed || roleSkills.length === 0) {
    return {
      roleId: roleData.id,
      overallScore: 0,
      skillsMatched: 0,
      totalSkills: 0,
      matchedSkills: [],
      hasSkillsListed: false,
      breakdown: {
        skillsScore: 0
      }
    };
  }
  
  // If user has no skills, return zero score
  if (userSkills.length === 0) {
    return {
      roleId: roleData.id,
      overallScore: 0,
      skillsMatched: 0,
      totalSkills: roleSkills.length,
      matchedSkills: [],
      hasSkillsListed: true,
      breakdown: {
        skillsScore: 0
      }
    };
  }
  
  // Match skills
  const skillMatches = matchSkills(userSkills, roleSkills, config);
  
  // Update source for all matches
  skillMatches.forEach(match => {
    match.source = source;
  });
  
  // Calculate skill score with level multipliers
  let totalSkillScore = 0;
  let maxPossibleScore = 0;
  
  // Calculate actual matches with level bonuses
  for (const match of skillMatches) {
    const levelMultiplier = getSkillLevelMultiplier(match.userLevel, config);
    const skillScore = match.confidence * levelMultiplier;
    totalSkillScore += skillScore;
  }
  
  // Calculate maximum possible score (if all skills matched perfectly)
  maxPossibleScore = Math.min(userSkills.length, roleSkills.length);
  
  // Calculate percentage score
  const skillsScore = maxPossibleScore > 0 
    ? Math.min(100, (totalSkillScore / maxPossibleScore) * 100)
    : 0;
  
  // Overall score is just skills score in initial implementation
  const overallScore = skillsScore * config.skillsWeight;
  
  return {
    roleId: roleData.id,
    overallScore: Math.round(overallScore),
    skillsMatched: skillMatches.length,
    totalSkills: roleSkills.length,
    matchedSkills: skillMatches,
    hasSkillsListed: true,
    breakdown: {
      skillsScore: Math.round(skillsScore)
    }
  };
}

/**
 * Calculate match scores for multiple roles in batch
 * @param request - Batch match request
 * @param roleDataProvider - Function to get role data by ID
 * @returns Batch match response with scores and errors
 */
export async function calculateBatchMatchScores(
  request: BatchMatchRequest,
  roleDataProvider: (roleId: string) => Promise<RapidApiJob | Role | null>
): Promise<BatchMatchResponse> {
  const startTime = Date.now();
  const roleScores: RoleMatchScore[] = [];
  const errors: MatchError[] = [];
  
  // Process each role
  for (const roleId of request.roleIds) {
    try {
      const roleData = await roleDataProvider(roleId);
      
      if (!roleData) {
        errors.push({
          roleId,
          error: `Role with ID ${roleId} not found`,
          code: MatchErrorCode.ROLE_NOT_FOUND
        });
        continue;
      }
      
      const matchScore = calculateRoleMatchScore(
        request.userSkills,
        roleData,
        defaultMatchingConfig
      );
      
      roleScores.push(matchScore);
      
    } catch (error) {
      errors.push({
        roleId,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: MatchErrorCode.PROCESSING_ERROR
      });
    }
  }
  
  const processingTime = Date.now() - startTime;
  
  return {
    userId: request.userId,
    roleScores,
    totalProcessed: request.roleIds.length,
    processingTime,
    errors
  };
}

/**
 * Sort role scores by match percentage (descending)
 * @param scores - Array of role match scores
 * @returns Sorted array of role match scores
 */
export function sortRolesByMatchScore(scores: RoleMatchScore[]): RoleMatchScore[] {
  return [...scores].sort((a, b) => {
    // First sort by overall score (descending)
    if (a.overallScore !== b.overallScore) {
      return b.overallScore - a.overallScore;
    }
    
    // Then by number of skills matched (descending)
    if (a.skillsMatched !== b.skillsMatched) {
      return b.skillsMatched - a.skillsMatched;
    }
    
    // Finally by whether skills are listed (has skills listed first)
    if (a.hasSkillsListed !== b.hasSkillsListed) {
      return a.hasSkillsListed ? -1 : 1;
    }
    
    return 0;
  });
}

/**
 * Filter role scores by minimum score threshold
 * @param scores - Array of role match scores
 * @param minScore - Minimum score threshold (0-100)
 * @returns Filtered array of role match scores
 */
export function filterRolesByMinScore(
  scores: RoleMatchScore[],
  minScore: number
): RoleMatchScore[] {
  return scores.filter(score => score.overallScore >= minScore);
}

/**
 * Get summary statistics for a batch of role scores
 * @param scores - Array of role match scores
 * @returns Statistics object
 */
export function getMatchingStatistics(scores: RoleMatchScore[]): {
  totalRoles: number;
  rolesWithSkills: number;
  rolesWithoutSkills: number;
  averageScore: number;
  highScoreRoles: number; // >70%
  mediumScoreRoles: number; // 40-70%
  lowScoreRoles: number; // <40%
} {
  const totalRoles = scores.length;
  const rolesWithSkills = scores.filter(s => s.hasSkillsListed).length;
  const rolesWithoutSkills = totalRoles - rolesWithSkills;
  
  const scoresOnly = scores.filter(s => s.hasSkillsListed);
  const averageScore = scoresOnly.length > 0 
    ? scoresOnly.reduce((sum, s) => sum + s.overallScore, 0) / scoresOnly.length
    : 0;
  
  const highScoreRoles = scoresOnly.filter(s => s.overallScore > 70).length;
  const mediumScoreRoles = scoresOnly.filter(s => s.overallScore >= 40 && s.overallScore <= 70).length;
  const lowScoreRoles = scoresOnly.filter(s => s.overallScore < 40).length;
  
  return {
    totalRoles,
    rolesWithSkills,
    rolesWithoutSkills,
    averageScore: Math.round(averageScore),
    highScoreRoles,
    mediumScoreRoles,
    lowScoreRoles
  };
}