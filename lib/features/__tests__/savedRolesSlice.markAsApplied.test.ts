import { configureStore } from '@reduxjs/toolkit';
import { savedRolesSlice, markRoleAsApplied, saveAndMarkRoleAsApplied, fetchSavedRoles } from '../savedRolesSlice';
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
        ...initialState
      }
    }
  });
};

const createMockSavedRole = (overrides: Partial<InternalSavedRole> = {}): InternalSavedRole => ({
  id: 'saved-role-123',
  roleId: 'external-role-123',
  developerId: 'dev-123',
  appliedFor: false,
  appliedAt: null,
  applicationMethod: null,
  jobPostingUrl: null,
  applicationNotes: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  notes: null,
  role: null,
  roleTitle: 'Software Engineer',
  companyName: 'TechCorp',
  ...overrides
});

const createMockRole = (overrides: any = {}) => ({
  id: 'external-role-123',
  title: 'Senior Frontend Developer',
  company: {
    name: 'TechCorp',
    industry: 'Technology',
    size: '100-500 employees'
  },
  location: 'San Francisco, CA',
  type: 'FULL_TIME',
  remote: true,
  description: 'Looking for a senior frontend developer...',
  requirements: ['React', 'TypeScript', 'Node.js'],
  salary: '$120,000 - $150,000',
  url: 'https://example.com/jobs/123',
  applicationInfo: {
    applicationUrl: 'https://example.com/apply/123'
  },
  ...overrides
});

describe('savedRolesSlice - Mark as Applied Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetch.mockClear();
  });

  describe('markRoleAsApplied', () => {
    it('should handle successful mark as applied for existing saved role', async () => {
      const existingSavedRole = createMockSavedRole();
      const store = createTestStore({
        savedRoles: [existingSavedRole],
        totalCount: 1,
        appliedCount: 0
      });

      const mockResponse = {
        success: true,
        appliedAt: '2024-01-15T10:00:00Z',
        data: { role: { title: 'Software Engineer' } }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'external-role-123',
        applicationMethod: 'external' as const,
        jobPostingUrl: 'https://example.com/jobs/123',
        applicationNotes: 'Applied via company website'
      };

      const result = await store.dispatch(markRoleAsApplied(params));

      // Verify action was successful
      expect(result.type).toBe('savedRoles/markRoleAsApplied/fulfilled');
      expect(result.payload).toEqual(mockResponse);

      // Verify API call
      expect(mockedFetch).toHaveBeenCalledWith('/api/developer/saved-roles/mark-applied', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      // Verify state updates
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(true);
      expect(state.savedRoles[0].appliedAt).toBe('2024-01-15T10:00:00Z');
      expect(state.savedRoles[0].applicationMethod).toBe('external');
      expect(state.savedRoles[0].jobPostingUrl).toBe('https://example.com/jobs/123');
      expect(state.savedRoles[0].applicationNotes).toBe('Applied via company website');
      expect(state.appliedCount).toBe(1);
      expect(state.markingAsApplied['external-role-123']).toBe(false);
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
        applicationMethod: 'external' as const
      };

      // Dispatch action but don't await yet
      const promise = store.dispatch(markRoleAsApplied(params));

      // Check pending state
      let state = store.getState().savedRoles;
      expect(state.markingAsApplied['external-role-123']).toBe(true);
      expect(state.markAsAppliedErrors['external-role-123']).toBeUndefined();

      // Wait for completion
      await promise;

      // Check final state
      state = store.getState().savedRoles;
      expect(state.markingAsApplied['external-role-123']).toBe(false);
    });

    it('should handle API errors correctly', async () => {
      const store = createTestStore();

      const errorResponse = { error: 'Role not found' };
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(errorResponse)
      } as any);

      const params = {
        roleId: 'nonexistent-role',
        applicationMethod: 'external' as const
      };

      const result = await store.dispatch(markRoleAsApplied(params));

      // Verify error handling
      expect(result.type).toBe('savedRoles/markRoleAsApplied/rejected');
      expect(result.error.message).toBe('Role not found');

      // Verify state updates
      const state = store.getState().savedRoles;
      expect(state.markingAsApplied['nonexistent-role']).toBe(false);
      expect(state.markAsAppliedErrors['nonexistent-role']).toBe('Role not found');
    });

    it('should handle network errors', async () => {
      const store = createTestStore();

      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      const params = {
        roleId: 'external-role-123',
        applicationMethod: 'external' as const
      };

      const result = await store.dispatch(markRoleAsApplied(params));

      expect(result.type).toBe('savedRoles/markRoleAsApplied/rejected');
      expect(result.error.message).toBe('Network error');

      const state = store.getState().savedRoles;
      expect(state.markAsAppliedErrors['external-role-123']).toBe('Network error');
    });

    it('should match role by different strategies', async () => {
      // Test role matching by title when direct ID match fails
      const existingSavedRole = createMockSavedRole({
        roleId: 'different-external-id',
        roleTitle: 'Software Engineer'
      });
      
      const store = createTestStore({
        savedRoles: [existingSavedRole],
        totalCount: 1,
        appliedCount: 0
      });

      const mockResponse = {
        success: true,
        appliedAt: '2024-01-15T10:00:00Z',
        data: { role: { title: 'Software Engineer' } }
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'external-role-123', // Different from saved role's roleId
        applicationMethod: 'external' as const
      };

      await store.dispatch(markRoleAsApplied(params));

      // Should still update the role because titles match
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].appliedFor).toBe(true);
      expect(state.appliedCount).toBe(1);
    });

    it('should log warning when role not found for update', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const store = createTestStore(); // Empty store

      const mockResponse = {
        success: true,
        appliedAt: '2024-01-15T10:00:00Z'
      };

      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as any);

      const params = {
        roleId: 'nonexistent-role',
        applicationMethod: 'external' as const
      };

      await store.dispatch(markRoleAsApplied(params));

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Redux] Could not find saved role to update for external ID:',
        'nonexistent-role'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('saveAndMarkRoleAsApplied', () => {
    it('should successfully save and mark role as applied', async () => {
      const store = createTestStore();
      const mockRole = createMockRole();

      // Mock save response
      const saveResponse = { success: true, savedRoleId: 'new-saved-role-123' };
      // Mock mark as applied response
      const markResponse = { 
        success: true, 
        appliedAt: '2024-01-15T10:00:00Z',
        data: { role: mockRole }
      };

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(saveResponse)
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(markResponse)
        } as any);

      const params = {
        roleData: mockRole,
        applicationMethod: 'external' as const,
        applicationNotes: 'Applied through role search'
      };

      const result = await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Verify both API calls were made
      expect(mockedFetch).toHaveBeenCalledTimes(2);
      
      // Verify save call
      expect(mockedFetch).toHaveBeenNthCalledWith(1, '/api/developer/me/saved-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleData: mockRole })
      });

      // Verify mark as applied call
      expect(mockedFetch).toHaveBeenNthCalledWith(2, '/api/developer/saved-roles/mark-applied', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: mockRole.id,
          applicationMethod: 'external',
          jobPostingUrl: mockRole.url, // Implementation prioritizes role.url over applicationInfo.applicationUrl
          applicationNotes: 'Applied through role search'
        })
      });

      // Verify action result
      expect(result.type).toBe('savedRoles/saveAndMarkRoleAsApplied/fulfilled');
      expect(result.payload).toEqual(markResponse);

      // Verify state - new role should be added to savedRoles
      const state = store.getState().savedRoles;
      expect(state.savedRoles).toHaveLength(1);
      expect(state.savedRoles[0].roleId).toBe(mockRole.id);
      expect(state.savedRoles[0].appliedFor).toBe(true);
      expect(state.savedRoles[0].appliedAt).toBe('2024-01-15T10:00:00Z');
      expect(state.savedRoles[0].applicationMethod).toBe('external');
      expect(state.savedRoles[0].roleTitle).toBe(mockRole.title);
      expect(state.savedRoles[0].companyName).toBe(mockRole.company.name);
      expect(state.totalCount).toBe(1);
      expect(state.appliedCount).toBe(1);
      expect(state.markingAsApplied[mockRole.id]).toBe(false);
    });

    it('should update existing saved role instead of creating new one', async () => {
      const mockRole = createMockRole();
      const existingSavedRole = createMockSavedRole({
        roleId: mockRole.id,
        appliedFor: false
      });

      const store = createTestStore({
        savedRoles: [existingSavedRole],
        totalCount: 1,
        appliedCount: 0
      });

      const saveResponse = { success: true };
      const markResponse = { 
        success: true, 
        appliedAt: '2024-01-15T10:00:00Z',
        data: { role: mockRole }
      };

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(saveResponse)
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(markResponse)
        } as any);

      const params = {
        roleData: mockRole,
        applicationMethod: 'manual' as const
      };

      await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Should still have only 1 role, but now marked as applied
      const state = store.getState().savedRoles;
      expect(state.savedRoles).toHaveLength(1);
      expect(state.savedRoles[0].id).toBe(existingSavedRole.id); // Same internal ID
      expect(state.savedRoles[0].appliedFor).toBe(true);
      expect(state.savedRoles[0].applicationMethod).toBe('manual');
      expect(state.totalCount).toBe(1); // Count unchanged
      expect(state.appliedCount).toBe(1); // Applied count increased
    });

    it('should handle save failure correctly', async () => {
      const store = createTestStore();
      const mockRole = createMockRole();

      // Mock save failure
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Save failed' })
      } as any);

      const params = {
        roleData: mockRole,
        applicationMethod: 'external' as const
      };

      const result = await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Verify error handling
      expect(result.type).toBe('savedRoles/saveAndMarkRoleAsApplied/rejected');
      expect(result.error.message).toBe('Save failed');

      // Verify only one API call was made (save failed, so mark wasn't attempted)
      expect(mockedFetch).toHaveBeenCalledTimes(1);

      // Verify state
      const state = store.getState().savedRoles;
      expect(state.markingAsApplied[mockRole.id]).toBe(false);
      expect(state.markAsAppliedErrors[mockRole.id]).toBe('Save failed');
      expect(state.savedRoles).toHaveLength(0); // Nothing added
    });

    it('should handle mark as applied failure after successful save', async () => {
      const store = createTestStore();
      const mockRole = createMockRole();

      // Mock successful save but failed mark
      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true })
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          json: jest.fn().mockResolvedValue({ error: 'Mark failed' })
        } as any);

      const params = {
        roleData: mockRole,
        applicationMethod: 'external' as const
      };

      const result = await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Verify error from second step
      expect(result.type).toBe('savedRoles/saveAndMarkRoleAsApplied/rejected');
      expect(result.error.message).toBe('Mark failed');

      // Verify both API calls were made
      expect(mockedFetch).toHaveBeenCalledTimes(2);

      // Verify error state
      const state = store.getState().savedRoles;
      expect(state.markAsAppliedErrors[mockRole.id]).toBe('Mark failed');
    });

    it('should handle role with missing optional data', async () => {
      const minimalRole = {
        id: 'minimal-role-123',
        title: 'Developer',
        company: { name: 'Company' },
        location: 'Remote',
        type: 'FULL_TIME'
        // Missing url, applicationInfo, etc.
      };

      const store = createTestStore();

      const saveResponse = { success: true };
      const markResponse = { 
        success: true, 
        appliedAt: '2024-01-15T10:00:00Z',
        data: { role: minimalRole }
      };

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(saveResponse)
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(markResponse)
        } as any);

      const params = {
        roleData: minimalRole,
        applicationMethod: 'external' as const
      };

      await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Verify mark call handles missing data gracefully
      expect(mockedFetch).toHaveBeenNthCalledWith(2, '/api/developer/saved-roles/mark-applied', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: minimalRole.id,
          applicationMethod: 'external',
          jobPostingUrl: undefined, // Should handle missing URL
          applicationNotes: undefined
        })
      });

      // Verify state with minimal data
      const state = store.getState().savedRoles;
      expect(state.savedRoles[0].roleTitle).toBe('Developer');
      expect(state.savedRoles[0].companyName).toBe('Company');
      expect(state.savedRoles[0].jobPostingUrl).toBeUndefined();
    });

    it('should use role.url when applicationInfo is missing', async () => {
      const roleWithUrl = createMockRole({
        url: 'https://company.com/careers/123',
        applicationInfo: undefined
      });

      const store = createTestStore();

      mockedFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ 
            success: true, 
            appliedAt: '2024-01-15T10:00:00Z',
            data: { role: roleWithUrl }
          })
        } as any);

      const params = {
        roleData: roleWithUrl,
        applicationMethod: 'external' as const
      };

      await store.dispatch(saveAndMarkRoleAsApplied(params));

      // Verify correct URL was used
      expect(mockedFetch).toHaveBeenNthCalledWith(2, '/api/developer/saved-roles/mark-applied', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: roleWithUrl.id,
          applicationMethod: 'external',
          jobPostingUrl: 'https://company.com/careers/123',
          applicationNotes: undefined
        })
      });
    });
  });

  describe('Selectors', () => {
    it('should select marking status correctly', () => {
      const store = createTestStore({
        markingAsApplied: {
          'role-123': true,
          'role-456': false
        }
      });

      const { selectIsMarkingAsApplied } = require('../savedRolesSlice');
      
      const state = store.getState();
      expect(selectIsMarkingAsApplied('role-123')(state)).toBe(true);
      expect(selectIsMarkingAsApplied('role-456')(state)).toBe(false);
      expect(selectIsMarkingAsApplied('nonexistent')(state)).toBe(false);
    });

    it('should select mark as applied errors correctly', () => {
      const store = createTestStore({
        markAsAppliedErrors: {
          'role-123': 'Network error',
          'role-456': 'Not found'
        }
      });

      const { selectMarkAsAppliedError } = require('../savedRolesSlice');
      
      const state = store.getState();
      expect(selectMarkAsAppliedError('role-123')(state)).toBe('Network error');
      expect(selectMarkAsAppliedError('role-456')(state)).toBe('Not found');
      expect(selectMarkAsAppliedError('nonexistent')(state)).toBeUndefined();
    });
  });

  describe('clearErrors action', () => {
    it('should clear all error states', () => {
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
          'role-123': 'Mark error',
          'role-456': 'Another error'
        }
      };

      const newState = savedRolesSlice.reducer(initialState, clearErrors());

      expect(newState.error).toBeNull();
      expect(newState.activityError).toBeNull();
      expect(newState.markAsAppliedErrors).toEqual({});
    });
  });
});