import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple admin check - in production, you'd want proper role-based access
const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  'admin@test.com',
  // Add more admin emails as needed
];

// GET /api/admin/gamification/developer - Get developer by email
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email },
      include: {
        userBadges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                category: true,
                tier: true,
                description: true,
              }
            }
          },
          orderBy: { earnedAt: 'desc' }
        },
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            source: true,
            description: true,
            createdAt: true,
          }
        },
        cvs: {
          orderBy: { uploadDate: 'desc' },
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            uploadDate: true,
            status: true,
            mimeType: true,
          }
        }
      }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    return NextResponse.json({
      developer: {
        id: developer.id,
        name: developer.name,
        email: developer.email,
        totalXP: developer.totalXP,
        currentLevel: developer.currentLevel,
        monthlyPoints: developer.monthlyPoints,
        pointsUsed: developer.pointsUsed,
        pointsEarned: developer.pointsEarned,
        subscriptionTier: developer.subscriptionTier,
        userBadges: developer.userBadges.map(ub => ({
          badgeId: ub.badgeId,
          earnedAt: ub.earnedAt,
          badge: ub.badge
        })),
        recentTransactions: developer.pointsTransactions,
        cvs: developer.cvs.map(cv => ({
          id: cv.id,
          filename: cv.filename,
          originalName: cv.originalName,
          size: cv.size,
          uploadDate: cv.uploadDate,
          status: cv.status,
          mimeType: cv.mimeType
        })),
        cvCount: developer.cvs.length
      }
    });

  } catch (error) {
    console.error('Admin developer lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}