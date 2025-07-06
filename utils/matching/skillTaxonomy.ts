// utils/matching/skillTaxonomy.ts
// Skill normalization and taxonomy for matching system

import { SkillAlias } from '@/types/matching';

// Skill alias mapping for normalization
export const skillAliases: SkillAlias[] = [
  // JavaScript variants
  {
    canonical: 'JavaScript',
    aliases: ['javascript', 'js', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'ecmascript']
  },
  
  // React variants
  {
    canonical: 'React',
    aliases: ['react', 'reactjs', 'react.js', 'react js', 'react-js']
  },
  
  // Node.js variants
  {
    canonical: 'Node.js',
    aliases: ['nodejs', 'node.js', 'node js', 'node-js', 'node']
  },
  
  // TypeScript variants
  {
    canonical: 'TypeScript',
    aliases: ['typescript', 'ts', 'type script']
  },
  
  // Angular variants
  {
    canonical: 'Angular',
    aliases: ['angular', 'angularjs', 'angular.js', 'angular js', 'angular2', 'angular 2', 'angular4', 'angular 4']
  },
  
  // Vue.js variants
  {
    canonical: 'Vue.js',
    aliases: ['vue', 'vuejs', 'vue.js', 'vue js', 'vue-js']
  },
  
  // Python variants
  {
    canonical: 'Python',
    aliases: ['python', 'python3', 'python 3', 'py']
  },
  
  // Java variants
  {
    canonical: 'Java',
    aliases: ['java', 'java8', 'java 8', 'java11', 'java 11', 'java17', 'java 17']
  },
  
  // C# variants
  {
    canonical: 'C#',
    aliases: ['c#', 'csharp', 'c sharp', 'c-sharp', '.net', 'dotnet']
  },
  
  // C++ variants
  {
    canonical: 'C++',
    aliases: ['c++', 'cpp', 'c plus plus', 'c-plus-plus']
  },
  
  // PHP variants
  {
    canonical: 'PHP',
    aliases: ['php', 'php7', 'php 7', 'php8', 'php 8']
  },
  
  // Ruby variants
  {
    canonical: 'Ruby',
    aliases: ['ruby', 'ruby on rails', 'rails', 'ror']
  },
  
  // Go variants
  {
    canonical: 'Go',
    aliases: ['go', 'golang', 'go-lang']
  },
  
  // Rust variants
  {
    canonical: 'Rust',
    aliases: ['rust', 'rust-lang', 'rustlang']
  },
  
  // Swift variants
  {
    canonical: 'Swift',
    aliases: ['swift', 'swift5', 'swift 5', 'ios swift']
  },
  
  // Kotlin variants
  {
    canonical: 'Kotlin',
    aliases: ['kotlin', 'kotlin/jvm', 'kotlin jvm']
  },
  
  // Database variants
  {
    canonical: 'SQL',
    aliases: ['sql', 'structured query language', 'mysql', 'postgresql', 'postgres', 'sqlite', 'sql server', 'oracle sql']
  },
  
  {
    canonical: 'MongoDB',
    aliases: ['mongodb', 'mongo', 'mongo db']
  },
  
  {
    canonical: 'Redis',
    aliases: ['redis', 'redis cache', 'redis-cache']
  },
  
  // AWS variants
  {
    canonical: 'AWS',
    aliases: ['aws', 'amazon web services', 'amazon aws', 'aws cloud']
  },
  
  // Docker variants
  {
    canonical: 'Docker',
    aliases: ['docker', 'containerization', 'containers', 'docker-compose', 'docker compose']
  },
  
  // Kubernetes variants
  {
    canonical: 'Kubernetes',
    aliases: ['kubernetes', 'k8s', 'k8', 'kube']
  },
  
  // Git variants
  {
    canonical: 'Git',
    aliases: ['git', 'github', 'gitlab', 'bitbucket', 'version control']
  },
  
  // CI/CD variants
  {
    canonical: 'CI/CD',
    aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'continuous delivery', 'jenkins', 'travis ci', 'github actions']
  },
  
  // Testing variants
  {
    canonical: 'Testing',
    aliases: ['testing', 'unit testing', 'integration testing', 'test driven development', 'tdd', 'jest', 'cypress', 'selenium']
  },
  
  // Agile variants
  {
    canonical: 'Agile',
    aliases: ['agile', 'scrum', 'kanban', 'agile methodology', 'agile development']
  },
  
  // Next.js variants
  {
    canonical: 'Next.js',
    aliases: ['nextjs', 'next.js', 'next js', 'next-js']
  },
  
  // Express.js variants
  {
    canonical: 'Express.js',
    aliases: ['express', 'expressjs', 'express.js', 'express js', 'express-js']
  },
  
  // GraphQL variants
  {
    canonical: 'GraphQL',
    aliases: ['graphql', 'graph ql', 'apollo', 'apollo graphql']
  },
  
  // REST API variants
  {
    canonical: 'REST API',
    aliases: ['rest', 'rest api', 'restful', 'restful api', 'api development']
  },
  
  // Redux variants
  {
    canonical: 'Redux',
    aliases: ['redux', 'redux toolkit', 'redux-toolkit', 'rtk']
  },
  
  // TailwindCSS variants
  {
    canonical: 'TailwindCSS',
    aliases: ['tailwind', 'tailwindcss', 'tailwind css', 'tailwind-css']
  },
  
  // Bootstrap variants
  {
    canonical: 'Bootstrap',
    aliases: ['bootstrap', 'bootstrap4', 'bootstrap 4', 'bootstrap5', 'bootstrap 5']
  },
  
  // Sass/SCSS variants
  {
    canonical: 'Sass',
    aliases: ['sass', 'scss', 'sass/scss', 'syntactically awesome stylesheets']
  },
  
  // Machine Learning variants
  {
    canonical: 'Machine Learning',
    aliases: ['ml', 'machine learning', 'artificial intelligence', 'ai', 'deep learning', 'neural networks']
  },
  
  // Data Science variants
  {
    canonical: 'Data Science',
    aliases: ['data science', 'data analysis', 'data analytics', 'pandas', 'numpy', 'jupyter']
  }
];

// Create a Map for fast lookup of canonical skill names
export const skillNormalizationMap = new Map<string, string>();

// Populate the normalization map
skillAliases.forEach(alias => {
  // Add canonical name mapping to itself
  skillNormalizationMap.set(alias.canonical.toLowerCase(), alias.canonical);
  
  // Add all aliases mapping to canonical
  alias.aliases.forEach(aliasName => {
    skillNormalizationMap.set(aliasName.toLowerCase(), alias.canonical);
  });
});

/**
 * Normalize a skill name to its canonical form
 * @param skillName - The skill name to normalize
 * @returns The canonical skill name or the original if no mapping exists
 */
export function normalizeSkillName(skillName: string): string {
  const normalized = skillNormalizationMap.get(skillName.toLowerCase());
  return normalized || skillName;
}

/**
 * Get all possible aliases for a skill name
 * @param skillName - The skill name to get aliases for
 * @returns Array of all aliases including the canonical form
 */
export function getSkillAliases(skillName: string): string[] {
  const canonical = normalizeSkillName(skillName);
  const skillAlias = skillAliases.find(alias => alias.canonical === canonical);
  
  if (skillAlias) {
    return [skillAlias.canonical, ...skillAlias.aliases];
  }
  
  return [skillName];
}

/**
 * Calculate string similarity using Levenshtein distance
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score between 0 and 1
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  return 1 - (distance / maxLength);
}

/**
 * Fuzzy match skill names using normalized forms and similarity scoring
 * @param userSkill - User's skill name
 * @param roleSkill - Role's skill name
 * @param threshold - Minimum similarity threshold (default: 0.8)
 * @returns Object with match status, confidence, and canonical forms
 */
export function fuzzyMatchSkills(
  userSkill: string,
  roleSkill: string,
  threshold: number = 0.8
): {
  matched: boolean;
  confidence: number;
  userCanonical: string;
  roleCanonical: string;
} {
  // Normalize both skills
  const userCanonical = normalizeSkillName(userSkill);
  const roleCanonical = normalizeSkillName(roleSkill);
  
  // Exact match after normalization
  if (userCanonical.toLowerCase() === roleCanonical.toLowerCase()) {
    return {
      matched: true,
      confidence: 1.0,
      userCanonical,
      roleCanonical
    };
  }
  
  // Calculate similarity
  const similarity = calculateStringSimilarity(
    userCanonical.toLowerCase(),
    roleCanonical.toLowerCase()
  );
  
  return {
    matched: similarity >= threshold,
    confidence: similarity,
    userCanonical,
    roleCanonical
  };
}

/**
 * Validate if a skill name is potentially valid (not empty, reasonable length)
 * @param skillName - The skill name to validate
 * @returns True if the skill name appears valid
 */
export function isValidSkillName(skillName: string): boolean {
  return Boolean(
    skillName &&
    skillName.trim().length > 0 &&
    skillName.trim().length <= 100 &&
    !/^\d+$/.test(skillName.trim()) // Not just numbers
  );
}

/**
 * Clean and prepare skill name for matching
 * @param skillName - The skill name to clean
 * @returns Cleaned skill name
 */
export function cleanSkillName(skillName: string): string {
  return skillName
    .trim()
    .replace(/[^\w\s\-\.#\+]/gi, '') // Remove special chars except common ones
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}