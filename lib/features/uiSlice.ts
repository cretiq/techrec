import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define a type for the UI state slice
interface UIState {
  isSidebarOpen: boolean;
  isLoading: boolean; // Global loading indicator maybe?
  activeModal: string | null; // Track which modal is open
  // Add other UI states as needed, e.g.:
  // activeAccordionSections: string[];
  // notification: { message: string; type: 'info' | 'success' | 'error' } | null;
}

// Define the initial state
const initialState: UIState = {
  isSidebarOpen: false, // Default state
  isLoading: false,
  activeModal: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    // Add other reducers for UI state changes
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
  openModal,
  closeModal,
} = uiSlice.actions;

// Selectors
export const selectIsSidebarOpen = (state: RootState) => state.ui.isSidebarOpen;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;

// Export reducer
export default uiSlice.reducer; 