// This route handles updating an existing CvAnalysis record, primarily its result
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, AnalysisStatus } from '@prisma/client';
import { setCache, getCache } from '@/lib/redis'; // Import setCache AND getCache
// Import Zod schema
import { UpdateCvAnalysisSchema } from '@/types/cv';

const prisma = new PrismaClient();
const ANALYSIS_CACHE_PREFIX = 'cv_analysis:';

interface Params {
  id: string; // CvAnalysis record ID
}

// GET /api/cv-analysis/[id]
export async function GET(request: Request, { params }: { params: Params }) {
  let analysisId: string | undefined;
  try {
    // Perform await for session check *before* accessing URL/params
    const session = await getServerSession(authOptions);
    
    // Extract ID from URL instead of params initially
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    analysisId = pathSegments[pathSegments.length - 1]; // Get last segment
    
    // Basic validation if the extracted ID looks reasonable (optional)
    if (!analysisId) {
       throw new Error("Could not extract analysis ID from URL");
    }
    
    console.log(`Received GET request for Analysis ID: ${analysisId}`);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // --- Fetch record from DB for ownership check and fileHash --- 
    const analysisRecord = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      // Select necessary fields including fileHash for cache key
      select: { 
        id: true,
        developerId: true, 
        fileHash: true, 
        originalName: true,
        mimeType: true,
        size: true,
        status: true,
        analysisResult: true,
        errorMessage: true,
        requestedAt: true,
        analyzedAt: true,
        createdAt: true,
        updatedAt: true,
      } 
    });

    if (!analysisRecord) {
      console.warn(`GET request: Analysis record ${analysisId} not found.`);
      return NextResponse.json({ error: 'Analysis record not found' }, { status: 404 });
    }

    // Verify ownership
    if (analysisRecord.developerId !== developerId) {
      console.warn(`GET request: User ${developerId} attempted to access analysis ${analysisId} owned by ${analysisRecord.developerId}.`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Attempt to fetch from Cache --- 
    let cacheHit = false;
    if (analysisRecord.fileHash) {
      const cacheKey = `${ANALYSIS_CACHE_PREFIX}${analysisRecord.fileHash}`;
      try {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
          console.log(`GET request: Cache HIT for analysis ${analysisId} (key: ${cacheKey})`);
          // Assuming getCache returns the parsed object or stringified JSON
          const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
          cacheHit = true;
          return NextResponse.json(parsedData, { headers: { 'X-Cache-Status': 'hit' } });
        } else {
          console.log(`GET request: Cache MISS for analysis ${analysisId} (key: ${cacheKey})`);
        }
      } catch (cacheError) {
        console.error(`GET request: Redis cache error for key ${cacheKey}:`, cacheError);
        // Proceed to return DB data if cache fails
      }
    }

    // --- Return DB data if cache miss or no fileHash --- 
    console.log(`GET request: Returning DB data for analysis ${analysisId} for user ${developerId}.`);
    return NextResponse.json(analysisRecord, { headers: { 'X-Cache-Status': 'miss' } });

  } catch (error) {
    // Ensure analysisId might be undefined here, handle appropriately
    console.error(`Error handling GET request for Analysis ID ${analysisId ?? 'unknown'}:`, error);
    return NextResponse.json({ error: 'Failed to fetch analysis details' }, { status: 500 });
  }
}

// PUT /api/cv-analysis/[id]
export async function PUT(request: Request, { params }: { params: Params }) {
  let analysisId: string | undefined;
  try {
    // Perform await for session check *before* accessing URL/params
    const session = await getServerSession(authOptions);

    // Extract ID from URL instead of params initially
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    analysisId = pathSegments[pathSegments.length - 1]; // Get last segment

    // Basic validation if the extracted ID looks reasonable (optional)
    if (!analysisId) {
       throw new Error("Could not extract analysis ID from URL");
    }

    console.log(`Received PUT request to update Analysis ID: ${analysisId}`);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Find the existing record to verify ownership and get fileHash for cache
    const existingRecord = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      select: { developerId: true, fileHash: true } // Select only needed fields
    });

    if (!existingRecord) {
      return NextResponse.json({ error: 'Analysis record not found' }, { status: 404 });
    }

    if (existingRecord.developerId !== developerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Validate Request Body --- 
    let rawBody;
    try {
      rawBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const validationResult = UpdateCvAnalysisSchema.safeParse(rawBody);
    if (!validationResult.success) {
       console.error('Invalid update data:', validationResult.error.flatten());
        return NextResponse.json(
            { error: 'Invalid analysis data format', details: validationResult.error.flatten().fieldErrors }, 
            { status: 400 }
        );
    }
    const updatedAnalysisData = validationResult.data; // Use validated data
    console.log(`Validated update data for ID: ${analysisId}`);

    // --- Update Database --- 
    const updatedRecord = await prisma.cvAnalysis.update({
      where: { id: analysisId },
      data: {
        analysisResult: updatedAnalysisData, 
        status: AnalysisStatus.COMPLETED, 
        errorMessage: null, 
        analyzedAt: new Date(), 
      },
    });
    console.log("Analysis record updated in DB.");

    // --- Update Cache --- 
    if (existingRecord.fileHash) {
      const cacheKey = `${ANALYSIS_CACHE_PREFIX}${existingRecord.fileHash}`;
      await setCache(cacheKey, updatedRecord); 
      console.log("Analysis cache updated.");
    }

    return NextResponse.json({
      message: 'Analysis updated successfully',
      analysisId: updatedRecord.id,
      status: updatedRecord.status,
    });

  } catch (error) {
    // Ensure analysisId might be undefined here, handle appropriately
    console.error(`Error handling PUT request for Analysis ID ${analysisId ?? 'unknown'}:`, error);
    return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 });
  }
} 