import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { clearCachePattern } from '@/lib/redis';

const prisma = new PrismaClient();

// Request validation schema
const reorderRequestSchema = z.object({
  experienceIds: z.array(z.string()).min(1),
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
    const validationResult = reorderRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { experienceIds } = validationResult.data;

    // Verify all experiences belong to the developer
    const experiences = await prisma.experience.findMany({
      where: {
        id: { in: experienceIds },
        developerId,
      },
      select: { id: true },
    });

    if (experiences.length !== experienceIds.length) {
      return NextResponse.json(
        { error: 'Some experiences not found or unauthorized' },
        { status: 403 }
      );
    }

    // Update display order for each experience
    const updatePromises = experienceIds.map((id, index) =>
      prisma.experience.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await prisma.$transaction(updatePromises);

    // Clear cache
    await clearCachePattern(`profile:${developerId}:*`);
    await clearCachePattern(`experience:${developerId}:*`);

    console.log(`[Reorder] Successfully reordered ${experienceIds.length} experiences for developer ${developerId}`);

    return NextResponse.json({
      success: true,
      message: `Reordered ${experienceIds.length} experiences`,
    });

  } catch (error: any) {
    console.error('[Reorder] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder experiences', details: error.message },
      { status: 500 }
    );
  }
}