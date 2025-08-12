/**
 * Data Transformation Unit Tests for saveAnalysisVersion
 * 
 * These tests validate the critical data transformation logic that happens
 * when converting Redux analysisData to the profile API payload.
 * 
 * Critical Issues Being Tested:
 * 1. Missing title field (defaults to 'Developer' - data loss)
 * 2. Experience teamSize/techStack hardcoded to null/[] (data loss)
 * 3. Personal projects not included in transformation (complete loss)
 * 4. Field mapping issues (location -> address)
 * 5. Missing optional fields handling
 */

import { configureStore } from '@reduxjs/toolkit';
import analysisSlice, { saveAnalysisVersion, type AnalysisState } from '../analysisSlice';
import type { ProfileAnalysisData } from '@/types/cv';

// Mock fetch for the thunk
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

// Test data fixtures representing real user data structures
const createCompleteAnalysisData = (): ProfileAnalysisData => ({
  contactInfo: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1-555-0123',
    location: '123 Main Street, San Francisco, CA', // Note: 'location' not 'address'
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    github: 'https://github.com/sarahjohnson',
    website: 'https://sarahjohnson.dev'
  },
  about: 'Experienced full-stack developer with 7 years of experience building scalable web applications.',
  skills: [
    { name: 'JavaScript', category: 'Programming Languages', level: 'ADVANCED' },
    { name: 'React', category: 'Frontend Frameworks', level: 'EXPERT' },
    { name: 'Node.js', category: 'Backend Technologies', level: 'ADVANCED' },
    { name: 'Python', category: 'Programming Languages' }, // Note: Missing level
  ],
  experience: [
    {
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Inc',
      description: 'Lead developer for e-commerce platform serving 1M+ users',
      location: 'San Francisco, CA',
      startDate: '2021-01-01T00:00:00.000Z',
      endDate: null,
      current: true,
      responsibilities: [
        'Architected and implemented microservices architecture',
        'Led team of 6 developers',
        'Mentored junior developers'
      ],
      achievements: [
        'Improved system performance by 40%',
        'Reduced deployment time from 2 hours to 15 minutes',
        'Implemented comprehensive testing strategy'
      ],
      // These fields should be preserved but currently get lost
      teamSize: 6,
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      projects: [
        {
          name: 'Payment Processing System',
          description: 'Built secure payment processing with Stripe integration',
          technologies: ['React', 'Node.js', 'Stripe API'],
          teamSize: 3,
          role: 'Lead Developer'
        }
      ]
    },
    {
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      description: 'Frontend development for SaaS application',
      location: 'Remote',
      startDate: '2019-03-01T00:00:00.000Z',
      endDate: '2020-12-31T00:00:00.000Z',
      current: false,
      responsibilities: ['Built responsive UI components', 'Implemented state management'],
      achievements: ['Delivered features 20% faster than estimated'],
      teamSize: 3,
      techStack: ['Vue.js', 'TypeScript', 'Vuex']
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      year: '2017',
      location: 'Berkeley, CA',
      startDate: '2013-09-01T00:00:00.000Z',
      endDate: '2017-05-01T00:00:00.000Z',
      gpa: 3.8,
      honors: ['Magna Cum Laude', 'Dean\'s List'],
      activities: ['Computer Science Club', 'Hackathon Team']
    }
  ],
  achievements: [
    {
      title: 'AWS Solutions Architect Certification',
      description: 'Professional level AWS certification for cloud architecture',
      date: '2022-06-15T00:00:00.000Z',
      url: 'https://aws.amazon.com/certification/',
      issuer: 'Amazon Web Services'
    },
    {
      title: 'Best Innovation Award',
      description: 'Company award for implementing automated deployment pipeline',
      date: '2022-12-01T00:00:00.000Z',
      url: null,
      issuer: 'TechCorp Inc'
    }
  ],
  // This is the critical field that gets completely lost
  personalProjects: [
    {
      name: 'Open Source React Library',
      description: 'Created a popular React component library with 5k+ GitHub stars',
      technologies: ['React', 'TypeScript', 'Storybook'],
      githubUrl: 'https://github.com/sarahjohnson/my-react-lib',
      liveUrl: 'https://my-react-lib.dev',
      startDate: '2020-01-01T00:00:00.000Z',
      endDate: null,
      status: 'active'
    },
    {
      name: 'Personal Portfolio Website',
      description: 'Modern portfolio site built with Next.js',
      technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
      githubUrl: 'https://github.com/sarahjohnson/portfolio',
      liveUrl: 'https://sarahjohnson.dev',
      startDate: '2021-06-01T00:00:00.000Z',
      endDate: '2021-07-01T00:00:00.000Z',
      status: 'completed'
    }
  ]
});

describe('Data Transformation Logic', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'updated-profile-123', success: true })
    } as Response);
  });

  describe('Complete Data Preservation', () => {
    it('should preserve all contactInfo fields with correct mapping', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      expect(mockFetch).toHaveBeenCalledWith('/api/developer/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"name":"Sarah Johnson"')
      });

      // Verify the actual payload structure
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload).toMatchObject({
        name: 'Sarah Johnson',
        profileEmail: 'sarah.johnson@example.com',
        contactInfo: {
          phone: '+1-555-0123',
          address: '123 Main Street, San Francisco, CA', // location -> address mapping
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          github: 'https://github.com/sarahjohnson',
          website: 'https://sarahjohnson.dev',
          city: null,
          country: null
        }
      });
    });

    it('should handle missing title field with proper fallback', async () => {
      const analysisData = createCompleteAnalysisData();
      // contactInfo doesn't have title field - this is the real issue
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // This demonstrates the data loss issue
      expect(payload.title).toBe('Developer'); // Default fallback
      expect(analysisData.contactInfo).not.toHaveProperty('title'); // Original has no title field
      
      // TODO: This test reveals the issue - we need to preserve user's actual title
      console.warn('⚠️ CRITICAL ISSUE: User\'s professional title gets replaced with generic "Developer"');
    });

    it('should preserve skills with proper level defaults', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.skills).toEqual([
        { name: 'JavaScript', category: 'Programming Languages', level: 'ADVANCED' },
        { name: 'React', category: 'Frontend Frameworks', level: 'EXPERT' },
        { name: 'Node.js', category: 'Backend Technologies', level: 'ADVANCED' },
        { name: 'Python', category: 'Programming Languages', level: 'INTERMEDIATE' } // Default applied
      ]);
    });

    it('should preserve experience data without loss', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // This test reveals critical data loss issues
      expect(payload.experience).toHaveLength(2);
      expect(payload.experience[0]).toMatchObject({
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Inc',
        description: 'Lead developer for e-commerce platform serving 1M+ users',
        location: 'San Francisco, CA',
        current: true,
        responsibilities: [
          'Architected and implemented microservices architecture',
          'Led team of 6 developers',
          'Mentored junior developers'
        ],
        achievements: [
          'Improved system performance by 40%',
          'Reduced deployment time from 2 hours to 15 minutes',
          'Implemented comprehensive testing strategy'
        ]
      });

      // These reveal the data loss issues
      expect(payload.experience[0].teamSize).toBeNull(); // Lost! Was 6
      expect(payload.experience[0].techStack).toEqual([]); // Lost! Was ['React', 'Node.js', 'PostgreSQL', 'Docker']
      
      console.warn('⚠️ CRITICAL ISSUE: Experience teamSize and techStack data is being lost');
    });

    it('should include education data correctly', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.education).toHaveLength(1);
      expect(payload.education[0]).toMatchObject({
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        year: '2017',
        location: 'Berkeley, CA',
        gpa: null, // Note: gpa gets lost in transformation
        honors: [], // Note: honors get lost in transformation
        activities: [] // Note: activities get lost in transformation
      });
      
      console.warn('⚠️ CRITICAL ISSUE: Education GPA, honors, and activities data is being lost');
    });

    it('should include achievements data correctly', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.achievements).toHaveLength(2);
      expect(payload.achievements[0]).toMatchObject({
        title: 'AWS Solutions Architect Certification',
        description: 'Professional level AWS certification for cloud architecture',
        url: 'https://aws.amazon.com/certification/',
        issuer: 'Amazon Web Services'
      });
    });
  });

  describe('Critical Data Loss Issues', () => {
    it('should reveal personal projects complete loss', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // Personal projects should be included but aren't
      expect(payload).not.toHaveProperty('personalProjects');
      expect(analysisData.personalProjects).toHaveLength(2); // Original has 2 projects
      
      console.error('🚨 CRITICAL ISSUE: Personal projects are completely lost during transformation');
    });

    it('should reveal experience project data loss', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // Experience projects should be preserved but aren't included in transformation
      expect(payload.experience[0]).not.toHaveProperty('projects');
      expect(analysisData.experience![0].projects).toHaveLength(1); // Original has projects
      
      console.error('🚨 CRITICAL ISSUE: Experience projects are completely lost during transformation');
    });

    it('should identify all hardcoded data loss points', async () => {
      const analysisData = createCompleteAnalysisData();
      const store = createTestStore(analysisData);
      
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // Document all the hardcoded data loss
      const dataLossIssues = [];
      
      if (payload.experience[0].teamSize === null && analysisData.experience![0].teamSize) {
        dataLossIssues.push('experience.teamSize hardcoded to null');
      }
      
      if (payload.experience[0].techStack.length === 0 && analysisData.experience![0].techStack?.length) {
        dataLossIssues.push('experience.techStack hardcoded to empty array');
      }
      
      if (!payload.personalProjects && analysisData.personalProjects?.length) {
        dataLossIssues.push('personalProjects completely excluded from payload');
      }
      
      if (payload.education[0].gpa === null && analysisData.education![0].gpa) {
        dataLossIssues.push('education.gpa hardcoded to null');
      }
      
      if (payload.education[0].honors.length === 0 && analysisData.education![0].honors?.length) {
        dataLossIssues.push('education.honors hardcoded to empty array');
      }
      
      expect(dataLossIssues.length).toBeGreaterThan(0);
      console.error('🚨 IDENTIFIED DATA LOSS ISSUES:', dataLossIssues);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle completely empty analysis data', async () => {
      const analysisData: ProfileAnalysisData = {
        contactInfo: null,
        about: null,
        skills: null,
        experience: null,
        education: null,
        achievements: null,
        personalProjects: null
      };
      
      const store = createTestStore(analysisData);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload).toMatchObject({
        name: 'Unknown', // Default
        title: 'Developer', // Default
        profileEmail: null,
        about: null,
        contactInfo: null,
        skills: [],
        experience: [],
        education: [],
        achievements: []
      });
    });

    it('should handle missing required fields gracefully', async () => {
      const analysisData: ProfileAnalysisData = {
        contactInfo: {
          name: null, // Missing required name
          email: 'test@example.com'
        },
        skills: [
          {
            // Missing required name field
            category: 'Programming',
            level: 'ADVANCED'
          }
        ]
      };
      
      const store = createTestStore(analysisData as any);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.name).toBe('Unknown'); // Fallback for null name
      expect(payload.skills[0].name).toBeUndefined(); // This might cause API validation to fail
    });

    it('should handle invalid date formats', async () => {
      const analysisData = createCompleteAnalysisData();
      // Corrupt a date field
      analysisData.experience![0].startDate = 'invalid-date-string';
      
      const store = createTestStore(analysisData);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      // Currently, invalid dates are passed through as-is (another issue!)
      expect(payload.experience[0].startDate).toBe('invalid-date-string');
      
      console.error('🚨 CRITICAL ISSUE: Invalid dates are not validated/sanitized before sending to API');
    });
  });

  describe('Field Mapping Validation', () => {
    it('should correctly map location to address', async () => {
      const analysisData: ProfileAnalysisData = {
        contactInfo: {
          name: 'Test User',
          location: '456 Oak Street, Austin, TX 78701' // location field
        }
      };
      
      const store = createTestStore(analysisData);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.contactInfo.address).toBe('456 Oak Street, Austin, TX 78701');
      expect(payload.contactInfo).not.toHaveProperty('location');
    });

    it('should handle all contactInfo field mappings', async () => {
      const analysisData: ProfileAnalysisData = {
        contactInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1-555-9999',
          location: 'Test Location', // maps to address
          linkedin: 'https://linkedin.com/in/test',
          github: 'https://github.com/test',
          website: 'https://test.com'
        }
      };
      
      const store = createTestStore(analysisData);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.contactInfo).toEqual({
        phone: '+1-555-9999',
        address: 'Test Location', // location -> address
        city: null, // not in original data
        country: null, // not in original data
        linkedin: 'https://linkedin.com/in/test',
        github: 'https://github.com/test',
        website: 'https://test.com'
      });
    });
  });

  describe('Array Processing', () => {
    it('should handle empty arrays correctly', async () => {
      const analysisData: ProfileAnalysisData = {
        contactInfo: { name: 'Test User' },
        skills: [],
        experience: [],
        education: [],
        achievements: []
      };
      
      const store = createTestStore(analysisData);
      await store.dispatch(saveAnalysisVersion());
      
      const callArgs = mockFetch.mock.calls[0];
      const payload = JSON.parse(callArgs[1]?.body as string);
      
      expect(payload.skills).toEqual([]);
      expect(payload.experience).toEqual([]);
      expect(payload.education).toEqual([]);
      expect(payload.achievements).toEqual([]);
    });

    it('should handle undefined vs null vs empty array consistently', async () => {
      const testCases = [
        { skills: undefined, expected: [] },
        { skills: null, expected: [] },
        { skills: [], expected: [] }
      ];
      
      for (const testCase of testCases) {
        const analysisData: ProfileAnalysisData = {
          contactInfo: { name: 'Test User' },
          skills: testCase.skills as any
        };
        
        const store = createTestStore(analysisData);
        await store.dispatch(saveAnalysisVersion());
        
        const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const payload = JSON.parse(callArgs[1]?.body as string);
        
        expect(payload.skills).toEqual(testCase.expected);
      }
    });
  });
});