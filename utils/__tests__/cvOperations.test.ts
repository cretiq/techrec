import { PrismaClient, CV, CvStatus } from '@prisma/client';
import { createCV, getCV, updateCV, deleteCV, listCVs, CvCreateData, CvUpdateData } from '@/utils/cvOperations';
import { deleteFileFromS3 } from '@/utils/s3Storage'; // Need to mock this dependency

// Mock Prisma Client
const mockPrisma = {
  cV: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  CvStatus: { // Also mock the enum values
    UPLOADING: 'UPLOADING',
    PROCESSING: 'PROCESSING',
    AVAILABLE: 'AVAILABLE',
    ERROR: 'ERROR',
  }
}));

// Mock S3 delete function
jest.mock('../s3Storage', () => ({
  deleteFileFromS3: jest.fn(),
}));
const mockedDeleteFileFromS3 = deleteFileFromS3 as jest.MockedFunction<typeof deleteFileFromS3>;

describe('CV Database Operations', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset S3 mock as well
    mockedDeleteFileFromS3.mockClear();
    // Set a default valid mock resolution for S3 delete
    mockedDeleteFileFromS3.mockResolvedValue({ $metadata: { httpStatusCode: 204 } });
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
    status: CvStatus.AVAILABLE,
    uploadDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    extractedText: null,
    metadata: null,
  };

  // --- createCV --- 
  it('should call prisma.cV.create with correct data', async () => {
    mockPrisma.cV.create.mockResolvedValue(sampleCV);
    await createCV(sampleCvData);
    expect(mockPrisma.cV.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.create).toHaveBeenCalledWith({
      data: {
        ...sampleCvData,
        status: CvStatus.UPLOADING, // Verifies default status
      },
    });
  });

   it('should call prisma.cV.create with provided status', async () => {
    mockPrisma.cV.create.mockResolvedValue({ ...sampleCV, status: CvStatus.PROCESSING });
    const dataWithStatus = { ...sampleCvData, status: CvStatus.PROCESSING };
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
    const updateData: CvUpdateData = { status: CvStatus.PROCESSING, originalName: 'new_name.pdf' };
    mockPrisma.cV.update.mockResolvedValue({ ...sampleCV, ...updateData });
    await updateCV('cv123', updateData);
    expect(mockPrisma.cV.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.update).toHaveBeenCalledWith({ 
        where: { id: 'cv123' }, 
        data: updateData 
    });
  });

  it('should return the updated CV', async () => {
    const updateData: CvUpdateData = { status: CvStatus.AVAILABLE };
     const updatedRecord = { ...sampleCV, ...updateData, updatedAt: new Date() };
    mockPrisma.cV.update.mockResolvedValue(updatedRecord);
    const result = await updateCV('cv123', updateData);
    expect(result).toEqual(updatedRecord);
  });

   it('should throw error if prisma update fails', async () => {
    const updateData: CvUpdateData = { status: CvStatus.ERROR };
    const mockError = new Error('DB Update Failed');
    mockPrisma.cV.update.mockRejectedValue(mockError);
    await expect(updateCV('cv123', updateData)).rejects.toThrow('Failed to update CV record');
  });

  // --- deleteCV ---
  it('should find CV, call deleteFileFromS3, then call prisma.cV.delete', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    mockPrisma.cV.delete.mockResolvedValue(sampleCV);

    await deleteCV('cv123');

    expect(mockPrisma.cV.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: 'cv123' } });
    expect(mockedDeleteFileFromS3).toHaveBeenCalledTimes(1);
    expect(mockedDeleteFileFromS3).toHaveBeenCalledWith(sampleCV.s3Key);
    expect(mockPrisma.cV.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.cV.delete).toHaveBeenCalledWith({ where: { id: 'cv123' } });
  });

   it('should return the deleted CV record', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    mockPrisma.cV.delete.mockResolvedValue(sampleCV);

    const result = await deleteCV('cv123');
    expect(result).toEqual(sampleCV);
  });

  it('should throw error if CV to delete is not found', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(null);

    await expect(deleteCV('notfound')).rejects.toThrow(
      'CV record with ID notfound not found.'
    );
    expect(mockedDeleteFileFromS3).not.toHaveBeenCalled();
    expect(mockPrisma.cV.delete).not.toHaveBeenCalled();
  });

   it('should throw error if S3 delete fails', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    const s3Error = new Error('S3 Delete Failed');
    mockedDeleteFileFromS3.mockRejectedValue(s3Error);

    await expect(deleteCV('cv123')).rejects.toThrow('Failed to delete CV');
    expect(mockPrisma.cV.delete).not.toHaveBeenCalled();
  });

   it('should throw error if prisma delete fails (after S3 delete)', async () => {
    mockPrisma.cV.findUnique.mockResolvedValue(sampleCV);
    const dbError = new Error('DB Delete Failed');
    mockPrisma.cV.delete.mockRejectedValue(dbError);

    await expect(deleteCV('cv123')).rejects.toThrow('Failed to delete CV');
    expect(mockedDeleteFileFromS3).toHaveBeenCalledTimes(1); // S3 delete was called
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
    const filters = { status: CvStatus.AVAILABLE };
    mockPrisma.cV.findMany.mockResolvedValue([]);
    await listCVs('dev123', filters);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        developerId: 'dev123',
        status: CvStatus.AVAILABLE,
      },
       orderBy: { uploadDate: 'desc' },
    }));
  });

  it('should apply multiple filters correctly', async () => {
    const filters = { originalName: 'report', status: CvStatus.PROCESSING };
    mockPrisma.cV.findMany.mockResolvedValue([]);
    await listCVs('dev123', filters);
    expect(mockPrisma.cV.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        developerId: 'dev123',
        originalName: { contains: 'report', mode: 'insensitive' },
        status: CvStatus.PROCESSING,
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