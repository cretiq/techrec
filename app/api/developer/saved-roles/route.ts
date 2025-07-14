import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Query parameters validation
const GetSavedRolesSchema = z.object({
  appliedFor: z.enum(['true', 'false']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeRoleDetails: z.enum(['true', 'false']).optional()
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validationResult = GetSavedRolesSchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { appliedFor, startDate, endDate, includeRoleDetails } = validationResult.data;

    // Build query filters
    const where: any = {
      developerId: session.user.id
    };

    // Filter by application status if specified
    if (appliedFor !== undefined) {
      where.appliedFor = appliedFor === 'true';
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      where.appliedAt = {};
      if (startDate) {
        where.appliedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.appliedAt.lte = new Date(endDate);
      }
    }

    // Determine what to include in the response
    const includeDetails = includeRoleDetails === 'true';
    const include = includeDetails ? {
      role: {
        include: {
          company: true,
          skills: {
            include: {
              skill: true
            }
          }
        }
      }
    } : undefined;

    const savedRoles = await prisma.savedRole.findMany({
      where,
      include,
      orderBy: [
        { appliedAt: 'desc' }, // Most recently applied first
        { createdAt: 'desc' }  // Then most recently saved
      ]
    });

    // Transform saved roles to use external IDs for consistency
    const transformedSavedRoles = savedRoles.map(savedRole => {
      // Extract external ID from notes (temporary solution until schema upgrade)
      const externalIdMatch = savedRole.notes?.match(/External ID: (.+)/);
      const externalRoleId = externalIdMatch ? externalIdMatch[1] : savedRole.role?.id || savedRole.roleId;
      
      return {
        ...savedRole,
        roleId: externalRoleId, // Use external ID for frontend compatibility
        role: savedRole.role ? {
          ...savedRole.role,
          id: externalRoleId // Override role ID with external ID
        } : null
      };
    });

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[SavedRoles] Query:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        filters: { appliedFor, startDate, endDate },
        resultCount: transformedSavedRoles.length,
        appliedCount: transformedSavedRoles.filter(r => r.appliedFor).length,
        sampleTransformation: transformedSavedRoles[0] ? {
          originalRoleId: savedRoles[0]?.roleId,
          transformedRoleId: transformedSavedRoles[0]?.roleId,
          notes: savedRoles[0]?.notes
        } : 'No roles found'
      });
    }

    return NextResponse.json({
      savedRoles: transformedSavedRoles,
      totalCount: transformedSavedRoles.length,
      appliedCount: transformedSavedRoles.filter(r => r.appliedFor).length
    });

  } catch (error) {
    console.error('[SavedRoles] Error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id || 'unknown'
    });

    return NextResponse.json(
      { error: 'Failed to fetch saved roles' },
      { status: 500 }
    );
  }
}