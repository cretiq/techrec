// Redux slice for Project Enhancement System state management
// Follows established Redux patterns for consistent state architecture

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { GitHubRepository } from '@/lib/github/repositoryService';
import type { ReadmeAnalysis } from '@/utils/readmeAnalyzer';
import type { ProjectIdea } from '@/utils/projectIdeasGenerator';
import type { CVDescriptionResponse } from '@/utils/cvDescriptionGenerator';

// State interfaces following existing Redux patterns
export interface ProjectEnhancementContext {
  personalRole?: string;
  teamSize?: string;
  duration?: string;
  challenges?: string;
  achievements?: string;
  impact?: string;
  context?: string;
}

export interface ProjectEnhancementState {
  // Wizard state
  currentStep: number;
  mode: 'github' | 'manual' | 'ideas' | null;
  isLoading: boolean;
  error: string | null;
  
  // GitHub integration
  githubRepositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  readmeAnalysis: ReadmeAnalysis | null;
  
  // Project ideas
  projectIdeas: ProjectIdea[];
  selectedIdea: ProjectIdea | null;
  
  // Manual project data
  manualProject: {
    name: string;
    description: string;
    technologies: string[];
  } | null;
  
  // User context
  enhancementContext: ProjectEnhancementContext;
  
  // Generated results
  cvDescription: CVDescriptionResponse | null;
  
  // UI state
  isWizardOpen: boolean;
  canProceedToNext: boolean;
}

const initialState: ProjectEnhancementState = {
  currentStep: 0,
  mode: null,
  isLoading: false,
  error: null,
  githubRepositories: [],
  selectedRepository: null,
  readmeAnalysis: null,
  projectIdeas: [],
  selectedIdea: null,
  manualProject: null,
  enhancementContext: {},
  cvDescription: null,
  isWizardOpen: false,
  canProceedToNext: false,
};

// Async thunks following existing patterns
export const fetchGitHubRepositories = createAsyncThunk(
  'projectEnhancement/fetchGitHubRepositories',
  async (options: { includePrivate?: boolean; limit?: number } = {}) => {
    const response = await fetch('/api/project-enhancement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'fetch-github-repos',
        data: options
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub repositories');
    }
    
    return response.json();
  }
);

export const analyzeReadme = createAsyncThunk(
  'projectEnhancement/analyzeReadme',
  async (data: { owner: string; repo: string; repositoryInfo: any }) => {
    const response = await fetch('/api/project-enhancement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze-readme',
        data
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze README');
    }
    
    return response.json();
  }
);

export const generateProjectIdeas = createAsyncThunk(
  'projectEnhancement/generateProjectIdeas',
  async (data: {
    skills: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    focusArea?: string;
  }) => {
    const response = await fetch('/api/project-enhancement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-project-ideas',
        data
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate project ideas');
    }
    
    return response.json();
  }
);

export const generateCVDescription = createAsyncThunk(
  'projectEnhancement/generateCVDescription',
  async (data: {
    projectInput: any;
    userProfile?: any;
    options?: any;
  }) => {
    const response = await fetch('/api/project-enhancement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate-cv-description',
        data
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate CV description');
    }
    
    return response.json();
  }
);

// Redux slice following established patterns
const projectEnhancementSlice = createSlice({
  name: 'projectEnhancement',
  initialState,
  reducers: {
    // Wizard navigation
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    
    setMode: (state, action: PayloadAction<'github' | 'manual' | 'ideas'>) => {
      state.mode = action.payload;
      state.currentStep = 0; // Reset to first step when changing mode
    },
    
    nextStep: (state) => {
      state.currentStep += 1;
    },
    
    previousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    
    // Repository selection
    setSelectedRepository: (state, action: PayloadAction<GitHubRepository | null>) => {
      state.selectedRepository = action.payload;
      state.readmeAnalysis = null; // Clear previous analysis
    },
    
    // Project ideas selection
    setSelectedIdea: (state, action: PayloadAction<ProjectIdea | null>) => {
      state.selectedIdea = action.payload;
    },
    
    // Manual project data
    setManualProject: (state, action: PayloadAction<{
      name?: string;
      description?: string;
      technologies?: string[];
    }>) => {
      state.manualProject = {
        ...state.manualProject,
        name: '',
        description: '',
        technologies: [],
        ...action.payload
      };
    },
    
    updateManualProjectField: (state, action: PayloadAction<{
      field: 'name' | 'description' | 'technologies';
      value: string | string[];
    }>) => {
      const { field, value } = action.payload;
      if (!state.manualProject) {
        state.manualProject = { name: '', description: '', technologies: [] };
      }
      (state.manualProject as any)[field] = value;
    },
    
    // Enhancement context
    updateEnhancementContext: (state, action: PayloadAction<Partial<ProjectEnhancementContext>>) => {
      state.enhancementContext = {
        ...state.enhancementContext,
        ...action.payload
      };
    },
    
    // UI state
    openWizard: (state, action: PayloadAction<'github' | 'manual' | 'ideas'>) => {
      state.isWizardOpen = true;
      state.mode = action.payload;
      state.currentStep = 0;
      state.error = null;
    },
    
    closeWizard: (state) => {
      state.isWizardOpen = false;
      state.mode = null;
      state.currentStep = 0;
      state.error = null;
    },
    
    setCanProceedToNext: (state, action: PayloadAction<boolean>) => {
      state.canProceedToNext = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset state
    resetWizard: () => initialState
  },
  
  extraReducers: (builder) => {
    // GitHub repositories
    builder
      .addCase(fetchGitHubRepositories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGitHubRepositories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.githubRepositories = action.payload.repositories || [];
      })
      .addCase(fetchGitHubRepositories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch repositories';
      });
    
    // README analysis
    builder
      .addCase(analyzeReadme.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeReadme.fulfilled, (state, action) => {
        state.isLoading = false;
        state.readmeAnalysis = action.payload.analysis;
      })
      .addCase(analyzeReadme.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to analyze README';
      });
    
    // Project ideas
    builder
      .addCase(generateProjectIdeas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateProjectIdeas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectIdeas = action.payload.ideas || [];
      })
      .addCase(generateProjectIdeas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate project ideas';
      });
    
    // CV description generation
    builder
      .addCase(generateCVDescription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateCVDescription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cvDescription = action.payload;
      })
      .addCase(generateCVDescription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to generate CV description';
      });
  }
});

// Export actions and reducer following established patterns
export const {
  setCurrentStep,
  setMode,
  nextStep,
  previousStep,
  setSelectedRepository,
  setSelectedIdea,
  setManualProject,
  updateManualProjectField,
  updateEnhancementContext,
  openWizard,
  closeWizard,
  setCanProceedToNext,
  clearError,
  resetWizard
} = projectEnhancementSlice.actions;

// Selectors following established patterns
export const selectProjectEnhancement = (state: any) => state.projectEnhancement;
export const selectCurrentStep = (state: any) => state.projectEnhancement.currentStep;
export const selectMode = (state: any) => state.projectEnhancement.mode;
export const selectIsLoading = (state: any) => state.projectEnhancement.isLoading;
export const selectError = (state: any) => state.projectEnhancement.error;
export const selectGitHubRepositories = (state: any) => state.projectEnhancement.githubRepositories;
export const selectSelectedRepository = (state: any) => state.projectEnhancement.selectedRepository;
export const selectReadmeAnalysis = (state: any) => state.projectEnhancement.readmeAnalysis;
export const selectProjectIdeas = (state: any) => state.projectEnhancement.projectIdeas;
export const selectSelectedIdea = (state: any) => state.projectEnhancement.selectedIdea;
export const selectManualProject = (state: any) => state.projectEnhancement.manualProject;
export const selectEnhancementContext = (state: any) => state.projectEnhancement.enhancementContext;
export const selectCVDescription = (state: any) => state.projectEnhancement.cvDescription;
export const selectIsWizardOpen = (state: any) => state.projectEnhancement.isWizardOpen;
export const selectCanProceedToNext = (state: any) => state.projectEnhancement.canProceedToNext;

export default projectEnhancementSlice.reducer;