/**
 * Integration Test: CV Deletion Flow
 * 
 * Tests the critical CV deletion functionality used by re-upload:
 * 1. User has existing CV data across multiple tables
 * 2. DELETE /api/developer/me/profile clears all CV data atomically
 * 3. S3 files are properly cleaned up
 * 4. Gamification data is preserved
 * 
 * This validates the core deletion logic without external dependencies.
 */

import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/developer/me/profile/route';
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

const mockPrismaClient = require('@prisma/client').PrismaClient();
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeleteFileFromS3 = deleteFileFromS3 as jest.MockedFunction<typeof deleteFileFromS3>;

describe('CV Deletion Integration Flow', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

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
    
    mockPrismaClient.$transaction.mockReset();
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  describe('Real-World CV Deletion Scenarios', () => {
    it('handles developer with comprehensive CV data', async () => {
      // === Simulate a power user with lots of CV data ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/resume-v1.pdf', filename: 'resume-v1.pdf' },
        { id: 'cv-2', s3Key: 'cvs/user-123/resume-v2.pdf', filename: 'resume-v2.pdf' },
        { id: 'cv-3', s3Key: 'cvs/user-123/cv-final.docx', filename: 'cv-final.docx' }
      ];

      const comprehensiveDeletionCounts = {
        cvs: { count: 3 },
        skills: { count: 15 },       // Multiple programming languages
        experience: { count: 8 },    // Long career history
        education: { count: 3 },     // Multiple degrees
        achievements: { count: 12 }, // Certifications and awards
        contactInfo: { count: 1 },   // Standard contact info
        personalProjects: { count: 5 }, // Multiple side projects
        personalProjectPortfolios: { count: 3 } // Enhanced projects
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {};
        
        Object.keys(comprehensiveDeletionCounts).forEach(key => {
          const tableName = key === 'cvs' ? 'cV' : 
                           key === 'skills' ? 'developerSkill' :
                           key === 'achievements' ? 'achievement' :
                           key === 'personalProjects' ? 'personalProject' :
                           key === 'personalProjectPortfolios' ? 'personalProjectPortfolio' :
                           key;
          
          mockTx[tableName] = {
            deleteMany: jest.fn().mockResolvedValue(comprehensiveDeletionCounts[key])
          };
          
          if (tableName === 'cV') {
            mockTx[tableName].findMany = jest.fn().mockResolvedValue(existingCVs);
          }
        });
        
        mockTx['developer'] = {
          update: jest.fn().mockResolvedValue({ id: 'user-123' })
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      // === Execute comprehensive deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate comprehensive cleanup ===
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
      
      // All data should be properly counted and cleared
      expect(deleteData.deletedCounts).toEqual({
        cvs: 3,
        skills: 15,
        experience: 8,
        education: 3,
        achievements: 12,
        contactInfo: 1,
        personalProjects: 5,
        personalProjectPortfolios: 3
      });

      // All S3 files should be deleted
      expect(deleteData.s3FilesDeleted).toBe(3);
      expect(deleteData.s3FilesFailed).toBe(0);
      
      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(3);
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/resume-v1.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/resume-v2.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/cv-final.docx');
    });

    it('handles mixed S3 success and failure scenarios', async () => {
      // === Real-world scenario: Some S3 files exist, some don't ===
      const mixedCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/exists.pdf', filename: 'exists.pdf' },
        { id: 'cv-2', s3Key: 'cvs/user-123/deleted-externally.pdf', filename: 'gone.pdf' },
        { id: 'cv-3', s3Key: 'cvs/user-123/corrupt.pdf', filename: 'corrupt.pdf' },
        { id: 'cv-4', s3Key: null, filename: 'legacy-no-s3.txt' } // Legacy CV without S3
      ];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(mixedCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 4 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 8 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 4 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      // Mixed S3 deletion results
      mockDeleteFileFromS3
        .mockResolvedValueOnce(undefined) // exists.pdf - success
        .mockRejectedValueOnce(new Error('NoSuchKey: File not found')) // deleted-externally.pdf - not found
        .mockRejectedValueOnce(new Error('AccessDenied: Permission denied')); // corrupt.pdf - permission error

      // === Execute deletion with mixed results ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate graceful handling of mixed results ===
      expect(deleteResponse.status).toBe(200); // Database operations still succeed
      expect(deleteData.success).toBe(true);
      expect(deleteData.deletedCounts.cvs).toBe(4);
      
      // S3 results should reflect partial success
      expect(deleteData.s3FilesDeleted).toBe(1); // Only exists.pdf succeeded
      expect(deleteData.s3FilesFailed).toBe(2);  // Two S3 operations failed

      // Only 3 S3 operations attempted (null s3Key skipped)
      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(3);
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/exists.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/deleted-externally.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/corrupt.pdf');
      expect(mockDeleteFileFromS3).not.toHaveBeenCalledWith(null);
    });

    it('validates transaction rollback on database errors', async () => {
      // === Setup scenario where database transaction fails ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/will-not-be-deleted.pdf', filename: 'safe.pdf' }
      ];

      // Simulate constraint violation during deletion
      mockPrismaClient.$transaction.mockRejectedValue(
        Object.assign(new Error('Foreign key constraint failed'), {
          name: 'PrismaClientKnownRequestError',
          code: 'P2003'
        })
      );

      // === Execute deletion that should fail ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate transaction rollback behavior ===
      expect(deleteResponse.status).toBe(500);
      expect(deleteData.error).toBe('Failed to clear profile data');
      
      // S3 deletion should NOT be attempted when database transaction fails
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
      
      // This prevents orphaned S3 files when database operations fail
    });

    it('confirms data integrity across related tables', async () => {
      // === Test complex relationships and cascade behavior ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/relationship-test.pdf', filename: 'test.pdf' }
      ];

      let operationOrder = [];
      const trackOperation = (operation) => {
        operationOrder.push(operation);
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          // Primary CV data
          cV: {
            findMany: jest.fn().mockImplementation(() => {
              trackOperation('find-cvs');
              return Promise.resolve(existingCVs);
            }),
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-cvs');
              return Promise.resolve({ count: 1 });
            })
          },
          
          // Profile-related data (should be deleted)
          developerSkill: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-skills');
              return Promise.resolve({ count: 5 });
            })
          },
          experience: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-experience');
              return Promise.resolve({ count: 2 });
            })
          },
          education: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-education');
              return Promise.resolve({ count: 1 });
            })
          },
          achievement: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-achievements');
              return Promise.resolve({ count: 3 });
            })
          },
          contactInfo: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-contact');
              return Promise.resolve({ count: 1 });
            })
          },
          personalProject: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-personal-projects');
              return Promise.resolve({ count: 1 });
            })
          },
          personalProjectPortfolio: {
            deleteMany: jest.fn().mockImplementation(() => {
              trackOperation('delete-portfolios');
              return Promise.resolve({ count: 1 });
            })
          },
          
          // Profile reset (should preserve gamification)
          developer: {
            update: jest.fn().mockImplementation(() => {
              trackOperation('reset-profile-fields');
              return Promise.resolve({ id: 'user-123' });
            })
          }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockImplementation(() => {
        trackOperation('delete-s3-file');
        return Promise.resolve(undefined);
      });

      // === Execute operation and track sequence ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);

      // === Validate operation sequence and data integrity ===
      expect(deleteResponse.status).toBe(200);
      
      // Database operations should happen in transaction first
      expect(operationOrder.indexOf('find-cvs')).toBeLessThan(operationOrder.indexOf('delete-s3-file'));
      expect(operationOrder.indexOf('delete-cvs')).toBeLessThan(operationOrder.indexOf('delete-s3-file'));
      expect(operationOrder.indexOf('reset-profile-fields')).toBeLessThan(operationOrder.indexOf('delete-s3-file'));
      
      // All CV-related data should be deleted
      const cvRelatedOperations = [
        'delete-cvs', 'delete-skills', 'delete-experience', 'delete-education',
        'delete-achievements', 'delete-contact', 'delete-personal-projects', 'delete-portfolios'
      ];
      
      cvRelatedOperations.forEach(operation => {
        expect(operationOrder).toContain(operation);
      });
      
      // S3 cleanup should happen after successful database transaction
      expect(operationOrder).toContain('delete-s3-file');
    });
  });

  describe('Production Scenarios', () => {
    it('handles large-scale deletion efficiently', async () => {
      // === Simulate enterprise user with extensive data ===
      const enterpriseCVs = Array.from({ length: 10 }, (_, i) => ({
        id: `cv-${i + 1}`,
        s3Key: `cvs/user-123/enterprise-cv-${i + 1}.pdf`,
        filename: `enterprise-cv-${i + 1}.pdf`
      }));

      const largeDeletionCounts = {
        cvs: { count: 10 },
        skills: { count: 50 },        // Extensive skill set
        experience: { count: 20 },     // Long career with many positions
        education: { count: 5 },       // Multiple degrees and certifications
        achievements: { count: 30 },   // Many awards and certifications
        contactInfo: { count: 1 },
        personalProjects: { count: 15 }, // Many side projects
        personalProjectPortfolios: { count: 8 }
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(enterpriseCVs),
            deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.cvs)
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.skills) },
          experience: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.experience) },
          education: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.education) },
          achievement: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.achievements) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.contactInfo) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.personalProjects) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue(largeDeletionCounts.personalProjectPortfolios) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      // === Execute large-scale deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate efficient large-scale handling ===
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
      
      // Verify all data is properly counted
      expect(deleteData.deletedCounts.cvs).toBe(10);
      expect(deleteData.deletedCounts.skills).toBe(50);
      expect(deleteData.deletedCounts.experience).toBe(20);
      expect(deleteData.deletedCounts.personalProjects).toBe(15);
      
      // All S3 files should be cleaned up
      expect(deleteData.s3FilesDeleted).toBe(10);
      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(10);
    });

    it('handles edge case: user with no CV data', async () => {
      // === Test deletion when user has no data to delete ===
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

      // === Execute deletion on empty profile ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate graceful empty state handling ===
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
      
      // All counts should be zero
      Object.values(deleteData.deletedCounts).forEach(count => {
        expect(count).toBe(0);
      });
      
      expect(deleteData.s3FilesDeleted).toBe(0);
      expect(deleteData.s3FilesFailed).toBe(0);
      expect(mockDeleteFileFromS3).not.toHaveBeenCalled();
    });
  });
});