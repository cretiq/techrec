// API Route for Project Portfolio Management
// Handles CRUD operations for user project portfolios

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Request validation schemas
export const CreateProjectPortfolioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  sourceType: z.enum(['github', 'idea', 'manual']),
  sourceId: z.string(),
  technologies: z.array(z.string()),
  achievements: z.array(z.string()),
  cvDescription: z.string(),
  metadata: z.record(z.any()).optional()
});

export const UpdateProjectPortfolioSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  technologies: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  cvDescription: z.string().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export const CreateProjectEnhancementSchema = z.object({
  portfolioId: z.string(),
  enhancementType: z.enum(['cv_description', 'technical_summary', 'impact_analysis']),
  originalContent: z.string(),
  enhancedContent: z.string(),
  pointsUsed: z.number().min(0),
  confidence: z.number().min(0).max(100),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /api/project-portfolio
 * Create a new project portfolio entry
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const validation = CreateProjectPortfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid project portfolio data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      sourceType,
      sourceId,
      technologies,
      achievements,
      cvDescription,
      metadata
    } = validation.data;

    // Create project portfolio
    const personalProjectPortfolio = await prisma.personalProjectPortfolio.create({
      data: {
        developerId: userId,
        title,
        description,
        sourceType,
        sourceId,
        technologies,
        achievements,
        cvDescription,
        isPublic: false, // Default to private
        metadata: metadata || {}
      }
    });

    return NextResponse.json({
      success: true,
      projectPortfolio
    });

  } catch (error) {
    console.error('Project portfolio creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/project-portfolio
 * Get user's project portfolios
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const includeEnhancements = searchParams.get('includeEnhancements') === 'true';
    const sourceType = searchParams.get('sourceType');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      developerId: userId
    };

    if (sourceType && ['github', 'idea', 'manual'].includes(sourceType)) {
      where.sourceType = sourceType;
    }

    // Get project portfolios
    const personalProjectPortfolios = await prisma.personalProjectPortfolio.findMany({
      where,
      include: {
        enhancements: includeEnhancements ? {
          orderBy: { createdAt: 'desc' },
          take: 5 // Limit enhancements per portfolio
        } : false
      },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(limit, 50), // Max 50 items
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.personalProjectPortfolio.count({ where });

    return NextResponse.json({
      success: true,
      projectPortfolios: personalProjectPortfolios,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Project portfolio fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project portfolios',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/project-portfolio
 * Update an existing project portfolio
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse and validate request
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const validation = UpdateProjectPortfolioSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid project portfolio update data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.personalProjectPortfolio.findFirst({
      where: {
        id,
        developerId: userId
      }
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: 'Project portfolio not found or access denied' },
        { status: 404 }
      );
    }

    // Update project portfolio
    const updatedPortfolio = await prisma.personalProjectPortfolio.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      projectPortfolio: updatedPortfolio
    });

  } catch (error) {
    console.error('Project portfolio update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update project portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/project-portfolio
 * Delete a project portfolio
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await prisma.personalProjectPortfolio.findFirst({
      where: {
        id: portfolioId,
        developerId: userId
      }
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: 'Project portfolio not found or access denied' },
        { status: 404 }
      );
    }

    // Delete project portfolio (cascade will handle enhancements)
    await prisma.personalProjectPortfolio.delete({
      where: { id: portfolioId }
    });

    return NextResponse.json({
      success: true,
      message: 'Project portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Project portfolio deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete project portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}