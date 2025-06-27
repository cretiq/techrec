// Daily Challenges API Endpoint

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock daily challenges for demo
    const challenges = [
      {
        id: '1',
        developerId: session.user.id,
        title: 'Profile Polish',
        description: 'Update 2 sections of your profile',
        type: 'PROFILE_UPDATE',
        targetValue: 2,
        currentProgress: 0,
        xpReward: 50,
        difficulty: 'Easy',
        completedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date()
      },
      {
        id: '2',
        developerId: session.user.id,
        title: 'AI Assistant',
        description: 'Accept 3 AI suggestions',
        type: 'AI_INTERACTION',
        targetValue: 3,
        currentProgress: 0,
        xpReward: 75,
        difficulty: 'Medium',
        completedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        id: '3',
        developerId: session.user.id,
        title: 'Job Hunt Focus',
        description: 'Apply to 2 relevant positions',
        type: 'APPLICATION_ACTIVITY',
        targetValue: 2,
        currentProgress: 0,
        xpReward: 100,
        difficulty: 'Hard',
        completedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];

    return NextResponse.json(challenges);

  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}