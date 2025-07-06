// utils/matching/roleFiltering.ts
// Utility functions for filtering and sorting roles by match scores

import { Role } from '@/types/role';
import { RoleMatchScore } from '@/types/matching';
import { MatchFilterOptions } from '@/components/roles/MatchScoreFilters';

/**
 * Sort roles by match score (descending)
 */
export function sortRolesByMatchScore(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  direction: 'asc' | 'desc' = 'desc'
): Role[] {
  return [...roles].sort((a, b) => {
    const scoreA = roleScores.get(a.id)?.overallScore || 0;
    const scoreB = roleScores.get(b.id)?.overallScore || 0;
    
    // First sort by whether skills are listed
    const hasSkillsA = roleScores.get(a.id)?.hasSkillsListed || false;
    const hasSkillsB = roleScores.get(b.id)?.hasSkillsListed || false;
    
    if (hasSkillsA !== hasSkillsB) {
      return hasSkillsA ? -1 : 1; // Skills listed roles first
    }
    
    // Then sort by score
    const multiplier = direction === 'desc' ? -1 : 1;
    return (scoreB - scoreA) * multiplier;
  });
}

/**
 * Sort roles by date posted (most recent first)
 */
export function sortRolesByDate(
  roles: Role[],
  direction: 'asc' | 'desc' = 'desc'
): Role[] {
  return [...roles].sort((a, b) => {
    // Note: Role interface doesn't have datePosted field yet
    // This is a placeholder implementation
    const dateA = new Date().getTime(); // Placeholder
    const dateB = new Date().getTime(); // Placeholder
    
    const multiplier = direction === 'desc' ? -1 : 1;
    return (dateB - dateA) * multiplier;
  });
}

/**
 * Sort roles by title alphabetically
 */
export function sortRolesByTitle(
  roles: Role[],
  direction: 'asc' | 'desc' = 'asc'
): Role[] {
  return [...roles].sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const titleB = b.title.toLowerCase();
    
    const multiplier = direction === 'desc' ? -1 : 1;
    return titleA.localeCompare(titleB) * multiplier;
  });
}

/**
 * Sort roles by company name alphabetically
 */
export function sortRolesByCompany(
  roles: Role[],
  direction: 'asc' | 'desc' = 'asc'
): Role[] {
  return [...roles].sort((a, b) => {
    const companyA = (a.company?.name || '').toLowerCase();
    const companyB = (b.company?.name || '').toLowerCase();
    
    const multiplier = direction === 'desc' ? -1 : 1;
    return companyA.localeCompare(companyB) * multiplier;
  });
}

/**
 * Apply sorting based on filter options
 */
export function applySorting(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  sortBy: MatchFilterOptions['sortBy'],
  direction: MatchFilterOptions['sortDirection']
): Role[] {
  switch (sortBy) {
    case 'match':
      return sortRolesByMatchScore(roles, roleScores, direction);
    case 'date':
      return sortRolesByDate(roles, direction);
    case 'title':
      return sortRolesByTitle(roles, direction);
    case 'company':
      return sortRolesByCompany(roles, direction);
    default:
      return roles;
  }
}

/**
 * Filter roles by match score range
 */
export function filterRolesByMatchScore(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  minScore: number,
  maxScore: number
): Role[] {
  return roles.filter(role => {
    const matchScore = roleScores.get(role.id);
    
    if (!matchScore) {
      // Include roles without scores if minimum is 0
      return minScore === 0;
    }
    
    return matchScore.overallScore >= minScore && matchScore.overallScore <= maxScore;
  });
}

/**
 * Filter roles that have skills listed
 */
export function filterRolesBySkillsListed(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  requireSkillsListed: boolean
): Role[] {
  if (!requireSkillsListed) {
    return roles;
  }
  
  return roles.filter(role => {
    const matchScore = roleScores.get(role.id);
    return matchScore?.hasSkillsListed === true;
  });
}

/**
 * Filter out roles with no matching potential
 */
export function filterRolesByMatchPotential(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  showOnlyMatches: boolean
): Role[] {
  if (!showOnlyMatches) {
    return roles;
  }
  
  return roles.filter(role => {
    const matchScore = roleScores.get(role.id);
    return matchScore?.hasSkillsListed === true;
  });
}

/**
 * Apply all filters and sorting to roles
 */
export function applyMatchFilters(
  roles: Role[],
  roleScores: Map<string, RoleMatchScore>,
  filters: MatchFilterOptions
): Role[] {
  let filteredRoles = [...roles];
  
  // Apply score range filter
  filteredRoles = filterRolesByMatchScore(
    filteredRoles,
    roleScores,
    filters.minScore,
    filters.maxScore
  );
  
  // Apply skills listed filter
  filteredRoles = filterRolesBySkillsListed(
    filteredRoles,
    roleScores,
    filters.requireSkillsListed
  );
  
  // Apply match potential filter
  filteredRoles = filterRolesByMatchPotential(
    filteredRoles,
    roleScores,
    filters.showOnlyMatches
  );
  
  // Apply sorting
  filteredRoles = applySorting(
    filteredRoles,
    roleScores,
    filters.sortBy,
    filters.sortDirection
  );
  
  return filteredRoles;
}

/**
 * Get filtering statistics
 */
export function getFilteringStats(
  originalRoles: Role[],
  filteredRoles: Role[],
  roleScores: Map<string, RoleMatchScore>
): {
  total: number;
  filtered: number;
  withSkills: number;
  withScores: number;
  averageScore: number;
} {
  const rolesWithSkills = originalRoles.filter(role => 
    roleScores.get(role.id)?.hasSkillsListed === true
  );
  
  const rolesWithScores = originalRoles.filter(role => 
    roleScores.has(role.id) && roleScores.get(role.id)!.hasSkillsListed
  );
  
  const scoresArray = rolesWithScores
    .map(role => roleScores.get(role.id)!.overallScore)
    .filter(score => score > 0);
  
  const averageScore = scoresArray.length > 0 
    ? Math.round(scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length)
    : 0;
  
  return {
    total: originalRoles.length,
    filtered: filteredRoles.length,
    withSkills: rolesWithSkills.length,
    withScores: rolesWithScores.length,
    averageScore
  };
}