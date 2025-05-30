import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { CVAnalysis } from '@/utils/cv-analyzer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis } = await request.json() as { analysis: CVAnalysis };

    // Update the developer's profile with the extracted information
    const updatedDeveloper = await prisma.developer.update({
      where: { id: session.user.id },
      data: {
        // Basic profile information
        name: analysis.name || undefined,
        title: analysis.title || undefined,
        location: analysis.location || undefined,
        about: analysis.summary || undefined,
        phone: analysis.phone || undefined,
        profileEmail: analysis.email || undefined,

        // Skills
        developerSkills: {
          deleteMany: {}, // Remove existing skills
          create: analysis.skills.map(skill => ({
            skill: {
              connectOrCreate: {
                where: { name: skill.name },
                create: { 
                  name: skill.name,
                  category: skill.category || 'uncategorized'
                }
              }
            },
            level: skill.level || 'intermediate',
            yearsOfExperience: skill.yearsOfExperience || 0,
            lastUsed: new Date(),
            confidence: skill.confidence || 50
          }))
        },

        // Experience
        experience: {
          deleteMany: {}, // Remove existing experience
          create: analysis.experience.map(exp => ({
            title: exp.title,
            company: exp.company,
            location: exp.location,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            current: exp.current || false
          }))
        },

        // Education
        education: {
          deleteMany: {}, // Remove existing education
          create: analysis.education.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            year: new Date(edu.startDate).getFullYear().toString(),
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            description: edu.description
          }))
        },

        // Achievements
        achievements: {
          deleteMany: {}, // Remove existing achievements
          create: analysis.achievements.map(achievement => ({
            title: achievement.title,
            description: achievement.description,
            date: new Date(achievement.date)
          }))
        }
      },
      include: {
        developerSkills: {
          include: {
            skill: true
          }
        },
        experience: true,
        education: true,
        achievements: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDeveloper
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 