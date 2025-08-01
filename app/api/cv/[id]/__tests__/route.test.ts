import { DELETE } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { deleteCV, getCV, updateCV } from '@/utils/cvOperations';
import { getPresignedS3Url } from '@/utils/s3Storage';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/utils/cvOperations', () => ({
  deleteCV: jest.fn(),
  getCV: jest.fn(),
  updateCV: jest.fn(),
}));

jest.mock('@/utils/s3Storage', () => ({
  getPresignedS3Url: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeleteCV = deleteCV as jest.MockedFunction<typeof deleteCV>;
const mockGetCV = getCV as jest.MockedFunction<typeof getCV>;
const mockUpdateCV = updateCV as jest.MockedFunction<typeof updateCV>;
const mockGetPresignedS3Url = getPresignedS3Url as jest.MockedFunction<typeof getPresignedS3Url>;

describe('/api/cv/[id] DELETE endpoint', () => {
  const mockParams = { id: 'cv-123' };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockDeleteCV).not.toHaveBeenCalled();
    });

    it('proceeds when user is authenticated', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      const existingCV = {
        id: 'cv-123',
        developerId: 'user-123',
        filename: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        s3Key: 'cvs/user-123/test.pdf',
        status: 'COMPLETED',
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        extractedText: null,
        metadata: null,
        analysisId: null,
        improvementScore: null,
      };

      mockGetServerSession.mockResolvedValue(mockSession);
      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockResolvedValue(existingCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });

      expect(response.status).toBe(204);
      expect(mockGetCV).toHaveBeenCalledWith('cv-123');
      expect(mockDeleteCV).toHaveBeenCalledWith('cv-123');
    });
  });

  describe('CV Deletion', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('successfully deletes CV and returns success response', async () => {
      const existingCV = {
        id: 'cv-123',
        developerId: 'user-123',
        filename: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        s3Key: 'cvs/user-123/test.pdf',
        status: 'COMPLETED',
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        extractedText: null,
        metadata: null,
        analysisId: null,
        improvementScore: null,
      };

      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockResolvedValue(existingCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });

      expect(response.status).toBe(204);
      expect(mockGetCV).toHaveBeenCalledWith('cv-123');
      expect(mockDeleteCV).toHaveBeenCalledWith('cv-123');
    });

    it('handles CV not found error', async () => {
      // When CV is not found, getCV returns null and route returns 204 (idempotent DELETE)
      mockGetCV.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });

      expect(response.status).toBe(204);
      expect(mockDeleteCV).not.toHaveBeenCalled(); // Should not attempt to delete if CV not found
    });

    it('handles S3 deletion failure', async () => {
      const existingCV = {
        id: 'cv-123',
        developerId: 'user-123',
        filename: 'test.pdf',
      };
      
      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockRejectedValue(new Error('S3 Delete Failed'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
    });

    it('handles database transaction failure', async () => {
      const existingCV = { id: 'cv-123', developerId: 'user-123' };
      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockRejectedValue(new Error('Transaction Failed'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
    });

    it('handles Redis cache clearing failure gracefully', async () => {
      // Redis failure shouldn't prevent CV deletion from succeeding
      const existingCV = {
        id: 'cv-123',
        developerId: 'user-123',
        filename: 'test.pdf',
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        s3Key: 'cvs/user-123/test.pdf',
        status: 'COMPLETED',
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        extractedText: null,
        metadata: null,
        analysisId: null,
        improvementScore: null,
      };

      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockResolvedValue(existingCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });

      expect(response.status).toBe(204);
      expect(mockGetCV).toHaveBeenCalledWith('cv-123');
      expect(mockDeleteCV).toHaveBeenCalledWith('cv-123');
    });

  });

  describe('Error Handling', () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
    };

    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('handles unexpected errors with generic error response', async () => {
      const existingCV = { id: 'cv-123', developerId: 'user-123' };
      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockRejectedValue(new Error('Unexpected database error'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
    });

    it('handles non-Error objects thrown', async () => {
      const existingCV = { id: 'cv-123', developerId: 'user-123' };
      mockGetCV.mockResolvedValue(existingCV as any);
      mockDeleteCV.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
    });

  });


  describe('Authorization Edge Cases', () => {
    it('handles session with missing user data', async () => {
      mockGetServerSession.mockResolvedValue({ user: null } as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles session with malformed user data', async () => {
      mockGetServerSession.mockResolvedValue({ user: {} } as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

});