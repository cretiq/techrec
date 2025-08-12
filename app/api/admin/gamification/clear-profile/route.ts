import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';

export async function DELETE(request: NextRequest) {
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

    // Clear all profile data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get experience IDs first for cascading deletes
      const experiences = await tx.experience.findMany({
        where: { developerId },
        select: { id: true }
      });
      const experienceIds = experiences.map(exp => exp.id);

      // Clear experience projects (related to experiences)
      const experienceProjectsDeleted = await tx.experienceProject.deleteMany({
        where: { experienceId: { in: experienceIds } }
      });

      // Clear skills
      const skillsDeleted = await tx.developerSkill.deleteMany({
        where: { developerId }
      });

      // Clear experience
      const experienceDeleted = await tx.experience.deleteMany({
        where: { developerId }
      });

      // Clear education
      const educationDeleted = await tx.education.deleteMany({
        where: { developerId }
      });

      // Clear achievements
      const achievementsDeleted = await tx.achievement.deleteMany({
        where: { developerId }
      });

      // Clear personal projects
      const personalProjectsDeleted = await tx.personalProject.deleteMany({
        where: { developerId }
      });

      return {
        skillsDeleted: skillsDeleted.count,
        experienceDeleted: experienceDeleted.count,
        educationDeleted: educationDeleted.count,
        achievementsDeleted: achievementsDeleted.count,
        personalProjectsDeleted: personalProjectsDeleted.count,
        experienceProjectsDeleted: experienceProjectsDeleted.count
      };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile data cleared successfully',
      deleted: result
    });

  } catch (error) {
    console.error('Error clearing profile data:', error);
    return NextResponse.json({ 
      error: 'Failed to clear profile data' 
    }, { status: 500 });
  }
}