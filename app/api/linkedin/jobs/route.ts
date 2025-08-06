import { NextResponse } from 'next/server';
import { getLinkedInClient } from '@/lib/linkedin';
import { prisma } from '@/prisma/prisma';
import { RoleType } from '@prisma/client';
import { cookies } from 'next/headers';

// Helper function to convert LinkedIn job type to our RoleType enum
const convertLinkedInJobType = (type: string): RoleType => {
  const typeMap: { [key: string]: RoleType } = {
    'FULL_TIME': 'FULL_TIME',
    'PART_TIME': 'PART_TIME',
    'CONTRACT': 'CONTRACT',
    'INTERNSHIP': 'INTERNSHIP',
    'TEMPORARY': 'CONTRACT',
    'VOLUNTEER': 'FREELANCE',
    'FREELANCE': 'FREELANCE'
  };

  return typeMap[type] || 'FULL_TIME';
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || '';
    const location = searchParams.get('location') || '';
    const start = searchParams.get('start') ? parseInt(searchParams.get('start') || '0') : 0;
    const count = searchParams.get('count') ? parseInt(searchParams.get('count') || '10') : 10;

    // Check if we have the access token in cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('linkedin_access_token')?.value;

    if (!accessToken) {
      // Generate a state parameter for security
      const state = Math.random().toString(36).substring(7);
      
      return NextResponse.json(
        { 
          error: 'LinkedIn API authentication required', 
          authUrl: getLinkedInClient().getAuthorizationUrl(state)
        },
        { status: 401 }
      );
    }

    console.log('keywords', keywords);
    console.log('location', location);
    console.log('start', start);
    console.log('count', count);
    console.log('accessToken', accessToken);
    // Search LinkedIn jobs
    const searchResults = await getLinkedInClient().searchJobs(accessToken, keywords, location, start, count);

    // Map LinkedIn job listings to our format
    const jobs = searchResults.jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: {
        country: job.location.country,
        postalCode: job.location.postalCode,
        city: job.location.city,
        address: job.location.address
      },
      companyDetails: {
        companyId: job.companyDetails.companyId,
        companyName: job.companyDetails.companyName,
        logoUrl: job.companyDetails.logoUrl
      },
      listingType: job.listingType,
      applicationDeadline: job.applicationDeadline,
      seniorityLevel: job.seniorityLevel,
      employmentType: convertLinkedInJobType(job.employmentType || 'FULL_TIME'),
      industries: job.industries,
      jobFunctions: job.jobFunctions,
      experienceLevel: job.experienceLevel,
      salaryRange: job.salaryRange,
      remote: job.remote
    }));

    return NextResponse.json({
      jobs,
      paging: searchResults.paging
    });
  } catch (error) {
    console.error('Error fetching LinkedIn jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LinkedIn jobs' },
      { status: 500 }
    );
  }
}

// LinkedIn OAuth callback handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange the code for an access token
    const { access_token } = await getLinkedInClient().exchangeCodeForToken(data.code);

    return NextResponse.json({ accessToken: access_token });
  } catch (error) {
    console.error('Error authenticating with LinkedIn:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with LinkedIn' },
      { status: 500 }
    );
  }
} 