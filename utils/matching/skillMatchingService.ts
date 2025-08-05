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
import {
  extractSkillsFromDescription
} from './descriptionSkillExtractor';
import {
  calculateSimpleMatch,
  extractAllSkillsFromRole
} from './simpleSkillMatcher';

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
  
  // Priority 3: Role requirements array
  if (roleData.requirements && roleData.requirements.length > 0) {
    const validSkills = roleData.requirements
      .filter(req => isValidSkillName(req))
      .map(req => cleanSkillName(req));
    
    if (validSkills.length > 0) {
      return {
        skills: validSkills,
        source: SkillSource.REQUIREMENTS,
        hasSkillsListed: true
      };
    }
  }
  
  // Priority 4: LinkedIn organization specialties
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
  
  // Priority 5: Extract skills from job description
  if (roleData.description && roleData.description.trim().length > 0) {
    const extractedSkills = extractSkillsFromDescription(roleData.description);
    
    if (extractedSkills.length > 0) {
      return {
        skills: extractedSkills,
        source: SkillSource.DESCRIPTION_DERIVED,
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
 * Calculate overall role match score using simple matching adapter
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
  console.log(`[SKILL_ADAPTER_DEBUG] ===== Starting calculation for role ${roleData.id} =====`);
  console.log(`[SKILL_ADAPTER_DEBUG] Input data:`, {
    roleId: roleData.id,
    roleTitle: roleData.title,
    userSkillsCount: userSkills.length,
    userSkillsData: userSkills.map(s => ({ name: s.name, level: s.level })),
    roleDataKeys: Object.keys(roleData),
    roleDataPreview: {
      hasAiKeySkills: !!(roleData as RapidApiJob).ai_key_skills,
      aiKeySkillsLength: (roleData as RapidApiJob).ai_key_skills?.length,
      aiKeySkillsData: (roleData as RapidApiJob).ai_key_skills,
      hasRequirements: !!roleData.requirements,
      requirementsLength: roleData.requirements?.length,
      requirementsData: roleData.requirements,
      hasSkills: !!roleData.skills,
      skillsLength: roleData.skills?.length,
      skillsData: roleData.skills,
      hasCompany: !!roleData.company,
      companyData: roleData.company,
      hasLinkedinSpecialties: !!(roleData as RapidApiJob).linkedin_org_specialties,
      linkedinSpecialtiesLength: (roleData as RapidApiJob).linkedin_org_specialties?.length,
      linkedinSpecialtiesData: (roleData as RapidApiJob).linkedin_org_specialties,
      hasDescription: !!roleData.description,
      descriptionLength: roleData.description?.length,
      descriptionPreview: roleData.description?.substring(0, 200)
    }
  });
  
  // Convert UserSkill[] to string[] for simple matcher
  const userSkillNames = userSkills.map(skill => skill.name);
  
  console.log(`[SKILL_ADAPTER_DEBUG] Converted to string array:`, {
    userSkillNames
  });
  
  // Use simple matcher to get match result
  const simpleResult = calculateSimpleMatch(userSkillNames, roleData);
  
  // Determine if role has skills listed for UI feedback
  const hasSkillsListed = simpleResult.totalRoleSkills > 0;
  
  console.log(`[SKILL_ADAPTER_DEBUG] Simple matcher result:`, {
    score: simpleResult.score,
    matchedSkillsCount: simpleResult.matchedSkills.length,
    matchedSkills: simpleResult.matchedSkills,
    totalUserSkills: simpleResult.totalUserSkills,
    totalRoleSkills: simpleResult.totalRoleSkills,
    hasSkillsListed
  });
  
  // Convert simple match result to legacy SkillMatch format for backward compatibility
  const skillMatches: SkillMatch[] = simpleResult.matchedSkills.map(skillName => {
    const userSkill = userSkills.find(us => us.name.toLowerCase() === skillName.toLowerCase());
    return {
      skillName,
      userLevel: userSkill?.level || SkillLevel.INTERMEDIATE,
      matched: true,
      source: SkillSource.AI_KEY_SKILLS, // Generic source since we extract from all sources
      confidence: 1.0 // Perfect confidence for exact matches
    };
  });
  
  const result: RoleMatchScore = {
    roleId: roleData.id,
    overallScore: simpleResult.score,
    skillsMatched: simpleResult.matchedSkills.length,
    totalSkills: simpleResult.totalRoleSkills,
    matchedSkills: skillMatches,
    hasSkillsListed,
    breakdown: {
      skillsScore: simpleResult.score
    }
  };
  
  console.log(`[SKILL_ADAPTER_DEBUG] Final adapter result for ${roleData.id}:`, {
    overallScore: result.overallScore,
    skillsMatched: result.skillsMatched,
    totalSkills: result.totalSkills,
    hasSkillsListed: result.hasSkillsListed,
    matchedSkillsDetails: result.matchedSkills
  });
  console.log(`[SKILL_ADAPTER_DEBUG] ===== Completed calculation for role ${roleData.id} =====\n`);
  
  return result;
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