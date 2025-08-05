// app/api/roles/batch-match/__tests__/route.test.ts
// Integration tests for batch match API endpoint

import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/prisma/prisma';
import { SkillLevel } from '@prisma/client';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/prisma/prisma', () => ({
  prisma: {
    developer: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/utils/matching/skillMatchingService', () => ({
  calculateBatchMatchScores: jest.fn(),
}));

const { calculateBatchMatchScores } = require('@/utils/matching/skillMatchingService');

// Mock session data
const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
};

// Mock developer data
const mockDeveloper = {
  id: 'user-123',
  developerSkills: [
    {
      level: SkillLevel.ADVANCED,
      skill: {
        name: 'React',
        categoryId: 'frontend',
        category: { name: 'Frontend' }
      }
    },
    {
      level: SkillLevel.INTERMEDIATE,
      skill: {
        name: 'TypeScript',
        categoryId: 'programming',
        category: { name: 'Programming Languages' }
      }
    },
    {
      level: SkillLevel.EXPERT,
      skill: {
        name: 'JavaScript',
        categoryId: 'programming',
        category: { name: 'Programming Languages' }
      }
    }
  ]
};

// Mock role data
const mockRolesData = [
  {
    id: 'role-1',
    title: 'Senior React Developer',
    description: 'Looking for React and TypeScript experience',
    ai_key_skills: ['React', 'TypeScript', 'JavaScript'],
    requirements: ['React', 'TypeScript'],
    skills: [],
    linkedin_org_specialties: []
  },
  {
    id: 'role-2',
    title: 'Full Stack Developer',
    description: 'Python and Django experience required',
    ai_key_skills: ['Python', 'Django', 'PostgreSQL'],
    requirements: ['Python', 'Django'],
    skills: [],
    linkedin_org_specialties: []
  },
  {
    id: 'role-3',
    title: 'Frontend Developer',
    description: 'Angular and RxJS experience',
    ai_key_skills: [],
    requirements: [],
    skills: [],
    linkedin_org_specialties: ['Angular', 'RxJS']
  }
];

// Mock batch match response
const mockBatchResponse = {
  userId: 'user-123',
  roleScores: [
    {
      roleId: 'role-1',
      overallScore: 95,
      skillsMatched: 3,
      totalSkills: 3,
      matchedSkills: [
        { skillName: 'React', userLevel: SkillLevel.ADVANCED, matched: true, confidence: 1.0 },
        { skillName: 'TypeScript', userLevel: SkillLevel.INTERMEDIATE, matched: true, confidence: 1.0 },
        { skillName: 'JavaScript', userLevel: SkillLevel.EXPERT, matched: true, confidence: 1.0 }
      ],
      hasSkillsListed: true,
      breakdown: { skillsScore: 95 }
    },
    {
      roleId: 'role-2',
      overallScore: 0,
      skillsMatched: 0,
      totalSkills: 3,
      matchedSkills: [],
      hasSkillsListed: true,
      breakdown: { skillsScore: 0 }
    },
    {
      roleId: 'role-3',
      overallScore: 0,
      skillsMatched: 0,
      totalSkills: 2,
      matchedSkills: [],
      hasSkillsListed: true,
      breakdown: { skillsScore: 0 }
    }
  ],
  totalProcessed: 3,
  processingTime: 150,
  errors: []
};

// Helper function to create mock request
const createMockRequest = (body: any): NextRequest => {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers(),
    url: 'http://localhost:3000/api/roles/batch-match',
    method: 'POST',
  } as unknown as NextRequest;
};

describe('/api/roles/batch-match', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.developer.findUnique as jest.Mock).mockResolvedValue(mockDeveloper);
    (calculateBatchMatchScores as jest.Mock).mockResolvedValue(mockBatchResponse);
  });

  describe('POST /api/roles/batch-match', () => {
    it('should successfully calculate batch match scores', async () => {
      const requestBody = {
        roleIds: ['role-1', 'role-2', 'role-3'],
        rolesData: mockRolesData
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.userId).toBe('user-123');
      expect(responseData.roleScores).toHaveLength(3);
      expect(responseData.totalProcessed).toBe(3);
      expect(responseData.processingTime).toBeGreaterThan(0);
      expect(responseData.errors).toEqual([]);

      // Verify high scoring role
      const role1Score = responseData.roleScores.find((s: any) => s.roleId === 'role-1');
      expect(role1Score.overallScore).toBe(95);
      expect(role1Score.skillsMatched).toBe(3);
      expect(role1Score.hasSkillsListed).toBe(true);

      // Verify zero scoring roles
      const role2Score = responseData.roleScores.find((s: any) => s.roleId === 'role-2');
      expect(role2Score.overallScore).toBe(0);
      expect(role2Score.skillsMatched).toBe(0);
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const requestBody = {
        roleIds: ['role-1'],
        rolesData: [mockRolesData[0]]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });

    it('should return 400 for invalid request data', async () => {
      const requestBody = {
        roleIds: [], // Empty array should fail validation
        rolesData: []
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request data');
      expect(responseData.details).toBeDefined();
    });

    it('should return 400 when rolesData length does not match roleIds', async () => {
      const requestBody = {
        roleIds: ['role-1', 'role-2'],
        rolesData: [mockRolesData[0]] // Only one role data for two IDs
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Role data must be provided for all role IDs');
      expect(responseData.details).toContain('Expected 2 role data objects, got 1');
    });

    it('should return 404 when developer profile is not found', async () => {
      (prisma.developer.findUnique as jest.Mock).mockResolvedValue(null);

      const requestBody = {
        roleIds: ['role-1'],
        rolesData: [mockRolesData[0]]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Developer profile not found');
    });

    it('should handle user with no skills', async () => {
      (prisma.developer.findUnique as jest.Mock).mockResolvedValue({
        ...mockDeveloper,
        developerSkills: []
      });

      const requestBody = {
        roleIds: ['role-1', 'role-2'],
        rolesData: [mockRolesData[0], mockRolesData[1]]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.roleScores).toHaveLength(2);
      
      // All scores should be 0 when user has no skills
      responseData.roleScores.forEach((score: any) => {
        expect(score.overallScore).toBe(0);
        expect(score.skillsMatched).toBe(0);
        expect(score.hasSkillsListed).toBe(false);
      });
    });

    it('should use provided userSkills when included in request', async () => {
      const customUserSkills = [
        {
          name: 'Python',
          level: SkillLevel.EXPERT,
          categoryId: 'programming',
          normalized: 'python'
        }
      ];

      const requestBody = {
        roleIds: ['role-2'],
        rolesData: [mockRolesData[1]],
        userSkills: customUserSkills
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      
      // Verify that calculateBatchMatchScores was called with custom skills
      expect(calculateBatchMatchScores).toHaveBeenCalledWith(
        expect.objectContaining({
          userSkills: customUserSkills
        }),
        expect.any(Function)
      );
    });

    it('should handle batch calculation errors gracefully', async () => {
      (calculateBatchMatchScores as jest.Mock).mockRejectedValue(new Error('Processing failed'));

      const requestBody = {
        roleIds: ['role-1'],
        rolesData: [mockRolesData[0]]
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error calculating batch match scores');
      expect(responseData.details).toBe('Processing failed');
    });

    it('should handle large batch requests (within limits)', async () => {
      const largeRoleIds = Array.from({ length: 50 }, (_, i) => `role-${i}`);
      const largeRolesData = largeRoleIds.map(id => ({
        ...mockRolesData[0],
        id
      }));

      const requestBody = {
        roleIds: largeRoleIds,
        rolesData: largeRolesData
      };

      const mockLargeResponse = {
        ...mockBatchResponse,
        roleScores: largeRoleIds.map(id => ({
          ...mockBatchResponse.roleScores[0],
          roleId: id
        })),
        totalProcessed: 50
      };

      (calculateBatchMatchScores as jest.Mock).mockResolvedValue(mockLargeResponse);

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.roleScores).toHaveLength(50);
      expect(responseData.totalProcessed).toBe(50);
    });

    it('should reject requests exceeding batch limits', async () => {
      const tooManyRoleIds = Array.from({ length: 101 }, (_, i) => `role-${i}`);
      const requestBody = {
        roleIds: tooManyRoleIds,
        rolesData: []
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request data');
    });
  });

  describe('GET /api/roles/batch-match', () => {
    it('should return matching configuration and user stats', async () => {
      const mockDeveloperWithCount = {
        ...mockDeveloper,
        _count: {
          developerSkills: 3
        }
      };

      (prisma.developer.findUnique as jest.Mock).mockResolvedValue(mockDeveloperWithCount);

      const request = {
        url: 'http://localhost:3000/api/roles/batch-match',
        method: 'GET',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.userId).toBe('user-123');
      expect(responseData.userSkillsCount).toBe(3);
      expect(responseData.batchLimits).toEqual({
        maxRolesPerBatch: 100,
        maxBatchesPerMinute: 10
      });
      expect(responseData.matchingConfig).toEqual({
        skillsWeight: 1.0,
        minimumConfidence: 0.7,
        fuzzyMatchThreshold: 0.8,
        minimumScoreThreshold: 0,
        bonusForHighLevelSkills: 1.2
      });
      expect(responseData.scoreRanges).toEqual({
        excellent: { min: 70, max: 100, color: 'green' },
        good: { min: 40, max: 69, color: 'yellow' },
        limited: { min: 0, max: 39, color: 'red' }
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = {
        url: 'http://localhost:3000/api/roles/batch-match',
        method: 'GET',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Authentication required');
    });

    it('should return 404 when developer profile is not found', async () => {
      (prisma.developer.findUnique as jest.Mock).mockResolvedValue(null);

      const request = {
        url: 'http://localhost:3000/api/roles/batch-match',
        method: 'GET',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Developer profile not found');
    });

    it('should handle database errors gracefully', async () => {
      (prisma.developer.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const request = {
        url: 'http://localhost:3000/api/roles/batch-match',
        method: 'GET',
      } as unknown as NextRequest;

      const response = await GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error getting configuration');
      expect(responseData.details).toBe('Database connection failed');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers(),
        url: 'http://localhost:3000/api/roles/batch-match',
        method: 'POST',
      } as unknown as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error calculating batch match scores');
    });

    it('should handle roles with mixed skill data formats', async () => {
      const mixedRolesData = [
        {
          id: 'role-1',
          ai_key_skills: ['React', 'TypeScript'],
          requirements: [],
          skills: [],
          linkedin_org_specialties: []
        },
        {
          id: 'role-2',
          ai_key_skills: [],
          requirements: ['Python', 'Django'],
          skills: [],
          linkedin_org_specialties: []
        },
        {
          id: 'role-3',
          ai_key_skills: [],
          requirements: [],
          skills: [{ id: '1', name: 'Angular' }],
          linkedin_org_specialties: []
        }
      ];

      const requestBody = {
        roleIds: ['role-1', 'role-2', 'role-3'],
        rolesData: mixedRolesData
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(calculateBatchMatchScores).toHaveBeenCalledWith(
        expect.objectContaining({
          roleIds: ['role-1', 'role-2', 'role-3']
        }),
        expect.any(Function)
      );
    });

    it('should handle concurrent requests properly', async () => {
      const requestBody = {
        roleIds: ['role-1'],
        rolesData: [mockRolesData[0]]
      };

      const requests = Array.from({ length: 5 }, () => createMockRequest(requestBody));
      const responses = await Promise.all(requests.map(req => POST(req)));

      responses.forEach(async (response) => {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.userId).toBe('user-123');
      });
    });
  });
});