import { NextResponse } from 'next/server';
import { GET } from './route';
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
    isTokenValid: jest.fn(),
    setAccessToken: jest.fn(),
    getAuthorizationUrl: jest.fn(),
    getJob: jest.fn(),
  },
}));

describe('LinkedIn Job by ID API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    // Setup mocks
    (linkedInClient.isTokenValid as jest.Mock).mockReturnValue(false);
    (linkedInClient.getAuthorizationUrl as jest.Mock).mockReturnValue('https://example.com/auth');

    // Create a mock request
    const request = mockRequest('http://localhost:3000/api/linkedin/jobs/job-1');

    // Call the handler
    const response = await GET(request, { params: { id: 'job-1' } });
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(401);
    expect(responseData).toEqual({
      error: 'LinkedIn API authentication required',
      authUrl: 'https://example.com/auth',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'LinkedIn API authentication required', authUrl: 'https://example.com/auth' },
      { status: 401 }
    );
  });

  it('should extract token from authorization header', async () => {
    // Setup mocks
    (linkedInClient.isTokenValid as jest.Mock).mockReturnValue(true);
    (linkedInClient.getJob as jest.Mock).mockResolvedValue({
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
      },
      employmentType: 'FULL_TIME',
    });

    // Create a mock request with authorization header
    const headers = new Headers();
    headers.append('authorization', 'Bearer test-token');
    const request = mockRequest('http://localhost:3000/api/linkedin/jobs/job-1', {
      headers,
    });

    // Call the handler
    await GET(request, { params: { id: 'job-1' } });

    // Verify the token was extracted and set
    expect(linkedInClient.setAccessToken).toHaveBeenCalledWith('test-token', 3600);
  });

  it('should return 400 when job ID is missing', async () => {
    // Setup mocks
    (linkedInClient.isTokenValid as jest.Mock).mockReturnValue(true);

    // Create a mock request without a job ID
    const request = mockRequest('http://localhost:3000/api/linkedin/jobs/');

    // Call the handler with empty params
    const response = await GET(request, { params: { id: '' } });
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(400);
    expect(responseData).toEqual({
      error: 'Job ID is required',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  });

  it('should fetch a job by ID', async () => {
    // Setup mocks
    (linkedInClient.isTokenValid as jest.Mock).mockReturnValue(true);
    (linkedInClient.getJob as jest.Mock).mockResolvedValue({
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
      listingType: 'FULL_TIME',
    });

    // Create a mock request
    const request = mockRequest('http://localhost:3000/api/linkedin/jobs/job-1');

    // Call the handler
    const response = await GET(request, { params: { id: 'job-1' } });
    const responseData = await (response as any).json();

    // Verify the job was fetched
    expect(linkedInClient.getJob).toHaveBeenCalledWith('job-1');

    // Verify response
    expect((response as any).status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'job-1' })); // Check if the job object is returned
  });

  it('should handle API errors', async () => {
    // Setup mocks
    (linkedInClient.isTokenValid as jest.Mock).mockReturnValue(true);
    (linkedInClient.getJob as jest.Mock).mockRejectedValue(new Error('API error'));

    // Create a mock request
    const request = mockRequest('http://localhost:3000/api/linkedin/jobs/job-1');

    // Call the handler
    const response = await GET(request, { params: { id: 'job-1' } });
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to fetch LinkedIn job job-1',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch LinkedIn job job-1' },
      { status: 500 }
    );
  });
}); 