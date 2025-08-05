// utils/matching/__tests__/simpleSkillMatcher.test.ts
// Tests for the simple skill matcher module

import {
  extractAllSkillsFromRole,
  extractTechTermsFromDescription,
  calculateSimpleMatch,
  SimpleMatchResult
} from '../simpleSkillMatcher';

describe('simpleSkillMatcher', () => {
  describe('extractAllSkillsFromRole', () => {
    it('should extract skills from all 4 sources', () => {
      const role = {
        id: 'test-role-1',
        title: 'Full Stack Developer',
        requirements: ['React', 'Node.js'],
        skills: [
          { id: 's1', name: 'JavaScript' },
          { id: 's2', name: 'TypeScript' }
        ],
        company: {
          name: 'Tech Corp',
          specialties: ['Web Development', 'Cloud Computing']
        },
        description: 'Looking for someone with MongoDB and Docker experience.'
      };
      
      const extracted = extractAllSkillsFromRole(role);
      
      // From requirements
      expect(extracted).toContain('React');
      expect(extracted).toContain('Node.js');
      
      // From skills
      expect(extracted).toContain('JavaScript');
      expect(extracted).toContain('TypeScript');
      
      // From company specialties
      expect(extracted).toContain('Web Development');
      expect(extracted).toContain('Cloud Computing');
      
      // From description
      expect(extracted).toContain('MongoDB');
      expect(extracted).toContain('Docker');
    });
    
    it('should handle missing fields gracefully', () => {
      const minimalRole = {
        id: 'test-role-2',
        title: 'Developer'
      };
      
      const extracted = extractAllSkillsFromRole(minimalRole);
      expect(extracted).toEqual([]);
    });
    
    it('should handle skills as string array', () => {
      const role = {
        skills: ['Python', 'Django', 'PostgreSQL']
      };
      
      const extracted = extractAllSkillsFromRole(role);
      expect(extracted).toContain('Python');
      expect(extracted).toContain('Django');
      expect(extracted).toContain('PostgreSQL');
    });
    
    it('should remove duplicates', () => {
      const role = {
        requirements: ['React', 'JavaScript'],
        skills: [{ name: 'React' }, { name: 'JavaScript' }],
        description: 'React and JavaScript required'
      };
      
      const extracted = extractAllSkillsFromRole(role);
      const reactCount = extracted.filter(skill => skill === 'React').length;
      const jsCount = extracted.filter(skill => skill === 'JavaScript').length;
      
      expect(reactCount).toBe(1);
      expect(jsCount).toBe(1);
    });
  });
  
  describe('extractTechTermsFromDescription', () => {
    it('should extract programming languages', () => {
      const description = 'We need JavaScript, Python, and Java developers';
      const terms = extractTechTermsFromDescription(description);
      
      expect(terms).toContain('JavaScript');
      expect(terms).toContain('Python');
      expect(terms).toContain('Java');
    });
    
    it('should extract frameworks and tools', () => {
      const description = 'Experience with React, Node.js, Docker, and AWS required';
      const terms = extractTechTermsFromDescription(description);
      
      expect(terms).toContain('React');
      expect(terms).toContain('Node.js');
      expect(terms).toContain('Docker');
      expect(terms).toContain('AWS');
    });
    
    it('should extract common abbreviations', () => {
      const description = 'Must know JS, TS, SQL, and work with REST APIs';
      const terms = extractTechTermsFromDescription(description);
      
      expect(terms).toContain('JS');
      expect(terms).toContain('TS');
      expect(terms).toContain('SQL');
      expect(terms).toContain('REST');
      expect(terms).toContain('API');
    });
    
    it('should handle descriptions with no tech terms', () => {
      const description = 'We are looking for a motivated individual to join our team';
      const terms = extractTechTermsFromDescription(description);
      
      expect(terms).toHaveLength(0);
    });
  });
  
  describe('calculateSimpleMatch', () => {
    it('should calculate correct match percentage', () => {
      const userSkills = ['React', 'JavaScript', 'Node.js', 'CSS'];
      const role = {
        requirements: ['React', 'JavaScript'],
        skills: [{ name: 'CSS' }],
        company: { specialties: [] },
        description: ''
      };
      
      const result = calculateSimpleMatch(userSkills, role);
      
      expect(result.score).toBe(75); // 3 out of 4 skills match
      expect(result.matchedSkills).toHaveLength(3);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('JavaScript');
      expect(result.matchedSkills).toContain('CSS');
      expect(result.totalUserSkills).toBe(4);
      expect(result.totalRoleSkills).toBe(3);
    });
    
    it('should handle case-insensitive matching', () => {
      const userSkills = ['react', 'JAVASCRIPT'];
      const role = {
        requirements: ['React', 'JavaScript']
      };
      
      const result = calculateSimpleMatch(userSkills, role);
      
      expect(result.score).toBe(100);
      expect(result.matchedSkills).toHaveLength(2);
    });
    
    it('should return 0 when no skills match', () => {
      const userSkills = ['React', 'JavaScript'];
      const role = {
        requirements: ['Python', 'Django']
      };
      
      const result = calculateSimpleMatch(userSkills, role);
      
      expect(result.score).toBe(0);
      expect(result.matchedSkills).toHaveLength(0);
    });
    
    it('should handle empty user skills', () => {
      const userSkills: string[] = [];
      const role = {
        requirements: ['React', 'JavaScript']
      };
      
      const result = calculateSimpleMatch(userSkills, role);
      
      expect(result.score).toBe(0);
      expect(result.totalUserSkills).toBe(0);
      expect(result.totalRoleSkills).toBe(2);
    });
    
    it('should work with realistic job data', () => {
      const userSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];
      
      const role = {
        id: 'real-job-1',
        title: 'Senior Full Stack Developer',
        requirements: ['React', 'TypeScript', 'Node.js'],
        skills: [
          { id: '1', name: 'JavaScript' },
          { id: '2', name: 'CSS' },
          { id: '3', name: 'HTML' }
        ],
        company: {
          name: 'Tech Startup',
          specialties: ['Web Development', 'SaaS', 'Cloud Computing']
        },
        description: `
          We are looking for a Senior Full Stack Developer to join our team.
          You should have strong experience with React, TypeScript, and Node.js.
          Experience with PostgreSQL, Docker, and AWS is highly valued.
          We use modern JavaScript and follow agile development practices.
        `
      };
      
      const result = calculateSimpleMatch(userSkills, role);
      
      // Should match: React, TypeScript, Node.js, PostgreSQL, Docker from various sources
      expect(result.score).toBe(100); // All 5 user skills match
      expect(result.matchedSkills).toHaveLength(5);
      expect(result.matchedSkills).toContain('React');
      expect(result.matchedSkills).toContain('TypeScript');
      expect(result.matchedSkills).toContain('Node.js');
      expect(result.matchedSkills).toContain('PostgreSQL');
      expect(result.matchedSkills).toContain('Docker');
    });
  });
});