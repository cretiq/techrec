// Badge Definitions for TechRec Gamification System
// Comprehensive badge system aligned with career progression goals

import { BadgeDefinition, BadgeCategory, BadgeTier } from '@/types/gamification';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // === PROFILE COMPLETION BADGES ===
  {
    id: 'profile_starter',
    name: 'Profile Pioneer',
    description: 'Complete your basic profile information',
    icon: '👤',
    category: 'PROFILE_COMPLETION',
    tier: 'BRONZE',
    xpReward: 50,
    requirements: {
      type: 'profile_completion',
      threshold: 25, // 25% profile completion
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Complete all profile sections with detailed information',
    icon: '🏆',
    category: 'PROFILE_COMPLETION',
    tier: 'GOLD',
    xpReward: 200,
    requirements: {
      type: 'profile_completion',
      threshold: 100,
      data: {}
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'contact_complete',
    name: 'Well Connected',
    description: 'Add all contact information including LinkedIn and GitHub',
    icon: '📞',
    category: 'PROFILE_COMPLETION',
    tier: 'BRONZE',
    xpReward: 75,
    requirements: {
      type: 'contact_info_complete',
      threshold: 100,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },

  // === CV ANALYSIS BADGES ===
  {
    id: 'first_analysis',
    name: 'CV Analyzer',
    description: 'Complete your first CV analysis',
    icon: '📄',
    category: 'CV_ANALYSIS',
    tier: 'BRONZE',
    xpReward: 100,
    requirements: {
      type: 'cv_analysis_count',
      threshold: 1,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'analysis_veteran',
    name: 'Analysis Veteran',
    description: 'Complete 10 CV analyses',
    icon: '📊',
    category: 'CV_ANALYSIS',
    tier: 'SILVER',
    xpReward: 250,
    requirements: {
      type: 'cv_analysis_count',
      threshold: 10,
      data: {}
    },
    rarity: 'UNCOMMON',
    isHidden: false
  },
  {
    id: 'perfectionist',
    name: 'CV Perfectionist',
    description: 'Achieve a 95+ overall CV score',
    icon: '💎',
    category: 'CV_ANALYSIS',
    tier: 'DIAMOND',
    xpReward: 500,
    requirements: {
      type: 'cv_score_threshold',
      threshold: 95,
      data: {}
    },
    rarity: 'LEGENDARY',
    isHidden: false
  },

  // === AI INTERACTION BADGES ===
  {
    id: 'ai_collaborator',
    name: 'AI Collaborator',
    description: 'Accept 5 AI suggestions',
    icon: '🤖',
    category: 'AI_INTERACTION',
    tier: 'BRONZE',
    xpReward: 100,
    requirements: {
      type: 'suggestions_accepted',
      threshold: 5,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'ai_power_user',
    name: 'AI Power User',
    description: 'Accept 25 AI suggestions',
    icon: '🚀',
    category: 'AI_INTERACTION',
    tier: 'GOLD',
    xpReward: 300,
    requirements: {
      type: 'suggestions_accepted',
      threshold: 25,
      data: {}
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'suggestion_master',
    name: 'Suggestion Master',
    description: 'Generate and review 50+ AI suggestions',
    icon: '✨',
    category: 'AI_INTERACTION',
    tier: 'PLATINUM',
    xpReward: 400,
    requirements: {
      type: 'suggestions_generated',
      threshold: 50,
      data: {}
    },
    rarity: 'EPIC',
    isHidden: false
  },

  // === JOB APPLICATION BADGES ===
  {
    id: 'first_application',
    name: 'Career Starter',
    description: 'Submit your first job application',
    icon: '📝',
    category: 'APPLICATION_ACTIVITY',
    tier: 'BRONZE',
    xpReward: 150,
    requirements: {
      type: 'applications_submitted',
      threshold: 1,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'application_spree',
    name: 'Application Dynamo',
    description: 'Submit 10 applications in a single day',
    icon: '⚡',
    category: 'APPLICATION_ACTIVITY',
    tier: 'GOLD',
    xpReward: 350,
    requirements: {
      type: 'daily_applications',
      threshold: 10,
      data: { timeframe: 'single_day' }
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'quality_applicant',
    name: 'Quality Over Quantity',
    description: 'Maintain 80%+ application relevance score over 20 applications',
    icon: '🎯',
    category: 'APPLICATION_ACTIVITY',
    tier: 'DIAMOND',
    xpReward: 500,
    requirements: {
      type: 'application_quality',
      threshold: 80,
      data: { min_applications: 20 }
    },
    rarity: 'LEGENDARY',
    isHidden: false
  },

  // === ENGAGEMENT BADGES ===
  {
    id: 'streak_starter',
    name: 'Consistency King',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    category: 'ENGAGEMENT',
    tier: 'BRONZE',
    xpReward: 100,
    requirements: {
      type: 'activity_streak',
      threshold: 7,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    description: 'Maintain a 30-day activity streak',
    icon: '🔥',
    category: 'ENGAGEMENT',
    tier: 'GOLD',
    xpReward: 400,
    requirements: {
      type: 'activity_streak',
      threshold: 30,
      data: {}
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'dedication_legend',
    name: 'Dedication Legend',
    description: 'Maintain a 100-day activity streak',
    icon: '🏅',
    category: 'ENGAGEMENT',
    tier: 'DIAMOND',
    xpReward: 1000,
    requirements: {
      type: 'activity_streak',
      threshold: 100,
      data: {}
    },
    rarity: 'LEGENDARY',
    isHidden: false
  },

  // === CHALLENGE BADGES ===
  {
    id: 'challenge_rookie',
    name: 'Challenge Rookie',
    description: 'Complete your first daily challenge',
    icon: '🎯',
    category: 'CHALLENGES',
    tier: 'BRONZE',
    xpReward: 75,
    requirements: {
      type: 'challenges_completed',
      threshold: 1,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'challenge_hunter',
    name: 'Challenge Hunter',
    description: 'Complete 50 daily challenges',
    icon: '🏹',
    category: 'CHALLENGES',
    tier: 'SILVER',
    xpReward: 300,
    requirements: {
      type: 'challenges_completed',
      threshold: 50,
      data: {}
    },
    rarity: 'UNCOMMON',
    isHidden: false
  },
  {
    id: 'perfectionist_challenger',
    name: 'Perfect Week',
    description: 'Complete all daily challenges for 7 consecutive days',
    icon: '⭐',
    category: 'CHALLENGES',
    tier: 'GOLD',
    xpReward: 500,
    requirements: {
      type: 'perfect_challenge_streak',
      threshold: 7,
      data: {}
    },
    rarity: 'RARE',
    isHidden: false
  },

  // === LEVEL PROGRESSION BADGES ===
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'LEVEL_PROGRESSION',
    tier: 'BRONZE',
    xpReward: 200,
    requirements: {
      type: 'level_reached',
      threshold: 10,
      data: {}
    },
    rarity: 'COMMON',
    isHidden: false
  },
  {
    id: 'level_25',
    name: 'Skilled Professional',
    description: 'Reach level 25',
    icon: '💼',
    category: 'LEVEL_PROGRESSION',
    tier: 'SILVER',
    xpReward: 400,
    requirements: {
      type: 'level_reached',
      threshold: 25,
      data: {}
    },
    rarity: 'UNCOMMON',
    isHidden: false
  },
  {
    id: 'level_50',
    name: 'Career Master',
    description: 'Reach level 50',
    icon: '👑',
    category: 'LEVEL_PROGRESSION',
    tier: 'DIAMOND',
    xpReward: 1000,
    requirements: {
      type: 'level_reached',
      threshold: 50,
      data: {}
    },
    rarity: 'LEGENDARY',
    isHidden: false
  },

  // === SPECIAL ACHIEVEMENT BADGES ===
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 1000 users to complete their profile',
    icon: '🚀',
    category: 'SPECIAL',
    tier: 'PLATINUM',
    xpReward: 750,
    requirements: {
      type: 'early_adopter',
      threshold: 1000,
      data: { user_rank: 'top_1000' }
    },
    rarity: 'EPIC',
    isHidden: false
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Provided valuable feedback during beta testing',
    icon: '🧪',
    category: 'SPECIAL',
    tier: 'GOLD',
    xpReward: 500,
    requirements: {
      type: 'beta_participation',
      threshold: 1,
      data: {}
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'feedback_champion',
    name: 'Feedback Champion',
    description: 'Submit 10+ valuable improvement suggestions',
    icon: '💡',
    category: 'SPECIAL',
    tier: 'PLATINUM',
    xpReward: 600,
    requirements: {
      type: 'feedback_submitted',
      threshold: 10,
      data: {}
    },
    rarity: 'EPIC',
    isHidden: false
  },

  // === SEASONAL & TIME-LIMITED BADGES ===
  {
    id: 'new_year_resolution',
    name: 'New Year, New Career',
    description: 'Complete 5 actions in the first week of January',
    icon: '🎊',
    category: 'SEASONAL',
    tier: 'GOLD',
    xpReward: 300,
    requirements: {
      type: 'seasonal_activity',
      threshold: 5,
      data: { season: 'new_year', timeframe: 'first_week_january' }
    },
    rarity: 'RARE',
    isHidden: false
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 20+ actions on weekends this month',
    icon: '⚔️',
    category: 'ENGAGEMENT',
    tier: 'SILVER',
    xpReward: 250,
    requirements: {
      type: 'weekend_activity',
      threshold: 20,
      data: { timeframe: 'monthly' }
    },
    rarity: 'UNCOMMON',
    isHidden: false
  }
];

// Helper functions for badge management
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => badge.category === category);
}

export function getBadgesByTier(tier: BadgeTier): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => badge.tier === tier);
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(badge => badge.id === id);
}

export function getVisibleBadges(): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => !badge.isHidden);
}

export function getBadgesByRarity(rarity?: string): BadgeDefinition[] {
  if (!rarity) return BADGE_DEFINITIONS;
  return BADGE_DEFINITIONS.filter(badge => badge.rarity === rarity);
}

// Badge sorting utilities
export function sortBadgesByXP(badges: BadgeDefinition[], ascending: boolean = false): BadgeDefinition[] {
  return [...badges].sort((a, b) => 
    ascending ? a.xpReward - b.xpReward : b.xpReward - a.xpReward
  );
}

export function sortBadgesByTier(badges: BadgeDefinition[]): BadgeDefinition[] {
  const tierOrder = { 'BRONZE': 1, 'SILVER': 2, 'GOLD': 3, 'PLATINUM': 4, 'DIAMOND': 5 };
  return [...badges].sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
}

// Badge statistics
export const BADGE_STATS = {
  total: BADGE_DEFINITIONS.length,
  byCategory: {
    PROFILE_COMPLETION: getBadgesByCategory('PROFILE_COMPLETION').length,
    CV_ANALYSIS: getBadgesByCategory('CV_ANALYSIS').length,
    AI_INTERACTION: getBadgesByCategory('AI_INTERACTION').length,
    APPLICATION_ACTIVITY: getBadgesByCategory('APPLICATION_ACTIVITY').length,
    ENGAGEMENT: getBadgesByCategory('ENGAGEMENT').length,
    CHALLENGES: getBadgesByCategory('CHALLENGES').length,
    LEVEL_PROGRESSION: getBadgesByCategory('LEVEL_PROGRESSION').length,
    SPECIAL: getBadgesByCategory('SPECIAL').length,
    SEASONAL: getBadgesByCategory('SEASONAL').length
  },
  byTier: {
    BRONZE: getBadgesByTier('BRONZE').length,
    SILVER: getBadgesByTier('SILVER').length,
    GOLD: getBadgesByTier('GOLD').length,
    PLATINUM: getBadgesByTier('PLATINUM').length,
    DIAMOND: getBadgesByTier('DIAMOND').length
  }
};