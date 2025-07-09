import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
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
// Import the matching reducer
import matchingReducer from './features/matchingSlice';
// Import the dashboard reducer
import dashboardReducer from './features/dashboardSlice';

// Configuration for persisting selectedRoles slice
const selectedRolesPersistConfig = {
  key: 'selectedRoles',
  storage,
  whitelist: ['selectedRoles', 'selectedRoleIds'], // Only persist these fields
};

// Configuration for persisting roles slice filters only
const rolesPersistConfig = {
  key: 'roles',
  storage,
  whitelist: ['lastSearchParams'], // Only persist search filters, not the roles array
};

// Configuration for persisting cover letters
const coverLettersPersistConfig = {
  key: 'coverLetters',
  storage,
  whitelist: ['coverLetters'], // Persist generated cover letters
};

// Configuration for persisting outreach messages  
const outreachMessagesPersistConfig = {
  key: 'outreachMessages',
  storage,
  whitelist: ['outreachMessages'], // Persist generated outreach messages
};

// Apply persistence to specific reducers
const persistedSelectedRolesReducer = persistReducer(selectedRolesPersistConfig, selectedRolesReducer);
const persistedRolesReducer = persistReducer(rolesPersistConfig, rolesReducer);
const persistedCoverLettersReducer = persistReducer(coverLettersPersistConfig, coverLettersReducer);
const persistedOutreachMessagesReducer = persistReducer(outreachMessagesPersistConfig, outreachMessagesReducer);

// Combine all reducers with selective persistence
const combinedReducer = combineReducers({
  user: userReducer,
  analysis: analysisReducer,
  ui: uiReducer,
  selectedRoles: persistedSelectedRolesReducer,
  coverLetters: persistedCoverLettersReducer,
  outreachMessages: persistedOutreachMessagesReducer,
  suggestions: suggestionsReducer,
  gamification: gamificationReducer,
  analytics: analyticsReducer,
  roles: persistedRolesReducer,
  matching: matchingReducer,
  dashboard: dashboardReducer,
});

/**
 * Root reducer that handles global state reset on user logout.
 * When userLoggedOut action is dispatched, it resets all state to initial values
 * to prevent data leakage between user sessions.
 * Also clears localStorage for persisted slices.
 */
const rootReducer = (
  state: ReturnType<typeof combinedReducer> | undefined, 
  action: { type: string; payload?: any }
) => {
  if (action.type === userLoggedOut.type) {
    // Clear persisted data from localStorage
    storage.removeItem('persist:selectedRoles');
    storage.removeItem('persist:roles');
    storage.removeItem('persist:coverLetters');
    storage.removeItem('persist:outreachMessages');
    
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
        // Ignore redux-persist specific actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER', 'persist/FLUSH'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist'],
      },
    }),
  // Enable Redux DevTools extension support
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor for PersistGate
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Add debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('[Redux Store] Store configured with persistence');
  console.log('[Redux Store] Persisted slices: selectedRoles, roles (filters only), coverLetters, outreachMessages');
  
  // Development utility for clearing persisted state (client-side only)
  if (typeof window !== 'undefined') {
    (window as any).clearPersistedState = async () => {
      console.log('[Dev Utility] Clearing all persisted state...');
      try {
        await persistor.purge();
        storage.removeItem('persist:selectedRoles');
        storage.removeItem('persist:roles');
        storage.removeItem('persist:coverLetters');
        storage.removeItem('persist:outreachMessages');
        console.log('[Dev Utility] Persisted state cleared successfully');
        console.log('[Dev Utility] Please refresh the page to see the effect');
      } catch (error) {
        console.error('[Dev Utility] Error clearing persisted state:', error);
      }
    };
    
    console.log('[Redux Store] Dev utility available: window.clearPersistedState()');
  }
}