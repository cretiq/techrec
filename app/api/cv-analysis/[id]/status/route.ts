import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, AnalysisStatus } from '@prisma/client';

const prisma = new PrismaClient();
const STALE_ANALYSIS_MINUTES = 2;

interface Params {
  id: string; 
}

// Revert to simple GET handler for polling
export async function GET(request: Request, { params }: { params: Params }) {
  // Ensure params is resolved before destructuring
  const resolvedParams = await Promise.resolve(params);
  const { id: analysisId } = resolvedParams;

  try {
    console.log(`Received GET status request for Analysis ID: ${analysisId}`);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const analysisRecord = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      select: { 
          id: true,
          status: true,
          analysisResult: true,
          errorMessage: true,
          developerId: true,
          requestedAt: true,
      }
    });

    if (!analysisRecord) {
      return NextResponse.json({ error: 'Analysis record not found' }, { status: 404 });
    }

    if (analysisRecord.developerId !== developerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check for stale PENDING status
    if (analysisRecord.status === AnalysisStatus.PENDING) {
      const analysisAge = Math.floor(
        (Date.now() - analysisRecord.requestedAt.getTime()) / (1000 * 60)
      );

      if (analysisAge > STALE_ANALYSIS_MINUTES) {
        // Update the record to FAILED status
        await prisma.cvAnalysis.update({
          where: { id: analysisId },
          data: {
            status: AnalysisStatus.FAILED,
            errorMessage: `Analysis timed out after ${analysisAge} minutes`,
            analyzedAt: new Date()
          }
        });

        console.log(`Marked stale analysis as failed: ${analysisId} (age: ${analysisAge} minutes)`);
        return NextResponse.json({
          id: analysisRecord.id,
          status: AnalysisStatus.FAILED,
          error: `Analysis timed out after ${analysisAge} minutes`,
          isStale: true
        });
      }
    }

    console.log(`Returning status ${analysisRecord.status} for Analysis ID: ${analysisId}`);
    return NextResponse.json({
        id: analysisRecord.id,
        status: analysisRecord.status,
        analysis: analysisRecord.analysisResult,
        error: analysisRecord.errorMessage,
    });

  } catch (error) {
    console.error(`Error handling GET status request for Analysis ID ${analysisId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve analysis status' }, { status: 500 });
  }
} 