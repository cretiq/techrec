import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, AnalysisStatus } from '@prisma/client';
import { setCache } from '@/lib/redis';
import { UpdateCvAnalysisSchema } from '@/types/cv';

const prisma = new PrismaClient();
const ANALYSIS_CACHE_PREFIX = 'cv_analysis:';

interface Params {
  id: string; // Original CvAnalysis record ID
}

// POST /api/cv-analysis/[id]/save-version
// Creates a new version of the analysis instead of updating the existing one
export async function POST(request: Request, { params }: { params: Params }) {
  let originalAnalysisId: string | undefined;
  try {
    const session = await getServerSession(authOptions);

    // Extract ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    originalAnalysisId = pathSegments[pathSegments.length - 2]; // Get the ID before 'save-version'

    if (!originalAnalysisId) {
       throw new Error("Could not extract analysis ID from URL");
    }

    console.log(`[POST /cv-analysis/${originalAnalysisId}/save-version] Received request.`);

    if (!session?.user?.id) {
      console.warn(`[POST /cv-analysis/${originalAnalysisId}/save-version] Unauthorized: No session user ID.`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Find the original record to verify ownership and get metadata
    const originalRecord = await prisma.cvAnalysis.findUnique({
      where: { id: originalAnalysisId },
      select: { 
        developerId: true, 
        fileHash: true,
        originalName: true,
        mimeType: true,
        size: true,
        s3Key: true,
        cvId: true
      }
    });

    if (!originalRecord) {
      return NextResponse.json({ error: 'Original analysis record not found' }, { status: 404 });
    }

    if (originalRecord.developerId !== developerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate Request Body
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
    const updatedAnalysisData = validationResult.data;
    console.log(`Validated update data for original ID: ${originalAnalysisId}`);

    // Create a new CvAnalysis record (new version)
    const newAnalysisRecord = await prisma.cvAnalysis.create({
      data: {
        developerId,
        cvId: originalRecord.cvId,
        originalName: originalRecord.originalName,
        fileHash: originalRecord.fileHash,
        s3Key: originalRecord.s3Key,
        mimeType: originalRecord.mimeType,
        size: originalRecord.size,
        status: AnalysisStatus.COMPLETED,
        analysisResult: updatedAnalysisData,
        analyzedAt: new Date(),
      },
    });

    console.log(`[POST /cv-analysis/${originalAnalysisId}/save-version] Created new version with ID: ${newAnalysisRecord.id}`);

    // Update cache with the new version if fileHash exists
    if (originalRecord.fileHash) {
      const cacheKey = `${ANALYSIS_CACHE_PREFIX}${originalRecord.fileHash}`;
      await setCache(cacheKey, newAnalysisRecord);
      console.log(`[POST /cv-analysis/${originalAnalysisId}/save-version] Cache updated with new version.`);
    }

    // Return the new analysis record
    return NextResponse.json({
      message: 'New analysis version created successfully',
      analysisId: newAnalysisRecord.id,
      originalAnalysisId: originalAnalysisId,
      status: newAnalysisRecord.status,
      version: 'new'
    });

  } catch (error) {
    console.error(`Error handling POST request for Analysis ID ${originalAnalysisId ?? 'unknown'}:`, error);
    return NextResponse.json({ error: 'Failed to create new analysis version' }, { status: 500 });
  }
} 