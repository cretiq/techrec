// Gamification Profile API Endpoint

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { gamificationEvents } from '@/lib/gamification/eventManager';
import { PointsManager } from '@/lib/gamification/pointsManager';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user gamification data
    const user = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        totalXP: true,
        currentLevel: true,
        levelProgress: true,
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        pointsResetDate: true,
        streak: true,
        lastActivityDate: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        },
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            source: true,
            spendType: true,
            description: true,
            createdAt: true
          }
        }
      }
    });

    // If user doesn't exist, return error
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use the enhanced gamification profile from event manager
    const gamificationProfile = await gamificationEvents.getUserProfile(user.id);
    
    if (!gamificationProfile) {
      return NextResponse.json({ error: 'Failed to get gamification profile' }, { status: 500 });
    }

    // Get recent XP transactions
    const recentXPTransactions = await prisma.xPTransaction.findMany({
      where: { developerId: user.id },
      orderBy: { earnedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        source: true,
        description: true,
        earnedAt: true
      }
    });

    // Get active challenges
    const activeChallenges = await prisma.dailyChallenge.findMany({
      where: {
        developerId: user.id,
        completedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const availableBadges = [
      {
        id: 'profile_complete',
        name: 'Profile Master',
        description: 'Complete all profile sections',
        icon: '👤',
        category: 'PROFILE_COMPLETION',
        tier: 'BRONZE',
        xpReward: 100
      }
    ];

    return NextResponse.json({
      profile: gamificationProfile,
      recentXPTransactions,
      recentPointsTransactions: user.pointsTransactions,
      activeChallenges,
      availableBadges,
      notifications: []
    });

  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}