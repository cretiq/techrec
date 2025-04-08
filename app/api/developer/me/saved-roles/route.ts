import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json(savedRoles?.savedRoles || []);
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

    const { roleId } = await request.json();

    // Check if the role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Save the role
    const savedRole = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        savedRoles: {
          create: {
            roleId
          }
        }
      },
      include: {
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

    return NextResponse.json(savedRole.savedRoles[savedRole.savedRoles.length - 1]);
  } catch (error) {
    console.error('Error saving role:', error);
    return NextResponse.json(
      { error: 'Failed to save role' },
      { status: 500 }
    );
  }
} 