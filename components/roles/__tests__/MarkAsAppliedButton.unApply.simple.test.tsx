import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { configureStore } from '@reduxjs/toolkit';
import MarkAsAppliedButton from '../MarkAsAppliedButton';
import { savedRolesSlice } from '@/lib/features/savedRolesSlice';

// Mock next-auth
const mockSession = {
  user: { id: 'test-user-123', email: 'test@example.com' },
  expires: '2024-12-31T23:59:59.999Z'
};

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession }),
  SessionProvider: ({ children }: any) => children
}));

// Mock fetch globally
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Test store helper
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
        status: 'idle',
        error: null,
        applicationActivity: { activityData: [], summary: null },
        activityStatus: 'idle',
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

// Mock role data
const mockRole = {
  id: 'test-role-123',
  title: 'Senior Frontend Developer',
  company: {
    name: 'TechCorp',
    industry: ['Technology'],
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
  }
};

// Mock applied saved role data
const mockAppliedSavedRole = {
  id: 'saved-role-123',
  roleId: 'test-role-123',
  developerId: 'test-user-123',
  appliedFor: true,
  appliedAt: '2024-01-15T10:00:00Z',
  applicationMethod: 'external',
  jobPostingUrl: 'https://example.com/jobs/123',
  applicationNotes: 'Applied via company website',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  notes: null,
  role: null,
  roleTitle: 'Senior Frontend Developer',
  companyName: 'TechCorp'
};

describe('MarkAsAppliedButton - Un-Apply Simple Tests', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    mockedFetch.mockClear();
  });

  const renderButton = (store: any, allowUnApply: boolean = false) => {
    return render(
      <Provider store={store}>
        <SessionProvider session={mockSession}>
          <MarkAsAppliedButton
            role={mockRole}
            data-testid="mark-applied-button"
            allowUnApply={allowUnApply}
          />
        </SessionProvider>
      </Provider>
    );
  };

  test('renders not applied button by default', () => {
    const store = createTestStore({
      savedRoles: [],
      appliedCount: 0
    });

    renderButton(store, false);

    expect(screen.getByTestId('mark-applied-button-mark-applied')).toBeInTheDocument();
    expect(screen.getByText('Mark as Applied')).toBeInTheDocument();
  });

  test('renders applied button as disabled when allowUnApply is false', () => {
    const store = createTestStore({
      savedRoles: [mockAppliedSavedRole],
      appliedCount: 1
    });

    renderButton(store, false);

    const button = screen.getByTestId('mark-applied-button-applied-status');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Applied');
    expect(button).toBeDisabled();
  });

  test('renders applied button as clickable when allowUnApply is true', () => {
    const store = createTestStore({
      savedRoles: [mockAppliedSavedRole],
      appliedCount: 1
    });

    renderButton(store, true);

    const button = screen.getByTestId('mark-applied-button-applied-status');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Applied');
    expect(button).not.toBeDisabled();
  });

  test('opens confirmation dialog when applied button is clicked with allowUnApply=true', async () => {
    const store = createTestStore({
      savedRoles: [mockAppliedSavedRole],
      appliedCount: 1
    });

    renderButton(store, true);

    const button = screen.getByTestId('mark-applied-button-applied-status');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Remove Application Status?')).toBeInTheDocument();
    });

    expect(screen.getByText('Remove Application')).toBeInTheDocument();
    expect(screen.getByText('Keep Application')).toBeInTheDocument();
  });

  test('closes dialog when cancel is clicked', async () => {
    const store = createTestStore({
      savedRoles: [mockAppliedSavedRole],
      appliedCount: 1
    });

    renderButton(store, true);

    // Open dialog
    const button = screen.getByTestId('mark-applied-button-applied-status');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Remove Application Status?')).toBeInTheDocument();
    });

    // Cancel
    fireEvent.click(screen.getByText('Keep Application'));

    await waitFor(() => {
      expect(screen.queryByText('Remove Application Status?')).not.toBeInTheDocument();
    });
  });

  test('successfully un-applies role when confirmed', async () => {
    const store = createTestStore({
      savedRoles: [mockAppliedSavedRole],
      appliedCount: 1
    });

    // Mock successful un-apply API response
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        savedRoleId: 'saved-role-123',
        unappliedAt: '2024-01-15T11:00:00Z',
        data: {
          ...mockAppliedSavedRole,
          appliedFor: false,
          appliedAt: null,
          applicationMethod: null
        }
      })
    } as any);

    renderButton(store, true);

    // Open dialog
    const button = screen.getByTestId('mark-applied-button-applied-status');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Remove Application Status?')).toBeInTheDocument();
    });

    // Confirm
    fireEvent.click(screen.getByText('Remove Application'));

    // Wait for API call
    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith('/api/developer/saved-roles/un-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roleId: 'test-role-123',
          keepNotes: true
        })
      });
    });

    // Dialog should close and button should change
    await waitFor(() => {
      expect(screen.queryByText('Remove Application Status?')).not.toBeInTheDocument();
    });

    // Button should change back to "Mark as Applied"
    await waitFor(() => {
      expect(screen.getByText('Mark as Applied')).toBeInTheDocument();
    });
  });
});