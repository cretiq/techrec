import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeCV } from '@/lib/cv-analysis';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Please upload a file smaller than 5MB.' },
        { status: 400 }
      );
    }

    // Read the file content
    const buffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    // Analyze the CV
    const analysis = await analyzeCV(text);

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
            description: exp.description,
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
            field: edu.field,
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
    console.error('Error processing CV:', error);
    return NextResponse.json(
      { error: 'Failed to process CV' },
      { status: 500 }
    );
  }
} 