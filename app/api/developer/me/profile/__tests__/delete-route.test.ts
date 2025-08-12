/**
 * API Route Handler Tests for /api/developer/me/profile DELETE endpoint
 * 
 * These tests validate that the profile deletion API:
 * 1. Handles authentication and authorization correctly
 * 2. Deletes all CV-related data atomically via transaction
 * 3. Removes S3 files associated with CVs
 * 4. Preserves gamification data (XP, points, badges)
 * 5. Handles errors gracefully with proper HTTP status codes
 * 6. Maintains data integrity during deletion
 * 
 * This is a critical API used by the CV re-upload functionality.
 */

import { DELETE } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { deleteFileFromS3 } from '@/utils/s3Storage';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/utils/s3Storage', () => ({
  deleteFileFromS3: jest.fn(),
}));

// The Prisma client is already mocked in jest.setup.ts
const mockPrismaClient = require('@prisma/client').PrismaClient();
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeleteFileFromS3 = deleteFileFromS3 as jest.MockedFunction<typeof deleteFileFromS3>;

describe('/api/developer/me/profile DELETE endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all Prisma mocks
    Object.keys(mockPrismaClient).forEach(key => {
      if (mockPrismaClient[key] && typeof mockPrismaClient[key] === 'object') {
        Object.keys(mockPrismaClient[key]).forEach(method => {
          if (typeof mockPrismaClient[key][method] === 'function') {
            mockPrismaClient[key][method].mockReset();
          }
        });
      }
    });
    
    // Reset transaction mock
    mockPrismaClient.$transaction.mockReset();
    
    // Reset S3 mock
    mockDeleteFileFromS3.mockReset();
  });

  const createMockCVs = () => [
    {
      id: 'cv-1',
      s3Key: 'cvs/user-123/cv1.pdf',
      filename: 'resume.pdf'
    },
    {
      id: 'cv-2', 
      s3Key: 'cvs/user-123/cv2.docx',
      filename: 'resume-v2.docx'
    }
  ];

  describe('Authentication & Authorization', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockPrismaClient.$transaction).not.toHaveBeenCalled();
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user ID', async () => {
      mockGetServerSession.mockResolvedValue({ user: null });

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('proceeds when user is properly authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' }
      };
      
      mockGetServerSession.mockResolvedValue(mockSession);
      
      // Mock successful deletion
      const mockCVs = createMockCVs();
      const mockDeletionCounts = {
        cvs: { count: 2 },
        skills: { count: 5 },
        experience: { count: 3 },
        education: { count: 2 },
        achievements: { count: 1 },
        contactInfo: { count: 1 },
        personalProjects: { count: 2 },
        personalProjectPortfolios: { count: 1 }
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: {
            deleteMany: jest.fn().mockResolvedValue({ count: 5 })
          },
          experience: {
            deleteMany: jest.fn().mockResolvedValue({ count: 3 })
          },
          education: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          achievement: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          contactInfo: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          personalProject: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          personalProjectPortfolio: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          developer: {
            update: jest.fn().mockResolvedValue({ id: 'user-123' })
          }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
    });
  });

  describe('Database Deletion Operations', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('deletes all CV-related data atomically', async () => {
      const mockCVs = createMockCVs();
      let transactionCallback;

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        transactionCallback = callback;
        
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: {
            deleteMany: jest.fn().mockResolvedValue({ count: 5 })
          },
          experience: {
            deleteMany: jest.fn().mockResolvedValue({ count: 3 })
          },
          education: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          achievement: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          contactInfo: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          personalProject: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          personalProjectPortfolio: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
          },
          developer: {
            update: jest.fn().mockResolvedValue({ id: 'user-123' })
          }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deletedCounts).toEqual({
        cvs: 2,
        skills: 5,
        experience: 3,
        education: 2,
        achievements: 1,
        contactInfo: 1,
        personalProjects: 2,
        personalProjectPortfolios: 1
      });
    });

    it('retrieves CV S3 keys before deletion', async () => {
      const mockCVs = createMockCVs();
      let findManyCall;

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockImplementation((query) => {
              findManyCall = query;
              return Promise.resolve(mockCVs);
            }),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      await DELETE(request);

      expect(findManyCall).toEqual({
        where: { developerId: 'user-123' },
        select: { id: true, s3Key: true, filename: true }
      });
    });

    it('resets profile fields while preserving gamification data', async () => {
      let developerUpdateCall;

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: {
            update: jest.fn().mockImplementation((query) => {
              developerUpdateCall = query;
              return Promise.resolve({ id: 'user-123' });
            })
          }
        };
        
        return callback(mockTx);
      });

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      await DELETE(request);

      expect(developerUpdateCall).toEqual({
        where: { id: 'user-123' },
        data: {
          title: null,
          profileEmail: null,
          about: null,
          // Gamification data is intentionally preserved
        }
      });
    });

    it('ensures all deletion operations target the correct developer', async () => {
      const developerId = 'user-123';
      const deletionQueries = [];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['cV', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          developerSkill: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['developerSkill', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          experience: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['experience', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          education: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['education', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          achievement: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['achievement', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          contactInfo: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['contactInfo', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          personalProject: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['personalProject', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          personalProjectPortfolio: {
            deleteMany: jest.fn().mockImplementation((query) => {
              deletionQueries.push(['personalProjectPortfolio', query]);
              return Promise.resolve({ count: 0 });
            })
          },
          developer: { update: jest.fn().mockResolvedValue({ id: developerId }) }
        };
        
        return callback(mockTx);
      });

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      await DELETE(request);

      // Verify all deletions target the same developer
      deletionQueries.forEach(([table, query]) => {
        expect(query.where).toEqual({ developerId });
      });
    });
  });

  describe('S3 File Deletion', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('deletes all S3 files associated with CVs', async () => {
      const mockCVs = createMockCVs();

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(2);
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/cv1.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/cv2.docx');
      
      expect(data.s3FilesDeleted).toBe(2);
      expect(data.s3FilesFailed).toBe(0);
    });

    it('handles S3 deletion failures gracefully', async () => {
      const mockCVs = createMockCVs();

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      // First file succeeds, second fails
      mockDeleteFileFromS3
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('S3 deletion failed'));

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Database operation still succeeded
      expect(data.s3FilesDeleted).toBe(1);
      expect(data.s3FilesFailed).toBe(1);
      expect(data.success).toBe(true);
    });

    it('skips S3 deletion for CVs without s3Key', async () => {
      const mockCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/cv1.pdf', filename: 'resume.pdf' },
        { id: 'cv-2', s3Key: null, filename: 'legacy-cv.txt' }, // No S3 key
      ];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(1);
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/cv1.pdf');
      expect(data.s3FilesDeleted).toBe(1);
    });
  });

  describe('Error Handling', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('handles database transaction failures', async () => {
      mockPrismaClient.$transaction.mockRejectedValue(new Error('Transaction failed'));

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to clear profile data');
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });

    it('handles Prisma constraint errors', async () => {
      const constraintError = new Error('Foreign key constraint violation');
      constraintError.name = 'PrismaClientKnownRequestError';
      (constraintError as any).code = 'P2003';
      
      mockPrismaClient.$transaction.mockRejectedValue(constraintError);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to clear profile data');
    });

    it('continues execution even if S3 deletion fails', async () => {
      const mockCVs = createMockCVs();

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mockCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      // All S3 deletions fail
      mockDeleteFileFromS3.mockRejectedValue(new Error('S3 service unavailable'));

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      // Database deletion still succeeds
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCounts.cvs).toBe(2);
      expect(data.s3FilesDeleted).toBe(0);
      expect(data.s3FilesFailed).toBe(2);
    });

    it('handles empty CV list gracefully', async () => {
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn().mockResolvedValue({ count: 0 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.s3FilesDeleted).toBe(0);
      expect(data.s3FilesFailed).toBe(0);
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });
  });

  describe('Data Integrity Validation', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' }
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('confirms comprehensive data deletion coverage', async () => {
      const mockCVs = createMockCVs();
      const tableCalls = [];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {};
        
        // Track all deleteMany calls
        const tables = [
          'cV', 'developerSkill', 'experience', 'education', 'achievement', 
          'contactInfo', 'personalProject', 'personalProjectPortfolio'
        ];
        
        tables.forEach(table => {
          mockTx[table] = {
            deleteMany: jest.fn().mockImplementation((query) => {
              tableCalls.push(table);
              return Promise.resolve({ count: 1 });
            })
          };
          
          if (table === 'cV') {
            mockTx[table].findMany = jest.fn().mockResolvedValue(mockCVs);
          }
        });
        
        mockTx['developer'] = {
          update: jest.fn().mockResolvedValue({ id: 'user-123' })
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      // Verify all CV-related tables are cleared
      const expectedTables = [
        'cV', 'developerSkill', 'experience', 'education', 
        'achievement', 'contactInfo', 'personalProject', 'personalProjectPortfolio'
      ];
      
      expectedTables.forEach(table => {
        expect(tableCalls).toContain(table);
      });
      
      // Verify response includes all deletion counts
      expect(data.deletedCounts).toHaveProperty('cvs');
      expect(data.deletedCounts).toHaveProperty('skills');
      expect(data.deletedCounts).toHaveProperty('experience');
      expect(data.deletedCounts).toHaveProperty('education');
      expect(data.deletedCounts).toHaveProperty('achievements');
      expect(data.deletedCounts).toHaveProperty('contactInfo');
      expect(data.deletedCounts).toHaveProperty('personalProjects');
      expect(data.deletedCounts).toHaveProperty('personalProjectPortfolios');
    });
  });
});