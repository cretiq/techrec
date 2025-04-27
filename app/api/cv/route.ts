import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listCVs } from '@/utils/cvOperations';
import { CvListFilterSchema, CvListFilters } from '@/types/cv'; 

export async function GET(request: Request) {
  try {
    console.log('Received GET request to list CVs');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Authentication failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const { searchParams } = new URL(request.url);
    
    // --- Validate Query Params --- 
    const queryParams = Object.fromEntries(searchParams.entries());
    const validationResult = CvListFilterSchema.safeParse(queryParams);

    if (!validationResult.success) {
        console.error('Invalid CV list filters:', validationResult.error.flatten());
        return NextResponse.json(
            { error: 'Invalid filter parameters', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    
    const filters: CvListFilters = validationResult.data;
    console.log('Validated filters:', filters);

    // TODO: Add parsing for pagination, sorting from query params

    const cvs = await listCVs(developerId, filters);
    console.log(`Found ${cvs.length} CVs for developer ID: ${developerId} with applied filters.`);

    return NextResponse.json(cvs);

  } catch (error) {
    console.error('Error handling GET request to list CVs:', error);
    return NextResponse.json({ error: 'Failed to list CVs' }, { status: 500 });
  }
} 