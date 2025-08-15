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

// POST /api/admin/gamification/points/set - Set exact point amount for developer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { developerId, amount, reason } = await request.json();

    if (!developerId || typeof amount !== 'number' || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: developerId, amount, reason' 
      }, { status: 400 });
    }

    if (amount < 0) {
      return NextResponse.json({ error: 'Amount cannot be negative when setting exact value' }, { status: 400 });
    }

    // Check if developer exists and get current points
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, name: true, email: true, pointsEarned: true, monthlyPoints: true, pointsUsed: true }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Calculate current available points
    const currentAvailablePoints = developer.monthlyPoints - developer.pointsUsed + developer.pointsEarned;
    
    // Calculate the difference needed to reach the target amount
    const difference = amount - currentAvailablePoints;

    // Set exact amount by adjusting earned points
    const result = await prisma.$transaction(async (tx) => {
      // Update developer's earned points to achieve the target total
      const newEarnedPoints = developer.pointsEarned + difference;
      const updatedDeveloper = await tx.developer.update({
        where: { id: developerId },
        data: { pointsEarned: newEarnedPoints }
      });

      // Create transaction record
      const transaction = await tx.pointsTransaction.create({
        data: {
          developerId,
          amount: difference, // This shows the actual change made
          source: 'ADMIN_SET_EXACT',
          description: `Admin set exact points: ${reason} (Target: ${amount}, Change: ${difference > 0 ? '+' : ''}${difference})`,
          metadata: {
            adminUser: session.user.email,
            timestamp: new Date().toISOString(),
            reason,
            targetAmount: amount,
            previousAvailablePoints: currentAvailablePoints,
            difference
          }
        }
      });

      return { updatedDeveloper, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully set ${developer.name}'s points to exactly ${amount} (${difference > 0 ? '+' : ''}${difference} change)`,
      newEarnedPoints: result.updatedDeveloper.pointsEarned,
      newAvailablePoints: amount,
      previousAvailablePoints: currentAvailablePoints,
      difference,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Admin points set exact error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}