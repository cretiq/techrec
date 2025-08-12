import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { clearCachePattern } from '@/lib/redis';

const prisma = new PrismaClient();

// Request validation schema
const unnestRequestSchema = z.object({
  experienceId: z.string(),
});

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = unnestRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { experienceId } = validationResult.data;

    // Verify experience belongs to the developer and has a parent
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId, developerId },
      select: { id: true, parentId: true, displayOrder: true },
    });

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found or unauthorized' },
        { status: 403 }
      );
    }

    if (!experience.parentId) {
      return NextResponse.json(
        { error: 'Experience is not nested' },
        { status: 400 }
      );
    }

    // Get the maximum display order for top-level experiences
    const maxOrder = await prisma.experience.aggregate({
      where: {
        developerId,
        parentId: null,
      },
      _max: {
        displayOrder: true,
      },
    });

    // Remove parent relationship and move to end of top-level list
    const updatedExperience = await prisma.experience.update({
      where: { id: experienceId },
      data: {
        parentId: null,
        displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      },
      include: {
        projects: true,
      },
    });

    // Clear cache
    await clearCachePattern(`profile:${developerId}:*`);
    await clearCachePattern(`experience:${developerId}:*`);

    console.log(`[Unnest] Successfully unnested experience ${experienceId} for developer ${developerId}`);

    return NextResponse.json({
      success: true,
      experience: updatedExperience,
    });

  } catch (error: any) {
    console.error('[Unnest] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unnest experience', details: error.message },
      { status: 500 }
    );
  }
}