// utils/matching/__tests__/skillMatchingService.test.ts
// Unit tests for skill matching service functionality

import { SkillLevel } from '@prisma/client';
import {
  extractRoleSkills,
  calculateRoleMatchScore,
  matchSkills,
  getSkillLevelMultiplier,
  calculateBatchMatchScores,
  sortRolesByMatchScore,
  filterRolesByMinScore,
  getMatchingStatistics,
  defaultMatchingConfig
} from '../skillMatchingService';
import {
  UserSkill,
  SkillSource,
  RoleMatchScore,
  BatchMatchRequest,
  MatchErrorCode
} from '@/types/matching';
import { Role } from '@/types/role';
import { RapidApiJob } from '@/types/rapidapi';

// Mock role data for testing
const createMockRole = (overrides: Partial<Role & RapidApiJob> = {}): Role & RapidApiJob => ({
  id: 'test-role-1',
  title: 'Senior React Developer',
  description: 'We are looking for a skilled React developer with experience in Node.js and TypeScript. The role involves building modern web applications using React, Redux, and working with REST APIs.',
  company: {
    id: 'company-1',
    name: 'Tech Corp',
    industry: 'Technology',
    size: '100-500',
    specialties: ['Web Development', 'React', 'Node.js', 'JavaScript']
  },
  location: 'San Francisco, CA',
  type: 'full-time',
  remote: true,
  salary: '$120,000 - $150,000',
  requirements: ['React', 'TypeScript', 'Node.js', 'Git'],
  skills: [],
  ai_key_skills: [],
  linkedin_org_specialties: [],
  applicationInfo: null,
  ...overrides
});

const createMockUserSkills = (): UserSkill[] => [
  {
    name: 'React',
    level: SkillLevel.ADVANCED,
    categoryId: 'frontend',
    normalized: 'react'
  },
  {
    name: 'TypeScript',
    level: SkillLevel.INTERMEDIATE,
    categoryId: 'programming',
    normalized: 'typescript'
  },
  {
    name: 'JavaScript',
    level: SkillLevel.EXPERT,
    categoryId: 'programming',
    normalized: 'javascript'
  },
  {
    name: 'Node.js',
    level: SkillLevel.BEGINNER,
    categoryId: 'backend',
    normalized: 'node.js'
  },
  {
    name: 'Python',
    level: SkillLevel.ADVANCED,
    categoryId: 'programming',
    normalized: 'python'
  }
];

describe('skillMatchingService', () => {
  describe('extractRoleSkills', () => {
    it('should extract skills from ai_key_skills (Priority 1)', () => {
      const role = createMockRole({
        ai_key_skills: ['React', 'TypeScript', 'Node.js'],
        skills: [{ id: '1', name: 'Angular' }],
        requirements: ['Vue.js'],
        linkedin_org_specialties: ['Java']
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual(['React', 'TypeScript', 'Node.js']);
      expect(result.source).toBe(SkillSource.AI_KEY_SKILLS);
      expect(result.hasSkillsListed).toBe(true);
    });

    it('should extract skills from role.skills (Priority 2) when ai_key_skills is empty', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [
          { id: '1', name: 'Angular' },
          { id: '2', name: 'Vue.js' }
        ],
        requirements: ['React'],
        linkedin_org_specialties: ['Java']
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual(['Angular', 'Vue.js']);
      expect(result.source).toBe(SkillSource.ROLE_SKILLS);
      expect(result.hasSkillsListed).toBe(true);
    });

    it('should extract skills from requirements (Priority 3) when higher priorities are empty', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [],
        requirements: ['React', 'TypeScript', 'Git'],
        linkedin_org_specialties: ['Java']
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual(['React', 'TypeScript', 'Git']);
      expect(result.source).toBe(SkillSource.REQUIREMENTS);
      expect(result.hasSkillsListed).toBe(true);
    });

    it('should extract skills from linkedin_org_specialties (Priority 4) when others are empty', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [],
        requirements: [],
        linkedin_org_specialties: ['Web Development', 'React', 'Node.js']
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual(['Web Development', 'React', 'Node.js']);
      expect(result.source).toBe(SkillSource.LINKEDIN_SPECIALTIES);
      expect(result.hasSkillsListed).toBe(true);
    });

    it('should extract skills from description (Priority 5) when others are empty', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [],
        requirements: [],
        linkedin_org_specialties: [],
        description: 'We need someone with React, TypeScript, and Node.js experience. Must know JavaScript and Docker.'
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toContain('React');
      expect(result.skills).toContain('TypeScript');
      expect(result.skills).toContain('Node.js');
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('Docker');
      expect(result.source).toBe(SkillSource.DESCRIPTION_DERIVED);
      expect(result.hasSkillsListed).toBe(true);
    });

    it('should return no skills when none are found', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [],
        requirements: [],
        linkedin_org_specialties: [],
        description: 'No technical skills mentioned here'
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual([]);
      expect(result.hasSkillsListed).toBe(false);
    });

    it('should filter out invalid skill names', () => {
      const role = createMockRole({
        ai_key_skills: ['React', '', '   ', '123', 'TypeScript'],
        skills: [],
        requirements: [],
        linkedin_org_specialties: []
      });

      const result = extractRoleSkills(role);

      expect(result.skills).toEqual(['React', 'TypeScript']);
      expect(result.hasSkillsListed).toBe(true);
    });
  });

  describe('getSkillLevelMultiplier', () => {
    it('should return correct multipliers for each skill level', () => {
      expect(getSkillLevelMultiplier(SkillLevel.EXPERT)).toBe(1.2);
      expect(getSkillLevelMultiplier(SkillLevel.ADVANCED)).toBe(1.2);
      expect(getSkillLevelMultiplier(SkillLevel.INTERMEDIATE)).toBe(1.0);
      expect(getSkillLevelMultiplier(SkillLevel.BEGINNER)).toBe(0.8);
    });

    it('should use custom config multiplier', () => {
      const customConfig = { ...defaultMatchingConfig, bonusForHighLevelSkills: 1.5 };
      expect(getSkillLevelMultiplier(SkillLevel.EXPERT, customConfig)).toBe(1.5);
      expect(getSkillLevelMultiplier(SkillLevel.ADVANCED, customConfig)).toBe(1.5);
    });
  });

  describe('matchSkills', () => {
    const userSkills = createMockUserSkills();

    it('should match exact skill names', () => {
      const roleSkills = ['React', 'TypeScript', 'Python'];
      const matches = matchSkills(userSkills, roleSkills);

      expect(matches).toHaveLength(3);
      expect(matches.find(m => m.skillName === 'React')?.confidence).toBe(1.0);
      expect(matches.find(m => m.skillName === 'TypeScript')?.confidence).toBe(1.0);
      expect(matches.find(m => m.skillName === 'Python')?.confidence).toBe(1.0);
    });

    it('should match skills with different casing', () => {
      const roleSkills = ['REACT', 'typescript', 'NODE.JS'];
      const matches = matchSkills(userSkills, roleSkills);

      expect(matches).toHaveLength(3);
      expect(matches.find(m => m.skillName === 'REACT')?.confidence).toBe(1.0);
      expect(matches.find(m => m.skillName === 'typescript')?.confidence).toBe(1.0);
      expect(matches.find(m => m.skillName === 'NODE.JS')?.confidence).toBe(1.0);
    });

    it('should handle fuzzy matching for similar skills', () => {
      const roleSkills = ['ReactJS', 'NodeJS', 'Javascript'];
      const matches = matchSkills(userSkills, roleSkills);

      expect(matches.length).toBeGreaterThan(0);
      // These should match with high confidence due to skill normalization
      const reactMatch = matches.find(m => m.skillName === 'ReactJS');
      const nodeMatch = matches.find(m => m.skillName === 'NodeJS');
      const jsMatch = matches.find(m => m.skillName === 'Javascript');

      expect(reactMatch?.confidence).toBeGreaterThan(0.8);
      expect(nodeMatch?.confidence).toBeGreaterThan(0.8);
      expect(jsMatch?.confidence).toBeGreaterThan(0.8);
    });

    it('should not match skills below threshold', () => {
      const roleSkills = ['C++', 'Rust', 'Assembly'];
      const matches = matchSkills(userSkills, roleSkills);

      expect(matches).toHaveLength(0);
    });

    it('should include user skill level in matches', () => {
      const roleSkills = ['React', 'TypeScript'];
      const matches = matchSkills(userSkills, roleSkills);

      const reactMatch = matches.find(m => m.skillName === 'React');
      const tsMatch = matches.find(m => m.skillName === 'TypeScript');

      expect(reactMatch?.userLevel).toBe(SkillLevel.ADVANCED);
      expect(tsMatch?.userLevel).toBe(SkillLevel.INTERMEDIATE);
    });
  });

  describe('calculateRoleMatchScore', () => {
    const userSkills = createMockUserSkills();

    it('should calculate correct score for role with matching skills', () => {
      const role = createMockRole({
        ai_key_skills: ['React', 'TypeScript', 'Node.js']
      });

      const score = calculateRoleMatchScore(userSkills, role);

      expect(score.roleId).toBe('test-role-1');
      expect(score.hasSkillsListed).toBe(true);
      expect(score.skillsMatched).toBe(3);
      expect(score.totalSkills).toBe(3);
      expect(score.overallScore).toBeGreaterThan(80); // High match
      expect(score.matchedSkills).toHaveLength(3);
    });

    it('should return zero score for role with no skills listed', () => {
      const role = createMockRole({
        ai_key_skills: [],
        skills: [],
        requirements: [],
        linkedin_org_specialties: [],
        description: 'No technical skills mentioned'
      });

      const score = calculateRoleMatchScore(userSkills, role);

      expect(score.overallScore).toBe(0);
      expect(score.hasSkillsListed).toBe(false);
      expect(score.skillsMatched).toBe(0);
      expect(score.totalSkills).toBe(0);
    });

    it('should return zero score when user has no skills', () => {
      const role = createMockRole({
        ai_key_skills: ['React', 'TypeScript', 'Node.js']
      });

      const score = calculateRoleMatchScore([], role);

      expect(score.overallScore).toBe(0);
      expect(score.hasSkillsListed).toBe(true);
      expect(score.skillsMatched).toBe(0);
      expect(score.totalSkills).toBe(3);
    });

    it('should apply skill level multipliers correctly', () => {
      // User with EXPERT React skill
      const expertUserSkills: UserSkill[] = [{
        name: 'React',
        level: SkillLevel.EXPERT,
        categoryId: 'frontend',
        normalized: 'react'
      }];

      // User with BEGINNER React skill
      const beginnerUserSkills: UserSkill[] = [{
        name: 'React',
        level: SkillLevel.BEGINNER,
        categoryId: 'frontend',
        normalized: 'react'
      }];

      const role = createMockRole({
        ai_key_skills: ['React']
      });

      const expertScore = calculateRoleMatchScore(expertUserSkills, role);
      const beginnerScore = calculateRoleMatchScore(beginnerUserSkills, role);

      expect(expertScore.overallScore).toBeGreaterThan(beginnerScore.overallScore);
    });

    it('should calculate partial matches correctly', () => {
      const role = createMockRole({
        ai_key_skills: ['React', 'Angular', 'Vue.js', 'Svelte'] // User only has React
      });

      const score = calculateRoleMatchScore(userSkills, role);

      expect(score.skillsMatched).toBe(1);
      expect(score.totalSkills).toBe(4);
      expect(score.overallScore).toBeLessThan(50); // Partial match
    });

    it('should include skill source in matched skills', () => {
      const role = createMockRole({
        requirements: ['React', 'TypeScript']
      });

      const score = calculateRoleMatchScore(userSkills, role);

      expect(score.matchedSkills[0].source).toBe(SkillSource.REQUIREMENTS);
      expect(score.matchedSkills[1].source).toBe(SkillSource.REQUIREMENTS);
    });
  });

  describe('calculateBatchMatchScores', () => {
    const userSkills = createMockUserSkills();

    it('should calculate scores for multiple roles', async () => {
      const roleIds = ['role-1', 'role-2', 'role-3'];
      const roleDataProvider = async (roleId: string) => {
        if (roleId === 'role-1') {
          return createMockRole({ id: 'role-1', ai_key_skills: ['React', 'TypeScript'] });
        }
        if (roleId === 'role-2') {
          return createMockRole({ id: 'role-2', ai_key_skills: ['Python', 'Django'] });
        }
        if (roleId === 'role-3') {
          return createMockRole({ id: 'role-3', ai_key_skills: ['Java', 'Spring'] });
        }
        return null;
      };

      const request: BatchMatchRequest = {
        userId: 'user-1',
        roleIds,
        userSkills
      };

      const result = await calculateBatchMatchScores(request, roleDataProvider);

      expect(result.userId).toBe('user-1');
      expect(result.roleScores).toHaveLength(3);
      expect(result.totalProcessed).toBe(3);
      expect(result.errors).toHaveLength(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);

      // Role 1 should have high score (React + TypeScript match)
      const role1Score = result.roleScores.find(s => s.roleId === 'role-1');
      expect(role1Score?.overallScore).toBeGreaterThan(70);

      // Role 2 should have medium score (Python match)
      const role2Score = result.roleScores.find(s => s.roleId === 'role-2');
      expect(role2Score?.overallScore).toBeGreaterThan(0);
      expect(role2Score?.overallScore).toBeLessThan(role1Score?.overallScore);

      // Role 3 should have low/zero score (no matches)
      const role3Score = result.roleScores.find(s => s.roleId === 'role-3');
      expect(role3Score?.overallScore).toBe(0);
    });

    it('should handle missing roles gracefully', async () => {
      const roleIds = ['role-1', 'missing-role', 'role-3'];
      const roleDataProvider = async (roleId: string) => {
        if (roleId === 'role-1') {
          return createMockRole({ id: 'role-1', ai_key_skills: ['React'] });
        }
        if (roleId === 'role-3') {
          return createMockRole({ id: 'role-3', ai_key_skills: ['Python'] });
        }
        return null; // Missing role
      };

      const request: BatchMatchRequest = {
        userId: 'user-1',
        roleIds,
        userSkills
      };

      const result = await calculateBatchMatchScores(request, roleDataProvider);

      expect(result.roleScores).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].roleId).toBe('missing-role');
      expect(result.errors[0].code).toBe(MatchErrorCode.ROLE_NOT_FOUND);
    });

    it('should handle processing errors', async () => {
      const roleIds = ['role-1'];
      const roleDataProvider = async (roleId: string) => {
        throw new Error('Database connection failed');
      };

      const request: BatchMatchRequest = {
        userId: 'user-1',
        roleIds,
        userSkills
      };

      const result = await calculateBatchMatchScores(request, roleDataProvider);

      expect(result.roleScores).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(MatchErrorCode.PROCESSING_ERROR);
    });
  });

  describe('sortRolesByMatchScore', () => {
    const mockScores: RoleMatchScore[] = [
      {
        roleId: 'role-1',
        overallScore: 85,
        skillsMatched: 3,
        totalSkills: 4,
        matchedSkills: [],
        hasSkillsListed: true,
        breakdown: { skillsScore: 85 }
      },
      {
        roleId: 'role-2',
        overallScore: 95,
        skillsMatched: 4,
        totalSkills: 4,
        matchedSkills: [],
        hasSkillsListed: true,
        breakdown: { skillsScore: 95 }
      },
      {
        roleId: 'role-3',
        overallScore: 0,
        skillsMatched: 0,
        totalSkills: 0,
        matchedSkills: [],
        hasSkillsListed: false,
        breakdown: { skillsScore: 0 }
      }
    ];

    it('should sort by overall score descending', () => {
      const sorted = sortRolesByMatchScore(mockScores);

      expect(sorted[0].roleId).toBe('role-2'); // 95%
      expect(sorted[1].roleId).toBe('role-1'); // 85%
      expect(sorted[2].roleId).toBe('role-3'); // 0%
    });

    it('should sort by skills matched when scores are equal', () => {
      const equalScores = [
        { ...mockScores[0], overallScore: 80, skillsMatched: 2 },
        { ...mockScores[1], overallScore: 80, skillsMatched: 3 }
      ];

      const sorted = sortRolesByMatchScore(equalScores);

      expect(sorted[0].skillsMatched).toBe(3);
      expect(sorted[1].skillsMatched).toBe(2);
    });

    it('should prioritize roles with skills listed', () => {
      const mixedScores = [
        { ...mockScores[2], overallScore: 0, hasSkillsListed: false },
        { ...mockScores[0], overallScore: 0, hasSkillsListed: true }
      ];

      const sorted = sortRolesByMatchScore(mixedScores);

      expect(sorted[0].hasSkillsListed).toBe(true);
      expect(sorted[1].hasSkillsListed).toBe(false);
    });
  });

  describe('filterRolesByMinScore', () => {
    const mockScores: RoleMatchScore[] = [
      { roleId: 'role-1', overallScore: 85, skillsMatched: 3, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 85 } },
      { roleId: 'role-2', overallScore: 45, skillsMatched: 2, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 45 } },
      { roleId: 'role-3', overallScore: 25, skillsMatched: 1, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 25 } }
    ];

    it('should filter roles by minimum score', () => {
      const filtered = filterRolesByMinScore(mockScores, 50);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].roleId).toBe('role-1');
    });

    it('should return empty array when no roles meet threshold', () => {
      const filtered = filterRolesByMinScore(mockScores, 90);

      expect(filtered).toHaveLength(0);
    });

    it('should return all roles when threshold is 0', () => {
      const filtered = filterRolesByMinScore(mockScores, 0);

      expect(filtered).toHaveLength(3);
    });
  });

  describe('getMatchingStatistics', () => {
    const mockScores: RoleMatchScore[] = [
      { roleId: 'role-1', overallScore: 85, skillsMatched: 3, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 85 } },
      { roleId: 'role-2', overallScore: 55, skillsMatched: 2, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 55 } },
      { roleId: 'role-3', overallScore: 25, skillsMatched: 1, totalSkills: 4, matchedSkills: [], hasSkillsListed: true, breakdown: { skillsScore: 25 } },
      { roleId: 'role-4', overallScore: 0, skillsMatched: 0, totalSkills: 0, matchedSkills: [], hasSkillsListed: false, breakdown: { skillsScore: 0 } }
    ];

    it('should calculate correct statistics', () => {
      const stats = getMatchingStatistics(mockScores);

      expect(stats.totalRoles).toBe(4);
      expect(stats.rolesWithSkills).toBe(3);
      expect(stats.rolesWithoutSkills).toBe(1);
      expect(stats.averageScore).toBe(55); // (85 + 55 + 25) / 3
      expect(stats.highScoreRoles).toBe(1); // >70%
      expect(stats.mediumScoreRoles).toBe(1); // 40-70%
      expect(stats.lowScoreRoles).toBe(1); // <40%
    });

    it('should handle empty scores array', () => {
      const stats = getMatchingStatistics([]);

      expect(stats.totalRoles).toBe(0);
      expect(stats.rolesWithSkills).toBe(0);
      expect(stats.rolesWithoutSkills).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.highScoreRoles).toBe(0);
      expect(stats.mediumScoreRoles).toBe(0);
      expect(stats.lowScoreRoles).toBe(0);
    });
  });
});