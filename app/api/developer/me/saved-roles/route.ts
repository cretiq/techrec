import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

// Helper function to map company size strings to EmployeeRange enum
function mapCompanySize(sizeString?: string): 'LESS_THAN_10' | 'FROM_10_TO_50' | 'FROM_50_TO_250' | 'MORE_THAN_250' | undefined {
  if (!sizeString) return undefined;
  
  const size = sizeString.toLowerCase();
  
  if (size.includes('1-10') || size.includes('1 employee') || size.includes('2-10')) {
    return 'LESS_THAN_10';
  } else if (size.includes('11-50') || size.includes('10-50') || size.includes('10 to 50')) {
    return 'FROM_10_TO_50';
  } else if (size.includes('51-250') || size.includes('50-250') || size.includes('50 to 250')) {
    return 'FROM_50_TO_250';
  } else if (size.includes('251+') || size.includes('250+') || size.includes('more than 250')) {
    return 'MORE_THAN_250';
  }
  
  // Default fallback based on numbers in the string
  const numberMatch = size.match(/(\d+)/);
  if (numberMatch) {
    const num = parseInt(numberMatch[1]);
    if (num < 10) return 'LESS_THAN_10';
    if (num < 50) return 'FROM_10_TO_50';
    if (num < 250) return 'FROM_50_TO_250';
    return 'MORE_THAN_250';
  }
  
  return undefined;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedRoles = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        savedRoles: {
          include: {
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
          }
        }
      }
    });

    // Transform the response to include external roleIds for frontend compatibility
    const transformedSavedRoles = savedRoles?.savedRoles.map(savedRole => {
      // Extract external ID from notes (temporary solution)
      const externalIdMatch = savedRole.notes?.match(/External ID: (.+)/);
      const externalRoleId = externalIdMatch ? externalIdMatch[1] : savedRole.role.id;
      
      return {
        ...savedRole,
        roleId: externalRoleId, // Use external ID for frontend compatibility
        role: {
          ...savedRole.role,
          id: externalRoleId // Override role ID with external ID
        }
      };
    }) || [];

    return NextResponse.json(transformedSavedRoles);
  } catch (error) {
    console.error('Error fetching saved roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleData } = await request.json();
    
    if (!roleData || !roleData.id) {
      return NextResponse.json(
        { error: 'Role data is required' },
        { status: 400 }
      );
    }

    // First, find or create the company
    const companyName = roleData.company?.name || 'Unknown Company';
    let company = await prisma.company.findFirst({
      where: { name: companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          description: roleData.company?.description || '',
          industry: roleData.company?.industry ? [roleData.company.industry] : ['Technology'],
          size: mapCompanySize(roleData.company?.size),
          website: roleData.company?.website,
          logo: roleData.company?.logo,
        }
      });
    }

    // Find or create the role (use title + company for uniqueness)
    let role = await prisma.role.findFirst({
      where: {
        title: roleData.title,
        companyId: company.id
      }
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          title: roleData.title,
          description: roleData.description || '',
          companyId: company.id,
          location: roleData.location || 'Remote', 
          salary: roleData.salary || 'Not specified',
          type: roleData.type || 'FULL_TIME',
          remote: roleData.remote || false,
          visaSponsorship: roleData.visaSponsorship || false,
          requirements: roleData.requirements || [],
        }
      });
    }

    // Check if already saved to prevent duplicates
    const existingSave = await prisma.savedRole.findUnique({
      where: {
        developerId_roleId: {
          developerId: session.user.id,
          roleId: role.id
        }
      }
    });

    if (existingSave) {
      return NextResponse.json(existingSave);
    }

    // Create the saved role relationship
    const savedRole = await prisma.savedRole.create({
      data: {
        developerId: session.user.id,
        roleId: role.id,
        jobPostingUrl: roleData.url || roleData.applicationInfo?.applicationUrl,
        notes: `External ID: ${roleData.id}`, // Store external ID for reference
      },
      include: {
        role: {
          include: {
            company: true,
          }
        }
      }
    });

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[SaveRole] Success:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        externalRoleId: roleData.id,
        savedRoleId: savedRole.id,
        internalRoleId: savedRole.roleId,
        notes: savedRole.notes
      });
    }

    return NextResponse.json(savedRole);
  } catch (error) {
    console.error('Error saving role:', error);
    return NextResponse.json(
      { error: 'Failed to save role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleId } = await request.json();

    // Find saved roles that match the external roleId stored in notes
    const savedRolesToDelete = await prisma.savedRole.findMany({
      where: {
        developerId: session.user.id,
        notes: {
          contains: `External ID: ${roleId}`
        }
      }
    });

    if (savedRolesToDelete.length === 0) {
      return NextResponse.json(
        { error: 'Saved role not found' },
        { status: 404 }
      );
    }

    // Delete the found saved roles
    await prisma.savedRole.deleteMany({
      where: {
        id: {
          in: savedRolesToDelete.map(sr => sr.id)
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved role:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved role' },
      { status: 500 }
    );
  }
}

// PATCH /api/developer/me/saved-roles
// Updates saved role application status (mark as applied / un-apply)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleId, action, applicationMethod, jobPostingUrl, applicationNotes } = await request.json();
    
    if (!roleId || !action) {
      return NextResponse.json(
        { error: 'Role ID and action are required' },
        { status: 400 }
      );
    }

    if (!['mark-applied', 'un-apply'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "mark-applied" or "un-apply"' },
        { status: 400 }
      );
    }

    // Find saved role that matches the external roleId
    const savedRole = await prisma.savedRole.findFirst({
      where: {
        developerId: session.user.id,
        notes: {
          contains: `External ID: ${roleId}`
        }
      }
    });

    if (!savedRole) {
      return NextResponse.json(
        { error: 'Saved role not found' },
        { status: 404 }
      );
    }

    // Update the saved role based on action
    if (action === 'mark-applied') {
      await prisma.savedRole.update({
        where: { id: savedRole.id },
        data: {
          appliedAt: new Date(),
          applicationMethod: applicationMethod || 'external',
          jobPostingUrl: jobPostingUrl,
          applicationNotes: applicationNotes
        }
      });
    } else if (action === 'un-apply') {
      await prisma.savedRole.update({
        where: { id: savedRole.id },
        data: {
          appliedAt: null,
          applicationMethod: null,
          jobPostingUrl: null,
          applicationNotes: null
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating saved role application status:', error);
    return NextResponse.json(
      { error: 'Failed to update saved role application status' },
      { status: 500 }
    );
  }
} 