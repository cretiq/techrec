import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { InternalSavedRole } from '@/types/types';

// Async thunk for fetching saved roles
export const fetchSavedRoles = createAsyncThunk(
  'savedRoles/fetchSavedRoles',
  async (params?: { appliedFor?: boolean; includeRoleDetails?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.appliedFor !== undefined) {
      searchParams.set('appliedFor', params.appliedFor.toString());
    }
    if (params?.includeRoleDetails !== undefined) {
      searchParams.set('includeRoleDetails', params.includeRoleDetails.toString());
    }

    const response = await fetch(`/api/developer/saved-roles?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch saved roles');
    }
    return response.json();
  }
);

// Async thunk for marking a role as applied
export const markRoleAsApplied = createAsyncThunk(
  'savedRoles/markRoleAsApplied',
  async (params: {
    roleId: string;
    applicationMethod?: 'easy_apply' | 'external' | 'manual' | 'cover_letter';
    jobPostingUrl?: string;
    applicationNotes?: string;
  }) => {
    const response = await fetch('/api/developer/saved-roles/mark-applied', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark role as applied');
    }
    
    return response.json();
  }
);

// Async thunk for saving and marking a role as applied (for search page)
export const saveAndMarkRoleAsApplied = createAsyncThunk(
  'savedRoles/saveAndMarkRoleAsApplied',
  async (params: {
    roleData: any; // Full role object from search
    applicationMethod?: 'easy_apply' | 'external' | 'manual' | 'cover_letter';
    applicationNotes?: string;
  }) => {
    // First, save the role (use the existing save endpoint)
    const saveResponse = await fetch('/api/developer/me/saved-roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleData: params.roleData }),
    });
    
    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(errorData.error || 'Failed to save role');
    }
    
    // Then mark it as applied
    const markResponse = await fetch('/api/developer/saved-roles/mark-applied', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roleId: params.roleData.id,
        applicationMethod: params.applicationMethod || 'external',
        jobPostingUrl: params.roleData.url || params.roleData.applicationInfo?.applicationUrl,
        applicationNotes: params.applicationNotes
      }),
    });
    
    if (!markResponse.ok) {
      const errorData = await markResponse.json();
      throw new Error(errorData.error || 'Failed to mark role as applied');
    }
    
    return markResponse.json();
  }
);

// Async thunk for un-applying a role
export const unApplyRole = createAsyncThunk(
  'savedRoles/unApplyRole',
  async (params: {
    roleId: string;
    keepNotes?: boolean;
  }) => {
    const response = await fetch('/api/developer/saved-roles/un-apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove role application status');
    }
    
    return response.json();
  }
);

// Async thunk for fetching application activity (for heatmap)
export const fetchApplicationActivity = createAsyncThunk(
  'savedRoles/fetchApplicationActivity',
  async (weeks: number = 12) => {
    const response = await fetch(`/api/developer/application-activity?weeks=${weeks}`);
    if (!response.ok) {
      throw new Error('Failed to fetch application activity');
    }
    return response.json();
  }
);

// Define the state interface
interface SavedRolesState {
  savedRoles: InternalSavedRole[];
  totalCount: number;
  appliedCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  
  // Application activity for heatmap
  applicationActivity: {
    activityData: Array<{ date: string; count: number }>;
    summary: {
      totalApplications: number;
      daysWithActivity: number;
      totalDays: number;
      maxDailyCount: number;
      averageDailyCount: number;
      weeks: number;
      dateRange: {
        start: string;
        end: string;
      };
    } | null;
  };
  activityStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  activityError: string | null;
  
  // Mark as applied operation state
  markingAsApplied: { [roleId: string]: boolean };
  markAsAppliedErrors: { [roleId: string]: string };
  
  // Un-apply operation state
  unApplying: { [roleId: string]: boolean };
  unApplyErrors: { [roleId: string]: string };
}

// Initial state
const initialState: SavedRolesState = {
  savedRoles: [],
  totalCount: 0,
  appliedCount: 0,
  status: 'idle',
  error: null,
  
  applicationActivity: {
    activityData: [],
    summary: null,
  },
  activityStatus: 'idle',
  activityError: null,
  
  markingAsApplied: {},
  markAsAppliedErrors: {},
  
  unApplying: {},
  unApplyErrors: {},
};

export const savedRolesSlice = createSlice({
  name: 'savedRoles',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.activityError = null;
      state.markAsAppliedErrors = {};
      state.unApplyErrors = {};
    },
    
    // Update a specific saved role in the state (for real-time updates)
    updateSavedRole: (state, action: PayloadAction<Partial<InternalSavedRole> & { id: string }>) => {
      const index = state.savedRoles.findIndex(role => role.id === action.payload.id);
      if (index !== -1) {
        state.savedRoles[index] = { ...state.savedRoles[index], ...action.payload };
        
        // Update counts if appliedFor status changed
        if (action.payload.appliedFor !== undefined) {
          state.appliedCount = state.savedRoles.filter(role => role.appliedFor).length;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch saved roles
    builder
      .addCase(fetchSavedRoles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSavedRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.savedRoles = action.payload.savedRoles || [];
        state.totalCount = action.payload.totalCount || 0;
        state.appliedCount = action.payload.appliedCount || 0;
      })
      .addCase(fetchSavedRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch saved roles';
      });

    // Mark role as applied
    builder
      .addCase(markRoleAsApplied.pending, (state, action) => {
        const roleId = action.meta.arg.roleId;
        state.markingAsApplied[roleId] = true;
        delete state.markAsAppliedErrors[roleId];
      })
      .addCase(markRoleAsApplied.fulfilled, (state, action) => {
        const externalRoleId = action.meta.arg.roleId; // This is the external role ID
        state.markingAsApplied[externalRoleId] = false;
        
        // Find the saved role by matching external role ID in various fields
        const index = state.savedRoles.findIndex(role => {
          // Try multiple matching strategies:
          // 1. Direct roleId match (if it's external ID)
          if (role.roleId === externalRoleId) return true;
          
          // 2. Check if the role title and ID combination match
          if (role.roleTitle && action.payload?.data?.role?.title === role.roleTitle) return true;
          
          // 3. Match by internal saved role ID if available in payload
          if (action.payload?.savedRoleId === role.id) return true;
          
          return false;
        });
        
        if (index !== -1) {
          state.savedRoles[index].appliedFor = true;
          state.savedRoles[index].appliedAt = action.payload.appliedAt;
          state.savedRoles[index].applicationMethod = action.meta.arg.applicationMethod || null;
          state.savedRoles[index].jobPostingUrl = action.meta.arg.jobPostingUrl || null;
          state.savedRoles[index].applicationNotes = action.meta.arg.applicationNotes || null;
          
          // Update applied count
          state.appliedCount = state.savedRoles.filter(role => role.appliedFor).length;
        } else {
          // Debug log if we can't find the role to update
          console.warn('[Redux] Could not find saved role to update for external ID:', externalRoleId);
        }
      })
      .addCase(markRoleAsApplied.rejected, (state, action) => {
        const roleId = action.meta.arg.roleId;
        state.markingAsApplied[roleId] = false;
        state.markAsAppliedErrors[roleId] = action.error.message || 'Failed to mark role as applied';
      });

    // Save and mark role as applied (for search page)
    builder
      .addCase(saveAndMarkRoleAsApplied.pending, (state, action) => {
        const roleId = action.meta.arg.roleData.id;
        state.markingAsApplied[roleId] = true;
        delete state.markAsAppliedErrors[roleId];
      })
      .addCase(saveAndMarkRoleAsApplied.fulfilled, (state, action) => {
        const externalRoleId = action.meta.arg.roleData.id;
        state.markingAsApplied[externalRoleId] = false;
        
        // After saving and marking, we need to trigger a refresh of the Redux state
        // to ensure consistency across the application
        if (action.payload?.data) {
          // Find existing role by external ID (now that APIs are standardized)
          const existingIndex = state.savedRoles.findIndex(role => role.roleId === externalRoleId);
          
          if (existingIndex !== -1) {
            // Update existing role with applied status
            state.savedRoles[existingIndex].appliedFor = true;
            state.savedRoles[existingIndex].appliedAt = action.payload.appliedAt;
            state.savedRoles[existingIndex].applicationMethod = action.meta.arg.applicationMethod || 'external';
            state.savedRoles[existingIndex].jobPostingUrl = action.meta.arg.roleData.url || action.meta.arg.roleData.applicationInfo?.applicationUrl;
          } else {
            // This is a new role that was just saved and marked as applied
            // Create a minimal saved role entry for immediate state consistency
            const newSavedRole = {
              id: action.payload.savedRoleId || `temp-${Date.now()}`,
              roleId: externalRoleId,
              developerId: state.savedRoles[0]?.developerId || '',
              appliedFor: true,
              appliedAt: action.payload.appliedAt,
              applicationMethod: action.meta.arg.applicationMethod || 'external',
              jobPostingUrl: action.meta.arg.roleData.url || action.meta.arg.roleData.applicationInfo?.applicationUrl,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              notes: `External ID: ${externalRoleId}`,
              role: null,
              roleTitle: action.meta.arg.roleData.title || 'Unknown Role',
              companyName: action.meta.arg.roleData.company?.name || 'Unknown Company'
            };
            
            state.savedRoles.unshift(newSavedRole);
            state.totalCount += 1;
          }
          
          // Recalculate applied count
          state.appliedCount = state.savedRoles.filter(role => role.appliedFor).length;
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log('[Redux] saveAndMarkRoleAsApplied success:', {
              externalRoleId,
              existingIndex,
              newAppliedCount: state.appliedCount,
              totalCount: state.totalCount
            });
          }
        }
      })
      .addCase(saveAndMarkRoleAsApplied.rejected, (state, action) => {
        const roleId = action.meta.arg.roleData.id;
        state.markingAsApplied[roleId] = false;
        state.markAsAppliedErrors[roleId] = action.error.message || 'Failed to save and mark role as applied';
      });

    // Un-apply role
    builder
      .addCase(unApplyRole.pending, (state, action) => {
        const roleId = action.meta.arg.roleId;
        state.unApplying[roleId] = true;
        delete state.unApplyErrors[roleId];
      })
      .addCase(unApplyRole.fulfilled, (state, action) => {
        const externalRoleId = action.meta.arg.roleId;
        state.unApplying[externalRoleId] = false;
        
        // Find the saved role by matching external role ID in various fields
        const index = state.savedRoles.findIndex(role => {
          // Try multiple matching strategies:
          // 1. Direct roleId match (if it's external ID)
          if (role.roleId === externalRoleId) return true;
          
          // 2. Check if the role title and ID combination match
          if (role.roleTitle && action.payload?.data?.role?.title === role.roleTitle) return true;
          
          // 3. Match by internal saved role ID if available in payload
          if (action.payload?.savedRoleId === role.id) return true;
          
          return false;
        });
        
        if (index !== -1) {
          // Reset application status
          state.savedRoles[index].appliedFor = false;
          state.savedRoles[index].appliedAt = null;
          state.savedRoles[index].applicationMethod = null;
          
          // Keep or clear notes based on what was requested
          if (!action.meta.arg.keepNotes) {
            state.savedRoles[index].applicationNotes = null;
          }
          
          // Update applied count
          state.appliedCount = state.savedRoles.filter(role => role.appliedFor).length;
          
          // Debug logging
          if (process.env.NODE_ENV === 'development') {
            console.log('[Redux] unApplyRole success:', {
              externalRoleId,
              savedRoleIndex: index,
              newAppliedCount: state.appliedCount,
              keepNotes: action.meta.arg.keepNotes
            });
          }
        } else {
          // Debug log if we can't find the role to update
          console.warn('[Redux] Could not find saved role to un-apply for external ID:', externalRoleId);
        }
      })
      .addCase(unApplyRole.rejected, (state, action) => {
        const roleId = action.meta.arg.roleId;
        state.unApplying[roleId] = false;
        state.unApplyErrors[roleId] = action.error.message || 'Failed to remove role application status';
      });

    // Fetch application activity
    builder
      .addCase(fetchApplicationActivity.pending, (state) => {
        state.activityStatus = 'loading';
        state.activityError = null;
      })
      .addCase(fetchApplicationActivity.fulfilled, (state, action) => {
        state.activityStatus = 'succeeded';
        state.applicationActivity = action.payload;
      })
      .addCase(fetchApplicationActivity.rejected, (state, action) => {
        state.activityStatus = 'failed';
        state.activityError = action.error.message || 'Failed to fetch application activity';
      });
  },
});

// Export actions
export const { clearErrors, updateSavedRole } = savedRolesSlice.actions;

// Selectors
export const selectSavedRoles = (state: RootState) => state.savedRoles.savedRoles;
export const selectSavedRolesStatus = (state: RootState) => state.savedRoles.status;
export const selectSavedRolesError = (state: RootState) => state.savedRoles.error;
export const selectSavedRolesCounts = (state: RootState) => ({
  total: state.savedRoles.totalCount,
  applied: state.savedRoles.appliedCount,
});

export const selectApplicationActivity = (state: RootState) => state.savedRoles.applicationActivity;
export const selectApplicationActivityStatus = (state: RootState) => state.savedRoles.activityStatus;
export const selectApplicationActivityError = (state: RootState) => state.savedRoles.activityError;

export const selectIsMarkingAsApplied = (roleId: string) => (state: RootState) => 
  state.savedRoles.markingAsApplied[roleId] || false;

export const selectMarkAsAppliedError = (roleId: string) => (state: RootState) => 
  state.savedRoles.markAsAppliedErrors[roleId];

export const selectIsUnApplying = (roleId: string) => (state: RootState) => 
  state.savedRoles.unApplying[roleId] || false;

export const selectUnApplyError = (roleId: string) => (state: RootState) => 
  state.savedRoles.unApplyErrors[roleId];

export const selectSavedRolesByStatus = (applied: boolean) => (state: RootState) =>
  state.savedRoles.savedRoles.filter(role => role.appliedFor === applied);

export const selectSavedRoleByRoleId = (roleId: string) => (state: RootState) =>
  state.savedRoles.savedRoles.find(role => role.roleId === roleId);

// Export the reducer
export default savedRolesSlice.reducer;