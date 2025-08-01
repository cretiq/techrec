import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserGamificationProfile } from '@/types/gamification';

interface DashboardData {
  profile: UserGamificationProfile;
  profileCompleteness: {
    score: number;
    sections: Array<{ name: string; score: number }>;
  };
  roadmapProgress: {
    milestones: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
      completedAt: string | null;
    }>;
    completedCount: number;
    progress: number;
  };
  activityStats: {
    cvsAnalyzed: number;
    rolesSearched: number;
    applicationsSubmitted: number;
    coverLettersGenerated: number;
    weeklyActivity: Array<{ day: string; activities: number }>;
    monthlyGoal: {
      target: number;
      current: number;
      label: string;
    };
  };
  streakData: {
    currentStreak: number;
    bestStreak: number;
    lastActivityDate: string | null;
    isStreakActive: boolean;
    nextMilestone: {
      target: number;
      reward: string;
      daysLeft: number;
    } | null;
  };
  pointsData: {
    available: number;
    monthly: number;
    used: number;
    earned: number;
    resetDate: string | null;
    subscriptionTier: string;
    efficiency: number;
    transactions: any[];
  };
  recentBadges: any[];
  dashboardMetadata: {
    lastUpdated: string;
    dataVersion: string;
  };
}

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: DashboardState = {
  data: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
};

// Async thunk for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/gamification/dashboard', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();

      // Data is already in the correct format (ISO strings for dates)
      // No date conversion needed - keep dates as strings for Redux serialization
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetchedAt = null;
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardData, clearDashboardError } = dashboardSlice.actions;

// Selectors
export const selectDashboardData = (state: { dashboard: DashboardState }) => state.dashboard.data;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectDashboardLastFetched = (state: { dashboard: DashboardState }) => state.dashboard.lastFetchedAt;

// Specific selectors for dashboard components
export const selectProfileData = (state: { dashboard: DashboardState }) => state.dashboard.data?.profile;
export const selectRoadmapProgress = (state: { dashboard: DashboardState }) => state.dashboard.data?.roadmapProgress;
export const selectActivityStats = (state: { dashboard: DashboardState }) => state.dashboard.data?.activityStats;
export const selectStreakData = (state: { dashboard: DashboardState }) => state.dashboard.data?.streakData;
export const selectPointsData = (state: { dashboard: DashboardState }) => state.dashboard.data?.pointsData;
export const selectRecentBadges = (state: { dashboard: DashboardState }) => state.dashboard.data?.recentBadges;
export const selectProfileCompleteness = (state: { dashboard: DashboardState }) => state.dashboard.data?.profileCompleteness;

export default dashboardSlice.reducer;