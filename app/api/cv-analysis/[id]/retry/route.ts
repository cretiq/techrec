import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, AnalysisStatus } from '@prisma/client';
import { processCvAnalysis } from '@/utils/analysisService';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id;

  try {
    console.log(`Received retry request for Analysis ID: ${analysisId}`);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Find and verify ownership of the analysis
    const analysis = await prisma.cvAnalysis.findUnique({
      where: { id: analysisId },
      select: { 
        id: true, 
        developerId: true, 
        status: true,
        requestedAt: true
      }
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (analysis.developerId !== developerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mark the old analysis as failed
    await prisma.cvAnalysis.update({
      where: { id: analysisId },
      data: {
        status: AnalysisStatus.FAILED,
        errorMessage: 'Analysis manually restarted by user',
        analyzedAt: new Date()
      }
    });

    // Start new analysis
    console.log(`Restarting analysis for ID: ${analysisId}`);
    Promise.race([
      processCvAnalysis(analysisId).catch(error => {
        console.error('Background analysis process error:', error);
      }),
      Promise.resolve()
    ]);

    return NextResponse.json({ 
      message: 'Analysis restart initiated',
      analysisId
    });

  } catch (error) {
    console.error('Error handling retry request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to restart analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 