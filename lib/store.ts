import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { userLoggedOut } from './features/metaSlice';
// Import the user reducer
import userReducer from './features/userSlice';
// Import the analysis reducer
import analysisReducer from './features/analysisSlice';
// Import the ui reducer
import uiReducer from './features/uiSlice';
// Import the analytics reducer
import analyticsReducer from './features/analyticsSlice';
// Import the new selected roles reducer
import selectedRolesReducer from './features/selectedRolesSlice';
// Import the cover letters reducer
import coverLettersReducer from './features/coverLettersSlice';
// Import the outreach messages reducer
import outreachMessagesReducer from './features/outreachMessagesSlice';
// Import the suggestions reducer
import suggestionsReducer from './features/suggestionsSlice';
// Import the gamification reducer
import gamificationReducer from './features/gamificationSlice';
// Import the roles reducer
import rolesReducer from './features/rolesSlice';

// Combine all reducers - no persistence needed as session-based auth handles state
const combinedReducer = combineReducers({
  user: userReducer,
  analysis: analysisReducer,
  ui: uiReducer,
  selectedRoles: selectedRolesReducer,
  coverLetters: coverLettersReducer,
  outreachMessages: outreachMessagesReducer,
  suggestions: suggestionsReducer,
  gamification: gamificationReducer,
  analytics: analyticsReducer,
  roles: rolesReducer,
});

/**
 * Root reducer that handles global state reset on user logout.
 * When userLoggedOut action is dispatched, it resets all state to initial values
 * to prevent data leakage between user sessions.
 */
const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined, 
  action: { type: string; payload?: any }
) => {
  if (action.type === userLoggedOut.type) {
    // Reset all state to initial values by passing undefined state
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Remove redux-persist specific ignored actions
        ignoredActions: [],
      },
    }),
  // Enable Redux DevTools extension support
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;