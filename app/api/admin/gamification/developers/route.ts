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
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';

    // Build orderBy object for Prisma
    const orderBy: any = {};
    
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'email':
        orderBy.email = sortOrder;
        break;
      case 'totalXP':
        orderBy.totalXP = sortOrder;
        break;
      case 'currentLevel':
        orderBy.currentLevel = sortOrder;
        break;
      case 'subscriptionTier':
        orderBy.subscriptionTier = sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = sortOrder;
        break;
      default:
        orderBy.name = 'asc';
    }

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const developers = await prisma.developer.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        totalXP: true,
        currentLevel: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        userBadges: {
          select: {
            badgeId: true,
            earnedAt: true,
            badge: {
              select: {
                name: true,
                icon: true,
                category: true,
                tier: true
              }
            }
          },
          take: 10,
          orderBy: { earnedAt: 'desc' }
        },
        cvs: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            uploadDate: true,
            status: true,
            mimeType: true
          },
          orderBy: { uploadDate: 'desc' }
        },
        _count: {
          select: {
            cvs: true,
            developerSkills: true,
            experience: true,
            education: true,
            achievements: true,
            personalProjects: true
          }
        }
      }
    });

    // Transform the data to match the expected format
    const transformedDevelopers = developers.map(dev => ({
      id: dev.id,
      name: dev.name,
      email: dev.email,
      totalXP: dev.totalXP,
      currentLevel: dev.currentLevel,
      monthlyPoints: dev.monthlyPoints,
      pointsUsed: dev.pointsUsed,
      pointsEarned: dev.pointsEarned,
      subscriptionTier: dev.subscriptionTier,
      createdAt: dev.createdAt,
      updatedAt: dev.updatedAt,
      userBadges: dev.userBadges,
      cvs: dev.cvs,
      cvCount: dev._count.cvs,
      skillsCount: dev._count.developerSkills,
      experienceCount: dev._count.experience,
      educationCount: dev._count.education,
      achievementsCount: dev._count.achievements,
      personalProjectsCount: dev._count.personalProjects
    }));

    return NextResponse.json({ 
      developers: transformedDevelopers,
      total: transformedDevelopers.length
    });

  } catch (error) {
    console.error('Error fetching developers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch developers' 
    }, { status: 500 });
  }
}