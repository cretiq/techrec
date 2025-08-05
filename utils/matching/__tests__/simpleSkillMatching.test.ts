// utils/matching/__tests__/simpleSkillMatching.test.ts
// Unit tests for simple skill matching calculation - extracting from all 4 sources

import { SkillLevel } from '@prisma/client';

// Simple skill matching functions we'll implement
function extractAllRoleSkills(role: any): string[] {
  const allSkills: string[] = [];
  
  // 1. Add requirements
  if (role.requirements && Array.isArray(role.requirements)) {
    allSkills.push(...role.requirements);
  }
  
  // 2. Add skills (extract .name from skill objects)
  if (role.skills && Array.isArray(role.skills)) {
    role.skills.forEach((skill: any) => {
      if (skill && skill.name) {
        allSkills.push(skill.name);
      }
    });
  }
  
  // 3. Add company specialties
  if (role.company?.specialties && Array.isArray(role.company.specialties)) {
    allSkills.push(...role.company.specialties);
  }
  
  // 4. Extract words from description
  if (role.description && typeof role.description === 'string') {
    const descriptionWords = extractWordsFromDescription(role.description);
    allSkills.push(...descriptionWords);
  }
  
  // Remove duplicates and filter out empty strings
  return [...new Set(allSkills.filter(skill => skill && skill.trim().length > 0))];
}

function extractWordsFromDescription(description: string): string[] {
  // Simple approach: extract potential tech skills from description
  const techSkillPatterns = [
    // Programming languages
    /\b(JavaScript|TypeScript|Python|Java|React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|MongoDB|PostgreSQL|MySQL|Redis|AWS|Azure|Docker|Kubernetes|Git|CSS|HTML|GraphQL|REST|API)\b/gi,
    // More specific patterns
    /\b(JS|TS|ReactJS|NodeJS|VueJS|AngularJS|Next\.js|Nuxt\.js|Laravel|Rails|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|C\+\+|C#|\.NET)\b/gi
  ];
  
  const extractedSkills: string[] = [];
  
  techSkillPatterns.forEach(pattern => {
    const matches = description.match(pattern);
    if (matches) {
      extractedSkills.push(...matches);
    }
  });
  
  // Also look for common tech terms in the description
  const commonTechTerms = ['frontend', 'backend', 'fullstack', 'full-stack', 'database', 'api', 'microservices', 'cloud', 'devops', 'ci/cd', 'testing', 'agile', 'scrum'];
  
  commonTechTerms.forEach(term => {
    if (description.toLowerCase().includes(term)) {
      extractedSkills.push(term);
    }
  });
  
  return [...new Set(extractedSkills)]; // Remove duplicates
}

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim();
}

function calculateSimpleMatchScore(userSkills: string[], role: any): {
  overallScore: number;
  matchedSkills: string[];
  totalRoleSkills: number;
  totalUserSkills: number;
} {
  const roleSkills = extractAllRoleSkills(role);
  const userSkillsNormalized = userSkills.map(normalizeSkill);
  const roleSkillsNormalized = roleSkills.map(normalizeSkill);
  
  const matchedSkills: string[] = [];
  
  userSkills.forEach(userSkill => {
    const normalizedUserSkill = normalizeSkill(userSkill);
    if (roleSkillsNormalized.includes(normalizedUserSkill)) {
      matchedSkills.push(userSkill);
    }
  });
  
  const score = userSkills.length > 0 
    ? Math.round((matchedSkills.length / userSkills.length) * 100)
    : 0;
  
  return {
    overallScore: score,
    matchedSkills,
    totalRoleSkills: roleSkills.length,
    totalUserSkills: userSkills.length
  };
}

describe('Simple Skill Matching Calculation', () => {
  describe('extractAllRoleSkills', () => {
    it('should extract skills from all 4 sources and combine them', () => {
      const role = {
        requirements: ['React', 'TypeScript'],
        skills: [{ name: 'JavaScript' }, { name: 'CSS' }],
        company: { specialties: ['Web Development', 'Frontend Development'] },
        description: 'We need Node.js developers with MongoDB experience and Docker knowledge. Must have API development skills.'
      };
      
      const extractedSkills = extractAllRoleSkills(role);
      
      // Should contain skills from all sources
      expect(extractedSkills).toContain('React');              // from requirements
      expect(extractedSkills).toContain('TypeScript');         // from requirements
      expect(extractedSkills).toContain('JavaScript');         // from skills
      expect(extractedSkills).toContain('CSS');                // from skills
      expect(extractedSkills).toContain('Web Development');    // from company specialties
      expect(extractedSkills).toContain('Frontend Development'); // from company specialties
      expect(extractedSkills).toContain('Node.js');            // from description
      expect(extractedSkills).toContain('MongoDB');            // from description
      expect(extractedSkills).toContain('Docker');             // from description
      expect(extractedSkills).toContain('API');                // from description
      
      // Should have no duplicates
      const uniqueSkills = [...new Set(extractedSkills)];
      expect(extractedSkills.length).toBe(uniqueSkills.length);
    });
    
    it('should handle empty or missing fields gracefully', () => {
      const role = {
        requirements: [],
        skills: null,
        company: null,
        description: ''
      };
      
      const extractedSkills = extractAllRoleSkills(role);
      expect(extractedSkills).toEqual([]);
    });
    
    it('should extract skills from requirements only when other fields are missing', () => {
      const role = {
        requirements: ['Python', 'Django', 'PostgreSQL'],
        // missing other fields
      };
      
      const extractedSkills = extractAllRoleSkills(role);
      expect(extractedSkills).toContain('Python');
      expect(extractedSkills).toContain('Django');
      expect(extractedSkills).toContain('PostgreSQL');
      expect(extractedSkills).toHaveLength(3);
    });
    
    it('should extract skills from description only when other fields are empty', () => {
      const role = {
        requirements: [],
        skills: [],
        company: { specialties: [] },
        description: 'Looking for React developers with TypeScript and Node.js experience. Must know JavaScript and have AWS cloud knowledge.'
      };
      
      const extractedSkills = extractAllRoleSkills(role);
      expect(extractedSkills).toContain('React');
      expect(extractedSkills).toContain('TypeScript');
      expect(extractedSkills).toContain('Node.js');
      expect(extractedSkills).toContain('JavaScript');
      expect(extractedSkills).toContain('AWS');
    });
    
    it('should handle skill objects with missing name property', () => {
      const role = {
        requirements: ['React'],
        skills: [
          { name: 'JavaScript' },
          { id: '123' }, // missing name
          null,
          { name: 'CSS' }
        ]
      };
      
      const extractedSkills = extractAllRoleSkills(role);
      expect(extractedSkills).toContain('React');
      expect(extractedSkills).toContain('JavaScript');
      expect(extractedSkills).toContain('CSS');
      expect(extractedSkills).toHaveLength(3);
    });
  });
  
  describe('calculateSimpleMatchScore', () => {
    it('should calculate different scores for different roles', () => {
      const userSkills = ['React', 'TypeScript', 'JavaScript', 'CSS'];
      
      const reactRole = {
        requirements: ['React', 'TypeScript'],
        skills: [{ name: 'JavaScript' }],
        company: { specialties: ['Frontend Development'] },
        description: 'React developer needed with modern JavaScript and CSS styling'
      };
      
      const pythonRole = {
        requirements: ['Python', 'Django'],
        skills: [{ name: 'PostgreSQL' }],
        company: { specialties: ['Backend Development'] },
        description: 'Python backend developer with database experience and REST API knowledge'
      };
      
      const reactScore = calculateSimpleMatchScore(userSkills, reactRole);
      const pythonScore = calculateSimpleMatchScore(userSkills, pythonRole);
      
      expect(reactScore.overallScore).toBeGreaterThan(pythonScore.overallScore);
      expect(reactScore.overallScore).toBeGreaterThan(50); // Should be high match
      expect(pythonScore.overallScore).toBeLessThan(25);   // Should be low match
      
      // Check matched skills
      expect(reactScore.matchedSkills).toContain('React');
      expect(reactScore.matchedSkills).toContain('TypeScript');
      expect(reactScore.matchedSkills).toContain('JavaScript');
      expect(reactScore.matchedSkills).toContain('CSS');
      
      expect(pythonScore.matchedSkills).toHaveLength(0); // No matches
    });
    
    it('should calculate 100% score when all user skills match role skills', () => {
      const userSkills = ['React', 'TypeScript', 'JavaScript'];
      
      const perfectMatchRole = {
        requirements: ['React', 'TypeScript', 'JavaScript'],
        skills: [],
        company: { specialties: [] },
        description: ''
      };
      
      const result = calculateSimpleMatchScore(userSkills, perfectMatchRole);
      expect(result.overallScore).toBe(100);
      expect(result.matchedSkills).toHaveLength(3);
      expect(result.matchedSkills).toEqual(expect.arrayContaining(['React', 'TypeScript', 'JavaScript']));
    });
    
    it('should calculate 0% score when no skills match', () => {
      const userSkills = ['React', 'TypeScript', 'JavaScript'];
      
      const noMatchRole = {
        requirements: ['Python', 'Django'],
        skills: [{ name: 'PostgreSQL' }],
        company: { specialties: ['Backend Development'] },
        description: 'Python and database development only'
      };
      
      const result = calculateSimpleMatchScore(userSkills, noMatchRole);
      expect(result.overallScore).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });
    
    it('should calculate partial matches correctly', () => {
      const userSkills = ['React', 'TypeScript', 'JavaScript', 'Python']; // 4 skills
      
      const partialMatchRole = {
        requirements: ['React', 'Angular'], // 1 match
        skills: [{ name: 'Vue' }], // 0 matches
        company: { specialties: ['Frontend Development'] }, // 0 matches
        description: 'We need TypeScript developers' // 1 match
      };
      
      const result = calculateSimpleMatchScore(userSkills, partialMatchRole);
      expect(result.overallScore).toBe(50); // 2 out of 4 skills match = 50%
      expect(result.matchedSkills).toHaveLength(2);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('TypeScript');
    });
    
    it('should handle case-insensitive matching', () => {
      const userSkills = ['react', 'typescript', 'javascript'];
      
      const roleWithDifferentCasing = {
        requirements: ['REACT', 'TypeScript'],
        skills: [{ name: 'Javascript' }],
        company: { specialties: [] },
        description: ''
      };
      
      const result = calculateSimpleMatchScore(userSkills, roleWithDifferentCasing);
      expect(result.overallScore).toBe(100); // All should match despite different casing
      expect(result.matchedSkills).toHaveLength(3);
    });
    
    it('should work with realistic job descriptions', () => {
      const userSkills = ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'];
      
      const realisticRole = {
        requirements: ['React', 'TypeScript'],
        skills: [
          { name: 'JavaScript' }, 
          { name: 'CSS' },
          { name: 'HTML' }
        ],
        company: { 
          specialties: ['Web Development', 'Software Development', 'Technology Consulting'] 
        },
        description: `
          We are looking for a Full Stack Developer to join our team. 
          The ideal candidate will have experience with React, Node.js, and MongoDB.
          You should be proficient in modern JavaScript and TypeScript.
          Experience with REST APIs, Docker, and AWS is a plus.
          This is a remote-friendly position for someone passionate about web development.
        `
      };
      
      const result = calculateSimpleMatchScore(userSkills, realisticRole);
      
      // Should have high score since user has React, Node.js, MongoDB, JavaScript, TypeScript
      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('Node.js');
      expect(result.matchedSkills).toContain('MongoDB');
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('TypeScript');
    });
    
    it('should handle empty user skills', () => {
      const userSkills: string[] = [];
      
      const role = {
        requirements: ['React', 'TypeScript'],
        skills: [{ name: 'JavaScript' }],
        company: { specialties: ['Frontend Development'] },
        description: 'React developer position'
      };
      
      const result = calculateSimpleMatchScore(userSkills, role);
      expect(result.overallScore).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });
    
    it('should provide detailed match information', () => {
      const userSkills = ['React', 'TypeScript', 'Python'];
      
      const role = {
        requirements: ['React', 'Angular'],
        skills: [{ name: 'JavaScript' }],
        company: { specialties: ['Web Development'] },
        description: 'TypeScript development required'
      };
      
      const result = calculateSimpleMatchScore(userSkills, role);
      
      expect(result.totalUserSkills).toBe(3);
      expect(result.totalRoleSkills).toBeGreaterThan(0);
      expect(result.matchedSkills).toEqual(expect.arrayContaining(['React', 'TypeScript']));
      expect(result.overallScore).toBe(Math.round((2/3) * 100)); // 67%
    });
  });
  
  describe('extractWordsFromDescription', () => {
    it('should extract technical skills from job descriptions', () => {
      const description = `
        We are seeking a Senior Full Stack Developer with expertise in React, Node.js, and MongoDB.
        The ideal candidate should have experience with TypeScript, Express, and REST APIs.
        Knowledge of Docker, AWS, and PostgreSQL is highly valued.
        Experience with GraphQL and microservices architecture is a plus.
      `;
      
      const extractedWords = extractWordsFromDescription(description);
      
      expect(extractedWords).toContain('React');
      expect(extractedWords).toContain('Node.js');
      expect(extractedWords).toContain('MongoDB');
      expect(extractedWords).toContain('TypeScript');
      expect(extractedWords).toContain('Express');
      expect(extractedWords).toContain('REST');
      expect(extractedWords).toContain('Docker');
      expect(extractedWords).toContain('AWS');
      expect(extractedWords).toContain('PostgreSQL');
      expect(extractedWords).toContain('GraphQL');
      expect(extractedWords).toContain('microservices');
    });
    
    it('should handle descriptions with no technical terms', () => {
      const description = 'We are a great company looking for talented individuals to join our team.';
      const extractedWords = extractWordsFromDescription(description);
      expect(extractedWords).toHaveLength(0);
    });
    
    it('should extract common tech abbreviations', () => {
      const description = 'Looking for JS, TS, and API development experience with CI/CD knowledge.';
      const extractedWords = extractWordsFromDescription(description);
      
      expect(extractedWords).toContain('JS');
      expect(extractedWords).toContain('TS');
      expect(extractedWords).toContain('API');
      expect(extractedWords).toContain('ci/cd');
    });
  });
});