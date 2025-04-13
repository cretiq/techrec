import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { LinkedInClient } from './linkedin';

// Mock fetch
global.fetch = jest.fn();

describe('LinkedInClient', () => {
  let client: LinkedInClient;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a new client for each test
    client = new LinkedInClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/callback'
    });
  });

  describe('getAccessToken', () => {
    test('should exchange an authorization code for an access token', async () => {
      // Mock API response
      const mockResponse = {
        access_token: 'test-access-token',
        expires_in: 3600
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Call the method
      const token = await client.getAccessToken('test-auth-code');

      // Verify results
      expect(token).toBe('test-access-token');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.linkedin.com/oauth/v2/accessToken',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams)
        })
      );
      
      // Verify the URLSearchParams has the correct values
      const call = (global.fetch as jest.Mock).mock.calls[0];
      const body = call[1].body as URLSearchParams;
      expect(body.get('grant_type')).toBe('authorization_code');
      expect(body.get('code')).toBe('test-auth-code');
      expect(body.get('client_id')).toBe('test-client-id');
      expect(body.get('client_secret')).toBe('test-client-secret');
      expect(body.get('redirect_uri')).toBe('http://localhost:3000/callback');
    });

    test('should handle API errors', async () => {
      // Mock API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      // Verify that error is thrown
      await expect(client.getAccessToken('test-auth-code')).rejects.toThrow('Failed to get LinkedIn access token');
    });
  });

  describe('isTokenValid', () => {
    test('should return false when token is not set', () => {
      expect(client.isTokenValid()).toBe(false);
    });

    test('should return false when token is expired', () => {
      // Set expired token
      client.setAccessToken('test-token', -100);
      expect(client.isTokenValid()).toBe(false);
    });

    test('should return true when token is valid', () => {
      // Set valid token
      client.setAccessToken('test-token', 3600);
      expect(client.isTokenValid()).toBe(true);
    });
  });

  describe('searchJobs', () => {
    test('should throw error when token is invalid', async () => {
      await expect(client.searchJobs({})).rejects.toThrow('Access token is invalid or expired');
    });

    test('should search for jobs with valid parameters', async () => {
      // Setup valid token
      client.setAccessToken('test-token', 3600);

      // Mock API response
      const mockResponse = {
        jobs: [
          {
            id: 'job-1',
            title: 'Software Engineer',
            description: 'Job description',
            location: {
              country: 'US',
              city: 'San Francisco'
            },
            companyDetails: {
              companyId: 'company-1',
              companyName: 'Example Corp'
            },
            listingType: 'FULL_TIME',
            employmentType: 'FULL_TIME'
          }
        ],
        paging: {
          count: 1,
          start: 0,
          total: 1
        }
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Call the method
      const result = await client.searchJobs({
        keywords: 'software engineer',
        location: 'San Francisco',
        count: 10
      });

      // Verify results
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.linkedin.com/v2/jobSearch?'),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token'
          }
        })
      );
      
      // Verify the search parameters
      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
      const searchParams = new URL(url).searchParams;
      expect(searchParams.get('keywords')).toBe('software engineer');
      expect(searchParams.get('location')).toBe('San Francisco');
      expect(searchParams.get('count')).toBe('10');
    });

    test('should handle API errors', async () => {
      // Setup valid token
      client.setAccessToken('test-token', 3600);

      // Mock API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      // Verify error is thrown
      await expect(client.searchJobs({})).rejects.toThrow('Failed to search LinkedIn jobs');
    });
  });

  describe('getJob', () => {
    test('should throw error when token is invalid', async () => {
      await expect(client.getJob('job-1')).rejects.toThrow('Access token is invalid or expired');
    });

    test('should get a job by ID', async () => {
      // Setup valid token
      client.setAccessToken('test-token', 3600);

      // Mock API response
      const mockResponse = {
        id: 'job-1',
        title: 'Software Engineer',
        description: 'Job description',
        location: {
          country: 'US',
          city: 'San Francisco'
        },
        companyDetails: {
          companyId: 'company-1',
          companyName: 'Example Corp'
        },
        listingType: 'FULL_TIME',
        employmentType: 'FULL_TIME'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Call the method
      const result = await client.getJob('job-1');

      // Verify results
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.linkedin.com/v2/jobs/job-1',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token'
          }
        })
      );
    });

    test('should handle API errors', async () => {
      // Setup valid token
      client.setAccessToken('test-token', 3600);

      // Mock API error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      // Verify error is thrown
      await expect(client.getJob('job-1')).rejects.toThrow('Failed to get LinkedIn job job-1');
    });
  });

  describe('getAuthorizationUrl', () => {
    test('should generate the correct authorization URL', () => {
      const url = client.getAuthorizationUrl(['r_liteprofile', 'r_emailaddress']);
      
      expect(url).toBe(
        'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=test-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=r_liteprofile%20r_emailaddress'
      );
    });

    test('should use default scopes when none are provided', () => {
      const url = client.getAuthorizationUrl();
      
      expect(url).toContain('scope=r_liteprofile%20r_emailaddress%20w_member_social');
    });
  });
}); 