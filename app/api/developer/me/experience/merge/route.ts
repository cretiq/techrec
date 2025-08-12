import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { clearCachePattern } from '@/lib/redis';

const prisma = new PrismaClient();

// Request validation schema
const mergeRequestSchema = z.object({
  sourceIds: z.array(z.string()).min(2),
  targetId: z.string().optional(),
});

// Helper function to merge date ranges
function mergeDateRanges(experiences: any[]): { startDate: Date; endDate: Date | null; current: boolean } {
  const startDates = experiences.map(e => new Date(e.startDate));
  const endDates = experiences
    .filter(e => e.endDate)
    .map(e => new Date(e.endDate));
  
  const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
  const latestEnd = endDates.length > 0 
    ? new Date(Math.max(...endDates.map(d => d.getTime())))
    : null;
  
  const current = experiences.some(e => e.current);
  
  return {
    startDate: earliestStart,
    endDate: current ? null : latestEnd,
    current,
  };
}

// Helper function to merge arrays without duplicates
function mergeArraysUnique(...arrays: string[][]): string[] {
  return [...new Set(arrays.flat())];
}

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
    const validationResult = mergeRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { sourceIds, targetId } = validationResult.data;

    // Verify all source experiences belong to the developer
    const sourceExperiences = await prisma.experience.findMany({
      where: {
        id: { in: sourceIds },
        developerId,
      },
      include: {
        projects: true,
      },
    });

    if (sourceExperiences.length !== sourceIds.length) {
      return NextResponse.json(
        { error: 'Some experiences not found or unauthorized' },
        { status: 403 }
      );
    }

    // Check if any source experience has children (we don't merge parent experiences)
    const hasChildren = await prisma.experience.findFirst({
      where: {
        parentId: { in: sourceIds },
      },
    });

    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cannot merge experiences that have nested items' },
        { status: 400 }
      );
    }

    // Merge data
    const { startDate, endDate, current } = mergeDateRanges(sourceExperiences);
    
    // Combine all data from source experiences
    const mergedData = {
      title: sourceExperiences[0].title, // Use first experience's title as default
      company: sourceExperiences[0].company, // Use first experience's company
      description: sourceExperiences
        .map(e => e.description)
        .filter(Boolean)
        .join('\n\n'),
      location: sourceExperiences[0].location,
      startDate,
      endDate,
      current,
      responsibilities: mergeArraysUnique(...sourceExperiences.map(e => e.responsibilities || [])),
      achievements: mergeArraysUnique(...sourceExperiences.map(e => e.achievements || [])),
      techStack: mergeArraysUnique(...sourceExperiences.map(e => e.techStack || [])),
      teamSize: Math.max(...sourceExperiences.map(e => e.teamSize || 0).filter(Boolean)),
      mergedFrom: sourceIds,
      displayOrder: Math.min(...sourceExperiences.map(e => e.displayOrder)),
    };

    let mergedExperience;

    if (targetId) {
      // Verify target experience belongs to developer
      const targetExperience = await prisma.experience.findUnique({
        where: { id: targetId, developerId },
      });

      if (!targetExperience) {
        return NextResponse.json(
          { error: 'Target experience not found or unauthorized' },
          { status: 403 }
        );
      }

      // Update target experience with merged data
      mergedExperience = await prisma.experience.update({
        where: { id: targetId },
        data: mergedData,
      });

      // Delete source experiences (except target if it's in the list)
      await prisma.experience.deleteMany({
        where: {
          id: { in: sourceIds.filter(id => id !== targetId) },
        },
      });
      
    } else {
      // Create new merged experience
      mergedExperience = await prisma.experience.create({
        data: {
          ...mergedData,
          developerId,
        },
      });

      // Migrate projects from source experiences to the new merged experience
      await prisma.experienceProject.updateMany({
        where: {
          experienceId: { in: sourceIds },
        },
        data: {
          experienceId: mergedExperience.id,
        },
      });

      // Delete source experiences
      await prisma.experience.deleteMany({
        where: {
          id: { in: sourceIds },
        },
      });
    }

    // Clear cache
    await clearCachePattern(`profile:${developerId}:*`);
    await clearCachePattern(`experience:${developerId}:*`);

    console.log(`[Merge] Successfully merged ${sourceIds.length} experiences for developer ${developerId}`);

    return NextResponse.json({
      success: true,
      experience: mergedExperience,
      mergedCount: sourceIds.length,
    });

  } catch (error: any) {
    console.error('[Merge] Error:', error);
    return NextResponse.json(
      { error: 'Failed to merge experiences', details: error.message },
      { status: 500 }
    );
  }
}