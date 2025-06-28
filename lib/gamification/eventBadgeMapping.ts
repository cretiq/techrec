// Event-to-Badge Mapping System
// Optimizes badge evaluation by only checking relevant badges for specific events

import { GamificationEventType } from '@/types/gamification';

/**
 * Maps gamification events to the badges that could potentially be unlocked by that event.
 * This dramatically reduces badge evaluation overhead by filtering irrelevant badges.
 */
export const EVENT_TO_BADGE_MAP: Record<GamificationEventType, string[]> = {
  // Profile and setup related events
  'PROFILE_SECTION_UPDATED': [
    'profile_starter',      // Complete basic profile (25%)
    'profile_complete',     // Complete all sections (100%)
    'contact_complete',     // Add all contact info
    'networking_ninja'      // Connect LinkedIn/GitHub
  ],

  'SKILL_ADDED': [
    'skill_showcase',       // Add 3 skills
    'skill_collector'       // Add 15+ skills
  ],

  // CV related events
  'CV_UPLOADED': [
    'first_analysis',       // First CV upload
    'cv_analyzer',          // Complete CV analysis
    'early_adopter'         // Top 1000 users
  ],

  'CV_ANALYSIS_COMPLETED': [
    'first_analysis',       // Complete first CV analysis
    'analysis_veteran',     // Complete 10 analyses
    'perfectionist',        // Achieve 95+ score
    'cv_optimizer',         // CV score improvements
    'streak_starter',       // Activity for streak
    'consistency_builder'   // Daily engagement
  ],

  'CV_IMPROVEMENT_APPLIED': [
    'ai_collaborator',      // Accept 5 AI suggestions
    'ai_power_user',        // Accept 25 AI suggestions
    'suggestion_master',    // Generate 50+ suggestions
    'cv_optimizer'          // CV improvements
  ],

  // Application related events
  'APPLICATION_SUBMITTED': [
    'first_application',    // Submit first application
    'application_spree',    // 10 applications in one day
    'quality_applicant',    // 80%+ relevance over 20 apps
    'job_hunter',           // Apply to 2 positions
    'application_quality',  // High-quality applications
    'weekend_warrior',      // Weekend activity
    'consistency_builder'   // Daily engagement
  ],

  // Engagement events
  'DAILY_LOGIN': [
    'streak_starter',       // 7-day login streak
    'streak_champion',      // 30-day streak
    'dedication_legend',    // 100-day streak
    'consistency_builder',  // Daily engagement
    'streak_maintainer',    // Maintain current streak
    'weekend_warrior'       // Weekend activity (if weekend)
  ],

  // Challenge events
  'CHALLENGE_COMPLETED': [
    'challenge_rookie',     // Complete first challenge
    'challenge_hunter',     // Complete 50 challenges
    'perfectionist_challenger', // 7-day perfect streak
    'consistency_builder'   // Daily engagement
  ],

  // Achievement events
  'ACHIEVEMENT_UNLOCKED': [
    // Level progression badges are triggered by level-up events
    'level_10',            // Reach level 10
    'level_25',            // Reach level 25
    'level_50'             // Reach level 50
  ],

  'LEVEL_UP': [
    'level_10',            // Rising Star
    'level_25',            // Skilled Professional  
    'level_50'             // Career Master
  ],

  'STREAK_MILESTONE': [
    'streak_starter',       // 7-day streak
    'streak_champion',      // 30-day streak
    'dedication_legend',    // 100-day streak
    'perfectionist_challenger' // Perfect challenge streak
  ],

  'BADGE_EARNED': [
    // Meta-achievement badges could be triggered by earning other badges
    // Currently no badges are triggered by earning badges
  ]
};

/**
 * Gets the relevant badge IDs for a specific event type
 */
export function getRelevantBadgeIds(eventType: GamificationEventType): string[] {
  return EVENT_TO_BADGE_MAP[eventType] || [];
}

/**
 * Gets all events that could potentially unlock a specific badge
 */
export function getEventsForBadge(badgeId: string): GamificationEventType[] {
  const events: GamificationEventType[] = [];
  
  for (const [event, badges] of Object.entries(EVENT_TO_BADGE_MAP)) {
    if (badges.includes(badgeId)) {
      events.push(event as GamificationEventType);
    }
  }
  
  return events;
}

/**
 * Validates that all badges in the mapping exist in badge definitions
 */
export function validateEventBadgeMapping(allBadgeIds: string[]): {
  isValid: boolean;
  missingBadges: string[];
  unmappedBadges: string[];
} {
  const allMappedBadges = new Set<string>();
  const missingBadges: string[] = [];
  
  // Collect all badges referenced in mapping
  for (const badges of Object.values(EVENT_TO_BADGE_MAP)) {
    badges.forEach(badgeId => allMappedBadges.add(badgeId));
  }
  
  // Check for badges in mapping that don't exist in definitions
  for (const badgeId of allMappedBadges) {
    if (!allBadgeIds.includes(badgeId)) {
      missingBadges.push(badgeId);
    }
  }
  
  // Check for badges in definitions that aren't mapped to any events
  const unmappedBadges = allBadgeIds.filter(badgeId => !allMappedBadges.has(badgeId));
  
  return {
    isValid: missingBadges.length === 0,
    missingBadges,
    unmappedBadges
  };
}

/**
 * Performance statistics for the mapping system
 */
export function getMappingStats(): {
  totalEvents: number;
  totalMappedBadges: number;
  averageBadgesPerEvent: number;
  maxBadgesPerEvent: number;
  eventsWithMostBadges: Array<{ event: string; count: number }>;
} {
  const eventCounts = Object.entries(EVENT_TO_BADGE_MAP).map(([event, badges]) => ({
    event,
    count: badges.length
  }));
  
  const totalMappedBadges = new Set(
    Object.values(EVENT_TO_BADGE_MAP).flat()
  ).size;
  
  const totalBadgeChecks = Object.values(EVENT_TO_BADGE_MAP)
    .reduce((sum, badges) => sum + badges.length, 0);
  
  return {
    totalEvents: Object.keys(EVENT_TO_BADGE_MAP).length,
    totalMappedBadges,
    averageBadgesPerEvent: totalBadgeChecks / Object.keys(EVENT_TO_BADGE_MAP).length,
    maxBadgesPerEvent: Math.max(...eventCounts.map(e => e.count)),
    eventsWithMostBadges: eventCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  };
}

/**
 * Context-aware badge filtering based on user state
 */
export function getContextualBadgeIds(
  eventType: GamificationEventType,
  userContext: {
    isWeekend?: boolean;
    hasRecentActivity?: boolean;
    currentLevel?: number;
    currentStreak?: number;
  }
): string[] {
  let relevantBadges = getRelevantBadgeIds(eventType);
  
  // Filter based on context
  if (!userContext.isWeekend) {
    relevantBadges = relevantBadges.filter(badge => badge !== 'weekend_warrior');
  }
  
  if (!userContext.hasRecentActivity) {
    relevantBadges = relevantBadges.filter(badge => badge !== 'streak_maintainer');
  }
  
  // Level-based filtering
  if (userContext.currentLevel && userContext.currentLevel < 10) {
    relevantBadges = relevantBadges.filter(badge => 
      !['level_25', 'level_50'].includes(badge)
    );
  }
  
  // Streak-based filtering
  if (userContext.currentStreak && userContext.currentStreak < 3) {
    relevantBadges = relevantBadges.filter(badge => badge !== 'streak_maintainer');
  }
  
  return relevantBadges;
}

// Performance optimization statistics
export const PERFORMANCE_METRICS = {
  // Before optimization: Evaluate ALL badges on EVERY event
  ORIGINAL_BADGE_CHECKS_PER_EVENT: 39, // Total number of badge definitions
  
  // After optimization: Only evaluate relevant badges
  AVERAGE_BADGE_CHECKS_PER_EVENT: getMappingStats().averageBadgesPerEvent,
  
  // Performance improvement calculation
  get PERFORMANCE_IMPROVEMENT_RATIO() {
    return this.ORIGINAL_BADGE_CHECKS_PER_EVENT / this.AVERAGE_BADGE_CHECKS_PER_EVENT;
  },
  
  // Estimated performance improvement percentage
  get PERFORMANCE_IMPROVEMENT_PERCENT() {
    return Math.round((1 - (this.AVERAGE_BADGE_CHECKS_PER_EVENT / this.ORIGINAL_BADGE_CHECKS_PER_EVENT)) * 100);
  }
};