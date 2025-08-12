import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateGroupingSuggestions } from '@/utils/experienceSuggestions';
import { z } from 'zod';

const prisma = new PrismaClient();

// Request validation schema
const suggestionsRequestSchema = z.object({
  cvId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validationResult = suggestionsRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { cvId } = validationResult.data;

    // If cvId is provided, verify ownership
    if (cvId) {
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
    }

    // Fetch all experiences for the developer
    const experiences = await prisma.experience.findMany({
      where: { developerId },
      include: {
        projects: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' },
      ],
    });

    if (experiences.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: 'No experiences found to analyze',
      });
    }

    // Generate suggestions
    const suggestions = generateGroupingSuggestions(experiences);

    console.log(`[Grouping Suggestions] Generated ${suggestions.length} suggestions for developer ${developerId}`);

    return NextResponse.json({
      suggestions,
      experienceCount: experiences.length,
      generatedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Grouping Suggestions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // GET method for fetching existing suggestions if we want to cache them
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const developerId = session.user.id;

    // Fetch experiences
    const experiences = await prisma.experience.findMany({
      where: { developerId },
      include: {
        projects: true,
      },
      orderBy: [
        { displayOrder: 'asc' },
        { startDate: 'desc' },
      ],
    });

    if (experiences.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: 'No experiences found to analyze',
      });
    }

    // Generate suggestions (in production, we might cache these)
    const suggestions = generateGroupingSuggestions(experiences);

    return NextResponse.json({
      suggestions,
      experienceCount: experiences.length,
      generatedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Grouping Suggestions GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', details: error.message },
      { status: 500 }
    );
  }
}