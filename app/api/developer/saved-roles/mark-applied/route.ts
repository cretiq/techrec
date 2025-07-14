import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Validation schema for mark as applied request
const MarkAppliedSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  applicationMethod: z.enum(['easy_apply', 'external', 'manual', 'cover_letter']).optional(),
  jobPostingUrl: z.string().url().optional().or(z.literal('')),
  applicationNotes: z.string().optional()
}).strict();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = MarkAppliedSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { roleId, applicationMethod, jobPostingUrl, applicationNotes } = validationResult.data;

    // Debug logging for development (as per execution-primer guidance)
    if (process.env.NODE_ENV === 'development') {
      console.log('[MarkApplied] Request Debug:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        roleIdReceived: roleId,
        searchPattern: `External ID: ${roleId}`
      });
    }

    // Find saved role by external role ID stored in notes
    // Since we store external IDs in notes as "External ID: {externalId}"
    const existingSavedRole = await prisma.savedRole.findFirst({
      where: {
        developerId: session.user.id,
        notes: {
          contains: `External ID: ${roleId}`
        }
      },
      include: {
        role: {
          include: {
            company: true
          }
        }
      }
    });

    // Debug what we found
    if (process.env.NODE_ENV === 'development') {
      console.log('[MarkApplied] Search Result:', {
        timestamp: new Date().toISOString(),
        found: !!existingSavedRole,
        savedRoleId: existingSavedRole?.id,
        notes: existingSavedRole?.notes
      });
      
      // If not found, let's see what saved roles exist for this user
      if (!existingSavedRole) {
        const allSavedRoles = await prisma.savedRole.findMany({
          where: { developerId: session.user.id },
          select: { id: true, notes: true, roleId: true }
        });
        console.log('[MarkApplied] All saved roles for user:', {
          count: allSavedRoles.length,
          roles: allSavedRoles
        });
      }
    }

    if (!existingSavedRole) {
      return NextResponse.json(
        { error: 'Saved role not found. Please save the role first.' },
        { status: 404 }
      );
    }

    // Update the existing saved role to mark as applied
    const savedRole = await prisma.savedRole.update({
      where: {
        id: existingSavedRole.id
      },
      data: {
        appliedFor: true,
        appliedAt: new Date(),
        applicationMethod: applicationMethod || existingSavedRole.applicationMethod,
        jobPostingUrl: jobPostingUrl || existingSavedRole.jobPostingUrl,
        applicationNotes: applicationNotes || existingSavedRole.applicationNotes,
        updatedAt: new Date()
      },
      include: {
        role: {
          include: {
            company: true
          }
        }
      }
    });

    // Debug logging for development (as per execution-primer guidance)
    if (process.env.NODE_ENV === 'development') {
      console.log('[MarkApplied] Success:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        externalRoleId: roleId,
        savedRoleId: savedRole.id,
        internalRoleId: savedRole.roleId,
        wasAlreadySaved: true,
        applicationMethod: savedRole.applicationMethod,
        appliedAt: savedRole.appliedAt
      });
    }

    return NextResponse.json({
      success: true,
      savedRoleId: savedRole.id,
      appliedAt: savedRole.appliedAt?.toISOString(),
      message: 'Role marked as applied',
      data: savedRole
    });

  } catch (error) {
    // Get session again for error logging since it might be out of scope
    const errorSession = await getServerSession(authOptions);
    
    // Comprehensive error logging as per execution-primer
    console.error('[MarkApplied] Error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: errorSession?.user?.id || 'unknown'
    });

    return NextResponse.json(
      { error: 'Failed to mark role as applied' },
      { status: 500 }
    );
  }
}