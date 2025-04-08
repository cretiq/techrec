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

    const developer = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
        developerSkills: {
          include: {
            skill: true
          }
        },
        experience: true,
        education: true,
        achievements: true,
        applications: true,
        savedRoles: true
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    return NextResponse.json(developer);
  } catch (error) {
    console.error('Error fetching developer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developer profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const updatedDeveloper = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        title: data.title,
        location: data.location,
        about: data.about,
        phone: data.phone,
        profileEmail: data.profileEmail
      },
      include: {
        developerSkills: {
          include: {
            skill: true
          }
        },
        experience: true,
        education: true,
        achievements: true,
        applications: true,
        savedRoles: true
      }
    });

    return NextResponse.json(updatedDeveloper);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    );
  }
} 