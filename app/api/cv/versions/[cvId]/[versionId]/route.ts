import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/cv/versions/[cvId]/[versionId] - Delete a specific version
export async function DELETE(
  request: Request,
  { params }: { params: { cvId: string; versionId: string } }
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

    // Don't allow deleting the active version if it's the only one
    if (version.isActive) {
      const versionCount = await prisma.cvAnalysisVersion.count({
        where: { cvId: version.cvId },
      });

      if (versionCount === 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only remaining version' },
          { status: 400 }
        );
      }

      // If deleting active version, activate another one
      const nextVersion = await prisma.cvAnalysisVersion.findFirst({
        where: {
          cvId: version.cvId,
          id: { not: versionId },
        },
        orderBy: { versionNumber: 'desc' },
      });

      if (nextVersion) {
        await prisma.cvAnalysisVersion.update({
          where: { id: nextVersion.id },
          data: { isActive: true },
        });

        // Update CV improvement score with the new active version
        await prisma.cV.update({
          where: { id: version.cvId },
          data: {
            improvementScore: nextVersion.improvementScore,
          },
        });
      }
    }

    // Delete the version
    await prisma.cvAnalysisVersion.delete({
      where: { id: versionId },
    });

    console.log(`[Delete Version] Successfully deleted version ${versionId}`);

    return NextResponse.json({
      success: true,
      message: 'Version deleted successfully',
    });

  } catch (error: any) {
    console.error('[Delete Version] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete version', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/cv/versions/[cvId]/[versionId] - Get a specific version
export async function GET(
  request: Request,
  { params }: { params: { cvId: string; versionId: string } }
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
            originalName: true,
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

    return NextResponse.json({
      version,
      cvName: version.cv.originalName,
    });

  } catch (error: any) {
    console.error('[Get Version] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version', details: error.message },
      { status: 500 }
    );
  }
}