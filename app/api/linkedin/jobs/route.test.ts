import { NextResponse } from 'next/server';
import { GET, POST } from './route';
import { linkedInClient } from '@/lib/linkedin';

// Mock NextRequest properties needed by the handler
const mockRequest = (url: string, options: { method?: string; headers?: Headers; body?: string } = {}) => {
  const baseRequest = {
    url,
    headers: options.headers || new Headers(),
    json: async () => (options.body ? JSON.parse(options.body) : {}),
  };
  return baseRequest as unknown as Request; // Cast to Request type expected by handler
};

// Mock NextResponse methods
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      headers: new Headers(init?.headers),
    })),
    redirect: jest.fn((url) => ({
      status: 307, // Default redirect status
      headers: new Headers({ location: url.toString() }),
    })),
  },
}));

// Mock the LinkedIn client module
jest.mock('@/lib/linkedin', () => ({
  linkedInClient: {
    getAuthorizationUrl: jest.fn(),
    searchJobs: jest.fn(),
    exchangeCodeForToken: jest.fn(),
  },
}));

// Mock cookies from Next.js
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
  }),
}));

// Mock Prisma
jest.mock('@/prisma/prisma', () => ({
  prisma: {
    role: {
      create: jest.fn(),
    },
  },
}));

describe('LinkedIn Jobs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should return 401 when not authenticated', async () => {
      // Setup mocks - no access token in cookies
      const { cookies } = require('next/headers');
      (cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined), // No access token
      });
      
      (linkedInClient.getAuthorizationUrl as jest.Mock).mockReturnValue('https://example.com/auth');

      // Create a mock request
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs');

      // Call the handler
      const response = await GET(request);
      const responseData = await (response as any).json();

      // Verify response
      expect((response as any).status).toBe(401);
      expect(responseData).toEqual({
        error: 'LinkedIn API authentication required',
        authUrl: 'https://example.com/auth',
      });
    });

    it('should use access token from cookies', async () => {
      // Setup mocks - access token available in cookies
      const { cookies } = require('next/headers');
      (cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'test-token' }),
      });
      
      (linkedInClient.searchJobs as jest.Mock).mockResolvedValue({
        jobs: [],
        paging: { count: 0, start: 0, total: 0 },
      });

      // Create a mock request
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs');

      // Call the handler
      const response = await GET(request);
      const responseData = await (response as any).json();

      // Verify the token was used for searching
      expect(linkedInClient.searchJobs).toHaveBeenCalledWith('test-token', '', '', 0, 10);
      expect((response as any).status).toBe(200);
      expect(responseData).toEqual({
        jobs: [],
        paging: { count: 0, start: 0, total: 0 },
      });
    });

    it('should search for jobs with query parameters', async () => {
      // Setup mocks - access token available in cookies
      const { cookies } = require('next/headers');
      (cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'test-token' }),
      });
      
      const mockSearchResults = {
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            description: 'Job description',
            location: {
              country: 'US',
              city: 'San Francisco',
            },
            companyDetails: {
              companyId: 'company-1',
              companyName: 'Example Corp',
              logoUrl: 'https://example.com/logo.png',
            },
            employmentType: 'FULL_TIME',
            remote: true,
          },
        ],
        paging: { count: 1, start: 0, total: 1 },
      };
      (linkedInClient.searchJobs as jest.Mock).mockResolvedValue(mockSearchResults);

      // Create a mock request with query parameters
      const request = mockRequest(
        'http://localhost:3000/api/linkedin/jobs?keywords=engineer&location=San%20Francisco&start=0&count=10'
      );

      // Call the handler
      const response = await GET(request);
      const responseData = await (response as any).json();

      // Verify the search was performed with the correct parameters
      expect(linkedInClient.searchJobs).toHaveBeenCalledWith('test-token', 'engineer', 'San Francisco', 0, 10);

      // Verify the response
      expect((response as any).status).toBe(200);
      // Add assertion for NextResponse.json call
      expect(NextResponse.json).toHaveBeenCalledWith({
        jobs: expect.any(Array), // Simplified check for brevity
        paging: mockSearchResults.paging,
      });
    });

    it('should handle API errors', async () => {
      // Setup mocks - access token available in cookies
      const { cookies } = require('next/headers');
      (cookies as jest.Mock).mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'test-token' }),
      });
      
      const apiError = new Error('API error');
      (linkedInClient.searchJobs as jest.Mock).mockRejectedValue(apiError);

      // Create a mock request
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs');

      // Call the handler
      const response = await GET(request);
      const responseData = await (response as any).json();

      // Verify the response
      expect((response as any).status).toBe(500);
      expect(responseData).toEqual({
        error: 'Failed to fetch LinkedIn jobs',
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch LinkedIn jobs' },
        { status: 500 }
      );
    });
  });

  describe('POST handler', () => {
    it('should return 400 when code is missing', async () => {
      // Create a mock request without a code
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Call the handler
      const response = await POST(request);
      const responseData = await (response as any).json();

      // Verify the response
      expect((response as any).status).toBe(400);
      expect(responseData).toEqual({
        error: 'Authorization code is required',
      });
       expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    });

    it('should exchange code for access token', async () => {
      // Setup mocks
      (linkedInClient.exchangeCodeForToken as jest.Mock).mockResolvedValue({
        access_token: 'test-access-token'
      });

      // Create a mock request with a code
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-auth-code' }),
      });

      // Call the handler
      const response = await POST(request);
      const responseData = await (response as any).json();

      // Verify the code was exchanged for a token
      expect(linkedInClient.exchangeCodeForToken).toHaveBeenCalledWith('test-auth-code');

      // Verify the response
      expect((response as any).status).toBe(200);
      expect(responseData).toEqual({
        accessToken: 'test-access-token',
      });
      expect(NextResponse.json).toHaveBeenCalledWith({ accessToken: 'test-access-token' });
    });

    it('should handle API errors', async () => {
      // Setup mocks
      (linkedInClient.exchangeCodeForToken as jest.Mock).mockRejectedValue(new Error('API error'));

      // Create a mock request with a code
      const request = mockRequest('http://localhost:3000/api/linkedin/jobs', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-auth-code' }),
      });

      // Call the handler
      const response = await POST(request);
      const responseData = await (response as any).json();

      // Verify the response
      expect((response as any).status).toBe(500);
      expect(responseData).toEqual({
        error: 'Failed to authenticate with LinkedIn',
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to authenticate with LinkedIn' },
        { status: 500 }
      );
    });
  });
}); 