import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions';

const prisma = new PrismaClient();

// Simple admin check - in production, you'd want proper role-based access
const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  'admin@test.com',
  // Add more admin emails as needed
];

// POST /api/admin/gamification/badge - Award badge to developer
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

    const { developerId, badgeId } = await request.json();

    if (!developerId || !badgeId) {
      return NextResponse.json({ 
        error: 'Missing required fields: developerId, badgeId' 
      }, { status: 400 });
    }

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, name: true, email: true }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Find badge definition
    const badgeDefinition = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeDefinition) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if developer already has this badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        developerId,
        badgeId
      }
    });

    if (existingBadge) {
      return NextResponse.json({ error: 'Developer already has this badge' }, { status: 400 });
    }

    // Award badge
    const result = await prisma.$transaction(async (tx) => {
      // Create badge record
      const badge = await tx.badge.upsert({
        where: { id: badgeId },
        update: {},
        create: {
          id: badgeId,
          name: badgeDefinition.name,
          description: badgeDefinition.description,
          icon: badgeDefinition.icon,
          category: badgeDefinition.category,
          tier: badgeDefinition.tier,
          criteria: badgeDefinition.requirements, // Map requirements to criteria
          xpReward: badgeDefinition.xpReward,
          isSecret: badgeDefinition.isHidden // Map isHidden to isSecret
        }
      });

      // Award badge to user
      const userBadge = await tx.userBadge.create({
        data: {
          developerId,
          badgeId,
          earnedAt: new Date(),
          progress: 1.0
        }
      });

      // Award XP for the badge
      await tx.developer.update({
        where: { id: developerId },
        data: { totalXP: { increment: badgeDefinition.xpReward } }
      });

      // Create XP transaction record
      await tx.xPTransaction.create({
        data: {
          developerId,
          amount: badgeDefinition.xpReward,
          source: 'BADGE_EARNED',
          sourceId: badgeId,
          description: `Badge earned: ${badgeDefinition.name} (Admin Award)`,
        },
      });

      return { badge, userBadge };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully awarded badge "${badgeDefinition.name}" to ${developer.name}`,
      badge: {
        id: badgeDefinition.id,
        name: badgeDefinition.name,
        description: badgeDefinition.description,
        icon: badgeDefinition.icon,
        xpReward: badgeDefinition.xpReward
      },
      earnedAt: result.userBadge.earnedAt
    });

  } catch (error) {
    console.error('Admin badge award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}