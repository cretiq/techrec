import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { clearCachePattern } from '@/lib/redis';

const prisma = new PrismaClient();

// Request validation schema
const nestRequestSchema = z.object({
  childId: z.string(),
  parentId: z.string(),
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
    const validationResult = nestRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { childId, parentId } = validationResult.data;

    // Prevent self-nesting
    if (childId === parentId) {
      return NextResponse.json(
        { error: 'Cannot nest an experience under itself' },
        { status: 400 }
      );
    }

    // Verify both experiences belong to the developer
    const [child, parent] = await Promise.all([
      prisma.experience.findUnique({
        where: { id: childId, developerId },
        include: { children: true },
      }),
      prisma.experience.findUnique({
        where: { id: parentId, developerId },
        select: { id: true, parentId: true },
      }),
    ]);

    if (!child || !parent) {
      return NextResponse.json(
        { error: 'Experience not found or unauthorized' },
        { status: 403 }
      );
    }

    // Prevent circular nesting (parent cannot be a descendant of child)
    if (parent.parentId === childId) {
      return NextResponse.json(
        { error: 'Cannot create circular nesting relationship' },
        { status: 400 }
      );
    }

    // Check if child has children (prevent deep nesting beyond 2 levels)
    if (child.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot nest an experience that already has nested items' },
        { status: 400 }
      );
    }

    // Update the child experience to set its parent
    const updatedExperience = await prisma.experience.update({
      where: { id: childId },
      data: { parentId },
      include: {
        parent: true,
        projects: true,
      },
    });

    // Clear cache
    await clearCachePattern(`profile:${developerId}:*`);
    await clearCachePattern(`experience:${developerId}:*`);

    console.log(`[Nest] Successfully nested experience ${childId} under ${parentId} for developer ${developerId}`);

    return NextResponse.json({
      success: true,
      experience: updatedExperience,
    });

  } catch (error: any) {
    console.error('[Nest] Error:', error);
    return NextResponse.json(
      { error: 'Failed to nest experience', details: error.message },
      { status: 500 }
    );
  }
}