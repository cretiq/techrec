/**
 * Background Profile Sync Unit Tests
 * 
 * Tests the data transformation functions that convert CV analysis data 
 * to proper database format, focusing on the new Experience fields:
 * - techStack arrays
 * - teamSize numbers
 * - current position booleans
 * - achievements arrays 
 * - responsibilities arrays
 */

import {
  transformContactInfo,
  transformSkills,
  transformExperience,
  transformEducation,
  transformAchievements,
  syncCvDataToProfile
} from '../backgroundProfileSync';
import { 
  ContactInfoData, 
  Skill, 
  ExperienceItem, 
  EducationItem, 
  AchievementItem,
  ProfileAnalysisData 
} from '@/types/cv';
import { ProfileUpdatePayload } from '@/types/types';

// Mock Prisma for syncCvDataToProfile tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    developer: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }))
}));

describe('Background Profile Sync', () => {
  describe('Experience Transformation', () => {
    it('should transform complete Experience data with all new fields', () => {
      const mockCvExperience: ExperienceItem[] = [{
        title: "Senior Software Engineer",
        company: "TechCorp",
        description: "Led development of microservices architecture using modern technologies",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: null,
        current: true,
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
      }];

      console.log('🔄 Testing complete Experience transformation...');

      const result = transformExperience(mockCvExperience);

      expect(result).toHaveLength(1);
      
      const transformed = result[0];

      // Test basic fields
      expect(transformed.title).toBe("Senior Software Engineer");
      expect(transformed.company).toBe("TechCorp");
      expect(transformed.description).toBe("Led development of microservices architecture using modern technologies");
      expect(transformed.location).toBe("San Francisco, CA");
      expect(transformed.startDate).toBe("2022-01");
      expect(transformed.endDate).toBeNull();
      expect(transformed.current).toBe(true);

      // Test new array fields
      expect(Array.isArray(transformed.responsibilities)).toBe(true);
      expect(transformed.responsibilities).toHaveLength(4);
      expect(transformed.responsibilities).toEqual([
        "Designed and implemented REST APIs serving 1M+ requests/day",
        "Mentored team of 4 junior developers on best practices", 
        "Reduced system latency by 40% through database optimization",
        "Implemented CI/CD pipelines using GitHub Actions"
      ]);

      expect(Array.isArray(transformed.achievements)).toBe(true);
      expect(transformed.achievements).toHaveLength(4);
      expect(transformed.achievements).toEqual([
        "Served 1M+ API requests per day with 99.9% uptime",
        "Reduced system latency by 40%",
        "Mentored 4 junior developers to mid-level positions",
        "Delivered 15 major features on schedule"
      ]);

      expect(Array.isArray(transformed.techStack)).toBe(true);
      expect(transformed.techStack).toHaveLength(8);
      expect(transformed.techStack).toEqual([
        "Node.js", "Express", "PostgreSQL", "Docker", "AWS", "React", "TypeScript", "Redis"
      ]);

      // Test teamSize
      expect(transformed.teamSize).toBe(4);

      console.log('✅ Complete Experience transformation successful');
    });

    it('should handle missing optional Experience fields with proper defaults', () => {
      const minimalCvExperience: ExperienceItem[] = [{
        title: "Developer",
        company: "StartupCorp"
        // Missing all optional fields
      }];

      console.log('🔄 Testing minimal Experience transformation...');

      const result = transformExperience(minimalCvExperience);

      expect(result).toHaveLength(1);
      
      const transformed = result[0];

      // Test required fields
      expect(transformed.title).toBe("Developer");
      expect(transformed.company).toBe("StartupCorp");

      // Test default values for missing fields
      expect(transformed.description).toBe('');
      expect(transformed.location).toBeNull();
      expect(transformed.responsibilities).toEqual([]);
      expect(transformed.achievements).toEqual([]);
      expect(transformed.techStack).toEqual([]);
      expect(transformed.teamSize).toBeNull();
      expect(transformed.current).toBe(false); // Default when no endDate

      console.log('✅ Minimal Experience transformation with defaults successful');
    });

    it('should correctly determine current position status', () => {
      const testCases = [
        {
          name: "Current position (no endDate)",
          experience: {
            title: "Current Role",
            company: "CurrentCorp",
            startDate: "2023-01",
            endDate: null,
            current: true
          },
          expectedCurrent: true,
          expectedEndDate: null
        },
        {
          name: "Current position (empty endDate)",
          experience: {
            title: "Current Role",
            company: "CurrentCorp", 
            startDate: "2023-01",
            endDate: "",
            current: true
          },
          expectedCurrent: true,
          expectedEndDate: null
        },
        {
          name: "Past position (with endDate)",
          experience: {
            title: "Past Role",
            company: "PastCorp",
            startDate: "2020-01", 
            endDate: "2022-12",
            current: false
          },
          expectedCurrent: false,
          expectedEndDate: "2022-12"
        }
      ];

      testCases.forEach(({ name, experience, expectedCurrent, expectedEndDate }) => {
        console.log(`🧪 Testing ${name}...`);

        const result = transformExperience([experience as ExperienceItem]);
        
        expect(result[0].current).toBe(expectedCurrent);
        expect(result[0].endDate).toBe(expectedEndDate);

        console.log(`✅ ${name}: current=${result[0].current}, endDate=${result[0].endDate}`);
      });
    });

    it('should handle various techStack formats', () => {
      const techStackTestCases = [
        {
          name: "Full stack technologies",
          techStack: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
          expected: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"]
        },
        {
          name: "Backend only",
          techStack: ["Python", "Django", "MySQL"],
          expected: ["Python", "Django", "MySQL"]
        },
        {
          name: "Empty tech stack",
          techStack: [],
          expected: []
        },
        {
          name: "Single technology",
          techStack: ["JavaScript"],
          expected: ["JavaScript"]
        }
      ];

      techStackTestCases.forEach(({ name, techStack, expected }) => {
        console.log(`🧪 Testing ${name}...`);

        const experience: ExperienceItem = {
          title: "Developer",
          company: "TestCorp",
          techStack
        };

        const result = transformExperience([experience]);
        
        expect(result[0].techStack).toEqual(expected);
        console.log(`✅ ${name} tech stack:`, result[0].techStack);
      });
    });

    it('should preserve responsibilities and achievements separately', () => {
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

      console.log('🔄 Testing responsibilities and achievements separation...');

      const result = transformExperience([experienceWithBoth]);
      const transformed = result[0];

      // Verify both arrays are preserved
      expect(transformed.responsibilities).toHaveLength(4);
      expect(transformed.achievements).toHaveLength(4);
      
      // Verify content is correct
      expect(transformed.responsibilities).toContain("Led daily standup meetings");
      expect(transformed.responsibilities).toContain("Designed system architecture");
      
      expect(transformed.achievements).toContain("Reduced deployment time by 60%");
      expect(transformed.achievements).toContain("Increased team productivity by 30%");

      // Verify they don't overlap
      const responsibilitySet = new Set(transformed.responsibilities);
      const achievementSet = new Set(transformed.achievements);
      const intersection = [...responsibilitySet].filter(x => achievementSet.has(x));
      expect(intersection).toHaveLength(0);

      console.log('✅ Responsibilities and achievements properly separated');
    });

    it('should handle multiple Experience entries', () => {
      const multipleExperiences: ExperienceItem[] = [
        {
          title: "Senior Developer",
          company: "CurrentCorp",
          current: true,
          techStack: ["React", "Node.js"],
          teamSize: 5
        },
        {
          title: "Junior Developer", 
          company: "PastCorp",
          current: false,
          endDate: "2021-12",
          techStack: ["JavaScript", "HTML"],
          teamSize: 2
        }
      ];

      console.log('🔄 Testing multiple Experience entries...');

      const result = transformExperience(multipleExperiences);

      expect(result).toHaveLength(2);
      
      // Test first experience
      expect(result[0].title).toBe("Senior Developer");
      expect(result[0].current).toBe(true);
      expect(result[0].techStack).toEqual(["React", "Node.js"]);
      expect(result[0].teamSize).toBe(5);

      // Test second experience
      expect(result[1].title).toBe("Junior Developer");
      expect(result[1].current).toBe(false);
      expect(result[1].endDate).toBe("2021-12");
      expect(result[1].techStack).toEqual(["JavaScript", "HTML"]);
      expect(result[1].teamSize).toBe(2);

      console.log('✅ Multiple Experience entries transformed correctly');
    });
  });

  describe('Contact Info Transformation', () => {
    it('should transform complete contact info', () => {
      const mockContactInfo: ContactInfoData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        website: "https://johndoe.dev"
      };

      const result = transformContactInfo(mockContactInfo);

      expect(result).toEqual({
        phone: "+1-555-0123",
        address: "San Francisco, CA", // location -> address mapping
        city: null,
        country: null,
        linkedin: "https://linkedin.com/in/johndoe",
        github: "https://github.com/johndoe",
        website: "https://johndoe.dev"
      });
    });

    it('should handle null contact info', () => {
      const result = transformContactInfo(null);
      expect(result).toBeNull();
    });
  });

  describe('Skills Transformation', () => {
    it('should transform skills with proper defaults', () => {
      const mockSkills: Skill[] = [
        { name: "JavaScript", level: "ADVANCED", category: "Programming Languages" },
        { name: "React", level: "EXPERT", category: "Frameworks" },
        { name: "Git" } // Missing level and category
      ];

      const result = transformSkills(mockSkills);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        name: "JavaScript",
        category: "Programming Languages",
        level: "ADVANCED"
      });
      expect(result[2]).toEqual({
        name: "Git",
        category: "General", // Default category
        level: "INTERMEDIATE" // Default level
      });
    });
  });

  describe('Education Transformation', () => {
    it('should transform education with proper date handling', () => {
      const mockEducation: EducationItem[] = [{
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        location: "Stanford, CA",
        startDate: "2018-09",
        endDate: "2022-05",
        year: "2022"
      }];

      const result = transformEducation(mockEducation);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        year: "2022",
        location: "Stanford, CA",
        startDate: "2018-09",
        endDate: "2022-05",
        gpa: null,
        honors: [],
        activities: []
      });
    });
  });

  describe('Achievements Transformation', () => {
    it('should transform achievements correctly', () => {
      const mockAchievements: AchievementItem[] = [{
        title: "AWS Certified Solutions Architect",
        description: "Professional level certification for cloud architecture",
        date: "2023-06",
        url: "https://aws.amazon.com/certification/",
        issuer: "Amazon Web Services"
      }];

      const result = transformAchievements(mockAchievements);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "AWS Certified Solutions Architect",
        description: "Professional level certification for cloud architecture",
        date: "2023-06",
        url: "https://aws.amazon.com/certification/",
        issuer: "Amazon Web Services"
      });
    });
  });

  describe('Data Type Validation', () => {
    it('should ensure all transformed data types match database schema', () => {
      const experience: ExperienceItem = {
        title: "Full Stack Developer",
        company: "WebCorp",
        description: "Developed web applications",
        location: "New York, NY",
        startDate: "2022-01",
        endDate: "2023-12",
        current: false,
        responsibilities: ["Frontend development", "Backend APIs"],
        achievements: ["Launched 5 applications", "Improved performance by 25%"],
        teamSize: 3,
        techStack: ["Vue.js", "Python", "FastAPI"]
      };

      const result = transformExperience([experience]);
      const transformed = result[0];

      // Validate data types match database expectations
      expect(typeof transformed.title).toBe('string');
      expect(typeof transformed.company).toBe('string');
      expect(typeof transformed.description).toBe('string');
      expect(typeof transformed.location === 'string' || transformed.location === null).toBe(true);
      expect(typeof transformed.startDate).toBe('string');
      expect(typeof transformed.endDate === 'string' || transformed.endDate === null).toBe(true);
      expect(typeof transformed.current).toBe('boolean');
      expect(Array.isArray(transformed.responsibilities)).toBe(true);
      expect(Array.isArray(transformed.achievements)).toBe(true);
      expect(typeof transformed.teamSize === 'number' || transformed.teamSize === null).toBe(true);
      expect(Array.isArray(transformed.techStack)).toBe(true);

      // Validate array element types
      transformed.responsibilities.forEach(item => expect(typeof item).toBe('string'));
      transformed.achievements.forEach(item => expect(typeof item).toBe('string'));
      transformed.techStack.forEach(item => expect(typeof item).toBe('string'));
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', () => {
      // Test with null input
      expect(transformExperience(null as any)).toEqual([]);
      expect(transformExperience(undefined as any)).toEqual([]);
      
      // Test with invalid array
      expect(transformExperience("not an array" as any)).toEqual([]);
    });

    it('should filter out invalid Experience entries', () => {
      const mixedExperiences = [
        { title: "Valid Role", company: "ValidCorp" }, // Valid
        { title: "Missing Company" }, // Invalid - no company
        { company: "Missing Title" }, // Invalid - no title  
        { title: "Another Valid", company: "AnotherCorp" } // Valid
      ];

      const result = transformExperience(mixedExperiences as any);
      
      // Should only include valid entries
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Valid Role");
      expect(result[1].title).toBe("Another Valid");
    });
  });
});

// Export test utilities
export const createMockExperience = (overrides: Partial<ExperienceItem> = {}): ExperienceItem => ({
  title: "Software Engineer",
  company: "TestCorp",
  description: "Developed software applications",
  location: "Test City",
  startDate: "2023-01",
  endDate: null,
  current: true,
  responsibilities: ["Write code", "Review PRs"],
  achievements: ["Delivered on time", "High quality work"],
  teamSize: 3,
  techStack: ["JavaScript", "React"],
  ...overrides
});

export const validateTransformedExperience = (
  transformed: ProfileUpdatePayload['experience'][0]
): boolean => {
  const requiredFields = ['title', 'company'];
  const arrayFields = ['responsibilities', 'achievements', 'techStack'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!transformed[field as keyof typeof transformed]) {
      return false;
    }
  }
  
  // Check array fields
  for (const field of arrayFields) {
    const value = transformed[field as keyof typeof transformed];
    if (!Array.isArray(value)) {
      return false;
    }
  }
  
  return true;
};