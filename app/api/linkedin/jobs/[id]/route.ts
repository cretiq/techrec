import { NextResponse } from 'next/server';
import { getLinkedInClient } from '@/lib/linkedin';
import { RoleType } from '@prisma/client';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if we have the access token in the request headers
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      getLinkedInClient().setAccessToken(token, 3600); // Assuming token is valid for 1 hour
    }

    // If no token in header and not authenticated, return error
    if (!getLinkedInClient().isTokenValid()) {
      return NextResponse.json(
        { error: 'LinkedIn API authentication required', authUrl: getLinkedInClient().getAuthorizationUrl(['r_liteprofile', 'r_emailaddress', 'job_search']) },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get LinkedIn job by ID
    const job = await getLinkedInClient().getJob(jobId);

    // Map LinkedIn job to our format
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      company: {
        id: job.companyDetails.companyId,
        name: job.companyDetails.companyName,
        logo: job.companyDetails.logoUrl
      },
      location: `${job.location.city || ''}, ${job.location.country}`,
      salary: '', // LinkedIn API doesn't always provide salary info
      type: convertLinkedInJobType(job.employmentType || 'FULL_TIME'),
      remote: job.remote || false,
      applicationDeadline: job.applicationDeadline,
      seniorityLevel: job.seniorityLevel,
      industries: job.industries,
      jobFunctions: job.jobFunctions,
      experienceLevel: job.experienceLevel
    };

    return NextResponse.json(formattedJob);
  } catch (error) {
    console.error(`Error fetching LinkedIn job ${jobId}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch LinkedIn job ${jobId}` },
      { status: 500 }
    );
  }
} 