// Gamification Redux Slice for TechRec Platform

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  UserGamificationProfile, 
  XPTransaction, 
  GamificationNotification,
  DailyChallenge,
  BadgeDefinition,
  PeerComparison,
  AnonymousLeaderboard
} from '@/types/gamification';

// Async thunks for API calls

export const fetchGamificationProfile = createAsyncThunk(
  'gamification/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gamification/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch gamification profile');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const awardXP = createAsyncThunk(
  'gamification/awardXP',
  async (xpData: { source: string; amount: number; sourceId?: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gamification/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xpData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to award XP');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchDailyChallenges = createAsyncThunk(
  'gamification/fetchChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gamification/challenges/daily');
      if (!response.ok) {
        throw new Error('Failed to fetch daily challenges');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const completeChallenge = createAsyncThunk(
  'gamification/completeChallenge',
  async (challengeId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gamification/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (category: string = 'global', { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gamification/leaderboard/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// State interface
export interface GamificationState {
  // User profile data
  userProfile: UserGamificationProfile | null;
  
  // Activity tracking
  recentTransactions: XPTransaction[];
  dailyChallenges: DailyChallenge[];
  
  // Badge system
  availableBadges: BadgeDefinition[];
  earnedBadges: Array<{ badge: BadgeDefinition; earnedAt: Date }>;
  badgeProgress: Array<{ badgeId: string; progress: number }>;
  
  // Social features
  leaderboard: AnonymousLeaderboard | null;
  peerComparison: PeerComparison | null;
  
  // Notifications and UI state
  notifications: GamificationNotification[];
  unreadNotifications: number;
  celebratingAchievement: {
    type: 'level_up' | 'badge_earned' | 'challenge_completed' | null;
    data: any;
  } | null;
  
  // Real-time updates
  pendingXP: number; // XP being animated
  animationQueue: Array<{
    id: string;
    type: 'xp_gain' | 'level_up' | 'badge_unlock';
    data: any;
    timestamp: number;
  }>;
  
  // Loading states
  isLoading: boolean;
  challengesLoading: boolean;
  leaderboardLoading: boolean;
  profileLoading: boolean;
  
  // Error handling
  error: string | null;
  lastUpdated: string | null;
  
  // Settings
  showAnimations: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

const initialState: GamificationState = {
  userProfile: null,
  recentTransactions: [],
  dailyChallenges: [],
  availableBadges: [],
  earnedBadges: [],
  badgeProgress: [],
  leaderboard: null,
  peerComparison: null,
  notifications: [],
  unreadNotifications: 0,
  celebratingAchievement: null,
  pendingXP: 0,
  animationQueue: [],
  isLoading: false,
  challengesLoading: false,
  leaderboardLoading: false,
  profileLoading: false,
  error: null,
  lastUpdated: null,
  showAnimations: true,
  soundEnabled: true,
  notificationsEnabled: true
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // XP and progression
    addXPNotification: (state, action: PayloadAction<{ amount: number; source: string; description: string }>) => {
      const notification: GamificationNotification = {
        id: Date.now().toString(),
        type: 'xp_gained',
        title: `+${action.payload.amount} XP`,
        message: action.payload.description,
        xpAmount: action.payload.amount,
        timestamp: new Date(),
        isRead: false
      };
      
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
      
      // Add to animation queue
      state.animationQueue.push({
        id: notification.id,
        type: 'xp_gain',
        data: action.payload,
        timestamp: Date.now()
      });
      
      // Update pending XP for smooth animations
      state.pendingXP += action.payload.amount;
      
      // Keep only last 20 notifications
      if (state.notifications.length > 20) {
        state.notifications = state.notifications.slice(0, 20);
      }
    },

    updateUserXP: (state, action: PayloadAction<number>) => {
      if (state.userProfile) {
        state.userProfile.totalXP += action.payload;
        state.pendingXP = Math.max(0, state.pendingXP - action.payload);
      }
    },

    triggerLevelUpCelebration: (state, action: PayloadAction<{ newLevel: number; benefits: string[] }>) => {
      const notification: GamificationNotification = {
        id: Date.now().toString(),
        type: 'level_up',
        title: `Level Up!`,
        message: `You've reached level ${action.payload.newLevel}!`,
        timestamp: new Date(),
        isRead: false
      };
      
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
      
      state.celebratingAchievement = {
        type: 'level_up',
        data: action.payload
      };
      
      state.animationQueue.push({
        id: notification.id,
        type: 'level_up',
        data: action.payload,
        timestamp: Date.now()
      });
    },

    // Badge system
    addBadgeNotification: (state, action: PayloadAction<{ badge: BadgeDefinition; xpAwarded: number }>) => {
      const notification: GamificationNotification = {
        id: Date.now().toString(),
        type: 'badge_earned',
        title: 'Badge Earned!',
        message: `You've earned the "${action.payload.badge.name}" badge!`,
        badgeId: action.payload.badge.id,
        timestamp: new Date(),
        isRead: false
      };
      
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
      
      state.celebratingAchievement = {
        type: 'badge_earned',
        data: action.payload
      };
      
      state.animationQueue.push({
        id: notification.id,
        type: 'badge_unlock',
        data: action.payload,
        timestamp: Date.now()
      });
      
      // Add to earned badges
      state.earnedBadges.unshift({
        badge: action.payload.badge,
        earnedAt: new Date()
      });
    },

    updateBadgeProgress: (state, action: PayloadAction<{ badgeId: string; progress: number }>) => {
      const existingProgress = state.badgeProgress.find(bp => bp.badgeId === action.payload.badgeId);
      if (existingProgress) {
        existingProgress.progress = action.payload.progress;
      } else {
        state.badgeProgress.push(action.payload);
      }
    },

    // Challenge system
    updateChallengeProgress: (state, action: PayloadAction<{ challengeId: string; progress: number }>) => {
      const challenge = state.dailyChallenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        challenge.currentProgress = action.payload.progress;
      }
    },

    markChallengeCompleted: (state, action: PayloadAction<{ challengeId: string; xpAwarded: number }>) => {
      const challenge = state.dailyChallenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        challenge.completedAt = new Date();
        challenge.currentProgress = challenge.targetValue;
      }
      
      const notification: GamificationNotification = {
        id: Date.now().toString(),
        type: 'challenge_completed',
        title: 'Challenge Complete!',
        message: `You've completed the "${challenge?.title}" challenge!`,
        xpAmount: action.payload.xpAwarded,
        timestamp: new Date(),
        isRead: false
      };
      
      state.notifications.unshift(notification);
      state.unreadNotifications += 1;
    },

    // Notifications
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
      }
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.isRead = true);
      state.unreadNotifications = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadNotifications = 0;
    },

    // UI state management
    dismissCelebration: (state) => {
      state.celebratingAchievement = null;
    },

    processAnimationQueue: (state) => {
      const now = Date.now();
      // Remove animations older than 5 seconds
      state.animationQueue = state.animationQueue.filter(animation => 
        now - animation.timestamp < 5000
      );
    },

    // Settings
    updateGamificationSettings: (state, action: PayloadAction<Partial<{
      showAnimations: boolean;
      soundEnabled: boolean;
      notificationsEnabled: boolean;
    }>>) => {
      Object.assign(state, action.payload);
    },

    // Data updates
    setUserProfile: (state, action: PayloadAction<UserGamificationProfile>) => {
      state.userProfile = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    setDailyChallenges: (state, action: PayloadAction<DailyChallenge[]>) => {
      state.dailyChallenges = action.payload;
    },

    setLeaderboard: (state, action: PayloadAction<AnonymousLeaderboard>) => {
      state.leaderboard = action.payload;
    },

    setPeerComparison: (state, action: PayloadAction<PeerComparison>) => {
      state.peerComparison = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    // Fetch gamification profile
    builder.addCase(fetchGamificationProfile.pending, (state) => {
      state.profileLoading = true;
      state.error = null;
    });
    builder.addCase(fetchGamificationProfile.fulfilled, (state, action) => {
      state.profileLoading = false;
      state.userProfile = action.payload.profile;
      state.recentTransactions = action.payload.recentTransactions;
      state.availableBadges = action.payload.availableBadges;
      state.dailyChallenges = action.payload.activeChallenges;
      state.lastUpdated = new Date().toISOString();
    });
    builder.addCase(fetchGamificationProfile.rejected, (state, action) => {
      state.profileLoading = false;
      state.error = action.payload as string;
    });

    // Award XP
    builder.addCase(awardXP.fulfilled, (state, action) => {
      const { xpAwarded, newLevel, profileUpdate } = action.payload;
      
      if (state.userProfile && profileUpdate) {
        Object.assign(state.userProfile, profileUpdate);
      }
      
      if (newLevel) {
        // Trigger level up celebration
        state.celebratingAchievement = {
          type: 'level_up',
          data: { newLevel }
        };
      }
    });

    // Fetch daily challenges
    builder.addCase(fetchDailyChallenges.pending, (state) => {
      state.challengesLoading = true;
    });
    builder.addCase(fetchDailyChallenges.fulfilled, (state, action) => {
      state.challengesLoading = false;
      state.dailyChallenges = action.payload;
    });
    builder.addCase(fetchDailyChallenges.rejected, (state, action) => {
      state.challengesLoading = false;
      state.error = action.payload as string;
    });

    // Complete challenge
    builder.addCase(completeChallenge.fulfilled, (state, action) => {
      const { challengeId, xpAwarded } = action.payload;
      
      const challenge = state.dailyChallenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.completedAt = new Date();
        challenge.currentProgress = challenge.targetValue;
      }
      
      if (xpAwarded > 0 && state.userProfile) {
        state.userProfile.totalXP += xpAwarded;
      }
    });

    // Fetch leaderboard
    builder.addCase(fetchLeaderboard.pending, (state) => {
      state.leaderboardLoading = true;
    });
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboardLoading = false;
      state.leaderboard = action.payload;
    });
    builder.addCase(fetchLeaderboard.rejected, (state, action) => {
      state.leaderboardLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const {
  addXPNotification,
  updateUserXP,
  triggerLevelUpCelebration,
  addBadgeNotification,
  updateBadgeProgress,
  updateChallengeProgress,
  markChallengeCompleted,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  dismissCelebration,
  processAnimationQueue,
  updateGamificationSettings,
  setUserProfile,
  setDailyChallenges,
  setLeaderboard,
  setPeerComparison,
  setError,
  clearError
} = gamificationSlice.actions;

// Selectors
export const selectGamificationProfile = (state: { gamification: GamificationState }) => 
  state.gamification.userProfile;

export const selectUserLevel = (state: { gamification: GamificationState }) => 
  state.gamification.userProfile?.currentLevel || 1;

export const selectUserXP = (state: { gamification: GamificationState }) => 
  state.gamification.userProfile?.totalXP || 0;

export const selectUserTier = (state: { gamification: GamificationState }) => 
  state.gamification.userProfile?.tier || 'BRONZE';

export const selectUserStreak = (state: { gamification: GamificationState }) => 
  state.gamification.userProfile?.streak || 0;

export const selectDailyChallenges = (state: { gamification: GamificationState }) => 
  state.gamification.dailyChallenges;

export const selectAvailableBadges = (state: { gamification: GamificationState }) => 
  state.gamification.availableBadges;

export const selectEarnedBadges = (state: { gamification: GamificationState }) => 
  state.gamification.earnedBadges;

export const selectBadgeProgress = (state: { gamification: GamificationState }) => 
  state.gamification.badgeProgress;

export const selectNotifications = (state: { gamification: GamificationState }) => 
  state.gamification.notifications;

export const selectUnreadNotifications = (state: { gamification: GamificationState }) => 
  state.gamification.unreadNotifications;

export const selectCelebration = (state: { gamification: GamificationState }) => 
  state.gamification.celebratingAchievement;

export const selectAnimationQueue = (state: { gamification: GamificationState }) => 
  state.gamification.animationQueue;

export const selectLeaderboard = (state: { gamification: GamificationState }) => 
  state.gamification.leaderboard;

export const selectPeerComparison = (state: { gamification: GamificationState }) => 
  state.gamification.peerComparison;

export const selectGamificationLoading = (state: { gamification: GamificationState }) => 
  state.gamification.isLoading || state.gamification.profileLoading;

export const selectGamificationError = (state: { gamification: GamificationState }) => 
  state.gamification.error;

export const selectGamificationSettings = (state: { gamification: GamificationState }) => ({
  showAnimations: state.gamification.showAnimations,
  soundEnabled: state.gamification.soundEnabled,
  notificationsEnabled: state.gamification.notificationsEnabled
});

// Computed selectors
export const selectCompletedChallenges = (state: { gamification: GamificationState }) => 
  state.gamification.dailyChallenges.filter(challenge => challenge.completedAt !== null);

export const selectPendingChallenges = (state: { gamification: GamificationState }) => 
  state.gamification.dailyChallenges.filter(challenge => challenge.completedAt === null);

export const selectNextLevelProgress = (state: { gamification: GamificationState }) => {
  const profile = state.gamification.userProfile;
  if (!profile) return { progress: 0, xpNeeded: 0 };
  
  return {
    progress: profile.levelProgress,
    xpNeeded: profile.nextLevelXP - profile.totalXP
  };
};

export const selectGamificationStats = (state: { gamification: GamificationState }) => {
  const profile = state.gamification.userProfile;
  const challenges = state.gamification.dailyChallenges;
  const badges = state.gamification.earnedBadges;
  
  return {
    totalXP: profile?.totalXP || 0,
    currentLevel: profile?.currentLevel || 1,
    tier: profile?.tier || 'BRONZE',
    streak: profile?.streak || 0,
    badgesEarned: badges.length,
    challengesCompleted: challenges.filter(c => c.completedAt).length,
    totalChallenges: challenges.length
  };
};

export default gamificationSlice.reducer;