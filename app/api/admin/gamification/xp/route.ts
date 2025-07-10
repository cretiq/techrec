import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, XPSource } from '@prisma/client';
import { gamificationEvents } from '@/lib/gamification/eventManager';

const prisma = new PrismaClient();

// Simple admin check - in production, you'd want proper role-based access
const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  // Add more admin emails as needed
];

// POST /api/admin/gamification/xp - Award XP to developer
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

    const { developerId, amount, source, description } = await request.json();

    if (!developerId || !amount || !source) {
      return NextResponse.json({ 
        error: 'Missing required fields: developerId, amount, source' 
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { id: true, name: true, email: true, totalXP: true, currentLevel: true }
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Award XP through the gamification system
    const result = await gamificationEvents.awardXP({
      userId: developerId,
      amount,
      source: source as XPSource,
      sourceId: `admin-${Date.now()}`,
      description: description || `Admin XP award: ${amount} XP for ${source}`,
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to award XP',
        details: result
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully awarded ${amount} XP to ${developer.name}`,
      xpAwarded: result.xpAwarded,
      newLevel: result.newLevel,
      leveledUp: !!result.newLevel,
      previousLevel: developer.currentLevel,
      source,
      description
    });

  } catch (error) {
    console.error('Admin XP award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}