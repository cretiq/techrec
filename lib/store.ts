import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
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
// Import reducers here when they are created
// import rootReducer from './rootReducer'; // Example

// Configure persist for each reducer that needs persistence
const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['isAuthenticated', 'userData'] // Only persist these fields
};

const analysisPersistConfig = {
  key: 'analysis',
  storage,
  whitelist: ['analysisData', 'originalData', 'currentAnalysisId', 'status', 'suggestions'] // Persist analysis data and status
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['isSidebarOpen'] // Only persist UI preferences
};

// Persist config for selected roles
const selectedRolesPersistConfig = {
    key: 'selectedRoles',
    storage,
    whitelist: ['selectedRoles'] // Persist the selected roles (full objects)
};

// Persist config for cover letters
const coverLettersPersistConfig = {
    key: 'coverLetters',
    storage,
    whitelist: ['coverLetters'] // Persist all cover letters
};

// Persist config for outreach messages
const outreachMessagesPersistConfig = {
    key: 'outreachMessages',
    storage,
    whitelist: ['messages'] // Persist all outreach messages
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedAnalysisReducer = persistReducer(analysisPersistConfig, analysisReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);
// Create persisted reducer for selected roles
const persistedSelectedRolesReducer = persistReducer(selectedRolesPersistConfig, selectedRolesReducer);
// Create persisted reducer for cover letters
const persistedCoverLettersReducer = persistReducer(coverLettersPersistConfig, coverLettersReducer);
// Create persisted reducer for outreach messages
const persistedOutreachMessagesReducer = persistReducer(outreachMessagesPersistConfig, outreachMessagesReducer);

export const store = configureStore({
  reducer: {
    // Add the persisted reducers to the store
    user: persistedUserReducer,
    analysis: persistedAnalysisReducer,
    ui: persistedUiReducer,
    // Add the new selected roles reducer
    selectedRoles: persistedSelectedRolesReducer,
    // Add the cover letters reducer
    coverLetters: persistedCoverLettersReducer,
    // Add the outreach messages reducer
    outreachMessages: persistedOutreachMessagesReducer,
    // Analytics doesn't need persistence
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // Enable Redux DevTools extension support
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;