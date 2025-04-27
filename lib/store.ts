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
  whitelist: ['analysisData', 'originalData', 'currentAnalysisId'] // Persist analysis data
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  whitelist: ['isSidebarOpen'] // Only persist UI preferences
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedAnalysisReducer = persistReducer(analysisPersistConfig, analysisReducer);
const persistedUiReducer = persistReducer(uiPersistConfig, uiReducer);

export const store = configureStore({
  reducer: {
    // Add the persisted reducers to the store
    user: persistedUserReducer,
    analysis: persistedAnalysisReducer,
    ui: persistedUiReducer,
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