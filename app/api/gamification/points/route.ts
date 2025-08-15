import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, PointsSpendType } from '@prisma/client';
import { PointsManager, PointsSpend } from '@/lib/gamification/pointsManager';
import { configService } from '@/utils/configService';

const prisma = new PrismaClient();

// GET /api/gamification/points - Get user's points balance and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
        pointsResetDate: true,
        pointsTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 transactions
          select: {
            id: true,
            amount: true,
            source: true,
            spendType: true,
            description: true,
            createdAt: true,
            metadata: true,
          },
        },
      },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Check if points reset is needed
    const resetNeeded = PointsManager.isPointsResetNeeded(developer.pointsResetDate);
    
    if (resetNeeded) {
      // Reset monthly points allocation
      const tierConfig = await configService.getSubscriptionTier(developer.subscriptionTier);
      await prisma.developer.update({
        where: { id: developer.id },
        data: {
          monthlyPoints: tierConfig.monthlyPoints,
          pointsUsed: 0,
          pointsEarned: 0,
          pointsResetDate: PointsManager.getNextResetDate(),
        },
      });

      // Return updated balance
      const available = PointsManager.calculateAvailablePoints(tierConfig.monthlyPoints, 0, 0);
      
      return NextResponse.json({
        balance: {
          monthly: tierConfig.monthlyPoints,
          used: 0,
          earned: 0,
          available,
          resetDate: PointsManager.getNextResetDate(),
        },
        tier: developer.subscriptionTier,
        transactions: [],
        resetOccurred: true,
      });
    }

    const available = PointsManager.calculateAvailablePoints(
      developer.monthlyPoints,
      developer.pointsUsed,
      developer.pointsEarned
    );

    const response = {
      balance: {
        monthly: developer.monthlyPoints,
        used: developer.pointsUsed,
        earned: developer.pointsEarned,
        available,
        resetDate: developer.pointsResetDate,
      },
      tier: developer.subscriptionTier,
      transactions: developer.pointsTransactions,
      resetOccurred: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Points GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/gamification/points - Spend points for an action
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, sourceId, metadata } = await request.json();
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action type' }, { status: 400 });
    }

    const validActions: PointsSpendType[] = [
      'JOB_QUERY',
      'COVER_LETTER',
      'OUTREACH_MESSAGE',
      'CV_SUGGESTION',
      'BULK_APPLICATION',
      'PREMIUM_ANALYSIS',
      'ADVANCED_SEARCH'
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    // Get effective cost with tier efficiency bonus first
    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptionTier: true,
        monthlyPoints: true,
        pointsUsed: true,
        pointsEarned: true,
      },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // For MVP Beta: JOB_QUERY cost is dynamic based on results
    let effectiveCost: number;
    if (action === 'JOB_QUERY' && process.env.ENABLE_MVP_MODE === 'true' && metadata?.resultsCount) {
      const pointsPerResult = parseInt(process.env.MVP_POINTS_PER_RESULT || '1');
      effectiveCost = metadata.resultsCount * pointsPerResult;
      console.log(`[MVP Beta] Dynamic cost for JOB_QUERY: ${metadata.resultsCount} results × ${pointsPerResult} = ${effectiveCost} points`);
    } else {
      effectiveCost = await PointsManager.getEffectiveCost(action, developer.subscriptionTier);
    }
    
    // Create spend record for validation
    const spend: PointsSpend = {
      userId: developer.id,
      amount: effectiveCost,
      spendType: action,
      sourceId,
      description: `${action.toLowerCase().replace('_', ' ')} action`,
      metadata,
    };

    // Skip validation for MVP Beta dynamic JOB_QUERY costs
    if (!(action === 'JOB_QUERY' && process.env.ENABLE_MVP_MODE === 'true' && metadata?.resultsCount)) {
      // Validate the spend first (for non-MVP Beta flows)
      const validation = await PointsManager.validatePointsSpend(spend);
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.reason }, { status: 400 });
      }
    }

    // ATOMIC TRANSACTION: Check balance and spend points in single operation
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch user data inside transaction for latest state
      const currentUser = await tx.developer.findUnique({
        where: { id: developer.id },
        select: {
          monthlyPoints: true,
          pointsUsed: true,
          pointsEarned: true,
          subscriptionTier: true,
        },
      });

      if (!currentUser) {
        throw new Error('Developer not found in transaction');
      }

      // Check affordability inside transaction with current data
      const currentAvailable = PointsManager.calculateAvailablePoints(
        currentUser.monthlyPoints,
        currentUser.pointsUsed,
        currentUser.pointsEarned
      );

      if (currentAvailable < effectiveCost) {
        throw new Error(`Insufficient points: need ${effectiveCost}, have ${currentAvailable}`);
      }

      // Atomically deduct points
      const updatedUser = await tx.developer.update({
        where: { id: developer.id },
        data: { pointsUsed: { increment: effectiveCost } },
      });

      // Create audit trail
      const transaction = await tx.pointsTransaction.create({
        data: {
          developerId: developer.id,
          amount: -effectiveCost, // Negative for spending
          spendType: action,
          sourceId,
          description: spend.description,
          metadata: {
            ...metadata,
            costCalculation: {
              baseCost: await PointsManager.getPointsCost(action),
              effectiveCost,
              tier: developer.subscriptionTier,
              timestamp: new Date().toISOString(),
            },
          },
          // Audit fields for fraud detection
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          sessionId: request.headers.get('x-session-id'),
        },
      });

      const newBalance = PointsManager.calculateAvailablePoints(
        updatedUser.monthlyPoints,
        updatedUser.pointsUsed,
        updatedUser.pointsEarned
      );

      return { transaction, newBalance, pointsSpent: effectiveCost };
    }, {
      isolationLevel: 'Serializable', // Highest isolation to prevent race conditions
      timeout: 10000, // 10 second timeout
    });

    // Calculate savings for response
    const baseCost = await PointsManager.getPointsCost(action);
    const savings = baseCost - effectiveCost;

    return NextResponse.json({
      success: true,
      pointsSpent: result.pointsSpent,
      newBalance: result.newBalance,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt,
      },
      savingsFromTier: savings,
      baseCost,
      effectiveCost,
    });

  } catch (error) {
    console.error('Points POST error:', error);
    
    // Handle specific transaction errors
    if (error instanceof Error) {
      if (error.message.includes('Insufficient points')) {
        return NextResponse.json({ 
          error: 'Insufficient points',
          details: error.message,
        }, { status: 402 });
      }
      
      if (error.message.includes('timeout') || error.message.includes('deadlock')) {
        return NextResponse.json({ 
          error: 'Transaction conflict, please try again',
          retryable: true,
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      retryable: false,
    }, { status: 500 });
  }
}