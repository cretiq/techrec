// API Route for Project Enhancement Records
// Handles CRUD operations for project enhancement history

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Request validation schemas
export const CreateProjectEnhancementSchema = z.object({
  portfolioId: z.string(),
  enhancementType: z.enum(['cv_description', 'technical_summary', 'impact_analysis', 'project_ideas']),
  originalContent: z.string(),
  enhancedContent: z.string(),
  pointsUsed: z.number().min(0),
  confidence: z.number().min(0).max(100),
  metadata: z.record(z.any()).optional()
});

export const UpdateProjectEnhancementSchema = z.object({
  id: z.string(),
  enhancedContent: z.string().optional(),
  confidence: z.number().min(0).max(100).optional(),
  userFeedback: z.enum(['helpful', 'somewhat_helpful', 'not_helpful']).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * POST /api/project-enhancement/enhancements
 * Create a new project enhancement record
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

    const validation = CreateProjectEnhancementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid project enhancement data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const {
      portfolioId,
      enhancementType,
      originalContent,
      enhancedContent,
      pointsUsed,
      confidence,
      metadata
    } = validation.data;

    // Verify the portfolio belongs to the user
    const portfolio = await prisma.projectPortfolio.findFirst({
      where: {
        id: portfolioId,
        developerId: userId
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Project portfolio not found or access denied' },
        { status: 404 }
      );
    }

    // Create project enhancement record
    const projectEnhancement = await prisma.projectEnhancement.create({
      data: {
        portfolioId,
        enhancementType,
        originalContent,
        enhancedContent,
        pointsUsed,
        confidence,
        metadata: metadata || {}
      }
    });

    return NextResponse.json({
      success: true,
      projectEnhancement
    });

  } catch (error) {
    console.error('Project enhancement creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create project enhancement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/project-enhancement/enhancements
 * Get project enhancement records
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
    const portfolioId = searchParams.get('portfolioId');
    const enhancementType = searchParams.get('enhancementType');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause - must include user ownership check
    const where: any = {
      portfolio: {
        developerId: userId
      }
    };

    if (portfolioId) {
      where.portfolioId = portfolioId;
    }

    if (enhancementType && ['cv_description', 'technical_summary', 'impact_analysis', 'project_ideas'].includes(enhancementType)) {
      where.enhancementType = enhancementType;
    }

    // Get project enhancements
    const projectEnhancements = await prisma.projectEnhancement.findMany({
      where,
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
            sourceType: true,
            sourceId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50), // Max 50 items
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.projectEnhancement.count({ where });

    return NextResponse.json({
      success: true,
      projectEnhancements,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Project enhancement fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project enhancements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/project-enhancement/enhancements
 * Update an existing project enhancement record
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

    const validation = UpdateProjectEnhancementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid project enhancement update data',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Check if enhancement exists and user has access
    const existingEnhancement = await prisma.projectEnhancement.findFirst({
      where: {
        id,
        portfolio: {
          developerId: userId
        }
      }
    });

    if (!existingEnhancement) {
      return NextResponse.json(
        { error: 'Project enhancement not found or access denied' },
        { status: 404 }
      );
    }

    // Update project enhancement
    const updatedEnhancement = await prisma.projectEnhancement.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      projectEnhancement: updatedEnhancement
    });

  } catch (error) {
    console.error('Project enhancement update error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update project enhancement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/project-enhancement/enhancements
 * Delete a project enhancement record
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
    const enhancementId = searchParams.get('id');

    if (!enhancementId) {
      return NextResponse.json(
        { error: 'Enhancement ID is required' },
        { status: 400 }
      );
    }

    // Check if enhancement exists and user has access
    const existingEnhancement = await prisma.projectEnhancement.findFirst({
      where: {
        id: enhancementId,
        portfolio: {
          developerId: userId
        }
      }
    });

    if (!existingEnhancement) {
      return NextResponse.json(
        { error: 'Project enhancement not found or access denied' },
        { status: 404 }
      );
    }

    // Delete project enhancement
    await prisma.projectEnhancement.delete({
      where: { id: enhancementId }
    });

    return NextResponse.json({
      success: true,
      message: 'Project enhancement deleted successfully'
    });

  } catch (error) {
    console.error('Project enhancement deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete project enhancement',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/project-enhancement/enhancements/stats
 * Get enhancement statistics for the user
 */
export async function getStats(request: NextRequest) {
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

    // Get enhancement statistics
    const stats = await prisma.projectEnhancement.groupBy({
      by: ['enhancementType'],
      where: {
        portfolio: {
          developerId: userId
        }
      },
      _count: {
        id: true
      },
      _sum: {
        pointsUsed: true
      },
      _avg: {
        confidence: true
      }
    });

    // Get recent activity
    const recentActivity = await prisma.projectEnhancement.findMany({
      where: {
        portfolio: {
          developerId: userId
        }
      },
      include: {
        portfolio: {
          select: {
            title: true,
            sourceType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Calculate totals
    const totals = {
      enhancements: stats.reduce((sum, stat) => sum + stat._count.id, 0),
      pointsUsed: stats.reduce((sum, stat) => sum + (stat._sum.pointsUsed || 0), 0),
      averageConfidence: stats.length > 0 
        ? stats.reduce((sum, stat) => sum + (stat._avg.confidence || 0), 0) / stats.length
        : 0
    };

    return NextResponse.json({
      success: true,
      stats: {
        byType: stats.map(stat => ({
          enhancementType: stat.enhancementType,
          count: stat._count.id,
          totalPointsUsed: stat._sum.pointsUsed || 0,
          averageConfidence: Math.round((stat._avg.confidence || 0) * 100) / 100
        })),
        totals,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Enhancement stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get enhancement statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}