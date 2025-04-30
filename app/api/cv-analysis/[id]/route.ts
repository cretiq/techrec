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
    console.log(`[GET /cv-analysis] Attempting DB fetch for ID: ${analysisId}`); // LOG
    const analysisRecord = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      include: { 
        cv: { select: { extractedText: true } }
      } 
    });
    console.log(`[GET /cv-analysis] DB fetch result:`, analysisRecord ? `Record found (Hash: ${analysisRecord.fileHash})` : 'Record not found'); // LOG

    if (!analysisRecord) {
      console.warn(`GET request: Analysis record ${analysisId} not found.`);
      return NextResponse.json({ error: 'Analysis record not found' }, { status: 404 });
    }

    // Verify ownership (keep logs)
    if (analysisRecord.developerId !== developerId) {
      console.warn(`GET request: User ${developerId} attempted to access analysis ${analysisId} owned by ${analysisRecord.developerId}.`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Attempt to fetch from Cache --- 
    let cacheHit = false;
    // const bypassCache = true; // Ensure this is removed or false

    if (analysisRecord.fileHash) { // Check if hash exists
      const cacheKey = `${ANALYSIS_CACHE_PREFIX}${analysisRecord.fileHash}`;
      console.log(`[GET /cv-analysis] Checking cache with key: ${cacheKey}`); // LOG
      try {
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
          console.log(`[GET /cv-analysis] Cache HIT for analysis ${analysisId} (key: ${cacheKey})`); // LOG
          const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
          cacheHit = true;
          console.log(`[GET /cv-analysis] Returning CACHED data for ${analysisId}`); // LOG
          return NextResponse.json(parsedData, { headers: { 'X-Cache-Status': 'hit' } });
        } else {
          console.log(`[GET /cv-analysis] Cache MISS for analysis ${analysisId} (key: ${cacheKey})`); // LOG
          // ---> WRITE TO CACHE ON MISS <--- 
          try {
             await setCache(cacheKey, analysisRecord); // Cache the record fetched from DB
             console.log(`[GET /cv-analysis] Wrote DB data to cache for key: ${cacheKey}`); // LOG
          } catch (setCacheError) {
             console.error(`[GET /cv-analysis] FAILED to write to cache for key ${cacheKey}:`, setCacheError); // LOG
          }
          // Proceed to return DB data below
        }
      } catch (cacheError) {
        console.error(`[GET /cv-analysis] Redis cache read error for key ${cacheKey}:`, cacheError); // LOG
        // Proceed to return DB data if cache fails
      }
    } else {
       console.log(`[GET /cv-analysis] Skipping cache check because fileHash is missing for ${analysisId}`); // LOG
    }

    // --- Return DB data if cache miss or no fileHash --- 
    console.log(`[GET /cv-analysis] Returning DB data for ${analysisId}`); // LOG
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
    const updatedRecordPartial = await prisma.cvAnalysis.update({ // Renamed temp var
      where: { id: analysisId },
      data: {
        analysisResult: updatedAnalysisData, 
        status: AnalysisStatus.COMPLETED, 
        errorMessage: null, 
        analyzedAt: new Date(), 
      },
    });
    console.log("Analysis record updated in DB.");

    // --- Remove Cache Update Logic --- 
    // Caching should primarily happen on GET requests after validation.
    // Avoids potential inconsistencies if PUT updates parts not in GET response.
    // if (existingRecord.fileHash && fullUpdatedRecord) { 
    //   const cacheKey = `${ANALYSIS_CACHE_PREFIX}${existingRecord.fileHash}`;
    //   await setCache(cacheKey, fullUpdatedRecord); // Cache the full record
    //   console.log("Analysis cache updated with full record.");
    // } else if (!fullUpdatedRecord) {
    //   console.warn(`Skipping cache update for ${analysisId} because re-fetch failed.`);
    // }

    return NextResponse.json({
      message: 'Analysis updated successfully',
      analysisId: updatedRecordPartial.id, // Return the basic ID/status
      status: updatedRecordPartial.status,
    });

  } catch (error) {
    // Ensure analysisId might be undefined here, handle appropriately
    console.error(`Error handling PUT request for Analysis ID ${analysisId ?? 'unknown'}:`, error);
    return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 });
  }
} 