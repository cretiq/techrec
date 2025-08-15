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

// POST /api/admin/gamification/points - Award points to developer
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

    if (!developerId || !amount || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: developerId, amount, reason' 
      }, { status: 400 });
    }

    if (amount === 0) {
      return NextResponse.json({ error: 'Amount cannot be zero' }, { status: 400 });
    }

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, name: true, email: true, pointsEarned: true }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Handle both positive and negative point adjustments
    const result = await prisma.$transaction(async (tx) => {
      // Update developer's earned points (can be positive or negative)
      const updatedDeveloper = await tx.developer.update({
        where: { id: developerId },
        data: { pointsEarned: { increment: amount } }
      });

      // Create transaction record
      const transaction = await tx.pointsTransaction.create({
        data: {
          developerId,
          amount,
          source: amount > 0 ? 'ADMIN_GRANTED' : 'ADMIN_DEDUCTED',
          description: amount > 0 ? `Admin award: ${reason}` : `Admin deduction: ${reason}`,
          metadata: {
            adminUser: session.user.email,
            timestamp: new Date().toISOString(),
            reason
          }
        }
      });

      return { updatedDeveloper, transaction };
    });

    return NextResponse.json({
      success: true,
      message: amount > 0 
        ? `Successfully awarded ${amount} points to ${developer.name}`
        : `Successfully deducted ${Math.abs(amount)} points from ${developer.name}`,
      newEarnedPoints: result.updatedDeveloper.pointsEarned,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Admin points award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}