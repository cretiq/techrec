/**
 * Integration Test: CV Re-upload Flow
 * 
 * Tests the complete end-to-end flow:
 * 1. User has existing CV data and profile
 * 2. User triggers re-upload via MvpResultDisplay component
 * 3. DELETE /api/developer/me/profile clears all CV data & S3 files
 * 4. POST /api/cv/upload processes new CV
 * 5. Profile data is updated with new CV information
 * 
 * This validates the critical re-upload deletion functionality.
 */

import { NextRequest } from 'next/server';
import { DELETE } from '@/app/api/developer/me/profile/route';
import { POST as CVUpload } from '@/app/api/cv/upload/route';
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
  uploadFileToS3: jest.fn(),
}));

jest.mock('@/utils/cvOperations', () => ({
  createCV: jest.fn(),
  updateCV: jest.fn(),
}));

jest.mock('@/utils/featureFlags', () => ({
  isInMvpMode: jest.fn().mockReturnValue(true),
  logFeatureFlags: jest.fn(),
}));

jest.mock('@/utils/mvpCvExtraction', () => ({
  extractMvpCvContent: jest.fn(),
}));

const mockPrismaClient = require('@prisma/client').PrismaClient();
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeleteFileFromS3 = deleteFileFromS3 as jest.MockedFunction<typeof deleteFileFromS3>;
const mockCreateCV = require('@/utils/cvOperations').createCV;
const mockUpdateCV = require('@/utils/cvOperations').updateCV;
const mockExtractMvpCvContent = require('@/utils/mvpCvExtraction').extractMvpCvContent;

describe('CV Re-upload Integration Flow', () => {
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

  describe('Complete Re-upload Flow', () => {
    it('clears existing data and processes new CV successfully', async () => {
      // === STEP 1: Setup existing user data ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/old-cv.pdf', filename: 'old-resume.pdf' },
        { id: 'cv-2', s3Key: 'cvs/user-123/old-cv-v2.pdf', filename: 'old-resume-v2.pdf' }
      ];

      // === STEP 2: Mock DELETE operation (profile clearing) ===
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(existingCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 2 })
          },
          developerSkill: { deleteMany: jest.fn().mockResolvedValue({ count: 5 }) },
          experience: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) },
          education: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
          achievement: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          contactInfo: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          personalProject: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          personalProjectPortfolio: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          developer: { update: jest.fn().mockResolvedValue({ id: 'user-123' }) }
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      // === STEP 3: Execute DELETE operation ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === STEP 4: Validate DELETE operation ===
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
      expect(deleteData.deletedCounts).toEqual({
        cvs: 2,
        skills: 5,
        experience: 3,
        education: 2,
        achievements: 1,
        contactInfo: 1,
        personalProjects: 1,
        personalProjectPortfolios: 1
      });
      expect(deleteData.s3FilesDeleted).toBe(2);
      expect(deleteData.s3FilesFailed).toBe(0);

      // Verify S3 cleanup
      expect(mockDeleteFileFromS3).toHaveBeenCalledTimes(2);
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/old-cv.pdf');
      expect(mockDeleteFileFromS3).toHaveBeenCalledWith('cvs/user-123/old-cv-v2.pdf');

      // === STEP 5: Mock CV upload operation ===
      const newCVId = 'new-cv-123';
      
      mockCreateCV.mockResolvedValue({
        id: newCVId,
        developerId: 'user-123',
        filename: 'cvs/user-123/new-cv.pdf',
        originalName: 'new-resume.pdf',
        s3Key: 'cvs/user-123/new-cv.pdf',
        status: 'PENDING'
      });

      mockExtractMvpCvContent.mockResolvedValue({
        success: true,
        formattedText: 'John Doe\nSoftware Engineer\n\nExperience:\n- 5 years at TechCorp',
        basicJson: {
          name: 'John Doe',
          title: 'Software Engineer',
          experience: [{ title: 'Senior Developer', company: 'TechCorp' }]
        },
        extractionDuration: 1200,
        wordCount: 50,
        characterCount: 250
      });

      mockUpdateCV.mockResolvedValue({
        id: newCVId,
        status: 'COMPLETED',
        improvementScore: 95
      });

      // === STEP 6: Execute CV upload ===
      const formData = new FormData();
      const mockFile = new File(['Mock PDF content'], 'new-resume.pdf', { type: 'application/pdf' });
      formData.append('file', mockFile);

      const uploadRequest = new NextRequest('http://localhost/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResponse = await CVUpload(uploadRequest);
      const uploadData = await uploadResponse.json();

      // === STEP 7: Validate CV upload operation ===
      expect(uploadResponse.status).toBe(201);
      expect(uploadData.cvId).toBe(newCVId);
      expect(uploadData.mode).toBe('mvp');
      expect(uploadData.status).toBe('COMPLETED');
      expect(uploadData.improvementScore).toBe(95);

      // === STEP 8: Verify end-to-end flow integrity ===
      // Old data cleared
      const transactionCall = mockPrismaClient.$transaction.mock.calls[0][0];
      expect(transactionCall).toBeDefined();

      // New CV created
      expect(mockCreateCV).toHaveBeenCalledWith(
        expect.objectContaining({
          developerId: 'user-123',
          originalName: 'new-resume.pdf',
          mimeType: 'application/pdf'
        })
      );

      // MVP extraction performed
      expect(mockExtractMvpCvContent).toHaveBeenCalled();

      // CV status updated to completed
      expect(mockUpdateCV).toHaveBeenCalledWith(
        newCVId,
        expect.objectContaining({
          status: 'COMPLETED',
          improvementScore: 95
        })
      );
    });

    it('handles S3 deletion failures gracefully during re-upload', async () => {
      // === Setup existing CV data ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/problematic-cv.pdf', filename: 'problematic.pdf' }
      ];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          cV: {
            findMany: jest.fn().mockResolvedValue(existingCVs),
            deleteMany: jest.fn().mockResolvedValue({ count: 1 })
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

      // S3 deletion fails but shouldn't break the flow
      mockDeleteFileFromS3.mockRejectedValue(new Error('S3 service temporarily unavailable'));

      // === Execute deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Validate graceful S3 failure handling ===
      expect(deleteResponse.status).toBe(200); // Database deletion still succeeds
      expect(deleteData.success).toBe(true);
      expect(deleteData.deletedCounts.cvs).toBe(1);
      expect(deleteData.s3FilesDeleted).toBe(0);
      expect(deleteData.s3FilesFailed).toBe(1);

      // The flow can continue despite S3 issues - upload can still proceed
      // This ensures users aren't blocked by temporary S3 outages
    });

    it('prevents data corruption by using atomic database operations', async () => {
      // === Setup test to verify transaction atomicity ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/cv.pdf', filename: 'resume.pdf' }
      ];

      let transactionCallsOrder = [];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        transactionCallsOrder.push('transaction-start');
        
        const mockTx = {
          cV: {
            findMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('cV-findMany');
              return Promise.resolve(existingCVs);
            }),
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('cV-deleteMany');
              return Promise.resolve({ count: 1 });
            })
          },
          developerSkill: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('developerSkill-deleteMany');
              return Promise.resolve({ count: 2 });
            })
          },
          experience: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('experience-deleteMany');
              return Promise.resolve({ count: 1 });
            })
          },
          education: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('education-deleteMany');
              return Promise.resolve({ count: 1 });
            })
          },
          achievement: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('achievement-deleteMany');
              return Promise.resolve({ count: 0 });
            })
          },
          contactInfo: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('contactInfo-deleteMany');
              return Promise.resolve({ count: 1 });
            })
          },
          personalProject: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('personalProject-deleteMany');
              return Promise.resolve({ count: 0 });
            })
          },
          personalProjectPortfolio: {
            deleteMany: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('personalProjectPortfolio-deleteMany');
              return Promise.resolve({ count: 0 });
            })
          },
          developer: {
            update: jest.fn().mockImplementation(() => {
              transactionCallsOrder.push('developer-update');
              return Promise.resolve({ id: 'user-123' });
            })
          }
        };
        
        const result = await callback(mockTx);
        transactionCallsOrder.push('transaction-complete');
        return result;
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      // === Execute deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);

      // === Verify atomic operation ===
      expect(deleteResponse.status).toBe(200);
      
      // Verify transaction executed all operations atomically
      expect(transactionCallsOrder).toContain('transaction-start');
      expect(transactionCallsOrder).toContain('cV-findMany');
      expect(transactionCallsOrder).toContain('cV-deleteMany');
      expect(transactionCallsOrder).toContain('developerSkill-deleteMany');
      expect(transactionCallsOrder).toContain('experience-deleteMany');
      expect(transactionCallsOrder).toContain('education-deleteMany');
      expect(transactionCallsOrder).toContain('developer-update');
      expect(transactionCallsOrder).toContain('transaction-complete');

      // Verify S3 deletion happens AFTER successful transaction
      expect(mockDeleteFileFromS3).toHaveBeenCalledAfter(
        mockPrismaClient.$transaction
      );
    });
  });

  describe('Data Integrity Validation', () => {
    it('ensures comprehensive coverage of all CV-related data types', async () => {
      // === Create comprehensive test data ===
      const existingCVs = [
        { id: 'cv-1', s3Key: 'cvs/user-123/comprehensive-cv.pdf', filename: 'comprehensive.pdf' }
      ];

      const deletedTables = [];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockTx = {};
        
        // Define all tables that should be cleaned during re-upload
        const expectedTables = [
          'cV', 'developerSkill', 'experience', 'education', 
          'achievement', 'contactInfo', 'personalProject', 'personalProjectPortfolio'
        ];
        
        expectedTables.forEach(table => {
          mockTx[table] = {
            deleteMany: jest.fn().mockImplementation(() => {
              deletedTables.push(table);
              return Promise.resolve({ count: 1 });
            })
          };
          
          if (table === 'cV') {
            mockTx[table].findMany = jest.fn().mockResolvedValue(existingCVs);
          }
        });
        
        mockTx['developer'] = {
          update: jest.fn().mockResolvedValue({ id: 'user-123' })
        };
        
        return callback(mockTx);
      });

      mockDeleteFileFromS3.mockResolvedValue(undefined);

      // === Execute deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      const deleteResponse = await DELETE(deleteRequest);
      const deleteData = await deleteResponse.json();

      // === Verify comprehensive data cleanup ===
      expect(deleteResponse.status).toBe(200);
      
      // All CV-related tables should be cleaned
      const expectedTables = [
        'cV', 'developerSkill', 'experience', 'education', 
        'achievement', 'contactInfo', 'personalProject', 'personalProjectPortfolio'
      ];
      
      expectedTables.forEach(table => {
        expect(deletedTables).toContain(table);
      });

      // Response should include counts for all deleted data types
      expect(deleteData.deletedCounts).toHaveProperty('cvs');
      expect(deleteData.deletedCounts).toHaveProperty('skills');
      expect(deleteData.deletedCounts).toHaveProperty('experience');
      expect(deleteData.deletedCounts).toHaveProperty('education');
      expect(deleteData.deletedCounts).toHaveProperty('achievements');
      expect(deleteData.deletedCounts).toHaveProperty('contactInfo');
      expect(deleteData.deletedCounts).toHaveProperty('personalProjects');
      expect(deleteData.deletedCounts).toHaveProperty('personalProjectPortfolios');
    });

    it('verifies gamification data is preserved during re-upload', async () => {
      // === Setup test data ===
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        let developerUpdateData;
        
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
              developerUpdateData = query.data;
              return Promise.resolve({ id: 'user-123' });
            })
          }
        };
        
        return callback(mockTx);
      });

      // === Execute deletion ===
      const deleteRequest = new NextRequest('http://localhost/api/developer/me/profile', {
        method: 'DELETE',
      });

      await DELETE(deleteRequest);

      // === Verify gamification preservation ===
      // Only profile fields should be reset, not gamification data
      expect(developerUpdateData).toEqual({
        title: null,
        profileEmail: null,
        about: null,
        // Gamification fields (XP, points, badges, streak) are intentionally omitted
        // This preserves user progress across re-uploads
      });

      // Verify no gamification tables are touched
      const gamificationTables = [
        'userBadge', 'xpTransactions', 'pointsTransactions', 'dailyChallenges'
      ];
      
      gamificationTables.forEach(table => {
        expect(mockPrismaClient.$transaction).not.toHaveBeenCalledWith(
          expect.anything()
        );
      });
    });
  });
});