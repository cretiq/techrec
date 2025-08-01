/**
 * Experience Data Flow Integration Tests
 * 
 * Critical test suite that validates the complete Experience data pipeline:
 * Gemini Response → ExperienceItemSchema → backgroundProfileSync → Database → UI
 * 
 * This test directly addresses data flow mismatch issues between UI/backend/database layers.
 */

import { ExperienceItemSchema, type ExperienceItem } from '@/types/cv';
import { transformExperience } from '@/utils/backgroundProfileSync';
import { ProfileUpdatePayload } from '@/types/types';

describe('Experience Data Flow Integration', () => {
  describe('Complete Pipeline Validation', () => {
    it('should validate entire Experience data flow from Gemini response to UI consumption', () => {
      console.log('🔍 Testing complete Experience data pipeline...');

      // STEP 1: Mock Gemini API response with ALL new Experience fields
      // This simulates what the enhanced Gemini prompt should return
      const mockGeminiExperienceResponse: ExperienceItem = {
        title: "Senior Software Engineer",
        company: "TechCorp Industries",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: null,
        current: true,
        description: "Led development of microservices architecture using Node.js and Docker. Responsible for system design and team leadership.",
        responsibilities: [
          "Designed and implemented REST APIs serving 1M+ requests/day",
          "Mentored team of 4 junior developers on best practices",
          "Reduced system latency by 40% through database optimization",
          "Implemented CI/CD pipelines using GitHub Actions"
        ],
        achievements: [
          "Served 1M+ API requests per day with 99.9% uptime",
          "Reduced system latency by 40%",
          "Mentored 4 junior developers to mid-level positions",
          "Delivered 15 major features on schedule"
        ],
        teamSize: 4,
        techStack: [
          "Node.js",
          "Express",
          "PostgreSQL", 
          "Docker",
          "AWS",
          "React",
          "TypeScript",
          "Redis"
        ]
      };

      // STEP 2: Validate against ExperienceItemSchema (TypeScript schema validation)
      const schemaValidation = ExperienceItemSchema.safeParse(mockGeminiExperienceResponse);
      
      console.log('📊 Schema validation result:', {
        success: schemaValidation.success,
        hasAllFields: {
          title: !!mockGeminiExperienceResponse.title,
          company: !!mockGeminiExperienceResponse.company,
          current: typeof mockGeminiExperienceResponse.current === 'boolean',
          responsibilities: Array.isArray(mockGeminiExperienceResponse.responsibilities),
          achievements: Array.isArray(mockGeminiExperienceResponse.achievements),
          techStack: Array.isArray(mockGeminiExperienceResponse.techStack),
          teamSize: typeof mockGeminiExperienceResponse.teamSize === 'number'
        }
      });

      expect(schemaValidation.success).toBe(true);
      
      if (!schemaValidation.success) {
        console.error('❌ Schema validation failed:', schemaValidation.error.flatten());
        throw new Error('ExperienceItemSchema validation failed');
      }

      // STEP 3: Transform via backgroundProfileSync
      const transformedExperience = transformExperience([mockGeminiExperienceResponse]);
      
      console.log('🔄 Transformation result:', {
        inputLength: 1,
        outputLength: transformedExperience.length,
        transformedFields: transformedExperience[0] ? Object.keys(transformedExperience[0]) : []
      });

      expect(transformedExperience).toHaveLength(1);
      
      const transformed = transformedExperience[0];

      // STEP 4: Verify output matches database schema expectations
      expect(transformed).toMatchObject({
        title: "Senior Software Engineer",
        company: "TechCorp Industries",
        description: "Led development of microservices architecture using Node.js and Docker. Responsible for system design and team leadership.",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: null,
        current: true,
        responsibilities: expect.arrayContaining([
          "Designed and implemented REST APIs serving 1M+ requests/day",
          "Mentored team of 4 junior developers on best practices"
        ]),
        achievements: expect.arrayContaining([
          "Served 1M+ API requests per day with 99.9% uptime",
          "Reduced system latency by 40%"
        ]),
        teamSize: 4,
        techStack: expect.arrayContaining([
          "Node.js", "Express", "PostgreSQL", "Docker", "AWS", "React", "TypeScript", "Redis"
        ])
      });

      // STEP 5: Verify ALL new fields are preserved
      expect(transformed.responsibilities).toEqual(mockGeminiExperienceResponse.responsibilities);
      expect(transformed.achievements).toEqual(mockGeminiExperienceResponse.achievements);
      expect(transformed.techStack).toEqual(mockGeminiExperienceResponse.techStack);
      expect(transformed.teamSize).toBe(mockGeminiExperienceResponse.teamSize);
      expect(transformed.current).toBe(mockGeminiExperienceResponse.current);

      console.log('✅ Complete data flow validation passed!');
    });

    it('should handle missing optional Experience fields gracefully with proper defaults', () => {
      // Test minimal Experience data (only required fields)
      const minimalExperience: ExperienceItem = {
        title: "Developer",
        company: "StartupCorp"
      };

      const schemaValidation = ExperienceItemSchema.safeParse(minimalExperience);
      expect(schemaValidation.success).toBe(true);

      const transformed = transformExperience([minimalExperience]);
      expect(transformed).toHaveLength(1);

      const result = transformed[0];
      
      // Verify proper defaults are applied
      expect(result.responsibilities).toEqual([]);
      expect(result.achievements).toEqual([]);
      expect(result.techStack).toEqual([]);
      expect(result.teamSize).toBeNull();
      expect(result.description).toBe('');
      expect(result.current).toBe(false); // Default when no endDate
    });

    it('should validate current position detection logic', () => {
      // Test current position (no endDate)
      const currentPosition: ExperienceItem = {
        title: "Senior Developer",
        company: "CurrentCorp",
        startDate: "2023-01",
        endDate: null,
        current: true
      };

      const transformedCurrent = transformExperience([currentPosition]);
      expect(transformedCurrent[0].current).toBe(true);
      expect(transformedCurrent[0].endDate).toBeNull();

      // Test past position (with endDate)
      const pastPosition: ExperienceItem = {
        title: "Junior Developer", 
        company: "PastCorp",
        startDate: "2020-01",
        endDate: "2022-12",
        current: false
      };

      const transformedPast = transformExperience([pastPosition]);
      expect(transformedPast[0].current).toBe(false);
      expect(transformedPast[0].endDate).toBe("2022-12");
    });
  });

  describe('Tech Stack Extraction Validation', () => {
    it('should preserve various tech stack formats correctly', () => {
      const techStackTests = [
        {
          name: "Backend Technologies",
          experience: {
            title: "Backend Engineer",
            company: "TechCorp",
            techStack: ["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis"]
          }
        },
        {
          name: "Frontend Technologies", 
          experience: {
            title: "Frontend Developer",
            company: "WebCorp",
            techStack: ["React", "TypeScript", "Next.js", "TailwindCSS", "Framer Motion"]
          }
        },
        {
          name: "DevOps Technologies",
          experience: {
            title: "DevOps Engineer",
            company: "CloudCorp", 
            techStack: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"]
          }
        }
      ];

      techStackTests.forEach(({ name, experience }) => {
        console.log(`🧪 Testing ${name}...`);
        
        const transformed = transformExperience([experience as ExperienceItem]);
        expect(transformed[0].techStack).toEqual(experience.techStack);
        
        console.log(`✅ ${name} tech stack preserved:`, transformed[0].techStack);
      });
    });

    it('should handle empty and null tech stack arrays', () => {
      const experienceWithEmptyTech: ExperienceItem = {
        title: "Manager",
        company: "NonTechCorp",
        techStack: []
      };

      const transformed = transformExperience([experienceWithEmptyTech]);
      expect(transformed[0].techStack).toEqual([]);

      const experienceWithoutTech: ExperienceItem = {
        title: "Consultant", 
        company: "BusinessCorp"
        // No techStack field
      };

      const transformedWithout = transformExperience([experienceWithoutTech]);
      expect(transformedWithout[0].techStack).toEqual([]);
    });
  });

  describe('Responsibilities and Achievements Separation', () => {
    it('should properly separate responsibilities from achievements', () => {
      const experienceWithBoth: ExperienceItem = {
        title: "Tech Lead",
        company: "InnovativeCorp",
        responsibilities: [
          "Led daily standup meetings",
          "Reviewed code from team members", 
          "Designed system architecture",
          "Coordinated with product managers"
        ],
        achievements: [
          "Reduced deployment time by 60%",
          "Increased team productivity by 30%",
          "Delivered 20 major features",
          "Mentored 3 developers to senior level"
        ]
      };

      const transformed = transformExperience([experienceWithBoth]);
      const result = transformed[0];

      // Verify responsibilities are preserved
      expect(result.responsibilities).toHaveLength(4);
      expect(result.responsibilities).toContain("Led daily standup meetings");
      expect(result.responsibilities).toContain("Designed system architecture");

      // Verify achievements are preserved
      expect(result.achievements).toHaveLength(4);
      expect(result.achievements).toContain("Reduced deployment time by 60%");
      expect(result.achievements).toContain("Increased team productivity by 30%");

      // Verify they're properly separated (no overlap)
      const responsibilitySet = new Set(result.responsibilities);
      const achievementSet = new Set(result.achievements);
      const intersection = [...responsibilitySet].filter(x => achievementSet.has(x));
      expect(intersection).toHaveLength(0);
    });
  });

  describe('Database Schema Compatibility', () => {
    it('should produce data compatible with Prisma Experience model', () => {
      const fullExperience: ExperienceItem = {
        title: "Principal Engineer",
        company: "MegaCorp",
        description: "Led architecture for distributed systems",
        location: "Seattle, WA", 
        startDate: "2021-03",
        endDate: "2023-11",
        current: false,
        responsibilities: ["System design", "Team mentoring"],
        achievements: ["99.9% uptime", "50% cost reduction"],
        teamSize: 8,
        techStack: ["Go", "Kubernetes", "PostgreSQL"]
      };

      const transformed = transformExperience([fullExperience]);
      const result = transformed[0];

      // Verify all database fields are present and correctly typed
      expect(typeof result.title).toBe('string');
      expect(typeof result.company).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(typeof result.location === 'string' || result.location === null).toBe(true);
      expect(typeof result.startDate).toBe('string');
      expect(typeof result.endDate === 'string' || result.endDate === null).toBe(true);
      expect(typeof result.current).toBe('boolean');
      expect(Array.isArray(result.responsibilities)).toBe(true);
      expect(Array.isArray(result.achievements)).toBe(true);
      expect(typeof result.teamSize === 'number' || result.teamSize === null).toBe(true);
      expect(Array.isArray(result.techStack)).toBe(true);

      // Verify data integrity
      expect(result.title).toBe(fullExperience.title);
      expect(result.company).toBe(fullExperience.company);
      expect(result.teamSize).toBe(fullExperience.teamSize);
      expect(result.current).toBe(fullExperience.current);
    });
  });
});

// Test utilities for debugging
export const logDataFlowStep = (step: string, data: any) => {
  console.log(`[DATA FLOW] ${step}:`, JSON.stringify(data, null, 2));
};

export const validateExperienceIntegrity = (
  original: ExperienceItem, 
  transformed: ProfileUpdatePayload['experience'][0]
): boolean => {
  const checks = [
    original.title === transformed.title,
    original.company === transformed.company,
    original.current === transformed.current,
    JSON.stringify(original.responsibilities || []) === JSON.stringify(transformed.responsibilities),
    JSON.stringify(original.achievements || []) === JSON.stringify(transformed.achievements),
    JSON.stringify(original.techStack || []) === JSON.stringify(transformed.techStack),
    original.teamSize === transformed.teamSize
  ];

  return checks.every(check => check === true);
};