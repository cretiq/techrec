/**
 * Integration Test: Complete Save Data Flow
 * 
 * This test validates the complete data flow from Redux transformation
 * to API endpoint without getting caught up in complex mocking.
 * 
 * It focuses on the CRITICAL DATA INTEGRITY ISSUES we identified:
 * 1. Personal projects complete loss
 * 2. Experience teamSize/techStack hardcoded data loss  
 * 3. Experience projects data loss
 * 4. Education GPA/honors data loss
 * 5. Invalid date handling
 */

import { configureStore } from '@reduxjs/toolkit';
import analysisSlice, { saveAnalysisVersion, type AnalysisState } from '@/lib/features/analysisSlice';
import type { ProfileAnalysisData } from '@/types/cv';

// Mock fetch to capture the actual payload sent to the API
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Helper to create test store with analysis data
const createTestStore = (analysisData: ProfileAnalysisData | null) => {
  const initialState: AnalysisState = {
    currentAnalysisId: analysisData ? 'test-analysis-1' : null,
    analysisData,
    originalData: analysisData,
    suggestions: [],
    status: 'idle',
    error: null,
    recentlyUpdatedPaths: [],
  };

  return configureStore({
    reducer: { analysis: analysisSlice },
    preloadedState: { analysis: initialState }
  });
};

// Complete test data that should be preserved
const createCompleteAnalysisData = (): ProfileAnalysisData => ({
  contactInfo: {
    name: 'Sarah Developer',
    email: 'sarah@example.com',
    phone: '+1-555-0100',
    location: '456 Tech Street, Austin, TX', // Maps to address
    linkedin: 'https://linkedin.com/in/sarahdev',
    github: 'https://github.com/sarahdev',
    website: 'https://sarahdev.com'
  },
  about: 'Full-stack developer with 5 years experience in modern web technologies.',
  skills: [
    { name: 'TypeScript', category: 'Programming Languages', level: 'EXPERT' },
    { name: 'Vue.js', category: 'Frontend Frameworks', level: 'ADVANCED' },
    { name: 'GraphQL', category: 'APIs' } // Missing level - should default to INTERMEDIATE
  ],
  experience: [
    {
      title: 'Lead Frontend Developer',
      company: 'InnovateTech',
      description: 'Led frontend architecture for SaaS platform',
      location: 'Austin, TX',
      startDate: '2020-06-01T00:00:00.000Z',
      endDate: null,
      current: true,
      responsibilities: ['Architect frontend solutions', 'Mentor junior developers'],
      achievements: ['Reduced load time by 60%', 'Implemented design system'],
      // These fields are CRITICAL and currently get lost
      teamSize: 8,
      techStack: ['Vue.js', 'TypeScript', 'GraphQL', 'Vite'],
      projects: [
        {
          name: 'Customer Dashboard Redesign',
          description: 'Complete redesign of customer analytics dashboard',
          technologies: ['Vue.js', 'D3.js', 'GraphQL'],
          teamSize: 4,
          role: 'Tech Lead'
        }
      ]
    }
  ],
  education: [
    {
      degree: 'Master of Computer Science',
      institution: 'University of Texas at Austin',
      year: '2019',
      location: 'Austin, TX',
      startDate: '2017-09-01T00:00:00.000Z',
      endDate: '2019-05-01T00:00:00.000Z',
      // These fields are CRITICAL and currently get lost
      gpa: 3.9,
      honors: ['Summa Cum Laude', 'Outstanding Graduate Student Award'],
      activities: ['ACM Programming Team', 'Graduate Teaching Assistant']
    }
  ],
  achievements: [
    {
      title: 'Google Cloud Professional Developer',
      description: 'Professional level GCP certification',
      date: '2023-03-01T00:00:00.000Z',
      url: 'https://cloud.google.com/certification',
      issuer: 'Google Cloud'
    }
  ],
  // This ENTIRE section gets lost in transformation
  personalProjects: [
    {
      name: 'DevTools Chrome Extension',
      description: 'Browser extension for developer productivity',
      technologies: ['TypeScript', 'Chrome APIs', 'Webpack'],
      githubUrl: 'https://github.com/sarahdev/devtools-extension',
      liveUrl: 'https://chrome.google.com/webstore/detail/devtools',
      startDate: '2022-01-01T00:00:00.000Z',
      endDate: null,
      status: 'active'
    }
  ]
});

describe('Complete Save Data Flow Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'saved-profile-123', success: true })
    } as Response);
  });

  describe('Critical Data Integrity Issues', () => {
    it('should identify personal projects complete loss in transformation', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      // Extract the payload that was sent to the API
      expect(mockFetch).toHaveBeenCalledWith('/api/developer/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      });
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Personal projects should be included but aren't
      expect(analysisData.personalProjects).toHaveLength(1); // Original has projects
      expect(payload).not.toHaveProperty('personalProjects'); // Payload doesn't
      
      console.error('🚨 CONFIRMED: Personal projects completely lost in transformation');
      console.log('Original had:', analysisData.personalProjects?.length, 'projects');
      console.log('Payload has:', payload.personalProjects ? payload.personalProjects.length : 'NO personalProjects field');
    });

    it('should identify experience team data loss in transformation', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Team size and tech stack should be preserved
      const originalExp = analysisData.experience![0];
      const payloadExp = payload.experience[0];
      
      expect(originalExp.teamSize).toBe(8); // Original has team size
      expect(originalExp.techStack).toEqual(['Vue.js', 'TypeScript', 'GraphQL', 'Vite']); // Original has tech stack
      expect(originalExp.projects).toHaveLength(1); // Original has projects
      
      expect(payloadExp.teamSize).toBeNull(); // Payload loses team size
      expect(payloadExp.techStack).toEqual([]); // Payload loses tech stack
      expect(payloadExp).not.toHaveProperty('projects'); // Payload loses projects
      
      console.error('🚨 CONFIRMED: Experience team data and projects lost in transformation');
      console.log('Original teamSize:', originalExp.teamSize, '→ Payload teamSize:', payloadExp.teamSize);
      console.log('Original techStack length:', originalExp.techStack?.length, '→ Payload techStack length:', payloadExp.techStack?.length);
      console.log('Original projects:', originalExp.projects?.length, '→ Payload projects:', payloadExp.projects ? 'exists' : 'MISSING');
    });

    it('should identify education details loss in transformation', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Education details should be preserved
      const originalEdu = analysisData.education![0];
      const payloadEdu = payload.education[0];
      
      expect(originalEdu.gpa).toBe(3.9); // Original has GPA
      expect(originalEdu.honors).toEqual(['Summa Cum Laude', 'Outstanding Graduate Student Award']); // Original has honors
      expect(originalEdu.activities).toEqual(['ACM Programming Team', 'Graduate Teaching Assistant']); // Original has activities
      
      expect(payloadEdu.gpa).toBeNull(); // Payload loses GPA
      expect(payloadEdu.honors).toEqual([]); // Payload loses honors
      expect(payloadEdu.activities).toEqual([]); // Payload loses activities
      
      console.error('🚨 CONFIRMED: Education details (GPA, honors, activities) lost in transformation');
      console.log('Original GPA:', originalEdu.gpa, '→ Payload GPA:', payloadEdu.gpa);
      console.log('Original honors:', originalEdu.honors?.length, '→ Payload honors:', payloadEdu.honors?.length);
      console.log('Original activities:', originalEdu.activities?.length, '→ Payload activities:', payloadEdu.activities?.length);
    });

    it('should identify missing title field issue', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Title field handling
      expect(analysisData.contactInfo).not.toHaveProperty('title'); // Original contactInfo has no title
      expect(payload.title).toBe('Developer'); // Payload defaults to 'Developer'
      
      console.error('🚨 CONFIRMED: User\'s professional title replaced with generic "Developer"');
      console.log('ContactInfo fields:', Object.keys(analysisData.contactInfo || {}));
      console.log('Payload title:', payload.title);
    });

    it('should identify field mapping issues', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Field mapping
      expect(analysisData.contactInfo?.location).toBe('456 Tech Street, Austin, TX'); // Original has 'location'
      expect(payload.contactInfo?.address).toBe('456 Tech Street, Austin, TX'); // Payload has 'address'
      expect(payload.contactInfo).not.toHaveProperty('location'); // location field removed
      
      console.log('✅ CONFIRMED: Field mapping location → address works correctly');
    });

    it('should identify skill level defaulting behavior', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Skill level defaults
      const originalSkillWithoutLevel = analysisData.skills?.find(s => s.name === 'GraphQL');
      const payloadSkillWithoutLevel = payload.skills?.find((s: any) => s.name === 'GraphQL');
      
      expect(originalSkillWithoutLevel?.level).toBeUndefined(); // Original missing level
      expect(payloadSkillWithoutLevel?.level).toBe('INTERMEDIATE'); // Payload gets default
      
      console.log('✅ CONFIRMED: Missing skill levels default to INTERMEDIATE correctly');
    });

    it('should identify invalid date handling issue', async () => {
      const analysisData = createCompleteAnalysisData();
      // Corrupt a date
      analysisData.experience![0].startDate = 'not-a-valid-date';
      
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // CRITICAL TEST: Invalid date handling
      expect(payload.experience[0].startDate).toBe('not-a-valid-date'); // Invalid date passed through
      
      console.error('🚨 CONFIRMED: Invalid dates pass through transformation without validation');
      console.log('Invalid date in payload:', payload.experience[0].startDate);
    });
  });

  describe('Data Transformation Summary Report', () => {
    it('should generate comprehensive data loss report', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // Generate comprehensive report of what gets lost
      const dataLossReport = {
        personalProjects: {
          original: analysisData.personalProjects?.length || 0,
          payload: payload.personalProjects?.length || 0,
          lost: (analysisData.personalProjects?.length || 0) - (payload.personalProjects?.length || 0)
        },
        experienceTeamSize: {
          original: analysisData.experience?.[0]?.teamSize,
          payload: payload.experience?.[0]?.teamSize,
          lost: (analysisData.experience?.[0]?.teamSize !== null) && (payload.experience?.[0]?.teamSize === null)
        },
        experienceTechStack: {
          original: analysisData.experience?.[0]?.techStack?.length || 0,
          payload: payload.experience?.[0]?.techStack?.length || 0,
          lost: (analysisData.experience?.[0]?.techStack?.length || 0) - (payload.experience?.[0]?.techStack?.length || 0)
        },
        experienceProjects: {
          original: analysisData.experience?.[0]?.projects?.length || 0,
          payload: payload.experience?.[0]?.projects?.length || 0,
          lost: (analysisData.experience?.[0]?.projects?.length || 0) - (payload.experience?.[0]?.projects?.length || 0)
        },
        educationGPA: {
          original: analysisData.education?.[0]?.gpa,
          payload: payload.education?.[0]?.gpa,
          lost: (analysisData.education?.[0]?.gpa !== null) && (payload.education?.[0]?.gpa === null)
        },
        educationHonors: {
          original: analysisData.education?.[0]?.honors?.length || 0,
          payload: payload.education?.[0]?.honors?.length || 0,
          lost: (analysisData.education?.[0]?.honors?.length || 0) - (payload.education?.[0]?.honors?.length || 0)
        },
        educationActivities: {
          original: analysisData.education?.[0]?.activities?.length || 0,
          payload: payload.education?.[0]?.activities?.length || 0,
          lost: (analysisData.education?.[0]?.activities?.length || 0) - (payload.education?.[0]?.activities?.length || 0)
        }
      };
      
      console.log('\n📊 COMPREHENSIVE DATA LOSS REPORT:');
      console.log('=====================================');
      
      Object.entries(dataLossReport).forEach(([field, report]) => {
        const { original, payload, lost } = report;
        const status = lost ? '🚨 LOST' : '✅ PRESERVED';
        console.log(`${status} ${field}: ${original} → ${payload} (lost: ${lost})`);
      });
      
      const totalLossCount = Object.values(dataLossReport).filter(r => r.lost).length;
      const totalPreservedCount = Object.values(dataLossReport).filter(r => !r.lost).length;
      
      console.log('\n📈 SUMMARY:');
      console.log(`✅ Data preserved: ${totalPreservedCount} fields`);
      console.log(`🚨 Data lost: ${totalLossCount} fields`);
      console.log(`📊 Data integrity: ${Math.round((totalPreservedCount / (totalPreservedCount + totalLossCount)) * 100)}%`);
      
      // The test should document the severity of data loss
      expect(totalLossCount).toBeGreaterThan(0); // We expect data loss with current implementation
      expect(totalLossCount).toBeGreaterThanOrEqual(5); // At least 5 critical data loss issues
    });
  });

  describe('API Request Structure Validation', () => {
    it('should verify correct API endpoint and headers', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      expect(mockFetch).toHaveBeenCalledWith('/api/developer/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      });
      
      console.log('✅ CONFIRMED: Correct API endpoint and headers');
    });

    it('should verify payload structure matches ProfileUpdateSchema expectations', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const payload = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      
      // Verify expected top-level fields
      const expectedFields = ['name', 'title', 'profileEmail', 'about', 'contactInfo', 'skills', 'experience', 'education', 'achievements'];
      const payloadFields = Object.keys(payload);
      
      expectedFields.forEach(field => {
        expect(payloadFields).toContain(field);
      });
      
      // Check for unexpected fields that might be missing from schema
      const unexpectedFields = payloadFields.filter(field => !expectedFields.includes(field));
      
      console.log('📋 PAYLOAD STRUCTURE ANALYSIS:');
      console.log('Expected fields present:', expectedFields.filter(f => payloadFields.includes(f)));
      console.log('Missing expected fields:', expectedFields.filter(f => !payloadFields.includes(f)));
      console.log('Unexpected fields:', unexpectedFields);
      
      if (unexpectedFields.includes('personalProjects')) {
        console.log('✅ personalProjects field present in payload');
      } else {
        console.error('🚨 personalProjects field missing from payload (confirms data loss)');
      }
    });
  });
});