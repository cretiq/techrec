import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { configureStore } from '@reduxjs/toolkit';
import MarkAsAppliedButton from '../MarkAsAppliedButton';
import { savedRolesSlice } from '@/lib/features/savedRolesSlice';
import type { Role } from '@/types/role';

// Mock the hooks
jest.mock('@/hooks/useSavedRoles', () => ({
  useSavedRoleStatus: jest.fn()
}));

// Mock the Redux actions
jest.mock('@/lib/features/savedRolesSlice', () => ({
  markRoleAsApplied: jest.fn(),
  saveAndMarkRoleAsApplied: jest.fn(),
  savedRolesSlice: {
    name: 'savedRoles',
    reducer: jest.fn(),
    actions: {}
  }
}));

const { useSavedRoleStatus } = require('@/hooks/useSavedRoles');
const { markRoleAsApplied, saveAndMarkRoleAsApplied } = require('@/lib/features/savedRolesSlice');

// Mock store setup
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      savedRoles: savedRolesSlice.reducer
    },
    preloadedState: initialState
  });
};

// Mock session data
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  expires: '2024-12-31'
};

// Mock role data
const mockRole: Role = {
  id: 'test-role-123',
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
  }
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createMockStore() 
}) => (
  <Provider store={store}>
    <SessionProvider session={mockSession}>
      {children}
    </SessionProvider>
  </Provider>
);

describe('MarkAsAppliedButton Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    markRoleAsApplied.mockReturnValue({
      type: 'savedRoles/markRoleAsApplied',
      payload: { roleId: mockRole.id },
      unwrap: jest.fn().mockResolvedValue({ success: true })
    });
    
    saveAndMarkRoleAsApplied.mockReturnValue({
      type: 'savedRoles/saveAndMarkRoleAsApplied', 
      payload: { roleData: mockRole },
      unwrap: jest.fn().mockResolvedValue({ success: true })
    });
  });

  describe('Initial State Rendering', () => {
    it('should render mark-as-applied button when role is not applied', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Mark as Applied');
      expect(button).toBeEnabled();
      expect(button).not.toHaveClass('bg-success');
    });

    it('should render applied state when role is already applied', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: true,
        isMarkingAsApplied: false,
        isSaved: true
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-applied-${mockRole.id}`);
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Applied');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-success');
    });

    it('should render loading state when marking as applied', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: true,
        isSaved: false
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      expect(button).toHaveTextContent('Marking...');
      expect(button).toBeDisabled();
    });
  });

  describe('Mark as Applied Functionality', () => {
    it('should call markRoleAsApplied for already saved role', async () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: true // Role is already saved
      });

      const mockDispatch = jest.fn();
      const store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'savedRoles/markRoleAsApplied'
          })
        );
      });

      expect(markRoleAsApplied).toHaveBeenCalledWith({
        roleId: mockRole.id,
        applicationMethod: 'external',
        jobPostingUrl: mockRole.applicationInfo?.applicationUrl
      });
    });

    it('should call saveAndMarkRoleAsApplied for unsaved role', async () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false // Role is not saved yet
      });

      const mockDispatch = jest.fn();
      const store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'savedRoles/saveAndMarkRoleAsApplied'
          })
        );
      });

      expect(saveAndMarkRoleAsApplied).toHaveBeenCalledWith({
        roleData: mockRole,
        applicationMethod: 'external',
        applicationNotes: undefined
      });
    });

    it('should call success callback when provided', async () => {
      const mockOnSuccess = jest.fn();
      
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={mockRole} onSuccess={mockOnSuccess} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle click events properly with stopPropagation', async () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      const mockParentClick = jest.fn();
      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <div onClick={mockParentClick}>
            <MarkAsAppliedButton role={mockRole} />
          </div>
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      // Parent click should not be called due to stopPropagation
      expect(mockParentClick).not.toHaveBeenCalled();
    });
  });

  describe('Authentication Integration', () => {
    it('should be disabled when user is not authenticated', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      render(
        <Provider store={createMockStore()}>
          <SessionProvider session={null}>
            <MarkAsAppliedButton role={mockRole} />
          </SessionProvider>
        </Provider>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      expect(button).toBeDisabled();
    });

    it('should not trigger action when clicked without authentication', async () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      const mockDispatch = jest.fn();
      const store = createMockStore();
      store.dispatch = mockDispatch;

      render(
        <Provider store={store}>
          <SessionProvider session={null}>
            <MarkAsAppliedButton role={mockRole} />
          </SessionProvider>
        </Provider>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      // Should not dispatch any actions
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle failed mark-as-applied action gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      // Mock failed action
      saveAndMarkRoleAsApplied.mockReturnValue({
        type: 'savedRoles/saveAndMarkRoleAsApplied',
        payload: { roleData: mockRole },
        unwrap: jest.fn().mockRejectedValue(new Error('API Error'))
      });

      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={mockRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to mark role as applied:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Custom Props Integration', () => {
    it('should apply custom className', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton role={mockRole} className="custom-class" />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${mockRole.id}`);
      expect(button).toHaveClass('custom-class');
    });

    it('should use custom testId when provided', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton 
            role={mockRole} 
            data-testid="custom-mark-applied-button" 
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('custom-mark-applied-button-mark-applied');
      expect(button).toBeInTheDocument();
    });

    it('should render applied state with custom testId', () => {
      useSavedRoleStatus.mockReturnValue({
        isApplied: true,
        isMarkingAsApplied: false,
        isSaved: true
      });

      render(
        <TestWrapper>
          <MarkAsAppliedButton 
            role={mockRole} 
            data-testid="custom-mark-applied-button" 
          />
        </TestWrapper>
      );

      const button = screen.getByTestId('custom-mark-applied-button-applied-status');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Applied');
    });
  });

  describe('Role Data Integration', () => {
    it('should handle role with missing optional data', async () => {
      const minimalRole: Role = {
        id: 'minimal-role-123',
        title: 'Developer',
        company: {
          name: 'Company'
        },
        location: 'Remote',
        type: 'FULL_TIME'
        // Missing optional fields like applicationInfo, url, etc.
      };

      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: false
      });

      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={minimalRole} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${minimalRole.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(saveAndMarkRoleAsApplied).toHaveBeenCalledWith({
          roleData: minimalRole,
          applicationMethod: 'external',
          applicationNotes: undefined
        });
      });
    });

    it('should use role URL as jobPostingUrl when applicationInfo is missing', async () => {
      const roleWithUrl: Role = {
        ...mockRole,
        url: 'https://example.com/job-posting',
        applicationInfo: undefined
      };

      useSavedRoleStatus.mockReturnValue({
        isApplied: false,
        isMarkingAsApplied: false,
        isSaved: true // Already saved
      });

      const store = createMockStore();

      render(
        <TestWrapper store={store}>
          <MarkAsAppliedButton role={roleWithUrl} />
        </TestWrapper>
      );

      const button = screen.getByTestId(`mark-applied-button-${roleWithUrl.id}`);
      fireEvent.click(button);

      await waitFor(() => {
        expect(markRoleAsApplied).toHaveBeenCalledWith({
          roleId: roleWithUrl.id,
          applicationMethod: 'external',
          jobPostingUrl: roleWithUrl.url
        });
      });
    });
  });
});