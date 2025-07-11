// Gamification Types for TechRec Platform

import { SubscriptionTier, BadgeCategory, BadgeTier, XPSource } from '@prisma/client';

// Core gamification profile interface
export interface UserGamificationProfile {
  totalXP: number;
  currentLevel: number;
  levelProgress: number; // 0.0 to 1.0
  subscriptionTier: SubscriptionTier;
  points?: {
    monthly: number;
    used: number;
    earned: number;
    available: number;
    resetDate: Date | null;
  };
  streak: number;
  lastActivityDate: Date | null;
  badges: UserBadgeWithDetails[];
  nextLevelXP: number;
  currentLevelXP: number;
}

// Badge interfaces
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  category: BadgeCategory;
  tier: BadgeTier;
  requirements: BadgeRequirement;
  xpReward: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isHidden: boolean;
}

export interface BadgeRequirement {
  type: string;
  threshold: number;
  data: Record<string, any>;
}

export interface UserBadgeWithDetails {
  id: string;
  badgeId: string;
  badge: BadgeDefinition;
  earnedAt: Date;
  progress: number; // 0.0 to 1.0 for progressive badges
}

export interface BadgeWithProgress extends BadgeDefinition {
  isEarned: boolean;
  earnedAt?: Date;
  progress: number;
  isInProgress: boolean;
}

export interface BadgeCriteria {
  type: 'profile_completeness' | 'suggestions_accepted' | 'applications_submitted' | 
        'cv_analyses_completed' | 'login_streak' | 'skill_count' | 'custom';
  threshold: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: Record<string, any>;
}

// XP and progression interfaces
export interface XPTransaction {
  id: string;
  developerId: string;
  amount: number;
  source: XPSource;
  sourceId?: string;
  description: string;
  earnedAt: Date;
}

export interface XPAward {
  userId: string;
  amount: number;
  source: XPSource;
  sourceId?: string;
  description: string;
}

// Level system configuration
export interface LevelSystem {
  level: number;
  requiredXP: number;
  title: string;
  benefits: string[];
}

// Daily challenges
export interface DailyChallenge {
  id: string;
  developerId: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetValue: number;
  currentProgress: number;
  xpReward: number;
  difficulty: ChallengeDifficulty;
  completedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

export type ChallengeType = 
  | 'PROFILE_UPDATE'
  | 'AI_INTERACTION'
  | 'APPLICATION_ACTIVITY'
  | 'SKILL_DEVELOPMENT'
  | 'CONTENT_GENERATION'
  | 'STREAK_MAINTENANCE';

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

// Leaderboard interfaces
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  level: number;
  xp: number;
  displayName: string; // Anonymous identifier
  isCurrentUser: boolean;
  subscriptionTier: SubscriptionTier;
}

export interface AnonymousLeaderboard {
  category: string;
  period: string;
  entries: LeaderboardEntry[];
  userRank?: number;
  totalUsers: number;
  lastUpdated: Date;
}

// Peer comparison and benchmarks
export interface BenchmarkData {
  industry: string;
  userXP: number;
  averageXP: number;
  percentile: number; // User's percentile ranking
  sampleSize: number;
  improvementPotential: number; // XP to reach next tier
}

export interface PeerComparison {
  userPercentile: number;
  industryBenchmark: BenchmarkData;
  anonymizedSuccessStories: SuccessStory[];
  improvementSuggestions: string[];
}

// Success stories
export interface SuccessStory {
  id: string;
  industry: string;
  beforeState: string;
  afterState: string;
  keyActions: string[];
  outcome: string;
  timeframe: string;
  isAnonymous: boolean;
}

// Game preferences
export interface GamePreferences {
  showLevelUp: boolean;
  showAchievements: boolean;
  publicProfile: boolean;
  emailNotifications: boolean;
  showComparisons: boolean;
  challengeReminders: boolean;
}

// Notifications and UI state
export interface GamificationNotification {
  id: string;
  type: 'xp_gained' | 'level_up' | 'badge_earned' | 'challenge_completed';
  title: string;
  message: string;
  xpAmount?: number;
  badgeId?: string;
  timestamp: Date;
  isRead: boolean;
}

export interface LevelUpNotification extends GamificationNotification {
  type: 'level_up';
  newLevel: number;
  levelTitle: string;
  newBenefits: string[];
}

export interface BadgeEarnedNotification extends GamificationNotification {
  type: 'badge_earned';
  badge: BadgeDefinition;
  xpAwarded: number;
}

// Gamification events for the event system
export interface GamificationEvent {
  type: GamificationEventType;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

export type GamificationEventType = 
  | 'CV_UPLOADED'
  | 'CV_ANALYSIS_COMPLETED'
  | 'CV_IMPROVEMENT_APPLIED'
  | 'APPLICATION_SUBMITTED'
  | 'PROFILE_SECTION_UPDATED'
  | 'SKILL_ADDED'
  | 'DAILY_LOGIN'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'CHALLENGE_COMPLETED'
  | 'STREAK_MILESTONE'
  | 'BADGE_EARNED'
  | 'LEVEL_UP';

// API response interfaces
export interface GamificationProfileResponse {
  profile: UserGamificationProfile;
  recentTransactions: XPTransaction[];
  availableBadges: BadgeDefinition[];
  activeChallenges: DailyChallenge[];
  notifications: GamificationNotification[];
}

export interface XPAwardResponse {
  success: boolean;
  xpAwarded: number;
  newLevel?: number;
  newBadges?: BadgeDefinition[];
  profileUpdate: Partial<UserGamificationProfile>;
}

// Constants for XP calculations
export const XP_REWARDS: Record<string, number> = {
  PROFILE_SECTION_UPDATED: 15,
  CV_UPLOADED: 25,
  CV_ANALYSIS_COMPLETED: 50,
  CV_IMPROVEMENT_APPLIED: 75,
  APPLICATION_SUBMITTED: 100,
  SKILL_ADDED: 10,
  ACHIEVEMENT_UNLOCKED: 20,
  DAILY_LOGIN: 5,
  STREAK_MILESTONE: 25,
  CHALLENGE_COMPLETED: 50,
  BADGE_EARNED: 0, // XP is handled by badge definition
  ADMIN_AWARD: 0, // Admin awards are flexible and bypass validation
  LEVEL_UP: 0, // Level up is a milestone, not a direct XP source
};

// Level thresholds for progression (ProfileTier removed)
// These are now informational only - subscription tiers handle access control
export const LEGACY_LEVEL_THRESHOLDS: Record<string, number> = {
  NEWCOMER: 0,
  APPRENTICE: 100,
  DEVELOPER: 250,
  PROFESSIONAL: 450,
  EXPERT: 700,
  SPECIALIST: 1500,
  SENIOR: 2500,
  LEAD: 4000,
  PRINCIPAL: 6000,
  ARCHITECT: 8500
};

// Level progression configuration (exponential growth)
export const LEVEL_SYSTEM: LevelSystem[] = [
  { level: 1, requiredXP: 0, title: 'Newcomer', benefits: ['Basic profile features'] },
  { level: 2, requiredXP: 100, title: 'Apprentice', benefits: ['Enhanced CV analysis'] },
  { level: 3, requiredXP: 250, title: 'Developer', benefits: ['Priority support'] },
  { level: 4, requiredXP: 450, title: 'Professional', benefits: ['Advanced insights'] },
  { level: 5, requiredXP: 700, title: 'Expert', benefits: ['Profile visibility boost'] },
  { level: 10, requiredXP: 1500, title: 'Specialist', benefits: ['Custom badges'] },
  { level: 15, requiredXP: 2500, title: 'Senior', benefits: ['Mentorship opportunities'] },
  { level: 20, requiredXP: 4000, title: 'Lead', benefits: ['Career consultation'] },
  { level: 25, requiredXP: 6000, title: 'Principal', benefits: ['Platform beta access'] },
  { level: 30, requiredXP: 8500, title: 'Architect', benefits: ['VIP status'] }
];

// Badge definitions (will be seeded in database)
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Profile Completion Badges
  {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Complete all profile sections',
    icon: '👤',
    category: 'PROFILE_COMPLETION',
    tier: 'BRONZE',
    requirements: { type: 'profile_completeness', threshold: 100, data: {} },
    xpReward: 100,
    rarity: 'COMMON',
    isHidden: false
  },
  
  // CV Improvement Badges
  {
    id: 'cv_optimizer',
    name: 'CV Optimizer',
    description: 'Accept 10 AI improvement suggestions',
    icon: '🚀',
    category: 'CV_IMPROVEMENT',
    tier: 'SILVER',
    requirements: { type: 'suggestions_accepted', threshold: 10, data: {} },
    xpReward: 200,
    rarity: 'UNCOMMON',
    isHidden: false
  },
  
  // Application Success Badges
  {
    id: 'application_machine',
    name: 'Application Machine',
    description: 'Submit 25 job applications',
    icon: '⚡',
    category: 'APPLICATION_SUCCESS',
    tier: 'GOLD',
    requirements: { type: 'applications_submitted', threshold: 25, data: {} },
    xpReward: 500,
    rarity: 'RARE',
    isHidden: false
  },
  
  // Engagement Badges
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: '7-day login streak',
    icon: '🔥',
    category: 'ENGAGEMENT',
    tier: 'BRONZE',
    requirements: { type: 'login_streak', threshold: 7, data: {} },
    xpReward: 150,
    rarity: 'UNCOMMON',
    isHidden: false
  },
  
  // Skill Mastery Badges
  {
    id: 'skill_collector',
    name: 'Skill Collector',
    description: 'Add 15+ skills to your profile',
    icon: '🎯',
    category: 'SKILL_MASTERY',
    tier: 'SILVER',
    requirements: { type: 'skill_count', threshold: 15, data: {} },
    xpReward: 300,
    rarity: 'UNCOMMON',
    isHidden: false
  }
];