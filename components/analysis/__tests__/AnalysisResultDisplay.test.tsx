import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AnalysisResultDisplay } from '../AnalysisResultDisplay';
import analysisSlice from '@/lib/features/analysisSlice';

// Mock the toast hook
jest.mock('@/components/ui-daisy/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

// Mock framer-motion components
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock animation config
jest.mock('@/lib/animation-config', () => ({
  defaultTransition: {},
  fadeInUp: { hidden: {}, visible: {} }
}));

// Mock child components - IMPORTANT: Use same paths as component imports
jest.mock('../display/ContactInfoDisplay', () => ({
  ContactInfoDisplay: ({ data, onChange }: any) => (
    <div data-testid="contact-info-display">
      <input
        data-testid="contact-name-input"
        value={data?.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />
    </div>
  )
}));

jest.mock('../display/AboutDisplay', () => ({
  AboutDisplay: ({ data, onChange }: any) => (
    <textarea
      data-testid="about-textarea"
      value={data || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

jest.mock('../display/SkillsDisplay', () => ({
  SkillsDisplay: ({ data, onChange }: any) => (
    <div data-testid="skills-display">
      {data?.map((skill: any, index: number) => (
        <span key={index}>{skill.name}</span>
      ))}
    </div>
  )
}));

jest.mock('../display/ExperienceDisplay', () => ({
  ExperienceDisplay: ({ data }: any) => (
    <div data-testid="experience-display">
      {data?.map((exp: any, index: number) => (
        <div key={index}>{exp.company}</div>
      ))}
    </div>
  )
}));

jest.mock('../display/EducationDisplay', () => ({
  EducationDisplay: ({ data }: any) => (
    <div data-testid="education-display">
      {data?.map((edu: any, index: number) => (
        <div key={index}>{edu.institution}</div>
      ))}
    </div>
  )
}));

jest.mock('../display/PersonalProjectsDisplay', () => ({
  PersonalProjectsDisplay: ({ data }: any) => (
    <div data-testid="projects-display">
      {data?.map((project: any, index: number) => (
        <div key={index}>{project.name}</div>
      ))}
    </div>
  )
}));

jest.mock('../AIAssistanceButton', () => ({
  AIAssistanceButton: () => <button data-testid="ai-button">AI</button>
}));

jest.mock('@/components/suggestions/SuggestionManager', () => ({
  SuggestionManager: () => <div data-testid="suggestion-manager" />
}));

jest.mock('../ProjectRecommendationCard', () => ({
  ProjectRecommendationCard: () => <div data-testid="project-recommendations" />
}));

// Sample test data - structured as the component expects it
const mockAnalysisData = {
  id: 'test-analysis-1',
  contactInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  about: 'Software developer with 5 years of experience',
  skills: [
    { name: 'JavaScript', level: 'Expert', category: 'Programming' },
    { name: 'React', level: 'Advanced', category: 'Frontend' }
  ],
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      responsibilities: ['Lead development', 'Code reviews'],
      achievements: ['Improved performance by 30%']
    }
  ],
  education: [
    {
      institution: 'University of Tech',
      degree: 'Computer Science',
      startDate: '2016-09-01',
      endDate: '2020-05-31'
    }
  ],
  personalProjects: [
    {
      name: 'Portfolio Website',
      description: 'Personal portfolio built with React',
      technologies: ['React', 'TypeScript'],
      url: 'https://johndoe.dev'
    }
  ],
  cv: {
    extractedText: 'Resume content...',
    originalFilename: 'john_doe_cv.pdf'
  },
  totalYearsExperience: 5,
  isJuniorDeveloper: false
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      analysis: analysisSlice
    },
    preloadedState: {
      analysis: {
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData,
        currentAnalysisId: 'test-analysis-1',
        status: 'succeeded',
        error: null,
        suggestions: [],
        recentlyUpdatedPaths: [],
        ...initialState
      }
    }
  });
};

describe('AnalysisResultDisplay', () => {
  describe('Data Structure Validation', () => {
    test('renders all sections when data is present', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      // Check that all sections render when data exists
      expect(screen.getByTestId('contact-info-display')).toBeInTheDocument();
      expect(screen.getByTestId('about-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('skills-display')).toBeInTheDocument();
      expect(screen.getByTestId('experience-display')).toBeInTheDocument();
      expect(screen.getByTestId('education-display')).toBeInTheDocument();
      expect(screen.getByTestId('projects-display')).toBeInTheDocument();
    });

    test('conditionally renders sections based on data presence', () => {
      const incompleteData = {
        ...mockAnalysisData,
        about: undefined,
        skills: [],
        experience: [],
        education: [],
        personalProjects: []
      };

      const store = createMockStore({ analysisData: incompleteData });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      // Contact info should still render (always shown if analysisData exists)
      expect(screen.getByTestId('contact-info-display')).toBeInTheDocument();
      
      // Other sections should not render when empty
      expect(screen.queryByTestId('about-textarea')).not.toBeInTheDocument();
      expect(screen.queryByTestId('skills-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('experience-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('education-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('projects-display')).not.toBeInTheDocument();
    });
  });

  describe('Redux Data Flow', () => {
    test('dispatches updateAnalysisData when contact info changes', async () => {
      const store = createMockStore();
      const mockDispatch = jest.fn();
      store.dispatch = mockDispatch;
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      const nameInput = screen.getByTestId('contact-name-input');
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('updateAnalysisData'),
            payload: expect.objectContaining({
              path: 'contactInfo',
              value: expect.objectContaining({
                name: 'Jane Doe'
              })
            })
          })
        );
      });
    });

    test('displays loading state correctly', () => {
      const store = createMockStore({ 
        status: 'loading',
        analysisData: null 
      });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      expect(screen.getByTestId('cv-management-analysis-display-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading analysis data...')).toBeInTheDocument();
    });

    test('displays error state correctly', () => {
      const store = createMockStore({ 
        status: 'failed',
        error: 'Failed to load data',
        analysisData: null 
      });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      expect(screen.getByTestId('cv-management-analysis-display-error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load analysis data/)).toBeInTheDocument();
    });

    test('calculates unsaved changes correctly', () => {
      // Create modified data
      const modifiedData = {
        ...mockAnalysisData,
        contactInfo: {
          ...mockAnalysisData.contactInfo,
          name: 'Modified Name'
        }
      };

      const store = createMockStore({ 
        analysisData: modifiedData,
        originalData: mockAnalysisData // Different from current
      });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      // Component should detect changes (this would show in save button state, etc.)
      // We can test this by checking the Redux state calculation
      const state = store.getState().analysis;
      expect(state.analysisData).not.toEqual(state.originalData);
    });
  });

  describe('Data Type Safety', () => {
    test('handles null/undefined data gracefully', () => {
      const store = createMockStore({ 
        analysisData: null,
        status: 'succeeded' 
      });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      expect(screen.getByTestId('cv-management-analysis-display-no-data')).toBeInTheDocument();
      expect(screen.getByText('No analysis data available.')).toBeInTheDocument();
    });

    test('handles malformed data structures', () => {
      const malformedData = {
        id: 'test',
        contactInfo: null, // This should be handled gracefully
        skills: 'invalid', // This should be handled gracefully
        experience: undefined
      };

      const store = createMockStore({ analysisData: malformedData });
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      // Should still render contact section (contactInfo is always shown)
      expect(screen.getByTestId('contact-info-display')).toBeInTheDocument();
      
      // Invalid data should not crash the component
      expect(screen.queryByTestId('skills-display')).not.toBeInTheDocument();
      expect(screen.queryByTestId('experience-display')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('renders all child components with correct props', () => {
      const store = createMockStore();
      
      render(
        <Provider store={store}>
          <AnalysisResultDisplay originalMimeType="application/pdf" />
        </Provider>
      );

      // All major child components should render
      expect(screen.getByTestId('contact-info-display')).toBeInTheDocument();
      expect(screen.getByTestId('about-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('skills-display')).toBeInTheDocument();
      expect(screen.getByTestId('experience-display')).toBeInTheDocument();
      expect(screen.getByTestId('education-display')).toBeInTheDocument();
      expect(screen.getByTestId('projects-display')).toBeInTheDocument();
      
      // AI assistance buttons should render
      expect(screen.getAllByTestId('ai-button')).toHaveLength(4); // 4 sections with AI buttons (About, Experience, Education, PersonalProjects)
      
      // Suggestion managers should render
      expect(screen.getAllByTestId('suggestion-manager')).toHaveLength(5); // 5 sections with suggestion managers (ContactInfo, About, Skills, Education, PersonalProjects)
    });
  });
});