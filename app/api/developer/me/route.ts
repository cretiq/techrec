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
        savedRoles: true,
        contactInfo: true
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Map the contact info to the expected format
    const mappedDeveloper = {
      ...developer,
      phone: developer.contactInfo?.phone || '',
      location: developer.contactInfo?.address || '',
      city: developer.contactInfo?.city || '',
      state: developer.contactInfo?.state || '',
      country: developer.contactInfo?.country || '',
      about: developer.about || ''
    };

    return NextResponse.json(mappedDeveloper);
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
    console.log("This is the data", data.about);
    
    // First update the developer's basic info
    const updatedDeveloper = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        title: data.title,
        profileEmail: data.profileEmail,
        about: data.about
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
        savedRoles: true,
        contactInfo: true
      }
    });

    // Then update or create contact info
    await prisma.contactInfo.upsert({
      where: {
        developerId: session.user.id
      },
      create: {
        developerId: session.user.id,
        phone: data.phone || null,
        address: data.location || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null
      },
      update: {
        phone: data.phone || null,
        address: data.location || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null
      }
    });

    // Fetch the complete updated developer with all relations
    const finalDeveloper = await prisma.developer.findUnique({
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
        savedRoles: true,
        contactInfo: true
      }
    });

    if (!finalDeveloper) {
      throw new Error('Failed to fetch updated developer');
    }

    // Map the contact info to the expected format
    const mappedDeveloper = {
      ...finalDeveloper,
      phone: finalDeveloper.contactInfo?.phone || '',
      location: finalDeveloper.contactInfo?.address || '',
      city: finalDeveloper.contactInfo?.city || '',
      state: finalDeveloper.contactInfo?.state || '',
      country: finalDeveloper.contactInfo?.country || '',
      about: finalDeveloper.about || ''
    };

    return NextResponse.json(mappedDeveloper);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update developer profile' },
      { status: 500 }
    );
  }
} 