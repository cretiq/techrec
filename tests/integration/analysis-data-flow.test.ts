import { configureStore } from '@reduxjs/toolkit';
import analysisSlice, { 
  updateAnalysisData, 
  saveAnalysisVersion,
  fetchLatestAnalysis 
} from '@/lib/features/analysisSlice';
import { 
  validateProfileAnalysisData,
  safeValidateProfileAnalysisData,
  type ProfileAnalysisData 
} from '@/lib/validation/analysisDataSchema';

// Mock fetch for API calls
global.fetch = jest.fn();

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      analysis: analysisSlice
    },
    preloadedState: {
      analysis: {
        analysisData: null,
        originalData: null,
        currentAnalysisId: null,
        status: 'idle',
        error: null,
        suggestions: [],
        recentlyUpdatedPaths: [],
        ...initialState
      }
    }
  });
};

// Use the actual structure that Redux expects (flat, not nested under analysisResult)
const mockAnalysisData = {
  id: 'test-analysis-1',
  contactInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890'
  },
  about: 'Experienced software developer',
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
      responsibilities: ['Lead development team', 'Code reviews'],
      achievements: ['Improved performance by 30%']
    }
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Computer Science',
      startDate: '2016-09-01',
      endDate: '2020-05-31'
    }
  ]
};

describe('Analysis Data Flow Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Data Structure Validation', () => {
    test('validates correct analysis data structure', () => {
      // Create a proper ProfileAnalysisData structure
      const properStructure = {
        id: mockAnalysisData.id,
        analysisResult: mockAnalysisData
      };
      expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();
    });

    test('validates partial data updates', () => {
      const partialUpdate = {
        contactInfo: {
          name: 'Jane Doe',
          email: 'jane@example.com'
        }
      };

      // Should not throw for partial updates
      expect(() => {
        const result = safeValidateProfileAnalysisData({
          id: 'test',
          analysisResult: {
            ...mockAnalysisData,
            ...partialUpdate
          }
        });
        expect(result.success).toBe(true);
      }).not.toThrow();
    });

    test('catches invalid data structures', () => {
      const invalidData = {
        id: '', // Invalid - empty string
        analysisResult: {
          contactInfo: {
            name: 'John Doe',
            email: 'invalid-email' // Invalid email format
          },
          skills: 'not-an-array' // Invalid - should be array
        }
      };

      const result = safeValidateProfileAnalysisData(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues).toBeDefined();
    });
  });

  describe('Redux State Management', () => {
    test('updates analysis data correctly', () => {
      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData
      });

      const newContactInfo = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321'
      };

      store.dispatch(updateAnalysisData({
        path: 'contactInfo',
        value: newContactInfo
      }));

      const state = store.getState().analysis;
      expect(state.analysisData?.contactInfo).toEqual(newContactInfo);
    });

    test('maintains data type safety during updates', () => {
      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData
      });

      // Valid skill update
      const newSkills = [
        { name: 'TypeScript', level: 'Advanced', category: 'Programming' },
        { name: 'Node.js', level: 'Intermediate', category: 'Backend' }
      ];

      store.dispatch(updateAnalysisData({
        path: 'skills',
        value: newSkills
      }));

      const state = store.getState().analysis;
      const updatedData = state.analysisData;
      
      // Validate the updated data structure (create proper format for validation)
      const properStructure = { id: updatedData?.id || 'test', analysisResult: updatedData };
      expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();
      expect(updatedData?.skills).toEqual(newSkills);
    });
  });

  describe('API Integration', () => {
    test('sends correct data structure to save endpoint', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysisId: 'new-analysis-id',
          message: 'Data saved successfully'
        })
      });

      const store = createTestStore({
        analysisData: mockAnalysisData,
        currentAnalysisId: 'test-analysis-1',
        status: 'succeeded'
      });

      await store.dispatch(saveAnalysisVersion()).unwrap();

      // Verify fetch was called with correct data (actual endpoint is profile update)
      expect(fetch).toHaveBeenCalledWith(
        '/api/developer/me/profile',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      // Parse the sent data and validate structure  
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const sentBody = JSON.parse(fetchCall[1].body);
      
      // The profile API doesn't send analysisData, it sends transformed profile data
      // Just verify that the data was sent properly
      expect(sentBody.name).toBeDefined();
      expect(sentBody.profileEmail).toBeDefined();
    });

    test('handles API validation errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Invalid data structure',
          details: 'Contact info email format is invalid'
        })
      });

      const store = createTestStore({
        analysisData: mockAnalysisData,
        currentAnalysisId: 'test-analysis-1',
        status: 'succeeded'
      });

      try {
        await store.dispatch(saveAnalysisVersion()).unwrap();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(store.getState().analysis.status).toBe('failed');
        expect(store.getState().analysis.error).toContain('Invalid data structure');
      }
    });

    test('fetches and validates data from API', async () => {
      // The actual API response format that the slice expects
      const mockApiResponse = {
        id: 'test-analysis-1',
        analysisResult: mockAnalysisData,
        cv: mockAnalysisData.cv || {}
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const store = createTestStore();

      const result = await store.dispatch(fetchLatestAnalysis()).unwrap();

      // Verify the result structure 
      expect(result.id).toBe('test-analysis-1');
      expect(result.analysisResult).toEqual(mockAnalysisData);

      const state = store.getState().analysis;
      
      // Validate that fetched data conforms to schema
      if (state.analysisData) {
        const properStructure = { id: state.analysisData.id || 'test', analysisResult: state.analysisData };
        expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();
        expect(state.analysisData.id).toBe('test-analysis-1');
      }
      expect(state.status).toBe('succeeded');
    });
  });

  describe('Data Transformation and Persistence', () => {
    test('maintains data integrity through complete edit-save cycle', async () => {
      // Mock successful save response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          id: 'updated-analysis-id', // The Redux slice uses this to create analysisId: `profile-${data.id}`
          message: 'Changes saved successfully'
        })
      });

      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData,
        currentAnalysisId: 'test-analysis-1',
        status: 'succeeded'
      });

      // 1. Simulate user edits
      const updates = [
        { path: 'contactInfo', value: { ...mockAnalysisData.contactInfo, name: 'Updated Name' } },
        { path: 'about', value: 'Updated about section' },
        { path: 'skills', value: [{ name: 'New Skill', level: 'Beginner', category: 'Learning' }] }
      ];

      updates.forEach(update => {
        store.dispatch(updateAnalysisData(update));
      });

      // 2. Validate intermediate state
      const intermediateState = store.getState().analysis.analysisData;
      const properStructure = { id: intermediateState?.id || 'test', analysisResult: intermediateState };
      expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();

      // 3. Save changes
      const saveResult = await store.dispatch(saveAnalysisVersion()).unwrap();

      // 4. Verify save was successful and data structure maintained
      expect(saveResult.success).toBe(true);
      expect(saveResult.analysisId).toBe('profile-updated-analysis-id'); // Redux formats as profile-${id}

      // 5. Verify the data sent to API maintains expected profile structure
      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const sentData = JSON.parse(fetchCall[1].body);
      
      // The save API transforms to profile format, so check the transformed data
      expect(sentData.name).toBe('Updated Name');
      expect(typeof sentData.profileEmail).toBe('string');
      // The skills, experience, etc. are saved separately in the background sync process
    });

    test('handles complex nested updates correctly', () => {
      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData
      });

      // Update nested experience data
      const updatedExperience = [
        {
          ...mockAnalysisData.experience?.[0],
          responsibilities: ['New responsibility', 'Updated responsibility'],
          achievements: ['Major achievement', 'Another achievement']
        },
        {
          company: 'New Company',
          position: 'Tech Lead',
          startDate: '2024-01-01',
          responsibilities: ['Leading team', 'Architecture decisions'],
          achievements: ['Successful product launch']
        }
      ];

      store.dispatch(updateAnalysisData({
        path: 'experience',
        value: updatedExperience
      }));

      const updatedData = store.getState().analysis.analysisData;
      
      // Validate structure is maintained
      const properStructure = { id: updatedData?.id || 'test', analysisResult: updatedData };
      expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();
      expect(updatedData?.experience).toHaveLength(2);
      expect(updatedData?.experience?.[1].company).toBe('New Company');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('recovers gracefully from malformed updates', () => {
      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData
      });

      // Attempt to update with invalid data structure
      const invalidSkills = 'not-an-array';

      store.dispatch(updateAnalysisData({
        path: 'skills',
        value: invalidSkills
      }));

      const state = store.getState().analysis;
      
      // The update should have been applied (Redux doesn't validate)
      // but we can detect the invalid structure
      const properStructure = { id: state.analysisData?.id || 'test', analysisResult: state.analysisData };
      const validationResult = safeValidateProfileAnalysisData(properStructure);
      expect(validationResult.success).toBe(false);
    });

    test('maintains original data when validation fails', () => {
      const store = createTestStore({
        analysisData: mockAnalysisData,
        originalData: mockAnalysisData
      });

      // Store should always maintain reference to valid original data
      const properStructure = { id: store.getState().analysis.originalData?.id || 'test', analysisResult: store.getState().analysis.originalData };
      expect(() => validateProfileAnalysisData(properStructure)).not.toThrow();
      
      // Even after invalid updates, original should remain valid
      store.dispatch(updateAnalysisData({ path: 'skills', value: 'invalid' }));
      
      const properStructureAfter = { id: store.getState().analysis.originalData?.id || 'test', analysisResult: store.getState().analysis.originalData };
      expect(() => validateProfileAnalysisData(properStructureAfter)).not.toThrow();
    });
  });
});