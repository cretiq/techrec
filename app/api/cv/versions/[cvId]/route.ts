import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cv/versions/[cvId] - Get all versions for a CV
export async function GET(
  request: Request,
  { params }: { params: { cvId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    const { cvId } = params;

    // Verify CV ownership
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      select: { developerId: true },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    if (cv.developerId !== developerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all versions for this CV
    const versions = await prisma.cvAnalysisVersion.findMany({
      where: { cvId },
      orderBy: { versionNumber: 'desc' },
    });

    console.log(`[Versions] Found ${versions.length} versions for CV ${cvId}`);

    return NextResponse.json({
      versions,
      count: versions.length,
    });

  } catch (error: any) {
    console.error('[Versions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions', details: error.message },
      { status: 500 }
    );
  }
}