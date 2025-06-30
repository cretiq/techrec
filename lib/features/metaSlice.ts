import { createAction } from '@reduxjs/toolkit';

/**
 * Critical security action that resets all Redux state during user logout.
 * 
 * **Security Purpose:**
 * - Prevents data leakage between user sessions
 * - Ensures no user-specific data persists in memory after logout
 * - Provides bulletproof state isolation for multi-user environments
 * 
 * **Usage:**
 * This action should ONLY be dispatched during the logout process,
 * immediately before terminating the NextAuth session.
 * 
 * **Implementation:**
 * The rootReducer in store.ts intercepts this action and resets
 * all slices to their initial state by passing undefined to combinedReducer.
 * 
 * @example
 * ```typescript
 * // In logout handler
 * dispatch(userLoggedOut()) // Clear all Redux state
 * await signOut({ redirect: false }) // Terminate session
 * ```
 */
export const userLoggedOut = createAction('meta/userLoggedOut');