import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EnhancedCvSuggestion, EnhancedCvImprovementResponse } from '@/types/cv';

export interface SuggestionStatus {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
  appliedContent?: string; // Track what content was actually applied
}

export interface SuggestionsState {
  // Current suggestions from AI
  suggestions: EnhancedCvSuggestion[];
  
  // Summary from AI response
  summary: {
    totalSuggestions: number;
    highPriority: number;
    categories: {
      experienceBullets: number;
      educationGaps: number;
      missingSkills: number;
      summaryImprovements: number;
      generalImprovements: number;
    };
  } | null;
  
  // User interactions with suggestions
  suggestionStatuses: Record<string, SuggestionStatus>;
  
  // UI state
  isLoading: boolean;
  isVisible: boolean; // Global visibility toggle
  sectionVisibility: Record<string, boolean>; // Per-section visibility
  lastFetched: string | null;
  error: string | null;
  
  // Cache metadata
  fromCache: boolean;
  provider: string | null;
}

const initialState: SuggestionsState = {
  suggestions: [],
  summary: null,
  suggestionStatuses: {},
  isLoading: false,
  isVisible: true,
  sectionVisibility: {},
  lastFetched: null,
  error: null,
  fromCache: false,
  provider: null,
};

const suggestionsSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set suggestions from AI response
    setSuggestions: (state, action: PayloadAction<EnhancedCvImprovementResponse>) => {
      state.suggestions = action.payload.suggestions;
      state.summary = action.payload.summary;
      state.lastFetched = new Date().toISOString();
      state.fromCache = action.payload.fromCache || false;
      state.provider = action.payload.provider || null;
      state.isLoading = false;
      state.error = null;
      
      // Initialize suggestion statuses for new suggestions
      action.payload.suggestions.forEach(suggestion => {
        if (!state.suggestionStatuses[suggestion.id]) {
          state.suggestionStatuses[suggestion.id] = {
            id: suggestion.id,
            status: 'pending',
            timestamp: new Date().toISOString(),
          };
        }
      });
    },

    // Accept a suggestion
    acceptSuggestion: (state, action: PayloadAction<{ suggestionId: string; appliedContent?: string }>) => {
      const { suggestionId, appliedContent } = action.payload;
      state.suggestionStatuses[suggestionId] = {
        id: suggestionId,
        status: 'accepted',
        timestamp: new Date().toISOString(),
        appliedContent,
      };
    },

    // Decline a suggestion
    declineSuggestion: (state, action: PayloadAction<string>) => {
      const suggestionId = action.payload;
      state.suggestionStatuses[suggestionId] = {
        id: suggestionId,
        status: 'declined',
        timestamp: new Date().toISOString(),
      };
    },

    // Reset suggestion status to pending
    resetSuggestionStatus: (state, action: PayloadAction<string>) => {
      const suggestionId = action.payload;
      state.suggestionStatuses[suggestionId] = {
        id: suggestionId,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
    },

    // Bulk accept suggestions
    acceptMultipleSuggestions: (state, action: PayloadAction<string[]>) => {
      const timestamp = new Date().toISOString();
      action.payload.forEach(suggestionId => {
        state.suggestionStatuses[suggestionId] = {
          id: suggestionId,
          status: 'accepted',
          timestamp,
        };
      });
    },

    // Bulk decline suggestions
    declineMultipleSuggestions: (state, action: PayloadAction<string[]>) => {
      const timestamp = new Date().toISOString();
      action.payload.forEach(suggestionId => {
        state.suggestionStatuses[suggestionId] = {
          id: suggestionId,
          status: 'declined',
          timestamp,
        };
      });
    },

    // Toggle global visibility
    toggleGlobalVisibility: (state) => {
      state.isVisible = !state.isVisible;
    },

    // Set global visibility
    setGlobalVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },

    // Toggle section visibility
    toggleSectionVisibility: (state, action: PayloadAction<string>) => {
      const section = action.payload;
      state.sectionVisibility[section] = !state.sectionVisibility[section];
    },

    // Set section visibility
    setSectionVisibility: (state, action: PayloadAction<{ section: string; visible: boolean }>) => {
      const { section, visible } = action.payload;
      state.sectionVisibility[section] = visible;
    },

    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear all suggestions and reset state
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.summary = null;
      state.suggestionStatuses = {};
      state.lastFetched = null;
      state.error = null;
      state.fromCache = false;
      state.provider = null;
    },

    // Clear all statuses (reset all to pending)
    clearAllStatuses: (state) => {
      const timestamp = new Date().toISOString();
      Object.keys(state.suggestionStatuses).forEach(suggestionId => {
        state.suggestionStatuses[suggestionId] = {
          id: suggestionId,
          status: 'pending',
          timestamp,
        };
      });
    },
  },
});

export const {
  setLoading,
  setSuggestions,
  acceptSuggestion,
  declineSuggestion,
  resetSuggestionStatus,
  acceptMultipleSuggestions,
  declineMultipleSuggestions,
  toggleGlobalVisibility,
  setGlobalVisibility,
  toggleSectionVisibility,
  setSectionVisibility,
  setError,
  clearSuggestions,
  clearAllStatuses,
} = suggestionsSlice.actions;

// Selectors
export const selectSuggestions = (state: { suggestions: SuggestionsState }) => state.suggestions.suggestions;
export const selectSuggestionsSummary = (state: { suggestions: SuggestionsState }) => state.suggestions.summary;
export const selectSuggestionsLoading = (state: { suggestions: SuggestionsState }) => state.suggestions.isLoading;
export const selectSuggestionsError = (state: { suggestions: SuggestionsState }) => state.suggestions.error;
export const selectSuggestionsVisibility = (state: { suggestions: SuggestionsState }) => state.suggestions.isVisible;
export const selectSectionVisibility = (section: string) => (state: { suggestions: SuggestionsState }) => 
  state.suggestions.sectionVisibility[section] ?? true;
export const selectSuggestionStatuses = (state: { suggestions: SuggestionsState }) => state.suggestions.suggestionStatuses;
export const selectLastFetched = (state: { suggestions: SuggestionsState }) => state.suggestions.lastFetched;
export const selectFromCache = (state: { suggestions: SuggestionsState }) => state.suggestions.fromCache;
export const selectProvider = (state: { suggestions: SuggestionsState }) => state.suggestions.provider;

// Computed selectors
export const selectAcceptedSuggestions = (state: { suggestions: SuggestionsState }) => {
  const statuses = state.suggestions.suggestionStatuses;
  return new Set(Object.keys(statuses).filter(id => statuses[id].status === 'accepted'));
};

export const selectDeclinedSuggestions = (state: { suggestions: SuggestionsState }) => {
  const statuses = state.suggestions.suggestionStatuses;
  return new Set(Object.keys(statuses).filter(id => statuses[id].status === 'declined'));
};

export const selectPendingSuggestions = (state: { suggestions: SuggestionsState }) => {
  const statuses = state.suggestions.suggestionStatuses;
  return new Set(Object.keys(statuses).filter(id => statuses[id].status === 'pending'));
};

export const selectSuggestionsBySection = (section: string) => (state: { suggestions: SuggestionsState }) => {
  return state.suggestions.suggestions.filter(suggestion => suggestion.section === section);
};

export const selectSuggestionsByTarget = (section: string, targetId?: string) => (state: { suggestions: SuggestionsState }) => {
  return state.suggestions.suggestions.filter(suggestion => {
    const matchesSection = suggestion.section === section;
    const matchesTarget = !targetId || suggestion.targetId === targetId;
    return matchesSection && matchesTarget;
  });
};

export const selectSuggestionsStats = (state: { suggestions: SuggestionsState }) => {
  const statuses = state.suggestions.suggestionStatuses;
  const suggestions = state.suggestions.suggestions;
  
  const total = suggestions.length;
  const pending = Object.values(statuses).filter(s => s.status === 'pending').length;
  const accepted = Object.values(statuses).filter(s => s.status === 'accepted').length;
  const declined = Object.values(statuses).filter(s => s.status === 'declined').length;
  const highPriority = suggestions.filter(s => 
    s.priority === 'high' && statuses[s.id]?.status === 'pending'
  ).length;

  return { total, pending, accepted, declined, highPriority };
};

export default suggestionsSlice.reducer;