import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, PointsSpendType, SubscriptionTier } from '@prisma/client';
import { PointsManager } from '@/lib/gamification/pointsManager';
import { configService } from '@/utils/configService';

const prisma = new PrismaClient();

// GET /api/gamification/points/costs - Get current points costs for all actions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: { subscriptionTier: true },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Get base costs from configuration
    const pointsCosts = await configService.getPointsCosts();
    
    // Calculate effective costs with tier efficiency
    const actions: PointsSpendType[] = [
      'JOB_QUERY',
      'COVER_LETTER',
      'OUTREACH_MESSAGE', 
      'CV_SUGGESTION',
      'BULK_APPLICATION',
      'PREMIUM_ANALYSIS'
    ];

    const costs = await Promise.all(
      actions.map(async (action) => {
        const baseCost = await PointsManager.getPointsCost(action);
        const effectiveCost = await PointsManager.getEffectiveCost(action, developer.subscriptionTier);
        const savings = baseCost - effectiveCost;
        
        return {
          action,
          baseCost,
          effectiveCost,
          savings,
          savingsPercentage: savings > 0 ? Math.round((savings / baseCost) * 100) : 0,
        };
      })
    );

    // Get tier efficiency information
    const efficiency = await PointsManager.getPointsEfficiencyMultiplier(developer.subscriptionTier);
    
    // Get upgrade incentives for higher tiers
    const upgrades = await Promise.all(
      (['BASIC', 'STARTER', 'PRO', 'EXPERT'] as SubscriptionTier[])
        .filter(tier => tier !== developer.subscriptionTier)
        .map(async (tier) => {
          const incentive = await PointsManager.getUpgradeIncentive(developer.subscriptionTier, tier);
          return {
            tier,
            ...incentive,
          };
        })
    );

    const response = {
      currentTier: developer.subscriptionTier,
      efficiency: {
        multiplier: efficiency,
        discount: Math.round((1 - efficiency) * 100), // Percentage discount
      },
      costs,
      upgrades,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Points costs GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}