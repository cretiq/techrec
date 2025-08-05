// utils/matching/simpleSkillMatcher.ts
// Self-contained, simple skill matching module with no dependencies on old code

export interface SimpleMatchResult {
  score: number;
  matchedSkills: string[];
  totalUserSkills: number;
  totalRoleSkills: number;
}

/**
 * Extract all skills from a role - combines all 4 sources
 * 1. role.requirements
 * 2. role.skills (array of objects with .name property)
 * 3. role.company.specialties
 * 4. role.description (extract tech terms)
 */
export function extractAllSkillsFromRole(role: any): string[] {
  const allSkills: string[] = [];
  
  console.log(`[SKILL_EXTRACT_DEBUG] Starting extraction for role ${role.id}:`, {
    roleTitle: role.title,
    hasRequirements: !!role.requirements,
    requirementsType: typeof role.requirements,
    requirementsLength: role.requirements?.length,
    requirementsData: role.requirements,
    hasSkills: !!role.skills,
    skillsType: typeof role.skills,
    skillsLength: role.skills?.length,
    skillsData: role.skills,
    hasCompany: !!role.company,
    hasSpecialties: !!role.company?.specialties,
    specialtiesType: typeof role.company?.specialties,
    specialtiesLength: role.company?.specialties?.length,
    specialtiesData: role.company?.specialties,
    hasDescription: !!role.description,
    descriptionType: typeof role.description,
    descriptionLength: role.description?.length,
    descriptionPreview: role.description?.substring(0, 100)
  });
  
  // 1. Add requirements
  if (role.requirements && Array.isArray(role.requirements)) {
    console.log(`[SKILL_EXTRACT_DEBUG] Adding ${role.requirements.length} requirements:`, role.requirements);
    allSkills.push(...role.requirements);
  }
  
  // 2. Add skills (handle both string[] and {name: string}[] formats)
  if (role.skills && Array.isArray(role.skills)) {
    console.log(`[SKILL_EXTRACT_DEBUG] Processing ${role.skills.length} skills:`, role.skills);
    role.skills.forEach((skill: any, index: number) => {
      if (typeof skill === 'string') {
        console.log(`[SKILL_EXTRACT_DEBUG] Skill ${index}: string format - "${skill}"`);
        allSkills.push(skill);
      } else if (skill && skill.name) {
        console.log(`[SKILL_EXTRACT_DEBUG] Skill ${index}: object format - "${skill.name}"`);
        allSkills.push(skill.name);
      } else {
        console.log(`[SKILL_EXTRACT_DEBUG] Skill ${index}: invalid format -`, skill);
      }
    });
  }
  
  // 3. Add company specialties
  if (role.company?.specialties && Array.isArray(role.company.specialties)) {
    console.log(`[SKILL_EXTRACT_DEBUG] Adding ${role.company.specialties.length} specialties:`, role.company.specialties);
    allSkills.push(...role.company.specialties);
  }
  
  // 4. Extract tech terms from description
  if (role.description && typeof role.description === 'string') {
    const techTerms = extractTechTermsFromDescription(role.description);
    console.log(`[SKILL_EXTRACT_DEBUG] Extracted ${techTerms.length} tech terms from description:`, techTerms);
    allSkills.push(...techTerms);
  }
  
  // Remove duplicates and empty strings
  const uniqueSkills = [...new Set(allSkills.filter(skill => skill && skill.trim().length > 0))];
  
  console.log(`[SKILL_EXTRACT_DEBUG] Final extraction result for role ${role.id}:`, {
    totalSkillsBeforeDedup: allSkills.length,
    totalSkillsAfterDedup: uniqueSkills.length,
    finalSkills: uniqueSkills
  });
  
  return uniqueSkills;
}

/**
 * Simple tech term extraction from job descriptions
 * Looks for common programming languages, frameworks, and tools
 */
export function extractTechTermsFromDescription(description: string): string[] {
  const techTerms: string[] = [];
  
  // Common tech skill patterns
  const patterns = [
    // Programming languages
    /\b(JavaScript|TypeScript|Python|Java|C#|C\+\+|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|Dart|R|MATLAB)\b/gi,
    // Frontend frameworks
    /\b(React|Angular|Vue|Svelte|Ember|jQuery|Bootstrap|Tailwind|Next\.js|Nuxt\.js|Gatsby)\b/gi,
    // Backend frameworks
    /\b(Node\.js|Express|Django|Flask|FastAPI|Spring|Laravel|Rails|ASP\.NET|Gin|Echo)\b/gi,
    // Databases
    /\b(MongoDB|PostgreSQL|MySQL|Redis|SQLite|Oracle|SQL Server|Cassandra|DynamoDB|Elasticsearch)\b/gi,
    // Cloud & DevOps
    /\b(AWS|Azure|Google Cloud|GCP|Docker|Kubernetes|Jenkins|GitLab|CI\/CD|Terraform|Ansible)\b/gi,
    // Other technologies
    /\b(Git|REST|GraphQL|API|Microservices|Agile|Scrum|TDD|Linux|Windows|MacOS)\b/gi,
    // Common abbreviations
    /\b(JS|TS|SQL|NoSQL|HTML|CSS|SASS|SCSS|XML|JSON|YAML)\b/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      // Normalize common abbreviations to uppercase
      const normalizedMatches = matches.map(match => {
        const upper = match.toUpperCase();
        if (['JS', 'TS', 'SQL', 'API', 'REST', 'XML', 'JSON', 'YAML', 'HTML', 'CSS'].includes(upper)) {
          return upper;
        }
        return match;
      });
      techTerms.push(...normalizedMatches);
    }
  });
  
  // Also check for common tech terms that might not be caught by patterns
  const commonTerms = ['frontend', 'backend', 'fullstack', 'full-stack', 'database', 'cloud', 'devops', 'mobile', 'web', 'testing'];
  
  commonTerms.forEach(term => {
    if (description.toLowerCase().includes(term)) {
      techTerms.push(term);
    }
  });
  
  // Special case for API - check for both API and api
  if (description.toLowerCase().includes('api')) {
    techTerms.push('API');
  }
  
  return [...new Set(techTerms)]; // Remove duplicates
}

/**
 * Calculate simple match score between user skills and role skills
 * Score = (number of matched skills / total user skills) * 100
 */
export function calculateSimpleMatch(userSkills: string[], role: any): SimpleMatchResult {
  console.log(`[SIMPLE_MATCH_DEBUG] Starting calculation for role ${role.id}:`, {
    roleTitle: role.title,
    userSkillsCount: userSkills.length,
    userSkills: userSkills
  });
  
  // Extract all skills from the role
  const roleSkills = extractAllSkillsFromRole(role);
  
  console.log(`[SIMPLE_MATCH_DEBUG] Role skills extracted:`, {
    roleSkillsCount: roleSkills.length,
    roleSkills: roleSkills
  });
  
  // Normalize for case-insensitive matching
  const normalizedRoleSkills = roleSkills.map(skill => skill.toLowerCase().trim());
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
  
  console.log(`[SIMPLE_MATCH_DEBUG] Normalized skills:`, {
    normalizedRoleSkills,
    normalizedUserSkills
  });
  
  // Find matches
  const matchedSkills: string[] = [];
  
  userSkills.forEach((userSkill, index) => {
    const normalizedUserSkill = normalizedUserSkills[index];
    const isMatch = normalizedRoleSkills.includes(normalizedUserSkill);
    console.log(`[SIMPLE_MATCH_DEBUG] Checking user skill "${userSkill}" -> "${normalizedUserSkill}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    
    if (isMatch) {
      matchedSkills.push(userSkill); // Keep original casing
    }
  });
  
  // Calculate percentage score
  const score = userSkills.length > 0 
    ? Math.round((matchedSkills.length / userSkills.length) * 100)
    : 0;
  
  const result = {
    score,
    matchedSkills,
    totalUserSkills: userSkills.length,
    totalRoleSkills: roleSkills.length
  };
  
  console.log(`[SIMPLE_MATCH_DEBUG] Final calculation result:`, {
    roleId: role.id,
    score: result.score,
    matchedSkillsCount: result.matchedSkills.length,
    matchedSkills: result.matchedSkills,
    totalUserSkills: result.totalUserSkills,
    totalRoleSkills: result.totalRoleSkills,
    calculation: `${result.matchedSkills.length}/${result.totalUserSkills} * 100 = ${result.score}%`
  });
  
  return result;
}

/**
 * Debug helper to log role skill extraction
 */
export function debugRoleSkills(role: any): void {
  console.log(`[SIMPLE_MATCH_DEBUG] Role ${role.id || 'unknown'}:`, {
    title: role.title,
    requirements: role.requirements?.length || 0,
    skills: role.skills?.length || 0,
    specialties: role.company?.specialties?.length || 0,
    hasDescription: !!role.description,
    extractedTotal: extractAllSkillsFromRole(role).length,
    extractedSkills: extractAllSkillsFromRole(role).slice(0, 10) // First 10
  });
}