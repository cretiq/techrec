import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, XPSource } from '@prisma/client';
import { gamificationEvents } from '@/lib/gamification/eventManager';
import { XPCalculator } from '@/lib/gamification/xpCalculator';
import { configService } from '@/utils/configService';

const prisma = new PrismaClient();

// POST /api/gamification/xp/award - Award XP for specific actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { source, sourceId, description, amount } = await request.json();
    
    if (!source) {
      return NextResponse.json({ error: 'Missing XP source' }, { status: 400 });
    }

    const validSources: XPSource[] = [
      'PROFILE_UPDATE',
      'CV_UPLOAD',
      'CV_ANALYSIS',
      'CV_IMPROVEMENT',
      'APPLICATION_SUBMIT',
      'SKILL_ADD',
      'ACHIEVEMENT_ADD',
      'DAILY_LOGIN',
      'STREAK_BONUS'
    ];

    if (!validSources.includes(source)) {
      return NextResponse.json({ error: 'Invalid XP source' }, { status: 400 });
    }

    // Get developer ID from session
    const developer = await prisma.developer.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!developer) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 });
    }

    // Calculate XP amount if not provided
    const xpAmount = amount || XPCalculator.getXPForSource(source);

    // Award XP through the gamification system
    const result = await gamificationEvents.awardXP({
      userId: developer.id,
      amount: xpAmount,
      source,
      sourceId,
      description: description || `XP award for ${source.toLowerCase().replace('_', ' ')}`,
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to award XP',
        details: result
      }, { status: 400 });
    }

    const response = {
      success: true,
      xpAwarded: result.xpAwarded,
      newLevel: result.newLevel,
      leveledUp: !!result.newLevel,
      source,
      sourceId,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('XP award error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/gamification/xp/award - Get XP award information and daily potential
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get XP rewards configuration
    const xpRewards = await configService.getXPRewards();
    
    // Get daily potential
    const dailyPotential = XPCalculator.getDailyXPPotential();
    
    // Get XP sources information
    const sources = Object.entries(xpRewards).map(([source, amount]) => ({
      source,
      amount,
      repeatable: XPCalculator.isRepeatableSource(source as XPSource),
      description: getSourceDescription(source as XPSource),
    }));

    const response = {
      sources,
      dailyPotential,
      xpRewards,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('XP info GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSourceDescription(source: XPSource): string {
  const descriptions: Record<XPSource, string> = {
    PROFILE_UPDATE: 'Update your profile sections',
    CV_UPLOAD: 'Upload a new CV document',
    CV_ANALYSIS: 'Complete CV analysis process',
    CV_IMPROVEMENT: 'Apply AI improvement suggestions',
    APPLICATION_SUBMIT: 'Submit job applications',
    SKILL_ADD: 'Add new skills to your profile',
    ACHIEVEMENT_ADD: 'Add achievements and certifications',
    DAILY_LOGIN: 'Daily login bonus',
    STREAK_BONUS: 'Consecutive day activity bonus',
  };
  
  return descriptions[source] || 'XP earning activity';
}