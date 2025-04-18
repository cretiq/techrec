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
      select: {
        id: true,
        email: true,
        profileEmail: true,
        name: true,
        title: true,
        about: true,
        isDeleted: true,
        deletedAt: true,
        contactInfo: true,
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        },
        experience: true,
        education: true,
        achievements: true,
        applications: true,
        savedRoles: true,
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    const mappedDeveloper = {
      ...developer,
      phone: developer.contactInfo?.phone || '',
      location: developer.contactInfo?.address || '',
      city: developer.contactInfo?.city || '',
      state: developer.contactInfo?.state || '',
      country: developer.contactInfo?.country || '',
      about: developer.about || '',
      skills: developer.developerSkills.map(skill => ({
        id: skill.id,
        name: skill.skill.name,
        category: skill.skill.category?.name || 'Other',
        level: skill.level
      }))
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
    console.log("Updating developer profile with data:", data);
    
    await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        title: data.title,
        about: data.about,
        profileEmail: data.profileEmail,
      }
    });

    await prisma.contactInfo.upsert({
      where: {
        developerId: session.user.id
      },
      create: {
        developerId: session.user.id,
        phone: data.contactInfo?.phone || null,
        address: data.contactInfo?.address || null,
        city: data.contactInfo?.city || null,
        state: data.contactInfo?.state || null,
        country: data.contactInfo?.country || null
      },
      update: {
        phone: data.contactInfo?.phone || null,
        address: data.contactInfo?.address || null,
        city: data.contactInfo?.city || null,
        state: data.contactInfo?.state || null,
        country: data.contactInfo?.country || null
      }
    });

    if (data.experience && Array.isArray(data.experience)) {
      await prisma.$transaction([
        prisma.experience.deleteMany({ where: { developerId: session.user.id } }),
        prisma.experience.createMany({
          data: data.experience.map((exp: any) => ({
            ...exp,
            developerId: session.user.id,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          })),
        }),
      ]);
    }

    if (data.education && Array.isArray(data.education)) {
      await prisma.$transaction([
        prisma.education.deleteMany({ where: { developerId: session.user.id } }),
        prisma.education.createMany({
          data: data.education.map((edu: any) => ({
            ...edu,
            developerId: session.user.id,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            gpa: edu.gpa ? parseFloat(edu.gpa) : null,
          })),
        }),
      ]);
    }

    if (data.achievements && Array.isArray(data.achievements)) {
      await prisma.$transaction([
        prisma.achievement.deleteMany({ where: { developerId: session.user.id } }),
        prisma.achievement.createMany({
          data: data.achievements.map((ach: any) => ({
            ...ach,
            developerId: session.user.id,
            date: ach.date ? new Date(ach.date) : undefined,
          })),
        }),
      ]);
    }

    const finalDeveloper = await prisma.developer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        profileEmail: true,
        name: true,
        title: true,
        about: true,
        isDeleted: true,
        deletedAt: true,
        contactInfo: true,
        developerSkills: {
          include: {
            skill: {
              include: {
                category: true
              }
            }
          }
        },
        experience: true,
        education: true,
        achievements: true,
        applications: true,
        savedRoles: true,
      }
    });

    if (!finalDeveloper) {
      throw new Error('Failed to fetch updated developer');
    }

    const mappedDeveloper = {
      ...finalDeveloper,
      phone: finalDeveloper.contactInfo?.phone || '',
      location: finalDeveloper.contactInfo?.address || '',
      city: finalDeveloper.contactInfo?.city || '',
      state: finalDeveloper.contactInfo?.state || '',
      country: finalDeveloper.contactInfo?.country || '',
      about: finalDeveloper.about || '',
      skills: finalDeveloper.developerSkills.map(skill => ({
        id: skill.id,
        name: skill.skill.name,
        category: skill.skill.category?.name || 'Other',
        level: skill.level
      }))
    };

    return NextResponse.json(mappedDeveloper);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update developer profile';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 