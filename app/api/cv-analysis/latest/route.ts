import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/cv-analysis/latest
// Fetches the latest analysis version for the authenticated developer
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    console.log(`[GET /cv-analysis/latest] Fetching latest analysis for developer: ${developerId}`);

    // Get the latest analysis for this developer
    const latestAnalysis = await prisma.cvAnalysis.findFirst({
      where: { 
        developerId,
        status: 'COMPLETED' // Only get completed analyses
      },
      orderBy: { 
        createdAt: 'desc' // Get the most recent one
      },
      include: { 
        cv: { select: { extractedText: true } }
      }
    });

    if (!latestAnalysis) {
      console.log(`[GET /cv-analysis/latest] No completed analysis found for developer: ${developerId}`);
      return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
    }

    console.log(`[GET /cv-analysis/latest] Found latest analysis: ${latestAnalysis.id} for developer: ${developerId}`);

    return NextResponse.json(latestAnalysis);

  } catch (error) {
    console.error('[GET /cv-analysis/latest] Error fetching latest analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 