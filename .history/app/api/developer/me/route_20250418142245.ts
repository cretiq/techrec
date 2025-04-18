import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Developer, ContactInfo, DeveloperSkill, Skill, SkillCategory } from '@prisma/client';

// Define a more specific type for the developer object with relations
type DeveloperWithRelations = Developer & {
  contactInfo: ContactInfo | null;
  developerSkills: (DeveloperSkill & {
    skill: Skill & {
      category: SkillCategory | null;
    };
  })[];
  experience: any[];
  education: any[];
  achievements: any[];
  applications: any[];
  savedRoles: any[];
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const developerData = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
        about: true,
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
        contactInfo: true
      }
    });

    if (!developerData) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Explicitly cast the fetched data to our specific type
    const developer = developerData as DeveloperWithRelations;

    const mappedDeveloper = {
      id: developer.id,
      email: developer.email,
      profileEmail: developer.profileEmail,
      name: developer.name,
      title: developer.title,
      about: developer.about || '',
      phone: developer.contactInfo?.phone || '',
      location: developer.contactInfo?.address || '',
      city: developer.contactInfo?.city || '',
      state: developer.contactInfo?.state || '',
      country: developer.contactInfo?.country || '',
      skills: developer.developerSkills.map(skill => ({
        id: skill.id,
        name: skill.skill.name,
        category: skill.skill.category?.name || 'Other',
        level: skill.level
      })),
      experience: developer.experience,
      education: developer.education,
      achievements: developer.achievements,
      applications: developer.applications,
      savedRoles: developer.savedRoles,
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

    const finalDeveloperData = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
        about: true,
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
        contactInfo: true
      }
    });

    if (!finalDeveloperData) {
      throw new Error('Failed to fetch updated developer');
    }

    // Explicitly cast the fetched data
    const finalDeveloper = finalDeveloperData as DeveloperWithRelations;

    const mappedDeveloper = {
      id: finalDeveloper.id,
      email: finalDeveloper.email,
      profileEmail: finalDeveloper.profileEmail,
      name: finalDeveloper.name,
      title: finalDeveloper.title,
      about: finalDeveloper.about || '',
      phone: finalDeveloper.contactInfo?.phone || '',
      location: finalDeveloper.contactInfo?.address || '',
      city: finalDeveloper.contactInfo?.city || '',
      state: finalDeveloper.contactInfo?.state || '',
      country: finalDeveloper.contactInfo?.country || '',
      skills: finalDeveloper.developerSkills.map(skill => ({
        id: skill.id,
        name: skill.skill.name,
        category: skill.skill.category?.name || 'Other',
        level: skill.level
      })),
      experience: finalDeveloper.experience,
      education: finalDeveloper.education,
      achievements: finalDeveloper.achievements,
      applications: finalDeveloper.applications,
      savedRoles: finalDeveloper.savedRoles,
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