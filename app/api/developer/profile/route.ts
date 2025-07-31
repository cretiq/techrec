import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/developer/profile
// Fetches comprehensive profile information for the authenticated developer
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const developerId = session.user.id;
    
    console.log(`[GET /api/developer/profile] Fetching profile for developer: ${developerId}`);

    // Fetch comprehensive developer profile with counts
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: {
        id: true,
        name: true,
        email: true,
        profileEmail: true,
        title: true,
        about: true,
        totalXP: true,
        currentLevel: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        createdAt: true,
        updatedAt: true,
        // Count related records
        _count: {
          select: {
            cvs: true,
            developerSkills: true,
            experience: true,
          }
        }
      }
    });

    if (!developer) {
      console.log(`[GET /api/developer/profile] Developer not found: ${developerId}`);
      return NextResponse.json({ error: 'Developer profile not found' }, { status: 404 });
    }

    // Format the response with counts
    const profileData = {
      id: developer.id,
      name: developer.name,
      email: developer.email,
      profileEmail: developer.profileEmail,
      title: developer.title,
      about: developer.about,
      totalXP: developer.totalXP,
      currentLevel: developer.currentLevel,
      subscriptionTier: developer.subscriptionTier,
      subscriptionStatus: developer.subscriptionStatus,
      monthlyPoints: developer.monthlyPoints,
      pointsUsed: developer.pointsUsed,
      pointsEarned: developer.pointsEarned,
      createdAt: developer.createdAt.toISOString(),
      updatedAt: developer.updatedAt.toISOString(),
      // Add counts from _count
      cvCount: developer._count.cvs,
      skillsCount: developer._count.developerSkills,
      experienceCount: developer._count.experience,
    };

    console.log(`[GET /api/developer/profile] Profile data retrieved for developer: ${developerId}`, {
      email: developer.email,
      cvCount: developer._count.cvs,
      skillsCount: developer._count.developerSkills,
      experienceCount: developer._count.experience,
    });

    return NextResponse.json({
      profile: profileData
    });

  } catch (error) {
    console.error('[GET /api/developer/profile] Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}