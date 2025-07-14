import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/prisma';
import { z } from 'zod';

// Query parameters validation
const ActivityQuerySchema = z.object({
  weeks: z.string().optional().default('12'),
}).strict();

interface DailyActivity {
  date: string; // YYYY-MM-DD format
  count: number;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const validationResult = ActivityQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const weeks = Math.min(Math.max(parseInt(validationResult.data.weeks), 1), 52); // Limit between 1-52 weeks
    
    // Calculate date range (weeks * 7 days)
    const totalDays = weeks * 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - totalDays + 1); // +1 to include today
    
    // Set times to start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Query applied roles within date range
    const appliedRoles = await prisma.savedRole.findMany({
      where: {
        developerId: session.user.id,
        appliedFor: true,
        appliedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        appliedAt: true
      }
    });

    // Create activity map with all days in range initialized to 0
    const activityMap = new Map<string, number>();
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      activityMap.set(dateKey, 0);
    }

    // Count applications per day
    appliedRoles.forEach(role => {
      if (role.appliedAt) {
        const dateKey = role.appliedAt.toISOString().split('T')[0];
        if (activityMap.has(dateKey)) {
          activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
        }
      }
    });

    // Convert to array format expected by heatmap
    const activityData: DailyActivity[] = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    // Calculate summary statistics
    const totalApplications = appliedRoles.length;
    const daysWithActivity = activityData.filter(day => day.count > 0).length;
    const maxDailyCount = Math.max(...activityData.map(day => day.count));
    const averageDailyCount = totalApplications / totalDays;

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[ApplicationActivity] Query:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        weeks,
        totalDays,
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        totalApplications,
        daysWithActivity,
        maxDailyCount,
        averageDailyCount: Math.round(averageDailyCount * 100) / 100
      });
    }

    return NextResponse.json({
      activityData,
      summary: {
        totalApplications,
        daysWithActivity,
        totalDays,
        maxDailyCount,
        averageDailyCount: Math.round(averageDailyCount * 100) / 100,
        weeks,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      }
    });

  } catch (error) {
    console.error('[ApplicationActivity] Error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id || 'unknown'
    });

    return NextResponse.json(
      { error: 'Failed to fetch application activity' },
      { status: 500 }
    );
  }
}