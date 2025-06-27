// Gamification Profile API Endpoint

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { XPCalculator } from '@/lib/gamification/xpCalculator';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or create user gamification data
    let user = await prisma.developer.findUnique({
      where: { id: userId },
      select: {
        totalXP: true,
        currentLevel: true,
        levelProgress: true,
        tier: true,
        streak: true,
        lastActivityDate: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        }
      }
    });

    // If user doesn't exist or has no gamification data, initialize it
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate current profile state
    const profileCalc = XPCalculator.calculateUserProfile(
      user.totalXP,
      user.streak,
      user.lastActivityDate
    );

    // Create response data
    const gamificationProfile = {
      totalXP: user.totalXP,
      currentLevel: profileCalc.currentLevel,
      levelProgress: profileCalc.levelProgress,
      tier: profileCalc.tier,
      streak: user.streak,
      lastActivityDate: user.lastActivityDate,
      badges: user.userBadges.map(ub => ({
        badge: ub.badge,
        earnedAt: ub.earnedAt
      })),
      nextLevelXP: profileCalc.nextLevelXP,
      currentLevelXP: profileCalc.currentLevelXP
    };

    // Mock some recent transactions and challenges for demo
    const recentTransactions = [
      {
        id: '1',
        amount: 50,
        source: 'CV_ANALYSIS',
        description: 'Completed CV analysis',
        earnedAt: new Date()
      }
    ];

    const activeChallenges = [
      {
        id: '1',
        title: 'Profile Polish',
        description: 'Update 2 sections of your profile',
        type: 'PROFILE_UPDATE',
        targetValue: 2,
        currentProgress: 0,
        xpReward: 50,
        difficulty: 'Easy',
        completedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    ];

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
      recentTransactions,
      activeChallenges,
      availableBadges,
      notifications: []
    });

  } catch (error) {
    console.error('Error fetching gamification profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}