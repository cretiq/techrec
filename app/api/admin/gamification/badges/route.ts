import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions';

// Simple admin check - in production, you'd want proper role-based access
const ADMIN_EMAILS = [
  'filipmellqvist255@gmail.com',
  'admin@techrec.com',
  // Add more admin emails as needed
];

// GET /api/admin/gamification/badges - Get all available badges
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Return all available badges from definitions
    const badges = BADGE_DEFINITIONS.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      tier: badge.tier,
      xpReward: badge.xpReward,
      requirements: badge.requirements,
      rarity: badge.rarity,
      isHidden: badge.isHidden
    }));

    return NextResponse.json({
      badges,
      total: badges.length
    });

  } catch (error) {
    console.error('Admin badges fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}