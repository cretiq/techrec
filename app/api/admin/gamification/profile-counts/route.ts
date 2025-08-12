import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const adminEmails = [
      "filipmellqvist255@gmail.com",
      "admin@techrec.com",
      "admin@test.com",
    ];

    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const developerId = searchParams.get('developerId');

    if (!developerId) {
      return NextResponse.json({ error: 'Developer ID is required' }, { status: 400 });
    }

    // Verify developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Get counts for all profile data types
    const [
      skillsCount,
      experienceCount,
      educationCount,
      achievementsCount,
      personalProjectsCount,
      experienceProjectsCount
    ] = await Promise.all([
      prisma.developerSkill.count({ where: { developerId } }),
      prisma.experience.count({ where: { developerId } }),
      prisma.education.count({ where: { developerId } }),
      prisma.achievement.count({ where: { developerId } }),
      prisma.personalProject.count({ where: { developerId } }),
      prisma.experienceProject.count({ where: { experience: { developerId } } })
    ]);

    return NextResponse.json({
      skills: skillsCount,
      experience: experienceCount,
      education: educationCount,
      achievements: achievementsCount,
      personalProjects: personalProjectsCount,
      experienceProjects: experienceProjectsCount
    });

  } catch (error) {
    console.error('Error fetching profile data counts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch profile data counts' 
    }, { status: 500 });
  }
}