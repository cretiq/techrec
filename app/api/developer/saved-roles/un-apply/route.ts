import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Validation schema for un-apply request
const UnApplySchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  keepNotes: z.boolean().optional().default(false)
}).strict();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = UnApplySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { roleId, keepNotes } = validationResult.data;

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[UnApply] Request Debug:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        roleIdReceived: roleId,
        searchPattern: `External ID: ${roleId}`,
        keepNotes
      });
    }

    // Find saved role by external role ID stored in notes
    const existingSavedRole = await prisma.savedRole.findFirst({
      where: {
        developerId: session.user.id,
        notes: {
          contains: `External ID: ${roleId}`
        },
        appliedFor: true // Only allow un-applying if currently applied
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
      console.log('[UnApply] Search Result:', {
        timestamp: new Date().toISOString(),
        found: !!existingSavedRole,
        savedRoleId: existingSavedRole?.id,
        notes: existingSavedRole?.notes,
        currentlyApplied: existingSavedRole?.appliedFor
      });
    }

    if (!existingSavedRole) {
      return NextResponse.json(
        { error: 'Applied role not found or role is not currently applied.' },
        { status: 404 }
      );
    }

    // Reset the application status
    const savedRole = await prisma.savedRole.update({
      where: {
        id: existingSavedRole.id
      },
      data: {
        appliedFor: false,
        appliedAt: null,
        applicationMethod: null,
        // Keep or clear application notes based on keepNotes flag
        applicationNotes: keepNotes ? existingSavedRole.applicationNotes : null,
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

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[UnApply] Success:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        externalRoleId: roleId,
        savedRoleId: savedRole.id,
        internalRoleId: savedRole.roleId,
        unappliedSuccessfully: !savedRole.appliedFor,
        notesKept: keepNotes,
        unappliedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      savedRoleId: savedRole.id,
      unappliedAt: new Date().toISOString(),
      message: 'Role application status removed',
      data: savedRole
    });

  } catch (error) {
    // Get session again for error logging since it might be out of scope
    const errorSession = await getServerSession(authOptions);
    
    // Comprehensive error logging
    console.error('[UnApply] Error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: errorSession?.user?.id || 'unknown'
    });

    return NextResponse.json(
      { error: 'Failed to remove role application status' },
      { status: 500 }
    );
  }
}