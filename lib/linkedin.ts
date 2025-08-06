interface LinkedInCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

interface LinkedInJobListing {
  id: string;
  title: string;
  description: string;
  location: {
    country: string;
    postalCode?: string;
    city?: string;
    address?: string;
  };
  companyDetails: {
    companyId: string;
    companyName: string;
    logoUrl?: string;
  };
  listingType: string;
  applicationDeadline?: string;
  seniorityLevel?: string;
  employmentType?: string;
  industries?: string[];
  jobFunctions?: string[];
  experienceLevel?: string;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  remote?: boolean;
}

interface LinkedInJobsResponse {
  jobs: LinkedInJobListing[];
  paging: {
    count: number;
    start: number;
    total: number;
  };
}

export class LinkedInClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl: string;

  constructor() {
    // Check for required environment variables
    if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET || !process.env.LINKEDIN_REDIRECT_URI) {
      throw new Error('LinkedIn not configured - Missing required environment variables: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI');
    }
    
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.baseUrl = 'https://www.linkedin.com/oauth/v2';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'openid profile email',
    });

    return `${this.baseUrl}/authorization?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
    id_token: string;
  }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(`${this.baseUrl}/accessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn token exchange error: ${error.error_description || error.error}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<{
    sub: string;
    name: string;
    email: string;
    picture: string;
  }> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn user info error: ${error.error_description || error.error}`);
    }

    return response.json();
  }

  async searchJobs(accessToken: string, keywords: string, location?: string, start: number = 0, count: number = 10): Promise<any> {
    const params = new URLSearchParams({
      q: 'jobSearch',
      start: start.toString(),
      count: count.toString(),
    });

    if (keywords) {
      params.append('keywords', keywords);
    }

    if (location) {
      params.append('location', location);
    }

    // console.log('params', `https://api.linkedin.com/v2/search?${params.toString()}`);

    const response = await fetch(`https://api.linkedin.com/v2/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    // const response2 = await fetch("https://api.linkedin.com/v2/companySearch?q=search&query=LinkedIn%20Corporation", {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     'X-Restli-Protocol-Version': '2.0.0',
    //   },
    // });

    // console.log('response2', response2);

    if (!response.ok) {
      const error = await response.json();
      console.error('LinkedIn API Error:', error);
      throw new Error(`LinkedIn job search error: ${error.message || error.error_description || error.error}`);
    }

    const data = await response.json();
    
    // Transform the response to match our expected format
    return {
      jobs: data.elements?.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: {
          country: job.location?.country,
          postalCode: job.location?.postalCode,
          city: job.location?.city,
          address: job.location?.address,
        },
        companyDetails: {
          companyId: job.companyDetails?.companyId,
          companyName: job.companyDetails?.companyName,
          logoUrl: job.companyDetails?.logoUrl,
        },
        listingType: job.listingType,
        applicationDeadline: job.applicationDeadline,
        seniorityLevel: job.seniorityLevel,
        employmentType: job.employmentType,
        industries: job.industries,
        jobFunctions: job.jobFunctions,
        experienceLevel: job.experienceLevel,
        salaryRange: job.salaryRange,
        remote: job.remote,
      })) || [],
      paging: {
        count: data.paging?.count || 0,
        start: data.paging?.start || 0,
        total: data.paging?.total || 0,
      },
    };
  }

  async getJobDetails(accessToken: string, jobId: string): Promise<any> {
    const response = await fetch(`https://api.linkedin.com/v2/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LinkedIn job details error: ${error.error_description || error.error}`);
    }

    return response.json();
  }
}

// Create and export a singleton instance with credentials from environment variables
// Lazy initialization function to avoid build-time errors
let linkedInClientInstance: LinkedInClient | null = null;

export function getLinkedInClient(): LinkedInClient {
  if (!linkedInClientInstance) {
    linkedInClientInstance = new LinkedInClient();
    
    // Add debug logging only when client is actually created
    console.log('[LinkedIn Client Init] ID:', process.env.LINKEDIN_CLIENT_ID?.substring(0, 5) + '...');
    console.log('[LinkedIn Client Init] Secret:', process.env.LINKEDIN_CLIENT_SECRET?.substring(0, 5) + '...');
    console.log('[LinkedIn Client Init] Redirect URI:', process.env.LINKEDIN_REDIRECT_URI);
  }
  return linkedInClientInstance;
}

// For backward compatibility, export a getter
export const linkedInClient = {
  get instance() {
    return getLinkedInClient();
  }
}; 