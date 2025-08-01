import { PrismaClient, CV, AnalysisStatus } from '@prisma/client';
import { createCV, getCV, updateCV, deleteCV, listCVs, CvCreateData, CvUpdateData } from '@/utils/cvOperations';
import { deleteFileFromS3 } from '@/utils/s3Storage';
import { clearCachePattern } from '@/lib/redis';

// Mock Prisma Client with transaction support  
jest.mock('@prisma/client', () => {
  const mockTransaction = jest.fn();
  const mockPrismaInstance = {
    cV: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cvAnalysis: {
      deleteMany: jest.fn(),
    },
    $transaction: mockTransaction,
  };
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaInstance),
    AnalysisStatus: {
      PENDING: 'PENDING',
      PROCESSING: 'PROCESSING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
    }
  };
});

// Mock S3 delete function
jest.mock('../s3Storage', () => ({
  deleteFileFromS3: jest.fn(),
}));
const mockedDeleteFileFromS3 = deleteFileFromS3 as jest.MockedFunction<typeof deleteFileFromS3>;

// Mock Redis cache clearing
jest.mock('@/lib/redis', () => ({
  clearCachePattern: jest.fn(),
}));
const mockedClearCachePattern = clearCachePattern as jest.MockedFunction<typeof clearCachePattern>;

describe('CV Database Operations', () => {
  let mockPrisma: any;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Get fresh mock instance from the mocked PrismaClient
    const { PrismaClient } = require('@prisma/client');
    mockPrisma = new PrismaClient(); // This will return our mock instance
    
    // Reset S3 mock
    mockedDeleteFileFromS3.mockClear();
    // Reset Redis cache mock
    mockedClearCachePattern.mockClear();
    // Set default valid mock resolutions
    mockedDeleteFileFromS3.mockResolvedValue({ $metadata: { httpStatusCode: 204 } });
    mockedClearCachePattern.mockResolvedValue(5); // Mock clearing 5 cache keys
  });

  const sampleCvData: CvCreateData = {
    developerId: 'dev123',
    filename: 'test.pdf',
    originalName: 'original_test.pdf',
    mimeType: 'application/pdf',
    size: 102400,
    s3Key: 'cvs/dev123/test.pdf',
  };

  const sampleCV: CV = {
    id: 'cv123',
    ...sampleCvData,
    status: AnalysisStatus.COMPLETED,
    uploadDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    extractedText: null,
    metadata: null,
    analysisId: null,
    improvementScore: null,
  };

  // --- createCV --- 
  it('should call prisma.cV.create with correct data', async () => {
    mockPrisma.cV.create.mockResolvedValue(sampleCV);
    await createCV(sampleCvData);
    expect(mockPrisma.cV.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.create).toHaveBeenCalledWith({
      data: {
        ...sampleCvData,
        status: AnalysisStatus.PENDING, // Verifies default status
      },
    });
  });

   it('should call prisma.cV.create with provided status', async () => {
    mockPrisma.cV.create.mockResolvedValue({ ...sampleCV, status: AnalysisStatus.PROCESSING });
    const dataWithStatus = { ...sampleCvData, status: AnalysisStatus.PROCESSING };
    await createCV(dataWithStatus);
    expect(mockPrisma.cV.create).toHaveBeenCalledWith({
      data: dataWithStatus,
    });
  });

  it('should return the created CV record', async () => {
    mockPrisma.cV.create.mockResolvedValue(sampleCV);
    const result = await createCV(sampleCvData);
    expect(result).toEqual(sampleCV);
  });

  it('should throw error if prisma create fails', async () => {
    const mockError = new Error('DB Create Failed');
    mockPrisma.cV.create.mockRejectedValue(mockError);
    await expect(createCV(sampleCvData)).rejects.toThrow('Failed to create CV record');
  });

  // --- getCV --- 
  it('should call prisma.cV.findUnique with ID', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    await getCV('cv123');
    expect(mockPrisma.cV.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: 'cv123' } });
  });

  it('should return CV if found', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    const result = await getCV('cv123');
    expect(result).toEqual(sampleCV);
  });

  it('should return null if CV not found', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(null);
    const result = await getCV('notfound');
    expect(result).toBeNull();
  });

  it('should throw error if prisma findUnique fails', async () => {
    const mockError = new Error('DB Find Failed');
    mockPrisma.cV.findUnique.mockRejectedValue(mockError);
    await expect(getCV('cv123')).rejects.toThrow('Failed to retrieve CV record');
  });

  // --- updateCV ---
  it('should call prisma.cV.update with ID and data', async () => {
    const updateData: CvUpdateData = { status: AnalysisStatus.PROCESSING, originalName: 'new_name.pdf' };
    mockPrisma.cV.update.mockResolvedValue({ ...sampleCV, ...updateData });
    await updateCV('cv123', updateData);
    expect(mockPrisma.cV.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.update).toHaveBeenCalledWith({ 
        where: { id: 'cv123' }, 
        data: updateData 
    });
  });

  it('should return the updated CV', async () => {
    const updateData: CvUpdateData = { status: AnalysisStatus.COMPLETED };
     const updatedRecord = { ...sampleCV, ...updateData, updatedAt: new Date() };
    mockPrisma.cV.update.mockResolvedValue(updatedRecord);
    const result = await updateCV('cv123', updateData);
    expect(result).toEqual(updatedRecord);
  });

   it('should throw error if prisma update fails', async () => {
    const updateData: CvUpdateData = { status: AnalysisStatus.FAILED };
    const mockError = new Error('DB Update Failed');
    mockPrisma.cV.update.mockRejectedValue(mockError);
    await expect(updateCV('cv123', updateData)).rejects.toThrow('Failed to update CV record');
  });

  // --- deleteCV (Enhanced with Redis Cache Clearing) ---
  describe('deleteCV', () => {
    const mockTransactionCallback = jest.fn();

    beforeEach(() => {
      // Setup transaction mock to execute the callback
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          cV: mockPrisma.cV,
          cvAnalysis: mockPrisma.cvAnalysis,
        });
      });
      mockTransactionCallback.mockClear();
    });

    it('should execute complete deletion workflow with Redis cache clearing', async () => {
      // Setup mocks
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      mockPrisma.cV.delete.mockResolvedValue(sampleCV);

      const result = await deleteCV('cv123');

      // Verify database operations
      expect(mockPrisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: 'cv123' } });
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockedDeleteFileFromS3).toHaveBeenCalledWith(sampleCV.s3Key);
      // cvAnalysis table is deprecated - no longer deleting from it
      expect(mockPrisma.cV.delete).toHaveBeenCalledWith({ where: { id: 'cv123' } });

      // Verify Redis cache clearing
      expect(mockedClearCachePattern).toHaveBeenCalledTimes(9); // 9 cache patterns
      expect(mockedClearCachePattern).toHaveBeenCalledWith(`user_profile:${sampleCV.developerId}*`);
      expect(mockedClearCachePattern).toHaveBeenCalledWith(`cv_count:${sampleCV.developerId}*`);
      expect(mockedClearCachePattern).toHaveBeenCalledWith(`leaderboard:*`);
      expect(mockedClearCachePattern).toHaveBeenCalledWith(`cv-analysis:cv123*`);

      expect(result).toEqual(sampleCV);
    });

    it('should handle Redis cache clearing failure gracefully', async () => {
      // Setup mocks
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      mockPrisma.cV.delete.mockResolvedValue(sampleCV);
      
      // Make cache clearing fail
      mockedClearCachePattern.mockRejectedValue(new Error('Redis connection failed'));

      const result = await deleteCV('cv123');

      // Should still complete successfully
      expect(result).toEqual(sampleCV);
      expect(mockPrisma.cV.delete).toHaveBeenCalled();
      expect(mockedClearCachePattern).toHaveBeenCalled();
    });

    it('should throw error if CV to delete is not found', async () => {
      mockPrisma.cV.findUnique.mockResolvedValue(null);

      await expect(deleteCV('notfound')).rejects.toThrow(
        'Failed to delete CV and associated analyses'
      );
      
      expect(mockedDeleteFileFromS3).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(mockedClearCachePattern).not.toHaveBeenCalled();
    });

    it('should throw error if S3 delete fails during transaction', async () => {
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      const s3Error = new Error('S3 Delete Failed');
      mockedDeleteFileFromS3.mockRejectedValue(s3Error);

      await expect(deleteCV('cv123')).rejects.toThrow('Failed to delete CV and associated analyses');
      
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // cvAnalysis table is deprecated - no longer used
      expect(mockPrisma.cV.delete).not.toHaveBeenCalled();
      expect(mockedClearCachePattern).not.toHaveBeenCalled();
    });

    it('should throw error if database transaction fails', async () => {
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      const dbError = new Error('Transaction Failed');
      mockPrisma.$transaction.mockRejectedValue(dbError);

      await expect(deleteCV('cv123')).rejects.toThrow('Failed to delete CV and associated analyses');
      
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockedClearCachePattern).not.toHaveBeenCalled();
    });

    it('should delete associated CV analyses before deleting CV', async () => {
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      mockPrisma.cV.delete.mockResolvedValue(sampleCV);

      await deleteCV('cv123');

      // cvAnalysis table is deprecated - only CV record is deleted now
      expect(mockPrisma.cV.delete).toHaveBeenCalledWith({ where: { id: 'cv123' } });
    });

    it('should clear all expected cache patterns', async () => {
      mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
      mockPrisma.cV.delete.mockResolvedValue(sampleCV);

      await deleteCV('cv123');

      const expectedPatterns = [
        `user_profile:${sampleCV.developerId}*`,
        `cv_count:${sampleCV.developerId}*`,
        `app_stats:${sampleCV.developerId}*`,
        `badge_eval_batch:${sampleCV.developerId}*`,
        `leaderboard:*`,
        `cv-analysis:cv123*`,
        `cv-improvement:cv123*`,
        `cover-letter:*${sampleCV.developerId}*`,
        `outreach-message:*${sampleCV.developerId}*`
      ];

      expectedPatterns.forEach(pattern => {
        expect(mockedClearCachePattern).toHaveBeenCalledWith(pattern);
      });
    });
  });

  // --- listCVs ---
  it('should call prisma.cV.findMany with developerId', async () => {
    mockPrisma.cV.findMany.mockResolvedValue([sampleCV]);
    await listCVs('dev123');
    expect(mockPrisma.cV.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { developerId: 'dev123' },
      orderBy: { uploadDate: 'desc' },
    }));
  });

  it('should apply originalName filter correctly', async () => {
    const filters = { originalName: 'test' };
    mockPrisma.cV.findMany.mockResolvedValue([]);
    await listCVs('dev123', filters);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        developerId: 'dev123',
        originalName: { contains: 'test', mode: 'insensitive' },
      },
      orderBy: { uploadDate: 'desc' },
    }));
  });

  it('should apply status filter correctly', async () => {
    const filters = { status: AnalysisStatus.COMPLETED };
    mockPrisma.cV.findMany.mockResolvedValue([]);
    await listCVs('dev123', filters);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        developerId: 'dev123',
        status: AnalysisStatus.COMPLETED,
      },
       orderBy: { uploadDate: 'desc' },
    }));
  });

  it('should apply multiple filters correctly', async () => {
    const filters = { originalName: 'report', status: AnalysisStatus.PROCESSING };
    mockPrisma.cV.findMany.mockResolvedValue([]);
    await listCVs('dev123', filters);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        developerId: 'dev123',
        originalName: { contains: 'report', mode: 'insensitive' },
        status: AnalysisStatus.PROCESSING,
      },
       orderBy: { uploadDate: 'desc' },
    }));
  });

  it('should return list of CVs on success', async () => {
    const cvList = [sampleCV, { ...sampleCV, id: 'cv456' }];
    mockPrisma.cV.findMany.mockResolvedValue(cvList);
    const result = await listCVs('dev123');
    expect(result).toEqual(cvList);
  });

  it('should throw error if prisma findMany fails', async () => {
    const mockError = new Error('DB List Failed');
    mockPrisma.cV.findMany.mockRejectedValue(mockError);
    await expect(listCVs('dev123')).rejects.toThrow('Failed to list CVs');
  });

}); 