/**
 * Smart grouping suggestion engine for CV experiences
 * Analyzes experiences to suggest potential merges, nesting, and organization improvements
 */

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  teamSize?: number | null;
  techStack: string[];
  parentId?: string | null;
  displayOrder: number;
}

export interface GroupingSuggestion {
  id: string;
  type: 'merge' | 'nest' | 'reorder';
  confidence: number; // 0-100
  experienceIds: string[];
  reason: string;
  description: string;
  action: {
    targetId?: string;
    parentId?: string;
    childIds?: string[];
  };
}

/**
 * Normalize company names for comparison
 */
function normalizeCompanyName(company: string): string {
  return company
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\b(inc|incorporated|llc|ltd|limited|corp|corporation|company|co)\b/g, '')
    .trim();
}

/**
 * Calculate similarity between two strings (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Check if two date ranges overlap
 */
function datesOverlap(
  start1: string,
  end1: string | null,
  start2: string,
  end2: string | null
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = end1 ? new Date(end1).getTime() : Date.now();
  const s2 = new Date(start2).getTime();
  const e2 = end2 ? new Date(end2).getTime() : Date.now();
  
  return s1 <= e2 && s2 <= e1;
}

/**
 * Check if dates are consecutive (within 3 months)
 */
function datesConsecutive(
  end1: string | null,
  start2: string
): boolean {
  if (!end1) return false;
  
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  
  return Math.abs(s2 - e1) <= threeMonths;
}

/**
 * Analyze tech stack overlap
 */
function techStackSimilarity(tech1: string[], tech2: string[]): number {
  if (tech1.length === 0 || tech2.length === 0) return 0;
  
  const set1 = new Set(tech1.map(t => t.toLowerCase()));
  const set2 = new Set(tech2.map(t => t.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Main function to generate grouping suggestions
 */
export function generateGroupingSuggestions(experiences: Experience[]): GroupingSuggestion[] {
  const suggestions: GroupingSuggestion[] = [];
  let suggestionId = 0;
  
  // Sort experiences by company and date for easier analysis
  const sortedExperiences = [...experiences].sort((a, b) => {
    const companyCompare = a.company.localeCompare(b.company);
    if (companyCompare !== 0) return companyCompare;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // 1. Detect same company with different roles
  const companyGroups = new Map<string, Experience[]>();
  
  sortedExperiences.forEach(exp => {
    const normalizedCompany = normalizeCompanyName(exp.company);
    const group = companyGroups.get(normalizedCompany) || [];
    group.push(exp);
    companyGroups.set(normalizedCompany, group);
  });
  
  // Suggest merging or nesting for same company experiences
  companyGroups.forEach((group, company) => {
    if (group.length > 1) {
      // Check if experiences are consecutive or overlapping
      for (let i = 0; i < group.length - 1; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const exp1 = group[i];
          const exp2 = group[j];
          
          // If dates overlap, suggest merging
          if (datesOverlap(exp1.startDate, exp1.endDate, exp2.startDate, exp2.endDate)) {
            suggestions.push({
              id: `suggestion-${suggestionId++}`,
              type: 'merge',
              confidence: 90,
              experienceIds: [exp1.id, exp2.id],
              reason: 'Overlapping roles at the same company',
              description: `These roles at ${exp1.company} have overlapping dates and could be merged into a single experience.`,
              action: {
                targetId: exp1.id,
              },
            });
          }
          // If dates are consecutive, suggest nesting
          else if (datesConsecutive(exp1.endDate, exp2.startDate)) {
            suggestions.push({
              id: `suggestion-${suggestionId++}`,
              type: 'nest',
              confidence: 85,
              experienceIds: [exp1.id, exp2.id],
              reason: 'Consecutive roles at the same company',
              description: `These consecutive roles at ${exp1.company} could be organized with one as the parent role.`,
              action: {
                parentId: exp2.id, // Make the later role the parent
                childIds: [exp1.id],
              },
            });
          }
        }
      }
      
      // If more than 2 experiences at same company, suggest grouping all
      if (group.length > 2) {
        suggestions.push({
          id: `suggestion-${suggestionId++}`,
          type: 'nest',
          confidence: 80,
          experienceIds: group.map(e => e.id),
          reason: `Multiple roles (${group.length}) at the same company`,
          description: `You have ${group.length} experiences at ${group[0].company}. Consider organizing them under a main role.`,
          action: {
            parentId: group[group.length - 1].id, // Most recent as parent
            childIds: group.slice(0, -1).map(e => e.id),
          },
        });
      }
    }
  });
  
  // 2. Detect similar companies (potential duplicates)
  for (let i = 0; i < sortedExperiences.length - 1; i++) {
    for (let j = i + 1; j < sortedExperiences.length; j++) {
      const exp1 = sortedExperiences[i];
      const exp2 = sortedExperiences[j];
      
      const companySimilarity = stringSimilarity(
        normalizeCompanyName(exp1.company),
        normalizeCompanyName(exp2.company)
      );
      
      // If companies are very similar but not exact match
      if (companySimilarity > 0.8 && companySimilarity < 1) {
        const titleSimilarity = stringSimilarity(exp1.title, exp2.title);
        
        if (titleSimilarity > 0.7) {
          suggestions.push({
            id: `suggestion-${suggestionId++}`,
            type: 'merge',
            confidence: Math.round(companySimilarity * titleSimilarity * 100),
            experienceIds: [exp1.id, exp2.id],
            reason: 'Potential duplicate entries',
            description: `"${exp1.company}" and "${exp2.company}" appear to be the same company with similar roles.`,
            action: {
              targetId: exp1.id,
            },
          });
        }
      }
    }
  }
  
  // 3. Detect experiences with high tech stack overlap
  for (let i = 0; i < sortedExperiences.length - 1; i++) {
    for (let j = i + 1; j < sortedExperiences.length; j++) {
      const exp1 = sortedExperiences[i];
      const exp2 = sortedExperiences[j];
      
      const techSimilarity = techStackSimilarity(exp1.techStack, exp2.techStack);
      
      if (techSimilarity > 0.7) {
        // Check if they're also close in time
        const timeDiff = Math.abs(
          new Date(exp1.startDate).getTime() - new Date(exp2.startDate).getTime()
        );
        const sixMonths = 180 * 24 * 60 * 60 * 1000;
        
        if (timeDiff < sixMonths) {
          suggestions.push({
            id: `suggestion-${suggestionId++}`,
            type: 'merge',
            confidence: Math.round(techSimilarity * 70),
            experienceIds: [exp1.id, exp2.id],
            reason: 'Similar technology stack and timeframe',
            description: `These roles have ${Math.round(techSimilarity * 100)}% tech stack overlap and occurred around the same time.`,
            action: {
              targetId: exp1.id,
            },
          });
        }
      }
    }
  }
  
  // 4. Detect short-term contracts that could be grouped
  const shortTermExperiences = sortedExperiences.filter(exp => {
    if (!exp.endDate && !exp.current) return false;
    const duration = exp.endDate
      ? new Date(exp.endDate).getTime() - new Date(exp.startDate).getTime()
      : Date.now() - new Date(exp.startDate).getTime();
    const sixMonths = 180 * 24 * 60 * 60 * 1000;
    return duration < sixMonths;
  });
  
  if (shortTermExperiences.length >= 3) {
    // Check if they're within a 2-year period
    const firstStart = new Date(shortTermExperiences[0].startDate).getTime();
    const lastEnd = shortTermExperiences[shortTermExperiences.length - 1].endDate
      ? new Date(shortTermExperiences[shortTermExperiences.length - 1].endDate!).getTime()
      : Date.now();
    const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
    
    if (lastEnd - firstStart < twoYears) {
      suggestions.push({
        id: `suggestion-${suggestionId++}`,
        type: 'nest',
        confidence: 70,
        experienceIds: shortTermExperiences.map(e => e.id),
        reason: 'Multiple short-term contracts',
        description: `You have ${shortTermExperiences.length} short-term roles that could be grouped as contract work.`,
        action: {
          // Suggest creating a parent "Contract Work" experience
        },
      });
    }
  }
  
  // Sort suggestions by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Apply a grouping suggestion to the experiences array
 */
export function applySuggestion(
  experiences: Experience[],
  suggestion: GroupingSuggestion
): Experience[] {
  const newExperiences = [...experiences];
  
  switch (suggestion.type) {
    case 'merge':
      // Implementation would call the merge API
      break;
    
    case 'nest':
      if (suggestion.action.parentId && suggestion.action.childIds) {
        suggestion.action.childIds.forEach(childId => {
          const childIndex = newExperiences.findIndex(e => e.id === childId);
          if (childIndex !== -1) {
            newExperiences[childIndex] = {
              ...newExperiences[childIndex],
              parentId: suggestion.action.parentId,
            };
          }
        });
      }
      break;
    
    case 'reorder':
      // Implementation would reorder based on suggestion
      break;
  }
  
  return newExperiences;
}