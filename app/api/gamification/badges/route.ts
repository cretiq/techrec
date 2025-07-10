import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBadgesForDeveloper } from '@/lib/gamification/data';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = session.user.id;
    console.log(`🏆 [API/gamification/badges] Fetching badges for user: ${userId}`);

    const badgesWithProgress = await getBadgesForDeveloper(userId);

    console.log(`🏆 [API/gamification/badges] Processed ${badgesWithProgress.length} total badges.`);

    return NextResponse.json(badgesWithProgress, { status: 200 });
  } catch (error) {
    console.error('🏆 [API/gamification/badges] Error fetching badges:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
