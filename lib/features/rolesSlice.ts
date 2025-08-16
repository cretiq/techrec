// lib/features/rolesSlice.ts
// Redux slice for RapidAPI role search with caching and usage tracking

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '@/types/role';
import RapidApiCacheManager, { type ApiUsageHeaders, type SearchParameters } from '@/lib/api/rapidapi-cache';
import RapidApiValidator, { type ValidationResult } from '@/lib/api/rapidapi-validator';
import { mapRapidApiJobToRole } from '@/utils/mappers';

interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  lastSearchParams: SearchParameters | null;
  cachedSearches: Record<string, {
    roles: Role[];
    timestamp: number;
    params: SearchParameters;
  }>;
  apiUsage: ApiUsageHeaders | null;
  usageWarningLevel: 'none' | 'low' | 'critical';
  requestThrottling: {
    enabled: boolean;
    lastRequestTime: number;
    minIntervalMs: number;
    maxJobsPerSearch: number;
  };
  validationErrors: string[];
  validationWarnings: string[];
  searchHistory: Array<{
    params: SearchParameters;
    timestamp: number;
    resultCount: number;
    cached: boolean;
  }>;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
  lastSearchParams: null,
  cachedSearches: {},
  apiUsage: null,
  usageWarningLevel: 'none',
  requestThrottling: {
    enabled: process.env.NODE_ENV === 'production', // Disable in development for debugging
    lastRequestTime: 0,
    minIntervalMs: 5 * 60 * 1000, // 5 minutes between requests
    maxJobsPerSearch: 10, // Conservative limit
  },
  validationErrors: [],
  validationWarnings: [],
  searchHistory: [],
};

// Async thunk for searching roles with caching and validation
export const searchRoles = createAsyncThunk<
  { roles: Role[]; cached: boolean; usage?: ApiUsageHeaders; pointsInfo?: { pointsSpent: number; newBalance: number; resultsCount: number } },
  SearchParameters & { forceRefresh?: boolean },
  { rejectValue: string }
>(
  'roles/searchRoles',
  async (params, { rejectWithValue }) => {
    const { forceRefresh, ...searchParams } = params;
    const cacheManager = RapidApiCacheManager.getInstance();
    const validator = RapidApiValidator.getInstance();

    try {
      // Validate parameters
      const validation = validator.validateSearchParameters(searchParams);
      if (!validation.valid) {
        return rejectWithValue(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Use normalized parameters
      const normalizedParams = validation.normalizedParams;

      // Check Redux-level cache first (unless forceRefresh is true)
      const cachedResponse = (!forceRefresh) ? cacheManager.getCachedResponse(normalizedParams) : null;
      if (cachedResponse) {
        return {
          roles: cachedResponse.data.map(mapRapidApiJobToRole),
          cached: true,
          // Note: Cached responses don't include points info since points are deducted by the server
        };
      }

      // Check if we can make a request
      const creditCheck = cacheManager.canMakeRequest(normalizedParams);
      if (!creditCheck.allowed) {
        return rejectWithValue(`API credits insufficient: ${creditCheck.reason}`);
      }

      // Construct API URL
      const baseUrl = '/api/rapidapi/search';
      const apiSearchParams = new URLSearchParams();
      
      Object.entries(normalizedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          apiSearchParams.append(key, value.toString());
        }
      });

      // Add forceRefresh parameter to bypass API-level cache
      if (forceRefresh) {
        apiSearchParams.append('forceRefresh', 'true');
      }

      const apiUrl = `${baseUrl}?${apiSearchParams.toString()}`;

      // Make API request
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        return rejectWithValue(errorData.error || `API request failed: ${response.status}`);
      }

      const jobs = await response.json();
      
      // Update usage tracking
      cacheManager.updateUsage(response.headers);
      
      // Cache the response
      cacheManager.cacheResponse(normalizedParams, jobs, response.headers);

      // Map jobs to roles
      const roles = jobs.map(mapRapidApiJobToRole);
      
      // Extract points information from headers (MVP Beta)
      const pointsInfo = {
        pointsSpent: response.headers.get('X-Points-Spent') ? parseInt(response.headers.get('X-Points-Spent')!) : null,
        newBalance: response.headers.get('X-Points-New-Balance') ? parseInt(response.headers.get('X-Points-New-Balance')!) : null,
        resultsCount: response.headers.get('X-Points-Results-Count') ? parseInt(response.headers.get('X-Points-Results-Count')!) : null,
      };

      return {
        roles,
        cached: false,
        usage: cacheManager.getCurrentUsage(),
        pointsInfo: pointsInfo.pointsSpent !== null ? pointsInfo : undefined,
      };

    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search roles');
    }
  }
);

// Async thunk for getting cached searches
export const getCachedSearches = createAsyncThunk<
  Record<string, { roles: Role[]; timestamp: number; params: SearchParameters }>,
  void
>(
  'roles/getCachedSearches',
  async () => {
    const cacheManager = RapidApiCacheManager.getInstance();
    const stats = cacheManager.getCacheStats();
    
    // Convert cache stats to our format
    const cachedSearches: Record<string, { roles: Role[]; timestamp: number; params: SearchParameters }> = {};
    
    // This is a simplified version - in a real implementation, we'd need to store more metadata
    return cachedSearches;
  }
);

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = [];
      state.validationWarnings = [];
    },
    
    updateRequestThrottling: (state, action: PayloadAction<Partial<RolesState['requestThrottling']>>) => {
      state.requestThrottling = { ...state.requestThrottling, ...action.payload };
    },
    
    updateUsageWarning: (state) => {
      const cacheManager = RapidApiCacheManager.getInstance();
      state.usageWarningLevel = cacheManager.getUsageWarningLevel();
    },
    
    clearCache: (state) => {
      const cacheManager = RapidApiCacheManager.getInstance();
      cacheManager.clearCache();
      state.cachedSearches = {};
      state.searchHistory = [];
    },
    
    setValidationResults: (state, action: PayloadAction<ValidationResult>) => {
      state.validationErrors = action.payload.errors;
      state.validationWarnings = action.payload.warnings;
    },
    
    addToSearchHistory: (state, action: PayloadAction<{
      params: SearchParameters;
      resultCount: number;
      cached: boolean;
    }>) => {
      const historyEntry = {
        ...action.payload,
        timestamp: Date.now(),
      };
      
      // Keep only last 20 searches
      state.searchHistory = [historyEntry, ...state.searchHistory.slice(0, 19)];
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(searchRoles.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastSearchParams = action.meta.arg;
        
        // Validate parameters and update validation state
        const validator = RapidApiValidator.getInstance();
        const validation = validator.validateSearchParameters(action.meta.arg);
        state.validationErrors = validation.errors;
        state.validationWarnings = validation.warnings;
      })
      
      .addCase(searchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.error = null;
        
        // Update API usage if provided
        if (action.payload.usage) {
          state.apiUsage = action.payload.usage;
          const cacheManager = RapidApiCacheManager.getInstance();
          state.usageWarningLevel = cacheManager.getUsageWarningLevel();
        }
        
        // Update request throttling
        if (!action.payload.cached) {
          state.requestThrottling.lastRequestTime = Date.now();
        }
        
        // Add to search history
        if (state.lastSearchParams) {
          const historyEntry = {
            params: state.lastSearchParams,
            timestamp: Date.now(),
            resultCount: action.payload.roles.length,
            cached: action.payload.cached,
          };
          state.searchHistory = [historyEntry, ...state.searchHistory.slice(0, 19)];
        }
      })
      
      .addCase(searchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search roles';
        state.roles = [];
      })
      
      .addCase(getCachedSearches.fulfilled, (state, action) => {
        state.cachedSearches = action.payload;
      });
  },
});

export const {
  clearError,
  updateRequestThrottling,
  updateUsageWarning,
  clearCache,
  setValidationResults,
  addToSearchHistory,
} = rolesSlice.actions;

// Selectors
export const selectRoles = (state: { roles: RolesState }) => state.roles.roles;
export const selectRolesLoading = (state: { roles: RolesState }) => state.roles.loading;
export const selectRolesError = (state: { roles: RolesState }) => state.roles.error;
export const selectApiUsage = (state: { roles: RolesState }) => state.roles.apiUsage;
export const selectUsageWarningLevel = (state: { roles: RolesState }) => state.roles.usageWarningLevel;
export const selectRequestThrottling = (state: { roles: RolesState }) => state.roles.requestThrottling;
export const selectValidationErrors = (state: { roles: RolesState }) => state.roles.validationErrors;
export const selectValidationWarnings = (state: { roles: RolesState }) => state.roles.validationWarnings;
export const selectSearchHistory = (state: { roles: RolesState }) => state.roles.searchHistory;
export const selectLastSearchParams = (state: { roles: RolesState }) => state.roles.lastSearchParams;

// Computed selectors
export const selectCanMakeRequest = (state: { roles: RolesState }) => {
  const { requestThrottling, apiUsage } = state.roles;
  
  if (!requestThrottling.enabled) return true;
  
  const timeSinceLastRequest = Date.now() - requestThrottling.lastRequestTime;
  const throttleAllowed = timeSinceLastRequest >= requestThrottling.minIntervalMs;
  
  const creditsAvailable = !apiUsage || (
    apiUsage.jobsRemaining >= requestThrottling.maxJobsPerSearch &&
    apiUsage.requestsRemaining >= 1
  );
  
  return throttleAllowed && creditsAvailable;
};

export const selectNextRequestTime = (state: { roles: RolesState }) => {
  const { requestThrottling } = state.roles;
  if (!requestThrottling.enabled) return null;
  
  const nextTime = requestThrottling.lastRequestTime + requestThrottling.minIntervalMs;
  return nextTime > Date.now() ? nextTime : null;
};

export default rolesSlice.reducer;