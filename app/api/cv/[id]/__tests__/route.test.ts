import { DELETE } from '../route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { deleteCV } from '@/utils/cvOperations';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/utils/cvOperations', () => ({
  deleteCV: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeleteCV = deleteCV as jest.MockedFunction<typeof deleteCV>;

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
      mockGetServerSession.mockResolvedValue(mockSession);
      mockDeleteCV.mockResolvedValue({
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
      } as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });

      expect(response.status).toBe(200);
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
      const deletedCV = {
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

      mockDeleteCV.mockResolvedValue(deletedCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('CV deleted successfully');
      expect(data.deletedCV).toEqual(deletedCV);
      expect(mockDeleteCV).toHaveBeenCalledWith('cv-123');
    });

    it('handles CV not found error', async () => {
      mockDeleteCV.mockRejectedValue(new Error('CV record with ID cv-123 not found.'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('CV not found');
      expect(data.details).toBe('CV record with ID cv-123 not found.');
    });

    it('handles S3 deletion failure', async () => {
      mockDeleteCV.mockRejectedValue(new Error('S3 Delete Failed'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
      expect(data.details).toBe('S3 Delete Failed');
    });

    it('handles database transaction failure', async () => {
      mockDeleteCV.mockRejectedValue(new Error('Transaction Failed'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
      expect(data.details).toBe('Transaction Failed');
    });

    it('handles Redis cache clearing failure gracefully', async () => {
      // Redis failure shouldn't prevent CV deletion from succeeding
      const deletedCV = {
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

      mockDeleteCV.mockResolvedValue(deletedCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('CV deleted successfully');
      expect(data.deletedCV).toEqual(deletedCV);
    });

    it('validates CV ID parameter', async () => {
      const request = new NextRequest('http://localhost/api/cv/', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CV ID is required');
      expect(mockDeleteCV).not.toHaveBeenCalled();
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
      mockDeleteCV.mockRejectedValue(new Error('Unexpected database error'));

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
      expect(data.details).toBe('Unexpected database error');
    });

    it('handles non-Error objects thrown', async () => {
      mockDeleteCV.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
      expect(data.details).toBe('An unexpected error occurred');
    });

    it('includes proper error context for debugging', async () => {
      const complexError = new Error('Complex database constraint violation');
      complexError.stack = 'Error stack trace...';
      mockDeleteCV.mockRejectedValue(complexError);

      const request = new NextRequest('http://localhost/api/cv/cv-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete CV');
      expect(data.details).toBe('Complex database constraint violation');
    });
  });

  describe('Request Validation', () => {
    it('handles malformed request parameters', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost/api/cv/invalid-id', {
        method: 'DELETE',
      });

      // Test with undefined params
      const response = await DELETE(request, { params: undefined as any });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CV ID is required');
    });

    it('handles null CV ID parameter', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost/api/cv/null', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: null as any } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CV ID is required');
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

  describe('Integration Scenarios', () => {
    it('handles complete deletion workflow including Redis cache patterns', async () => {
      const mockSession = {
        user: { id: 'user-456', email: 'test@example.com' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const deletedCV = {
        id: 'cv-789',
        developerId: 'user-456',
        filename: 'complex-cv.pdf',
        originalName: 'My Complex CV.pdf',
        mimeType: 'application/pdf',
        size: 2048576, // 2MB
        s3Key: 'cvs/user-456/complex-cv.pdf',
        status: 'COMPLETED',
        uploadDate: new Date('2024-01-15T10:30:00Z'),
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        extractedText: 'Sample CV content...',
        metadata: { pageCount: 2 },
        analysisId: 'analysis-456',
        improvementScore: 85,
      };

      mockDeleteCV.mockResolvedValue(deletedCV as any);

      const request = new NextRequest('http://localhost/api/cv/cv-789', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'cv-789' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('CV deleted successfully');
      expect(data.deletedCV).toEqual(deletedCV);
      expect(mockDeleteCV).toHaveBeenCalledWith('cv-789');
    });

    it('maintains proper HTTP status codes for different failure scenarios', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      // Test different error scenarios and their corresponding status codes
      const testCases = [
        {
          error: new Error('CV record with ID cv-123 not found.'),
          expectedStatus: 404,
          expectedError: 'CV not found',
        },
        {
          error: new Error('Failed to delete CV and associated analyses'),
          expectedStatus: 500,
          expectedError: 'Failed to delete CV',
        },
        {
          error: new Error('S3 connection timeout'),
          expectedStatus: 500,
          expectedError: 'Failed to delete CV',
        },
      ];

      for (const testCase of testCases) {
        mockDeleteCV.mockRejectedValue(testCase.error);

        const request = new NextRequest('http://localhost/api/cv/cv-123', {
          method: 'DELETE',
        });

        const response = await DELETE(request, { params: mockParams });
        const data = await response.json();

        expect(response.status).toBe(testCase.expectedStatus);
        expect(data.error).toBe(testCase.expectedError);
      }
    });
  });
});