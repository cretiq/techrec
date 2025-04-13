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
    getAccessToken: jest.fn(),
  },
}));

describe('LinkedIn OAuth Callback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when error is present', async () => {
    // Create a mock request with an error
    const request = mockRequest('http://localhost:3000/api/linkedin/callback?error=access_denied');

    // Call the handler
    const response = await GET(request);
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(400);
    expect(responseData).toEqual({
      error: 'LinkedIn authorization error: access_denied',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'LinkedIn authorization error: access_denied' },
      { status: 400 }
    );
  });

  it('should return 400 when code is missing', async () => {
    // Create a mock request without a code
    const request = mockRequest('http://localhost:3000/api/linkedin/callback');

    // Call the handler
    const response = await GET(request);
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(400);
    expect(responseData).toEqual({
      error: 'Authorization code is required',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Authorization code is required' },
      { status: 400 }
    );
  });

  it('should exchange code for access token and redirect', async () => {
    // Setup mocks
    (linkedInClient.getAccessToken as jest.Mock).mockResolvedValue('test-access-token');

    // Create a mock request with a code
    const request = mockRequest('http://localhost:3000/api/linkedin/callback?code=test-auth-code');

    // Call the handler
    const response = await GET(request);

    // Verify the code was exchanged for a token
    expect(linkedInClient.getAccessToken).toHaveBeenCalledWith('test-auth-code');

    // Verify the redirect
    expect((response as any).status).toBe(307); // Temporary redirect
    expect((response as any).headers.get('location')).toBe('http://localhost:3000/linkedin/auth-success?token=test-access-token');
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/linkedin/auth-success?token=test-access-token'));
  });

  it('should handle API errors', async () => {
    // Setup mocks
    (linkedInClient.getAccessToken as jest.Mock).mockRejectedValue(new Error('API error'));

    // Create a mock request with a code
    const request = mockRequest('http://localhost:3000/api/linkedin/callback?code=test-auth-code');

    // Call the handler
    const response = await GET(request);
    const responseData = await (response as any).json();

    // Verify response
    expect((response as any).status).toBe(500);
    expect(responseData).toEqual({
      error: 'Failed to complete LinkedIn authentication',
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to complete LinkedIn authentication' },
      { status: 500 }
    );
  });
}); 