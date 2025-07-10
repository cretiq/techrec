// lib/gamification/data.ts
import { prisma } from '@/prisma/prisma';
import { BADGE_DEFINITIONS } from '@/lib/gamification/badgeDefinitions';
import type { BadgeWithProgress, BadgeDefinition } from '@/types/gamification';
import type { UserBadge } from '@prisma/client';

/**
 * Fetches all badge definitions and correlates them with a specific developer's progress.
 * This is the single source of truth for badge data.
 * @param developerId The ID of the developer.
 * @returns A promise that resolves to an array of all badges with user-specific progress.
 */
export async function getBadgesForDeveloper(developerId: string): Promise<BadgeWithProgress[]> {
  // 1. Fetch all earned badges for the user from the database
  const userBadges = await prisma.userBadge.findMany({
    where: { developerId },
  });

  const earnedBadgeMap = new Map(userBadges.map((ub: UserBadge) => [ub.badgeId, ub]));

  // 2. Process all badge definitions to determine progress
  const badgesWithProgress = BADGE_DEFINITIONS.map((badgeDef: BadgeDefinition) => {
    const userBadge = earnedBadgeMap.get(badgeDef.id);
    const isEarned = !!userBadge;

    // TODO: Replace with real progress calculation logic
    let progress = 0;
    if (isEarned) {
      progress = 100;
    } else {
      // Mock progress for unearned badges for demonstration
      switch (badgeDef.id) {
        case 'profile_complete':
          progress = 65;
          break;
        case 'streak_starter':
          progress = 45;
          break;
        case 'first_application':
          progress = 80;
          break;
        default:
          progress = Math.floor(Math.random() * 30);
      }
    }

    return {
      ...badgeDef,
      isEarned,
      earnedAt: userBadge?.earnedAt, // This will be a Date object or undefined
      progress,
      isInProgress: progress > 0 && progress < 100,
    };
  });

  return badgesWithProgress;
}
