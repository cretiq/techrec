import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Achievement, Application, DeveloperProfile, Education, Experience, SavedRole, Skill } from '@/types/developer';
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

    const skills: Skill[] = developer.developerSkills.map(skill => ({
      id: skill.id,
      name: skill.skill.name,
      category: skill.skill.category?.name || 'Other',
      level: skill.level
    }));

    const achievements: Achievement[] = developer.achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title || '',
      description: achievement.description,
      date: achievement.date.toISOString().split('T')[0],
      url: achievement.url || undefined,
      issuer: achievement.issuer || undefined
    }));

    const experiences: Experience[] = developer.experience.map(experience => ({
      id: experience.id,
      title: experience.title || '',
      description: experience.description,
      date: experience.startDate.toISOString().split('T')[0]
    }));

    const education: Education[] = developer.education.map(education => ({
      id: education.id,
      title: education.degree || '',
      description: education.institution,
      date: education.startDate.toISOString().split('T')[0]
    }));    

    const applications: Application[] = developer.applications.map(application => ({
      id: application.id,
      title: application.roleId,
      description: application.coverLetter || '',
      date: application.appliedAt.toISOString().split('T')[0]
    }));

    const savedRoles: SavedRole[] = developer.savedRoles.map(role => ({
      id: role.id,
      title: role.roleId,
      description: role.notes || '',
      date: role.createdAt.toISOString().split('T')[0]
    }));

    const mappedDeveloper: DeveloperProfile = {
      name: developer.name || '',
      email: developer.profileEmail || '',
      phone: developer.contactInfo?.phone || '',
      location: developer.contactInfo?.address || '',
      linkedin: developer.contactInfo?.linkedin || undefined,
      github: developer.contactInfo?.github || undefined,
      portfolio: developer.contactInfo?.website || undefined,
      skills: skills,
      achievements: achievements,
      experience: experiences,
      education: education,
      applications: applications,
      savedRoles: savedRoles,
      totalExperience: undefined
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
      // Delete existing experience first
      await prisma.experience.deleteMany({
        where: { developerId: session.user.id }
      });

      // Only create new entries if the array is not empty
      if (Array.isArray(data.experience) && data.experience.length > 0) {
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
            institution: exp.institution,
            responsibilities: exp.responsibilities,
            achievements: exp.achievements,
            teamSize: exp.teamSize,
            techStack: exp.techStack
          }))
        });
      }
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

    // Map the developer data to match DeveloperProfile interface
    const mappedDeveloper: DeveloperProfile = {
      name: finalDeveloper.name || '',
      email: finalDeveloper.email || '',
      phone: finalDeveloper.contactInfo?.phone || '',
      location: finalDeveloper.contactInfo?.address || '',
      linkedin: finalDeveloper.contactInfo?.linkedin || undefined,
      github: finalDeveloper.contactInfo?.github || undefined,
      portfolio: finalDeveloper.contactInfo?.website || undefined,
      skills: finalDeveloper.developerSkills.map(skill => ({
        id: skill.id,
        name: skill.skill.name,
        category: skill.skill.category?.name || 'Other',
        level: skill.level
      })),
      achievements: finalDeveloper.achievements.map(achievement => ({
        id: achievement.id,
        title: achievement.title || '',
        description: achievement.description,
        date: achievement.date.toISOString().split('T')[0],
        url: achievement.url || undefined,
        issuer: achievement.issuer || undefined
      })),
      experience: finalDeveloper.experience.map(exp => ({
        id: exp.id,
        title: exp.title || '',
        description: exp.description,
        date: exp.startDate.toISOString().split('T')[0]
      })),
      education: finalDeveloper.education.map(edu => ({
        id: edu.id,
        title: edu.degree || '',
        description: edu.institution || '',
        date: edu.startDate.toISOString().split('T')[0]
      })),
      applications: finalDeveloper.applications.map(app => ({
        id: app.id,
        title: app.roleId,
        description: app.coverLetter || '',
        date: app.appliedAt.toISOString().split('T')[0]
      })),
      savedRoles: finalDeveloper.savedRoles.map(role => ({
        id: role.id,
        title: role.roleId,
        description: role.notes || '',
        date: role.createdAt.toISOString().split('T')[0]
      })),
      totalExperience: undefined
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