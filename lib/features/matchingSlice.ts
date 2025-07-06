// lib/features/matchingSlice.ts
// Redux slice for managing role matching scores and state

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  MatchingState, 
  UserSkillProfile, 
  SerializableUserSkillProfile,
  RoleMatchScore, 
  MatchingConfig,
  BatchMatchRequest,
  BatchMatchResponse,
  UserSkill
} from '@/types/matching';
import { SkillLevel } from '@prisma/client';
import { Role } from '@/types/role';
import { RapidApiJob } from '@/types/rapidapi';

// Updated MatchingState type for Redux serialization
interface ReduxMatchingState {
  userProfile: SerializableUserSkillProfile | null;
  roleScores: Record<string, RoleMatchScore>; // Use plain object instead of Map
  loading: boolean;
  error: string | null;
  config: MatchingConfig;
  lastCalculated: number | null; // Use timestamp for Date serialization
}

// Initial state
const initialState: ReduxMatchingState = {
  userProfile: null,
  roleScores: {},
  loading: false,
  error: null,
  config: {
    skillsWeight: 1.0,
    minimumConfidence: 0.7,
    fuzzyMatchThreshold: 0.8,
    minimumScoreThreshold: 0,
    bonusForHighLevelSkills: 1.2
  },
  lastCalculated: null
};

// Async thunks

/**
 * Calculate batch match scores for multiple roles
 */
export const calculateBatchMatchScores = createAsyncThunk(
  'matching/calculateBatchMatchScores',
  async (payload: {
    roleIds: string[];
    rolesData: (Role | RapidApiJob)[];
    userSkills?: UserSkill[];
  }) => {
    
    const { roleIds, rolesData, userSkills } = payload;
    
    const response = await fetch('/api/roles/batch-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roleIds,
        rolesData,
        userSkills
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate batch match scores');
    }
    
    const result: BatchMatchResponse = await response.json();
    
    return result;
  }
);

/**
 * Calculate match score for a single role
 */
export const calculateSingleMatchScore = createAsyncThunk(
  'matching/calculateSingleMatchScore',
  async (payload: {
    roleId: string;
    roleData: Role | RapidApiJob;
    userSkills?: UserSkill[];
  }) => {
    const { roleId, roleData, userSkills } = payload;
    
    const response = await fetch(`/api/roles/${roleId}/match-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roleData,
        userSkills
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate match score');
    }
    
    const result = await response.json();
    return result;
  }
);

/**
 * Fetch user skills profile
 */
export const fetchUserSkillProfile = createAsyncThunk(
  'matching/fetchUserSkillProfile',
  async () => {
    const response = await fetch('/api/developer/me/skills');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user skills');
    }
    
    const skills = await response.json();
    
    // Convert to UserSkill format
    const userSkills: UserSkill[] = skills.map((skill: any) => ({
      name: skill.skill.name,
      level: skill.level as SkillLevel,
      categoryId: skill.skill.categoryId,
      normalized: skill.skill.name.toLowerCase().trim()
    }));
    
    const userProfile: SerializableUserSkillProfile = {
      userId: 'current', // Will be set by the API
      skills: userSkills,
      lastUpdated: Date.now() // Use timestamp instead of Date object
    };
    
    return userProfile;
  }
);

// Slice definition
const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    // Clear all match scores
    clearMatchScores: (state) => {
      state.roleScores = {};
      state.lastCalculated = null;
      state.error = null;
    },
    
    // Update single role match score
    updateRoleScore: (state, action: PayloadAction<RoleMatchScore>) => {
      state.roleScores[action.payload.roleId] = action.payload;
    },
    
    // Update multiple role scores
    updateRoleScores: (state, action: PayloadAction<RoleMatchScore[]>) => {
      action.payload.forEach(score => {
        state.roleScores[score.roleId] = score;
      });
      state.lastCalculated = Date.now();
    },
    
    // Update user skills profile
    updateUserProfile: (state, action: PayloadAction<SerializableUserSkillProfile>) => {
      state.userProfile = action.payload;
      // Clear existing scores when profile changes
      state.roleScores = {};
      state.lastCalculated = null;
    },
    
    // Update matching configuration
    updateConfig: (state, action: PayloadAction<Partial<MatchingConfig>>) => {
      state.config = { ...state.config, ...action.payload };
      // Clear scores when config changes (they need recalculation)
      state.roleScores = {};
      state.lastCalculated = null;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Remove role score (when role is removed from results)
    removeRoleScore: (state, action: PayloadAction<string>) => {
      delete state.roleScores[action.payload];
    },
    
    // Reset entire state
    resetMatchingState: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle batch match scores calculation
      .addCase(calculateBatchMatchScores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateBatchMatchScores.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.roleScores.forEach(score => {
          state.roleScores[score.roleId] = score;
        });
        state.lastCalculated = Date.now();
      })
      .addCase(calculateBatchMatchScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to calculate batch match scores';
      })
      
      // Handle single match score calculation
      .addCase(calculateSingleMatchScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateSingleMatchScore.fulfilled, (state, action) => {
        state.loading = false;
        state.roleScores[action.payload.matchScore.roleId] = action.payload.matchScore;
        state.lastCalculated = Date.now();
      })
      .addCase(calculateSingleMatchScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to calculate match score';
      })
      
      // Handle user profile fetching
      .addCase(fetchUserSkillProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSkillProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        // Clear existing scores when profile is refreshed
        state.roleScores = {};
        state.lastCalculated = null;
      })
      .addCase(fetchUserSkillProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user skills';
      });
  },
});

// Action creators
export const {
  clearMatchScores,
  updateRoleScore,
  updateRoleScores,
  updateUserProfile,
  updateConfig,
  setLoading,
  setError,
  clearError,
  removeRoleScore,
  resetMatchingState
} = matchingSlice.actions;

// Selectors
export const selectMatchingState = (state: { matching: ReduxMatchingState }) => state.matching;
export const selectUserProfile = (state: { matching: ReduxMatchingState }) => state.matching.userProfile;
export const selectRoleScores = (state: { matching: ReduxMatchingState }) => state.matching.roleScores;
export const selectMatchingLoading = (state: { matching: ReduxMatchingState }) => state.matching.loading;
export const selectMatchingError = (state: { matching: ReduxMatchingState }) => state.matching.error;
export const selectMatchingConfig = (state: { matching: ReduxMatchingState }) => state.matching.config;
export const selectLastCalculated = (state: { matching: ReduxMatchingState }) => state.matching.lastCalculated;

// Computed selectors
export const selectRoleScore = (state: { matching: ReduxMatchingState }, roleId: string) => 
  state.matching.roleScores[roleId];

export const selectUserHasSkills = (state: { matching: ReduxMatchingState }) => 
  (state.matching.userProfile?.skills.length || 0) > 0;

export const selectMatchingStats = (state: { matching: ReduxMatchingState }) => {
  const scores = Object.values(state.matching.roleScores);
  const rolesWithSkills = scores.filter(score => score.hasSkillsListed);
  const scoresArray = rolesWithSkills.map(score => score.overallScore);
  
  return {
    totalScored: scores.length,
    rolesWithSkills: rolesWithSkills.length,
    rolesWithoutSkills: scores.length - rolesWithSkills.length,
    averageScore: scoresArray.length > 0 
      ? Math.round(scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length)
      : 0,
    highScoreCount: scoresArray.filter(score => score >= 70).length,
    mediumScoreCount: scoresArray.filter(score => score >= 40 && score < 70).length,
    lowScoreCount: scoresArray.filter(score => score < 40).length
  };
};

export const selectTopMatchingRoles = (state: { matching: ReduxMatchingState }, limit: number = 5) => {
  const scores = Object.values(state.matching.roleScores)
    .filter(score => score.hasSkillsListed && score.overallScore > 0)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, limit);
  
  return scores;
};

export default matchingSlice.reducer;