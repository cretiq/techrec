import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { CvAnalysisData, CvImprovementSuggestion } from '@/types/cv'; // Import relevant types
import { set } from 'lodash'; // For applying suggestions
import { getProviderEndpoints } from '@/utils/aiProviderSelector';

// Define the possible status values
export type AnalysisStatus = 'idle' | 'loading' | 'succeeded' | 'failed' | 'suggesting' | 'analyzing';

// Define a type for the analysis state slice
export interface AnalysisState {
  currentAnalysisId: string | null;
  analysisData: CvAnalysisData | null; // The editable CV data
  originalData: CvAnalysisData | null; // Original data for comparison/reset (optional)
  suggestions: CvImprovementSuggestion[];
  status: AnalysisStatus;
  error: string | null;
}

// Define the initial state
const initialState: AnalysisState = {
  currentAnalysisId: null,
  analysisData: null,
  originalData: null,
  suggestions: [],
  status: 'idle',
  error: null,
};

// Example Async Thunk for fetching analysis data (adjust API call as needed)
export const fetchAnalysisById = createAsyncThunk(
  'analysis/fetchById',
  async (analysisId: string, { rejectWithValue }) => {
    console.log(`[fetchAnalysisById Thunk] Fetching data for ID: ${analysisId}`);
    try {
      const response = await fetch(`/api/cv-analysis/${analysisId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[fetchAnalysisById] Fetch failed with status ${response.status}:`, errorData.error);
        return rejectWithValue(errorData.error || `Failed to fetch analysis (${response.status})`);
      }
      const data = await response.json(); // Data is now { id, ..., cv: { extractedText: ... } }
      console.log('[fetchAnalysisById Thunk] Fetch successful, received data:', data); 
      // Return the fetched data directly as it now matches the expected structure 
      // (after CvAnalysisData type was updated)
      return data; 
    } catch (error: any) {
      console.error('[fetchAnalysisById] Exception during fetch:', error);
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

// New Async Thunk for fetching the latest analysis version
export const fetchLatestAnalysis = createAsyncThunk(
  'analysis/fetchLatest',
  async (_, { rejectWithValue }) => {
    console.log(`[fetchLatestAnalysis Thunk] Fetching latest analysis`);
    try {
      const response = await fetch(`/api/cv-analysis/latest`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[fetchLatestAnalysis] Fetch failed with status ${response.status}:`, errorData.error);
        return rejectWithValue(errorData.error || `Failed to fetch latest analysis (${response.status})`);
      }
      const data = await response.json();
      console.log('[fetchLatestAnalysis Thunk] Fetch successful, received data:', data); 
      return data; 
    } catch (error: any) {
      console.error('[fetchLatestAnalysis] Exception during fetch:', error);
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

// New Async Thunk for saving a new version
export const saveAnalysisVersion = createAsyncThunk(
  'analysis/saveVersion',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { analysis: AnalysisState };
    const { currentAnalysisId, analysisData } = state.analysis;
    
    if (!currentAnalysisId || !analysisData) {
      return rejectWithValue('No analysis data to save');
    }

    console.log(`[saveAnalysisVersion Thunk] Saving new version for ID: ${currentAnalysisId}`);
    try {
      const response = await fetch(`/api/cv-analysis/${currentAnalysisId}/save-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[saveAnalysisVersion] Save failed with status ${response.status}:`, errorData.error);
        return rejectWithValue(errorData.error || `Failed to save analysis version (${response.status})`);
      }
      
      const data = await response.json();
      console.log('[saveAnalysisVersion Thunk] Save successful, received data:', data); 
      return data; 
    } catch (error: any) {
      console.error('[saveAnalysisVersion] Exception during save:', error);
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);
// Example Async Thunk for getting suggestions
export const fetchSuggestions = createAsyncThunk(
  'analysis/fetchSuggestions',
  async (cvData: CvAnalysisData, { rejectWithValue }) => {
    try {
      const { cvImprovement } = getProviderEndpoints();
      const response = await fetch(cvImprovement, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData)
      });
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Pass through the full error object for retry exhaustion cases
          if (errorData.error === 'RETRY_EXHAUSTED') {
            return rejectWithValue(errorData);
          }
          return rejectWithValue(errorData.error || `Failed to get suggestions (${response.status})`);
      }
      const result = await response.json(); // Expects { suggestions: CvImprovementSuggestion[] }
      return result.suggestions as CvImprovementSuggestion[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred while fetching suggestions');
    }
  }
);

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    // Action to set the current analysis data directly (e.g., after upload)
    setAnalysis: (state, action: PayloadAction<{ id: string; data: CvAnalysisData }>) => {
      state.currentAnalysisId = action.payload.id;
      state.analysisData = action.payload.data;
      state.originalData = JSON.parse(JSON.stringify(action.payload.data)); // Deep clone for original
      state.suggestions = []; // Clear old suggestions
      state.status = 'succeeded';
      state.error = null;
    },
    // Action to update a part of the analysis data (e.g., user edit)
    updateAnalysisData: (state, action: PayloadAction<{ path: string; value: any }>) => {
      if (state.analysisData) {
        // Use lodash set for deep updates
        set(state.analysisData, action.payload.path, action.payload.value);
      }
    },
    // Action to apply a suggestion to the data
    applySuggestion: (state, action: PayloadAction<CvImprovementSuggestion>) => {
      const suggestion = action.payload;
      if (state.analysisData && suggestion.suggestedText !== null && suggestion.suggestedText !== undefined) {
        set(state.analysisData, suggestion.section, suggestion.suggestedText);
      }
      // Remove the applied suggestion from the list
      state.suggestions = state.suggestions.filter(s => 
          !(s.section === suggestion.section && s.reasoning === suggestion.reasoning) // Example filter logic
      );
    },
    // Action to dismiss a suggestion without applying it
    dismissSuggestion: (state, action: PayloadAction<CvImprovementSuggestion>) => {
      const suggestion = action.payload;
      state.suggestions = state.suggestions.filter(s => 
          !(s.section === suggestion.section && s.reasoning === suggestion.reasoning)
      );
    },
    // Action to clear the current analysis state
    clearAnalysis: (state) => {
      // Return initialState instead of modifying state directly for a full reset
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analysis By ID handlers
      .addCase(fetchAnalysisById.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.analysisData = null; // Clear previous data while loading
        state.originalData = null;
        state.suggestions = [];
        state.currentAnalysisId = null;
      })
      .addCase(fetchAnalysisById.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.id) {
          // Combine analysisResult and cv into the state.analysisData
          const analysisResultData = payload.analysisResult || {};
          const cvData = payload.cv || {};

          const combinedData = {
            ...analysisResultData,
            cv: cvData
          } as CvAnalysisData; // Assert the combined type

          state.status = 'succeeded';
          state.currentAnalysisId = payload.id;
          state.analysisData = combinedData;
          state.originalData = combinedData ? JSON.parse(JSON.stringify(combinedData)) : null;
          
        }
      })
      .addCase(fetchAnalysisById.rejected, (state, action) => {
        console.log('[analysisSlice Reducer] fetchAnalysisById.rejected - Setting status to failed.');
        state.status = 'failed';
        state.error = action.payload as string ?? action.error.message ?? 'Failed to fetch analysis';
      })
      // Fetch Suggestions handlers
      .addCase(fetchSuggestions.pending, (state) => {
        state.status = 'suggesting';
        state.error = null; // Clear previous errors
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Back to succeeded after suggestions load
        state.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.status = 'failed'; // Or back to 'succeeded' if suggestions are optional?
        state.error = action.payload as string ?? action.error.message ?? 'Failed to fetch suggestions';
        state.suggestions = []; // Clear suggestions on error
      })
      // Fetch Latest Analysis handlers
      .addCase(fetchLatestAnalysis.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.analysisData = null;
        state.originalData = null;
        state.suggestions = [];
        state.currentAnalysisId = null;
      })
      .addCase(fetchLatestAnalysis.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.id) {
          const analysisResultData = payload.analysisResult || {};
          const cvData = payload.cv || {};

          const combinedData = {
            ...analysisResultData,
            cv: cvData
          } as CvAnalysisData;

          state.status = 'succeeded';
          state.currentAnalysisId = payload.id;
          state.analysisData = combinedData;
          state.originalData = combinedData ? JSON.parse(JSON.stringify(combinedData)) : null;
        }
      })
      .addCase(fetchLatestAnalysis.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? action.error.message ?? 'Failed to fetch latest analysis';
      })
      // Save Analysis Version handlers
      .addCase(saveAnalysisVersion.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveAnalysisVersion.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.analysisId) {
          // Update the current analysis ID to the new version
          // NOTE: This ID change is handled in AnalysisResultDisplay by updating the URL
          // to prevent infinite loops in CVManagementPage useEffect
          state.currentAnalysisId = payload.analysisId;
          // Update original data to match current data (no unsaved changes)
          state.originalData = state.analysisData ? JSON.parse(JSON.stringify(state.analysisData)) : null;
          state.status = 'succeeded';
        }
      })
      .addCase(saveAnalysisVersion.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string ?? action.error.message ?? 'Failed to save analysis version';
      });
  },
});

export const {
  setAnalysis,
  updateAnalysisData,
  applySuggestion,
  dismissSuggestion,
  clearAnalysis,
} = analysisSlice.actions;

// Selectors
export const selectCurrentAnalysisData = (state: RootState) => state.analysis.analysisData;
export const selectCurrentAnalysisId = (state: RootState) => state.analysis.currentAnalysisId;
export const selectOriginalAnalysisData = (state: RootState) => state.analysis.originalData;
export const selectSuggestions = (state: RootState) => state.analysis.suggestions;
export const selectAnalysisStatus = (state: RootState): AnalysisStatus => state.analysis.status;
export const selectAnalysisError = (state: RootState) => state.analysis.error;

export default analysisSlice.reducer; 