import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define placeholder types for your analytics data structures
interface TrendData { /* ... structure for trend analysis ... */ }
interface PerformanceMetrics { /* ... structure for performance metrics ... */ }

// Define a type for the analytics state slice
interface AnalyticsState {
  trends: TrendData | null;
  performance: PerformanceMetrics | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: AnalyticsState = {
  trends: null,
  performance: null,
  status: 'idle',
  error: null,
};

// Example Async Thunk for fetching analytics data
export const fetchAnalyticsData = createAsyncThunk(
  'analytics/fetchData',
  async (/* pass necessary params like dateRange, userId, etc. */ _, { rejectWithValue }) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/analytics'); 
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.error || `Failed to fetch analytics (${response.status})`);
      }
      const data = await response.json();
      // Assume data structure matches { trends: TrendData, performance: PerformanceMetrics }
      return data as { trends: TrendData, performance: PerformanceMetrics };
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Reducer to clear analytics data
    clearAnalytics: (state) => {
      return initialState;
    },
    // Add other specific reducers if needed (e.g., update specific metric locally)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trends = action.payload.trends;
        state.performance = action.payload.performance;
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.trends = null; // Clear data on error
        state.performance = null;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;

// Selectors
export const selectTrendsData = (state: RootState) => state.analytics.trends;
export const selectPerformanceMetrics = (state: RootState) => state.analytics.performance;
export const selectAnalyticsStatus = (state: RootState) => state.analytics.status;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

export default analyticsSlice.reducer; 