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

    // Update or create contact info
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

    // Handle experience
    if (data.experience) {
      // Delete existing experience
      await prisma.experience.deleteMany({
        where: { developerId: session.user.id }
      });

      // Create new experience entries
      await prisma.experience.createMany({
        data: data.experience.map((exp: any) => ({
          developerId: session.user.id,
          title: exp.title,
          company: exp.company,
          description: exp.description,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          responsibilities: exp.responsibilities,
          achievements: exp.achievements,
          teamSize: exp.teamSize,
          techStack: exp.techStack
        }))
      });
    }

    // Handle education
    if (data.education) {
      // Delete existing education
      await prisma.education.deleteMany({
        where: { developerId: session.user.id }
      });

      // Create new education entries
      await prisma.education.createMany({
        data: data.education.map((edu: any) => ({
          developerId: session.user.id,
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
          honors: edu.honors,
          activities: edu.activities
        }))
      });
    }

    // Handle achievements
    if (data.achievements) {
      // Delete existing achievements
      await prisma.achievement.deleteMany({
        where: { developerId: session.user.id }
      });

      // Create new achievement entries
      await prisma.achievement.createMany({
        data: data.achievements.map((achievement: any) => ({
          developerId: session.user.id,
          title: achievement.title,
          description: achievement.description,
          date: achievement.date,
          url: achievement.url,
          issuer: achievement.issuer
        }))
      });
    }

    // Fetch the complete updated developer with all relations
    const finalDeveloper = await prisma.developer.findUnique({
      where: { id: session.user.id },
      include: {
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