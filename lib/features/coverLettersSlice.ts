import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { CoverLetterData, CoverLettersState, CoverLetterTone, RequestType } from '@/types/coverLetter';

const initialState: CoverLettersState = {
  coverLetters: {},
};

export const coverLettersSlice = createSlice({
  name: 'coverLetters',
  initialState,
  reducers: {
    setCoverLetter: (state, action: PayloadAction<CoverLetterData>) => {
      const { roleId } = action.payload;
      state.coverLetters[roleId] = action.payload;
    },
    removeCoverLetter: (state, action: PayloadAction<string>) => {
      const roleId = action.payload;
      delete state.coverLetters[roleId];
    },
    clearAllCoverLetters: (state) => {
      state.coverLetters = {};
    },
    updateCoverLetterJobSource: (state, action: PayloadAction<{ roleId: string; jobSource: string }>) => {
      const { roleId, jobSource } = action.payload;
      if (state.coverLetters[roleId]) {
        state.coverLetters[roleId].jobSource = jobSource;
      }
    },
    updateCoverLetterAttractionPoints: (state, action: PayloadAction<{ roleId: string; attractionPoints: string[] }>) => {
      const { roleId, attractionPoints } = action.payload;
      if (state.coverLetters[roleId]) {
        state.coverLetters[roleId].companyAttractionPoints = attractionPoints;
      }
    },
    updateCoverLetterTone: (state, action: PayloadAction<{ roleId: string; tone: CoverLetterTone }>) => {
      const { roleId, tone } = action.payload;
      if (state.coverLetters[roleId]) {
        state.coverLetters[roleId].tone = tone;
      }
    },
    updateCoverLetterRequestType: (state, action: PayloadAction<{ roleId: string; requestType: RequestType }>) => {
      const { roleId, requestType } = action.payload;
      if (state.coverLetters[roleId]) {
        state.coverLetters[roleId].requestType = requestType;
      }
    },
    updateCoverLetterHiringManager: (state, action: PayloadAction<{ roleId: string; hiringManager: string }>) => {
      const { roleId, hiringManager } = action.payload;
      if (state.coverLetters[roleId]) {
        state.coverLetters[roleId].hiringManager = hiringManager;
      }
    },
  },
});

// Export actions
export const { 
  setCoverLetter, 
  removeCoverLetter, 
  clearAllCoverLetters,
  updateCoverLetterJobSource,
  updateCoverLetterAttractionPoints,
  updateCoverLetterTone,
  updateCoverLetterRequestType,
  updateCoverLetterHiringManager
} = coverLettersSlice.actions;

// Export selectors
export const selectCoverLetter = (state: RootState, roleId: string) =>
  state.coverLetters.coverLetters[roleId];

export const selectAllCoverLetters = (state: RootState) =>
  state.coverLetters.coverLetters;

export const selectCoverLettersCount = (state: RootState) =>
  Object.keys(state.coverLetters.coverLetters).length;

// Export the reducer
export default coverLettersSlice.reducer;