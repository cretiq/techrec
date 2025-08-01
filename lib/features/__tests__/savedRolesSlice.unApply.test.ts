import { configureStore } from '@reduxjs/toolkit';
import { savedRolesSlice, unApplyRole, fetchSavedRoles } from '../savedRolesSlice';
import type { InternalSavedRole } from '@/types/types';

// Mock fetch globally for these tests
global.fetch = jest.fn();

const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Test helpers
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      savedRoles: savedRolesSlice.reducer
    },
    preloadedState: {
      savedRoles: {
        savedRoles: [],
        totalCount: 0,
        appliedCount: 0,
        status: 'idle' as const,
        error: null,
        applicationActivity: {
          activityData: [],
          summary: null
        },
        activityStatus: 'idle' as const,
        activityError: null,
        markingAsApplied: {},
        markAsAppliedErrors: {},
        unApplying: {},
        unApplyErrors: {},
        ...initialState
      }
    }
  });
};

const createMockAppliedSavedRole = (overrides: Partial<InternalSavedRole> = {}): InternalSavedRole => ({
  id: 'saved-role-123',
  roleId: 'external-role-123',
  developerId: 'dev-123',
  appliedFor: true, // This role is applied
  appliedAt: '2024-01-15T10:00:00Z',
  applicationMethod: 'external',
  jobPostingUrl: 'https://example.com/jobs/123',
  applicationNotes: 'Applied via company website',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  notes: 'External ID: external-role-123',
  role: null,
  roleTitle: 'Software Engineer',
  companyName: 'TechCorp',
  ...overrides
});

describe('savedRolesSlice - Un-Apply Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetch.mockClear();
  });

  describe('unApplyRole', () => {
    it('should handle successful un-apply for applied role', async () => {
      const appliedSavedRole = createMockAppliedSavedRole();
      const store = createTestStore({
        savedRoles: [appliedSavedRole],
        totalCount: 1,
        appliedCount: 1
      });

      const mockResponse = {
        success: true,
        savedRoleId: 'saved-role-123',
        unappliedAt: '2024-01-15T11:00:00Z',
        message: 'Role application status removed',
        data: {
          ...appliedSavedRole,
          appliedFor: false,
          appliedAt: null,
          applicationMethod: null,
          applicationNotes: null
        }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'external-role-123',
        keepNotes: false
      };

      const result = await store.dispatch(unApplyRole(params));

      // Verify action was successful
      expect(result.type).toBe('savedRoles/unApplyRole/fulfilled');
      expect(result.payload).toEqual(mockResponse);

      // Verify API call
      expect(mockedFetch).toHaveBeenCalledWith('/api/developer/saved-roles/un-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      // Verify state updates
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(false);
      expect(state.savedRoles[0].appliedAt).toBe(null);
      expect(state.savedRoles[0].applicationMethod).toBe(null);
      expect(state.savedRoles[0].applicationNotes).toBe(null);
      expect(state.appliedCount).toBe(0);
      expect(state.unApplying['external-role-123']).toBe(false);
    });

    it('should handle successful un-apply with keeping notes', async () => {
      const appliedSavedRole = createMockAppliedSavedRole();
      const store = createTestStore({
        savedRoles: [appliedSavedRole],
        totalCount: 1,
        appliedCount: 1
      });

      const mockResponse = {
        success: true,
        savedRoleId: 'saved-role-123',
        unappliedAt: '2024-01-15T11:00:00Z',
        message: 'Role application status removed',
        data: {
          ...appliedSavedRole,
          appliedFor: false,
          appliedAt: null,
          applicationMethod: null,
          // Notes kept when keepNotes: true
          applicationNotes: 'Applied via company website'
        }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'external-role-123',
        keepNotes: true
      };

      await store.dispatch(unApplyRole(params));

      // Verify state updates - notes should be kept
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(false);
      expect(state.savedRoles[0].appliedAt).toBe(null);
      expect(state.savedRoles[0].applicationMethod).toBe(null);
      expect(state.savedRoles[0].applicationNotes).toBe('Applied via company website'); // Notes kept
      expect(state.appliedCount).toBe(0);
    });

    it('should handle pending state correctly', async () => {
      const store = createTestStore();

      // Mock a slow response to test pending state
      mockedFetch.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true })
        } as any), 100)
      ));

      const params = {
        roleId: 'external-role-123',
        keepNotes: false
      };

      // Dispatch action but don't await yet
      const promise = store.dispatch(unApplyRole(params));

      // Check pending state
      let state = store.getState().savedRoles;
      expect(state.unApplying['external-role-123']).toBe(true);
      expect(state.unApplyErrors['external-role-123']).toBeUndefined();

      // Wait for completion
      await promise;

      // Check final state
      state = store.getState().savedRoles;
      expect(state.unApplying['external-role-123']).toBe(false);
    });

    it('should handle API errors correctly', async () => {
      const store = createTestStore();

      const errorResponse = { error: 'Role not found or not currently applied' };
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(errorResponse)
      } as any);

      const params = {
        roleId: 'nonexistent-role',
        keepNotes: false
      };

      const result = await store.dispatch(unApplyRole(params));

      // Verify error handling
      expect(result.type).toBe('savedRoles/unApplyRole/rejected');
      expect(result.error.message).toBe('Role not found or not currently applied');

      // Verify state updates
      const state = store.getState().savedRoles;
      expect(state.unApplying['nonexistent-role']).toBe(false);
      expect(state.unApplyErrors['nonexistent-role']).toBe('Role not found or not currently applied');
    });

    it('should handle network errors', async () => {
      const store = createTestStore();

      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      const params = {
        roleId: 'external-role-123',
        keepNotes: false
      };

      const result = await store.dispatch(unApplyRole(params));

      expect(result.type).toBe('savedRoles/unApplyRole/rejected');
      expect(result.error.message).toBe('Network error');

      const state = store.getState().savedRoles;
      expect(state.unApplyErrors['external-role-123']).toBe('Network error');
    });

    it('should match role by different strategies', async () => {
      // Test role matching by title when direct ID match fails
      const appliedSavedRole = createMockAppliedSavedRole({
        roleId: 'different-external-id',
        roleTitle: 'Software Engineer'
      });
      
      const store = createTestStore({
        savedRoles: [appliedSavedRole],
        totalCount: 1,
        appliedCount: 1
      });

      const mockResponse = {
        success: true,
        savedRoleId: 'saved-role-123',
        unappliedAt: '2024-01-15T11:00:00Z',
        data: { 
          role: { title: 'Software Engineer' },
          appliedFor: false,
          appliedAt: null,
          applicationMethod: null
        }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'external-role-123', // Different from saved role's roleId
        keepNotes: false
      };

      await store.dispatch(unApplyRole(params));

      // Should still update the role because titles match
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(false);
      expect(state.appliedCount).toBe(0);
    });

    it('should handle un-apply for role with multiple applied roles correctly', async () => {
      const appliedRole1 = createMockAppliedSavedRole({
        id: 'saved-role-1',
        roleId: 'external-role-1',
        roleTitle: 'Frontend Developer'
      });
      
      const appliedRole2 = createMockAppliedSavedRole({
        id: 'saved-role-2',
        roleId: 'external-role-2',
        roleTitle: 'Backend Developer'
      });
      
      const store = createTestStore({
        savedRoles: [appliedRole1, appliedRole2],
        totalCount: 2,
        appliedCount: 2
      });

      const mockResponse = {
        success: true,
        savedRoleId: 'saved-role-1',
        unappliedAt: '2024-01-15T11:00:00Z',
        data: {
          ...appliedRole1,
          appliedFor: false,
          appliedAt: null,
          applicationMethod: null
        }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      await store.dispatch(unApplyRole({
        roleId: 'external-role-1',
        keepNotes: false
      }));

      // Verify only the first role was un-applied
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(false); // Un-applied
      expect(state.savedRoles[1].appliedFor).toBe(true);  // Still applied
      expect(state.appliedCount).toBe(1); // Count decreased by 1
    });

    it('should log warning when role not found for un-apply', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const store = createTestStore(); // Empty store

      const mockResponse = {
        success: true,
        savedRoleId: 'some-role-id',
        unappliedAt: '2024-01-15T11:00:00Z'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'nonexistent-role',
        keepNotes: false
      };

      await store.dispatch(unApplyRole(params));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Redux] Could not find saved role to un-apply for external ID:',
        'nonexistent-role'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Selectors', () => {
    it('should select un-applying status correctly', () => {
      const store = createTestStore({
        unApplying: {
          'role-123': true,
          'role-456': false
        }
      });

      const { selectIsUnApplying } = require('../savedRolesSlice');
      
      const state = store.getState();
      expect(selectIsUnApplying('role-123')(state)).toBe(true);
      expect(selectIsUnApplying('role-456')(state)).toBe(false);
      expect(selectIsUnApplying('nonexistent')(state)).toBe(false);
    });

    it('should select un-apply errors correctly', () => {
      const store = createTestStore({
        unApplyErrors: {
          'role-123': 'Network error',
          'role-456': 'Role not found'
        }
      });

      const { selectUnApplyError } = require('../savedRolesSlice');
      
      const state = store.getState();
      expect(selectUnApplyError('role-123')(state)).toBe('Network error');
      expect(selectUnApplyError('role-456')(state)).toBe('Role not found');
      expect(selectUnApplyError('nonexistent')(state)).toBeUndefined();
    });
  });

  describe('clearErrors action', () => {
    it('should clear un-apply error states', () => {
      const { clearErrors } = savedRolesSlice.actions;
      const initialState = {
        savedRoles: [],
        totalCount: 0,
        appliedCount: 0,
        status: 'idle' as const,
        error: 'Main error',
        applicationActivity: { activityData: [], summary: null },
        activityStatus: 'idle' as const,
        activityError: 'Activity error',
        markingAsApplied: {},
        markAsAppliedErrors: {
          'role-123': 'Mark error'
        },
        unApplying: {},
        unApplyErrors: {
          'role-123': 'Un-apply error',
          'role-456': 'Another un-apply error'
        }
      };

      const newState = savedRolesSlice.reducer(initialState, clearErrors());

      expect(newState.error).toBeNull();
      expect(newState.activityError).toBeNull();
      expect(newState.markAsAppliedErrors).toEqual({});
      expect(newState.unApplyErrors).toEqual({}); // Un-apply errors cleared
    });
  });
});