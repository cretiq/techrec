import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { syncCvDataToProfile } from '@/utils/backgroundProfileSync';
import { clearCachePattern } from '@/lib/redis';

const prisma = new PrismaClient();

// POST /api/cv/versions/[cvId]/[versionId]/activate - Activate a specific version
export async function POST(
  request: Request,
  { params }: { params: Promise<{ cvId: string; versionId: string }> }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const { cvId, versionId } = params;

    // Verify version exists and get CV ownership
    const version = await prisma.cvAnalysisVersion.findUnique({
      where: { id: versionId },
      include: {
        cv: {
          select: {
            developerId: true,
            id: true,
          },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    if (version.cv.id !== cvId || version.cv.developerId !== developerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already active
    if (version.isActive) {
      return NextResponse.json({
        message: 'Version is already active',
        version,
      });
    }

    // Deactivate all other versions for this CV
    await prisma.cvAnalysisVersion.updateMany({
      where: { 
        cvId: version.cvId,
        id: { not: versionId },
      },
      data: { isActive: false },
    });

    // Activate this version
    const updatedVersion = await prisma.cvAnalysisVersion.update({
      where: { id: versionId },
      data: { isActive: true },
    });

    // Sync the activated version's data to profile
    console.log(`[Activate] Syncing version ${versionId} data to profile`);
    const extractedData = updatedVersion.userEdits || updatedVersion.extractedData;
    await syncCvDataToProfile(developerId, extractedData);

    // Update CV improvement score
    await prisma.cV.update({
      where: { id: version.cvId },
      data: {
        improvementScore: updatedVersion.improvementScore,
      },
    });

    // Clear cache
    await clearCachePattern(`cv:${developerId}:*`);
    await clearCachePattern(`analysis:${developerId}:*`);
    await clearCachePattern(`profile:${developerId}:*`);

    console.log(`[Activate] Successfully activated version ${versionId} for CV ${version.cvId}`);

    return NextResponse.json({
      success: true,
      version: updatedVersion,
      message: 'Version activated and synced to profile',
    });

  } catch (error: any) {
    console.error('[Activate Version] Error:', error);
    return NextResponse.json(
      { error: 'Failed to activate version', details: error.message },
      { status: 500 }
    );
  }
}