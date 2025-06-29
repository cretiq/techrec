import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/gamification/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'overall';
    const tier = searchParams.get('tier') as SubscriptionTier | null;
    const period = searchParams.get('period') || 'all-time';
    const limit = parseInt(searchParams.get('limit') || '50');

    const session = await getServerSession();
    let currentUserId: string | null = null;
    
    if (session?.user?.email) {
      const user = await prisma.developer.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    let whereClause: any = {};
    let orderByClause: any = { totalXP: 'desc' };

    // Apply tier filter if specified
    if (tier) {
      whereClause.subscriptionTier = tier;
    }

    // Different leaderboard categories
    switch (category) {
      case 'overall':
        // Overall XP leaderboard (default)
        break;
        
      case 'monthly':
        // This would require tracking monthly XP gains
        // For now, we'll use overall XP but could be enhanced
        whereClause.lastActivityDate = {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        };
        break;
        
      case 'weekly':
        whereClause.lastActivityDate = {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        };
        break;
        
      case 'streak':
        orderByClause = { streak: 'desc' };
        whereClause.streak = { gt: 0 };
        break;
        
      case 'level':
        orderByClause = { currentLevel: 'desc' };
        break;
        
      default:
        // Default to overall
        break;
    }

    // Get leaderboard data
    const leaderboard = await prisma.developer.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        totalXP: true,
        currentLevel: true,
        subscriptionTier: true,
        streak: true,
        lastActivityDate: true,
        userBadges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                tier: true,
              }
            }
          },
          take: 3, // Show top 3 badges
          orderBy: {
            earnedAt: 'desc'
          }
        }
      },
      orderBy: orderByClause,
      take: limit,
    });

    // Add rank and anonymize data
    const rankedLeaderboard = leaderboard.map((user, index) => {
      const isCurrentUser = currentUserId === user.id;
      
      return {
        rank: index + 1,
        // Anonymize unless it's the current user
        name: isCurrentUser ? user.name : `Player ${index + 1}`,
        isCurrentUser,
        totalXP: user.totalXP,
        currentLevel: user.currentLevel,
        subscriptionTier: user.subscriptionTier,
        streak: user.streak,
        lastActive: user.lastActivityDate,
        topBadges: user.userBadges.map(ub => ub.badge),
        // Show score based on category
        score: category === 'streak' ? user.streak : 
               category === 'level' ? user.currentLevel : 
               user.totalXP,
      };
    });

    // Get current user's rank if they're not in the top results
    let currentUserRank = null;
    if (currentUserId) {
      const currentUserInTop = rankedLeaderboard.find(u => u.isCurrentUser);
      
      if (!currentUserInTop) {
        const currentUserData = await prisma.developer.findUnique({
          where: { id: currentUserId },
          select: {
            totalXP: true,
            currentLevel: true,
            subscriptionTier: true,
            streak: true,
          },
        });

        if (currentUserData) {
          let scoreField: string;
          let scoreValue: number;
          
          switch (category) {
            case 'streak':
              scoreField = 'streak';
              scoreValue = currentUserData.streak;
              break;
            case 'level':
              scoreField = 'currentLevel';
              scoreValue = currentUserData.currentLevel;
              break;
            default:
              scoreField = 'totalXP';
              scoreValue = currentUserData.totalXP;
              break;
          }

          // Count users with higher scores
          const higherScoreCount = await prisma.developer.count({
            where: {
              ...whereClause,
              [scoreField]: { gt: scoreValue },
            },
          });

          currentUserRank = {
            rank: higherScoreCount + 1,
            score: scoreValue,
            tier: currentUserData.subscriptionTier,
          };
        }
      }
    }

    // Get tier distribution for context
    const tierDistribution = await prisma.developer.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true,
      },
      where: whereClause,
    });

    const response = {
      category,
      period,
      tier: tier || 'all',
      leaderboard: rankedLeaderboard,
      currentUserRank,
      stats: {
        totalPlayers: leaderboard.length,
        tierDistribution: tierDistribution.reduce((acc, item) => {
          acc[item.subscriptionTier] = item._count.subscriptionTier;
          return acc;
        }, {} as Record<string, number>),
      },
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}